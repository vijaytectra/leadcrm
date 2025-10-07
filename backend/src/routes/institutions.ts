import { Router } from "express";
import { prisma } from "../lib/prisma";
import {
  requireAuth,
  requireActiveUser,
  requireRole,
  AuthedRequest,
} from "../middleware/auth";
import { z } from "zod";

const router = Router();

// Validation schemas
const createInstitutionSchema = z.object({
  name: z.string().min(1, "Institution name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  email: z.string().email("Valid email is required").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  subscriptionTier: z.enum(["STARTER", "PRO", "MAX"]).default("STARTER"),
  maxLeads: z.number().int().min(1).default(500),
  maxTeamMembers: z.number().int().min(1).default(2),
});

const updateInstitutionSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  subscriptionTier: z.enum(["STARTER", "PRO", "MAX"]).optional(),
  subscriptionStatus: z
    .enum(["ACTIVE", "INACTIVE", "SUSPENDED", "EXPIRED"])
    .optional(),
  maxLeads: z.number().int().min(1).optional(),
  maxTeamMembers: z.number().int().min(1).optional(),
});

const querySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("20"),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "EXPIRED"]).optional(),
  subscriptionTier: z.enum(["STARTER", "PRO", "MAX"]).optional(),
});

/**
 * GET /api/institutions
 * Get all institutions with filtering and pagination
 */
