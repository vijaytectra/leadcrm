import { Router } from "express";
import { prisma } from "../lib/prisma";
import {
  requireAuth,
  requireActiveUser,
  requireRole,
  AuthedRequest,
} from "../middleware/auth";
import { emailService } from "../lib/email";
import { generateInstitutionCredentialsEmail } from "../lib/email-templates";
import { hashPassword, generateSecurePassword } from "../lib/password";
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
  status: z
    .enum(["ACTIVE", "INACTIVE", "SUSPENDED", "EXPIRED", "all"])
    .optional(),
  subscriptionTier: z.enum(["STARTER", "PRO", "MAX", "all"]).optional(),
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
          { name: { contains: search } },
          { email: { contains: search } },
          { slug: { contains: search } },
        ];
      }

      if (status && status !== "all") {
        whereClause.subscriptionStatus = status;
      }

      if (subscriptionTier && subscriptionTier !== "all") {
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
            email: institution.email || "",
            phone: institution.phone || "",
            address: institution.address || "",
            status:
              institution.subscriptionStatus === "ACTIVE"
                ? "active"
                : institution.subscriptionStatus === "INACTIVE"
                ? "pending"
                : institution.subscriptionStatus === "SUSPENDED"
                ? "suspended"
                : "active",
            subscription: institution.subscriptionTier,
            plan: institution.subscriptionTier,
            revenue: revenueResult._sum.amount || 0,
            users: institution._count.users,
            joinedDate: institution.createdAt.toISOString(),
            lastActive:
              lastActiveUser?.lastLoginAt?.toISOString() ||
              institution.updatedAt.toISOString(),
          };
        })
      );

      // Calculate stats
      const stats = {
        total: totalCount,
        active: await prisma.tenant.count({
          where: { subscriptionStatus: "ACTIVE" },
        }),
        pending: await prisma.tenant.count({
          where: { subscriptionStatus: "INACTIVE" },
        }),
        suspended: await prisma.tenant.count({
          where: { subscriptionStatus: "SUSPENDED" },
        }),
        totalRevenue: institutionsWithMetrics.reduce(
          (sum, inst) => sum + inst.revenue,
          0
        ),
      };

      res.json({
        success: true,
        data: {
          institutions: institutionsWithMetrics,
          pagination: {
            page: pageNum,
            pageSize: limitNum,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limitNum),
          },
          stats,
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

      // Create admin user for the institution
      const adminPassword = generateSecurePassword();
      const adminUser = await prisma.user.create({
        data: {
          email: institutionData.email || `${institution.slug}@example.com`,
          passwordHash: await hashPassword(adminPassword),
          firstName: "Admin",
          lastName: institution.name,
          role: "INSTITUTION_ADMIN",
          tenantId: institution.id,
          isActive: true,
        },
      });

      // Send welcome email to institution admin
      try {
        const loginUrl = `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/login`;
        const supportEmail =
          process.env.SENDGRID_FROM_EMAIL || "support@lead101.com";
        const supportPhone = process.env.SUPPORT_PHONE || "+91-9876543210";

        const emailTemplate = generateInstitutionCredentialsEmail(
          institution.name,
          `${adminUser.firstName || "Admin"} ${
            adminUser.lastName || institution.name
          }`,
          adminUser.email,
          adminPassword,
          loginUrl
        );

        // Send email using the email service
        await emailService.sendInstitutionCredentials({
          institutionName: institution.name,
          institutionSlug: institution.slug,
          adminEmail: adminUser.email,
          adminPassword: adminPassword,
          loginUrl,
          supportEmail,
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Don't fail the institution creation if email fails
      }

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

/**
 * POST /api/institutions/bulk-delete
 * Delete multiple institutions
 */
router.post(
  "/bulk-delete",
  requireAuth,
  requireActiveUser,
  requireRole(["SUPER_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const { institutionIds } = req.body;

      if (
        !institutionIds ||
        !Array.isArray(institutionIds) ||
        institutionIds.length === 0
      ) {
        return res.status(400).json({
          error: "Institution IDs are required",
          code: "MISSING_INSTITUTION_IDS",
        });
      }

      // Check if all institutions exist
      const existingInstitutions = await prisma.tenant.findMany({
        where: {
          id: { in: institutionIds },
        },
        select: { id: true, name: true },
      });

      if (existingInstitutions.length !== institutionIds.length) {
        const foundIds = existingInstitutions.map((inst) => inst.id);
        const missingIds = institutionIds.filter(
          (id) => !foundIds.includes(id)
        );
        return res.status(404).json({
          error: "Some institutions not found",
          code: "INSTITUTIONS_NOT_FOUND",
          missingIds,
        });
      }

      // Delete related records first, then delete institutions
      for (const institutionId of institutionIds) {
        // Delete related records in the correct order
        await prisma.refreshToken.deleteMany({
          where: {
            user: {
              tenantId: institutionId,
            },
          },
        });

        await prisma.auditLog.deleteMany({
          where: {
            tenantId: institutionId,
          },
        });

        await prisma.payment.deleteMany({
          where: {
            tenantId: institutionId,
          },
        });

        await prisma.application.deleteMany({
          where: {
            tenantId: institutionId,
          },
        });

        await prisma.lead.deleteMany({
          where: {
            tenantId: institutionId,
          },
        });

        await prisma.user.deleteMany({
          where: {
            tenantId: institutionId,
          },
        });
      }

      // Now delete the institutions
      const deleteResult = await prisma.tenant.deleteMany({
        where: {
          id: { in: institutionIds },
        },
      });

      res.json({
        success: true,
        data: {
          deletedCount: deleteResult.count,
          deletedInstitutions: existingInstitutions,
        },
        message: `Successfully deleted ${deleteResult.count} institution(s)`,
      });
    } catch (error) {
      console.error("Bulk delete institutions error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * POST /api/institutions/bulk-activate
 * Activate multiple institutions
 */
router.post(
  "/bulk-activate",
  requireAuth,
  requireActiveUser,
  requireRole(["SUPER_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const { institutionIds } = req.body;

      if (
        !institutionIds ||
        !Array.isArray(institutionIds) ||
        institutionIds.length === 0
      ) {
        return res.status(400).json({
          error: "Institution IDs are required",
          code: "MISSING_INSTITUTION_IDS",
        });
      }

      // Update institutions to active status
      const updateResult = await prisma.tenant.updateMany({
        where: {
          id: { in: institutionIds },
        },
        data: {
          subscriptionStatus: "ACTIVE",
        },
      });

      res.json({
        success: true,
        data: {
          updatedCount: updateResult.count,
        },
        message: `Successfully activated ${updateResult.count} institution(s)`,
      });
    } catch (error) {
      console.error("Bulk activate institutions error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * POST /api/institutions/bulk-suspend
 * Suspend multiple institutions
 */
router.post(
  "/bulk-suspend",
  requireAuth,
  requireActiveUser,
  requireRole(["SUPER_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const { institutionIds } = req.body;

      if (
        !institutionIds ||
        !Array.isArray(institutionIds) ||
        institutionIds.length === 0
      ) {
        return res.status(400).json({
          error: "Institution IDs are required",
          code: "MISSING_INSTITUTION_IDS",
        });
      }

      // Update institutions to suspended status
      const updateResult = await prisma.tenant.updateMany({
        where: {
          id: { in: institutionIds },
        },
        data: {
          subscriptionStatus: "SUSPENDED",
        },
      });

      res.json({
        success: true,
        data: {
          updatedCount: updateResult.count,
        },
        message: `Successfully suspended ${updateResult.count} institution(s)`,
      });
    } catch (error) {
      console.error("Bulk suspend institutions error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

export default router;
