import { Router } from "express";
import { prisma } from "../lib/prisma";
import {
  requireAuth,
  requireSuperAdmin,
  requireActiveUser,
  AuthedRequest,
} from "../middleware/auth";
import { z } from "zod";

const router = Router();

// Validation schemas
const createSubscriptionSchema = z.object({
  tenantId: z.string().min(1, "Tenant ID is required"),
  tier: z.enum(["STARTER", "PRO", "MAX"]),
  status: z
    .enum(["ACTIVE", "INACTIVE", "SUSPENDED", "EXPIRED"])
    .default("ACTIVE"),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  amount: z.number().int().min(0),
});

const updateSubscriptionSchema = z.object({
  tier: z.enum(["STARTER", "PRO", "MAX"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "EXPIRED"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  amount: z.number().int().min(0).optional(),
  paymentStatus: z
    .enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"])
    .optional(),
});

// Subscription tier configurations
const SUBSCRIPTION_TIERS = {
  STARTER: {
    name: "Starter",
    price: 5000, // ₹5,000/month
    maxLeads: 500,
    maxTeamMembers: 2,
    features: [
      "Basic lead management",
      "Email support",
      "Standard integrations",
      "Basic reporting",
    ],
  },
  PRO: {
    name: "Pro",
    price: 15000, // ₹15,000/month
    maxLeads: 2000,
    maxTeamMembers: 10,
    features: [
      "Advanced lead management",
      "Priority support",
      "All integrations",
      "Advanced analytics",
      "Custom branding",
      "API access",
    ],
  },
  MAX: {
    name: "Max",
    price: 35000, // ₹35,000/month
    maxLeads: -1, // Unlimited
    maxTeamMembers: -1, // Unlimited
    features: [
      "Unlimited leads",
      "Unlimited team members",
      "White-label solution",
      "Dedicated support",
      "Custom integrations",
      "Advanced security features",
      "Priority feature requests",
    ],
  },
};

/**
 * GET /api/super-admin/subscriptions
 * Get all subscriptions with filtering and pagination
 */
router.get(
  "/",
  requireAuth,
  requireActiveUser,
  requireSuperAdmin,
  async (req: AuthedRequest, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        tier,
        paymentStatus,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      // Build where clause
      const where: any = {};

      if (search) {
        where.tenant = {
          OR: [
            { name: { contains: search as string, mode: "insensitive" } },
            { slug: { contains: search as string, mode: "insensitive" } },
          ],
        };
      }

      if (status) {
        where.status = status;
      }

      if (tier) {
        where.tier = tier;
      }

      if (paymentStatus) {
        where.paymentStatus = paymentStatus;
      }

      const [subscriptions, total] = await Promise.all([
        prisma.subscription.findMany({
          where,
          include: {
            tenant: {
              select: {
                id: true,
                slug: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { [sortBy as string]: sortOrder },
          skip,
          take: Number(limit),
        }),
        prisma.subscription.count({ where }),
      ]);

      res.json({
        subscriptions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error("Get subscriptions error:", error);
      res.status(500).json({
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * GET /api/super-admin/subscriptions/:id
 * Get specific subscription details
 */
router.get(
  "/:id",
  requireAuth,
  requireActiveUser,
  requireSuperAdmin,
  async (req: AuthedRequest, res) => {
    try {
      const { id } = req.params;

      const subscription = await prisma.subscription.findUnique({
        where: { id },
        include: {
          tenant: {
            select: {
              id: true,
              slug: true,
              name: true,
              email: true,
              phone: true,
              address: true,
            },
          },
        },
      });

      if (!subscription) {
        return res.status(404).json({
          message: "Subscription not found",
          code: "SUBSCRIPTION_NOT_FOUND",
        });
      }

      res.json({ subscription });
    } catch (error) {
      console.error("Get subscription error:", error);
      res.status(500).json({
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * POST /api/super-admin/subscriptions
 * Create a new subscription
 */
router.post(
  "/",
  requireAuth,
  requireActiveUser,
  requireSuperAdmin,
  async (req: AuthedRequest, res) => {
    try {
      const validation = createSubscriptionSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          message: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const { tenantId, tier, status, startDate, endDate, amount } =
        validation.data;

      // Check if tenant exists
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        return res.status(404).json({
          message: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      // Create subscription
      const subscription = await prisma.subscription.create({
        data: {
          tenantId,
          tier,
          status,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          amount,
          paymentStatus: "PENDING",
        },
        include: {
          tenant: {
            select: {
              id: true,
              slug: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Update tenant subscription details
      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          subscriptionTier: tier,
          subscriptionStatus: status,
          subscriptionStart: new Date(startDate),
          subscriptionEnd: new Date(endDate),
          maxLeads: SUBSCRIPTION_TIERS[tier].maxLeads,
          maxTeamMembers: SUBSCRIPTION_TIERS[tier].maxTeamMembers,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          tenantId,
          userId: req.auth?.sub,
          action: "SUBSCRIPTION_CREATED",
          entity: "Subscription",
          entityId: subscription.id,
          newValues: {
            tier,
            status,
            amount,
          },
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        },
      });

      res.status(201).json({ subscription });
    } catch (error) {
      console.error("Create subscription error:", error);
      res.status(500).json({
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * PUT /api/super-admin/subscriptions/:id
 * Update subscription details
 */
router.put(
  "/:id",
  requireAuth,
  requireActiveUser,
  requireSuperAdmin,
  async (req: AuthedRequest, res) => {
    try {
      const { id } = req.params;
      const validation = updateSubscriptionSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          message: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const updateData = validation.data;

      // Check if subscription exists
      const existingSubscription = await prisma.subscription.findUnique({
        where: { id },
        include: { tenant: true },
      });

      if (!existingSubscription) {
        return res.status(404).json({
          message: "Subscription not found",
          code: "SUBSCRIPTION_NOT_FOUND",
        });
      }

      // Update subscription
      const subscription = await prisma.subscription.update({
        where: { id },
        data: {
          ...updateData,
          startDate: updateData.startDate
            ? new Date(updateData.startDate)
            : undefined,
          endDate: updateData.endDate
            ? new Date(updateData.endDate)
            : undefined,
        },
        include: {
          tenant: {
            select: {
              id: true,
              slug: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Update tenant subscription details if tier or status changed
      if (updateData.tier || updateData.status) {
        await prisma.tenant.update({
          where: { id: existingSubscription.tenantId },
          data: {
            ...(updateData.tier && {
              subscriptionTier: updateData.tier,
              maxLeads: SUBSCRIPTION_TIERS[updateData.tier].maxLeads,
              maxTeamMembers:
                SUBSCRIPTION_TIERS[updateData.tier].maxTeamMembers,
            }),
            ...(updateData.status && { subscriptionStatus: updateData.status }),
            ...(updateData.startDate && {
              subscriptionStart: new Date(updateData.startDate),
            }),
            ...(updateData.endDate && {
              subscriptionEnd: new Date(updateData.endDate),
            }),
          },
        });
      }

      // Create audit log
      await prisma.auditLog.create({
        data: {
          tenantId: existingSubscription.tenantId,
          userId: req.auth?.sub,
          action: "SUBSCRIPTION_UPDATED",
          entity: "Subscription",
          entityId: id,
          oldValues: existingSubscription,
          newValues: subscription,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        },
      });

      res.json({ subscription });
    } catch (error) {
      console.error("Update subscription error:", error);
      res.status(500).json({
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * GET /api/super-admin/subscriptions/tiers
 * Get subscription tier configurations
 */
router.get(
  "/tiers",
  requireAuth,
  requireActiveUser,
  requireSuperAdmin,
  async (req: AuthedRequest, res) => {
    try {
      res.json({ tiers: SUBSCRIPTION_TIERS });
    } catch (error) {
      console.error("Get subscription tiers error:", error);
      res.status(500).json({
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * GET /api/super-admin/subscriptions/analytics
 * Get subscription analytics
 */
router.get(
  "/analytics",
  requireAuth,
  requireActiveUser,
  requireSuperAdmin,
  async (req: AuthedRequest, res) => {
    try {
      const { period = "30d" } = req.query;

      // Calculate date range
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Get analytics data
      const [
        totalSubscriptions,
        activeSubscriptions,
        revenue,
        tierDistribution,
        paymentStatusDistribution,
        recentSubscriptions,
      ] = await Promise.all([
        // Total subscriptions
        prisma.subscription.count(),

        // Active subscriptions
        prisma.subscription.count({
          where: { status: "ACTIVE" },
        }),

        // Revenue
        prisma.subscription.aggregate({
          where: {
            status: "ACTIVE",
            paymentStatus: "COMPLETED",
            createdAt: { gte: startDate },
          },
          _sum: { amount: true },
        }),

        // Tier distribution
        prisma.subscription.groupBy({
          by: ["tier"],
          where: { status: "ACTIVE" },
          _count: { tier: true },
        }),

        // Payment status distribution
        prisma.subscription.groupBy({
          by: ["paymentStatus"],
          _count: { paymentStatus: true },
        }),

        // Recent subscriptions
        prisma.subscription.findMany({
          where: { createdAt: { gte: startDate } },
          include: {
            tenant: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);

      res.json({
        analytics: {
          totalSubscriptions,
          activeSubscriptions,
          revenue: revenue._sum.amount || 0,
          tierDistribution,
          paymentStatusDistribution,
          recentSubscriptions,
        },
        period,
        dateRange: {
          start: startDate,
          end: now,
        },
      });
    } catch (error) {
      console.error("Get subscription analytics error:", error);
      res.status(500).json({
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * POST /api/super-admin/subscriptions/:id/renew
 * Renew subscription
 */
router.post(
  "/:id/renew",
  requireAuth,
  requireActiveUser,
  requireSuperAdmin,
  async (req: AuthedRequest, res) => {
    try {
      const { id } = req.params;
      const { months = 1 } = req.body;

      const subscription = await prisma.subscription.findUnique({
        where: { id },
        include: { tenant: true },
      });

      if (!subscription) {
        return res.status(404).json({
          message: "Subscription not found",
          code: "SUBSCRIPTION_NOT_FOUND",
        });
      }

      // Calculate new end date
      const newEndDate = new Date(subscription.endDate);
      newEndDate.setMonth(newEndDate.getMonth() + months);

      // Update subscription
      const updatedSubscription = await prisma.subscription.update({
        where: { id },
        data: {
          endDate: newEndDate,
          status: "ACTIVE",
        },
        include: {
          tenant: {
            select: {
              id: true,
              slug: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Update tenant subscription end date
      await prisma.tenant.update({
        where: { id: subscription.tenantId },
        data: {
          subscriptionEnd: newEndDate,
          subscriptionStatus: "ACTIVE",
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          tenantId: subscription.tenantId,
          userId: req.auth?.sub,
          action: "SUBSCRIPTION_RENEWED",
          entity: "Subscription",
          entityId: id,
          oldValues: {
            endDate: subscription.endDate,
            status: subscription.status,
          },
          newValues: {
            endDate: newEndDate,
            status: "ACTIVE",
          },
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        },
      });

      res.json({ subscription: updatedSubscription });
    } catch (error) {
      console.error("Renew subscription error:", error);
      res.status(500).json({
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

export default router;