router.get(
  "/",
  requireAuth,
  requireActiveUser,
  requireRole(["SUPER_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const { page, limit, search, status, subscriptionTier } =
        querySchema.parse(req.query);

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const whereClause: any = {};

      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ];
      }

      if (status) {
        whereClause.subscriptionStatus = status;
      }

      if (subscriptionTier) {
        whereClause.subscriptionTier = subscriptionTier;
      }

      const [institutions, totalCount] = await Promise.all([
        prisma.tenant.findMany({
          where: whereClause,
          include: {
            users: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
              },
            },
            _count: {
              select: {
                users: true,
                leads: true,
                payments: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: limitNum,
        }),
        prisma.tenant.count({
          where: whereClause,
        }),
      ]);

      // Calculate additional metrics
      const institutionsWithMetrics = await Promise.all(
        institutions.map(async (institution) => {
          // Get total revenue
          const revenueResult = await prisma.payment.aggregate({
            where: {
              tenantId: institution.id,
              status: "COMPLETED",
            },
            _sum: {
              amount: true,
            },
          });

          // Get last active date
          const lastActiveUser = await prisma.user.findFirst({
            where: {
              tenantId: institution.id,
            },
            orderBy: {
              lastLoginAt: "desc",
            },
            select: {
              lastLoginAt: true,
            },
          });

          return {
            id: institution.id,
            name: institution.name,
            slug: institution.slug,
            email: institution.email,
            phone: institution.phone,
            address: institution.address,
            subscriptionTier: institution.subscriptionTier,
            subscriptionStatus: institution.subscriptionStatus,
            subscriptionStart: institution.subscriptionStart,
            subscriptionEnd: institution.subscriptionEnd,
            maxLeads: institution.maxLeads,
            maxTeamMembers: institution.maxTeamMembers,
            createdAt: institution.createdAt,
            updatedAt: institution.updatedAt,
            userCount: institution._count.users,
            leadCount: institution._count.leads,
            paymentCount: institution._count.payments,
            totalRevenue: revenueResult._sum.amount || 0,
            lastActive: lastActiveUser?.lastLoginAt,
            users: institution.users,
          };
        })
      );

      res.json({
        success: true,
        data: {
          institutions: institutionsWithMetrics,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalCount,
            pages: Math.ceil(totalCount / limitNum),
          },
        },
      });
    } catch (error) {
      console.error("Get institutions error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * GET /api/institutions/:id
 * Get institution by ID
 */
router.get(
  "/:id",
  requireAuth,
  requireActiveUser,
  requireRole(["SUPER_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const { id } = req.params;

      const institution = await prisma.tenant.findUnique({
        where: { id },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              isActive: true,
              lastLoginAt: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              users: true,
              leads: true,
              payments: true,
              applications: true,
            },
          },
        },
      });

      if (!institution) {
        return res.status(404).json({
          error: "Institution not found",
          code: "INSTITUTION_NOT_FOUND",
        });
      }

      // Get financial metrics
      const financialMetrics = await prisma.payment.aggregate({
        where: {
          tenantId: institution.id,
        },
        _sum: {
          amount: true,
          platformFee: true,
          institutionAmount: true,
        },
        _count: {
          id: true,
        },
      });

      const successfulPayments = await prisma.payment.aggregate({
        where: {
          tenantId: institution.id,
          status: "COMPLETED",
        },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
      });

      res.json({
        success: true,
        data: {
          ...institution,
          financialMetrics: {
            totalTransactions: financialMetrics._count.id,
            totalAmount: financialMetrics._sum.amount || 0,
            totalPlatformFees: financialMetrics._sum.platformFee || 0,
            totalInstitutionAmount:
              financialMetrics._sum.institutionAmount || 0,
            successfulTransactions: successfulPayments._count.id,
            successfulAmount: successfulPayments._sum.amount || 0,
          },
        },
      });
    } catch (error) {
      console.error("Get institution error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * POST /api/institutions
 * Create new institution
 */
router.post(
  "/",
  requireAuth,
  requireActiveUser,
  requireRole(["SUPER_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const institutionData = createInstitutionSchema.parse(req.body);

      // Check if slug already exists
      const existingInstitution = await prisma.tenant.findUnique({
        where: { slug: institutionData.slug },
      });

      if (existingInstitution) {
        return res.status(400).json({
          error: "Institution with this slug already exists",
          code: "SLUG_ALREADY_EXISTS",
        });
      }

      // Create institution
      const institution = await prisma.tenant.create({
        data: {
          ...institutionData,
          subscriptionStatus: "ACTIVE",
          subscriptionStart: new Date(),
          subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        },
        include: {
          _count: {
            select: {
              users: true,
              leads: true,
              payments: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        data: institution,
        message: "Institution created successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation error",
          code: "VALIDATION_ERROR",
          details: error.issues,
        });
      }

      console.error("Create institution error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * PUT /api/institutions/:id
 * Update institution
 */
router.put(
  "/:id",
  requireAuth,
  requireActiveUser,
  requireRole(["SUPER_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const { id } = req.params;
      const updateData = updateInstitutionSchema.parse(req.body);

      // Check if institution exists
      const existingInstitution = await prisma.tenant.findUnique({
        where: { id },
      });

      if (!existingInstitution) {
        return res.status(404).json({
          error: "Institution not found",
          code: "INSTITUTION_NOT_FOUND",
        });
      }

      // Update institution
      const institution = await prisma.tenant.update({
        where: { id },
        data: updateData,
        include: {
          _count: {
            select: {
              users: true,
              leads: true,
              payments: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: institution,
        message: "Institution updated successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation error",
          code: "VALIDATION_ERROR",
          details: error.issues,
        });
      }

      console.error("Update institution error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * DELETE /api/institutions/:id
 * Delete institution
 */
router.delete(
  "/:id",
  requireAuth,
  requireActiveUser,
  requireRole(["SUPER_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const { id } = req.params;

      // Check if institution exists
      const existingInstitution = await prisma.tenant.findUnique({
        where: { id },
      });

      if (!existingInstitution) {
        return res.status(404).json({
          error: "Institution not found",
          code: "INSTITUTION_NOT_FOUND",
        });
      }

      // Delete institution (this will cascade delete related records)
      await prisma.tenant.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: "Institution deleted successfully",
      });
    } catch (error) {
      console.error("Delete institution error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * POST /api/institutions/:id/status
 * Update institution status
 */
router.post(
  "/:id/status",
  requireAuth,
  requireActiveUser,
  requireRole(["SUPER_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED", "EXPIRED"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: "Invalid status",
          code: "INVALID_STATUS",
        });
      }

      const institution = await prisma.tenant.update({
        where: { id },
        data: {
          subscriptionStatus: status,
        },
      });

      res.json({
        success: true,
        data: institution,
        message: `Institution status updated to ${status}`,
      });
    } catch (error) {
      console.error("Update institution status error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

export default router;
