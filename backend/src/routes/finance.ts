import { Router } from "express";
import { prisma } from "../lib/prisma";
import {
  requireAuth,
  requireActiveUser,
  requireRole,
  AuthedRequest,
} from "../middleware/auth";
import { z } from "zod";
import {
  calculatePlatformFee,
  calculateRevenueSplit,
  getTenantFinancialMetrics,
  getPlatformFinancialMetrics,
  createPaymentWithFees,
  reconcilePayments,
} from "../lib/finance";

const router = Router();

// Validation schemas
const feeCalculationSchema = z.object({
  amount: z.number().int().min(1, "Amount must be greater than 0"),
  paymentType: z
    .enum(["SUBSCRIPTION", "TRANSACTION", "FORM_PAYMENT"])
    .default("TRANSACTION"),
  customFeeStructure: z.any().optional(),
});

const createPaymentSchema = z.object({
  amount: z.number().int().min(1, "Amount must be greater than 0"),
  applicationId: z.string().optional(),
  submissionId: z.string().optional(),
  gateway: z.string().default("cashfree"),
  gatewayTransactionId: z.string().optional(),
  gatewayResponse: z.any().optional(),
});

const reconciliationSchema = z.object({
  tenantId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * POST /api/finance/calculate-fee
 * Calculate platform fees for a given amount
 */
router.post(
  "/calculate-fee",
  requireAuth,
  requireActiveUser,
  requireRole(["SUPER_ADMIN", "INSTITUTION_ADMIN", "FINANCE_TEAM"]),
  async (req: AuthedRequest, res) => {
    try {
      const { amount, paymentType, customFeeStructure } =
        feeCalculationSchema.parse(req.body);
      const tenantId = req.auth?.ten;

      if (!tenantId) {
        return res.status(400).json({
          error: "Tenant ID is required",
          code: "MISSING_TENANT_ID",
        });
      }

      const feeCalculation = await calculatePlatformFee({
        amount,
        tenantId,
        paymentType,
        customFeeStructure,
      });

      res.json({
        success: true,
        data: feeCalculation,
      });
    } catch (error) {
      console.error("Calculate fee error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * POST /api/finance/calculate-revenue-split
 * Calculate revenue split between platform and institution
 */
router.post(
  "/calculate-revenue-split",
  requireAuth,
  requireActiveUser,
  requireRole(["SUPER_ADMIN", "INSTITUTION_ADMIN", "FINANCE_TEAM"]),
  async (req: AuthedRequest, res) => {
    try {
      const { amount, paymentType } = feeCalculationSchema.parse(req.body);
      const tenantId = req.auth?.ten;

      if (!tenantId) {
        return res.status(400).json({
          error: "Tenant ID is required",
          code: "MISSING_TENANT_ID",
        });
      }

      const revenueSplit = await calculateRevenueSplit(
        amount,
        tenantId,
        paymentType
      );

      res.json({
        success: true,
        data: revenueSplit,
      });
    } catch (error) {
      console.error("Calculate revenue split error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * GET /api/finance/metrics
 * Get financial metrics for the current tenant
 */
router.get(
  "/metrics",
  requireAuth,
  requireActiveUser,
  requireRole(["SUPER_ADMIN", "INSTITUTION_ADMIN", "FINANCE_TEAM"]),
  async (req: AuthedRequest, res) => {
    try {
      const { period = "30d" } = req.query;
      const tenantId = req.auth?.ten;

      if (!tenantId) {
        return res.status(400).json({
          error: "Tenant ID is required",
          code: "MISSING_TENANT_ID",
        });
      }

      const metrics = await getTenantFinancialMetrics(
        tenantId,
        period as string
      );

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      console.error("Get financial metrics error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * GET /api/finance/platform-metrics
 * Get platform-wide financial metrics (Super Admin only)
 */
router.get(
  "/platform-metrics",
  requireAuth,
  requireActiveUser,
  requireRole(["SUPER_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const { period = "30d" } = req.query;

      const metrics = await getPlatformFinancialMetrics(period as string);

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      console.error("Get platform metrics error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * POST /api/finance/create-payment
 * Create a payment record with automatic fee calculation
 */
router.post(
  "/create-payment",
  requireAuth,
  requireActiveUser,
  requireRole(["SUPER_ADMIN", "INSTITUTION_ADMIN", "FINANCE_TEAM"]),
  async (req: AuthedRequest, res) => {
    try {
      const paymentData = createPaymentSchema.parse(req.body);
      const tenantId = req.auth?.ten;

      if (!tenantId) {
        return res.status(400).json({
          error: "Tenant ID is required",
          code: "MISSING_TENANT_ID",
        });
      }

      const payment = await createPaymentWithFees({
        ...paymentData,
        tenantId,
      });

      res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      console.error("Create payment error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * GET /api/finance/reconciliation
 * Get payment reconciliation data
 */
router.get(
  "/reconciliation",
  requireAuth,
  requireActiveUser,
  requireRole(["SUPER_ADMIN", "INSTITUTION_ADMIN", "FINANCE_TEAM"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantId, startDate, endDate } = reconciliationSchema.parse(
        req.query
      );
      const userTenantId = req.auth?.ten;

      // Non-super admins can only access their own tenant data
      const allowedTenantId =
        req.auth?.rol === "SUPER_ADMIN" ? tenantId : userTenantId;

      let dateRange;
      if (startDate && endDate) {
        dateRange = {
          start: new Date(startDate),
          end: new Date(endDate),
        };
      }

      const reconciliation = await reconcilePayments(
        allowedTenantId,
        dateRange
      );

      res.json({
        success: true,
        data: reconciliation,
      });
    } catch (error) {
      console.error("Get reconciliation error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * GET /api/finance/payments
 * Get payment history with filtering
 */
router.get(
  "/payments",
  requireAuth,
  requireActiveUser,
  requireRole(["SUPER_ADMIN", "INSTITUTION_ADMIN", "FINANCE_TEAM"]),
  async (req: AuthedRequest, res) => {
    try {
      const {
        page = "1",
        limit = "20",
        status,
        startDate,
        endDate,
        tenantId,
      } = req.query as {
        page?: string;
        limit?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
        tenantId?: string;
      };

      const userTenantId = req.auth?.ten;
      const allowedTenantId =
        req.auth?.rol === "SUPER_ADMIN" ? tenantId : userTenantId;

      if (!allowedTenantId) {
        return res.status(400).json({
          error: "Tenant ID is required",
          code: "MISSING_TENANT_ID",
        });
      }

      const whereClause: any = {
        tenantId: allowedTenantId,
      };

      if (status) {
        whereClause.status = status;
      }

      if (startDate && endDate) {
        whereClause.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const [payments, totalCount] = await Promise.all([
        prisma.payment.findMany({
          where: whereClause,
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                subscriptionTier: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: limitNum,
        }),
        prisma.payment.count({
          where: whereClause,
        }),
      ]);

      res.json({
        success: true,
        data: {
          payments: payments.map((payment) => ({
            id: payment.id,
            tenantName: payment.tenant.name,
            amount: payment.amount,
            platformFee: payment.platformFee,
            institutionAmount: payment.institutionAmount,
            status: payment.status,
            gateway: payment.gateway,
            gatewayTransactionId: payment.gatewayTransactionId,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
          })),
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalCount,
            pages: Math.ceil(totalCount / limitNum),
          },
        },
      });
    } catch (error) {
      console.error("Get payments error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * PUT /api/finance/payments/:id/status
 * Update payment status
 */
router.put(
  "/payments/:id/status",
  requireAuth,
  requireActiveUser,
  requireRole(["SUPER_ADMIN", "INSTITUTION_ADMIN", "FINANCE_TEAM"]),
  async (req: AuthedRequest, res) => {
    try {
      const { id } = req.params;
      const { status, gatewayTransactionId, gatewayResponse } = req.body;

      const validStatuses = ["CREATED", "COMPLETED", "FAILED", "REFUNDED"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: "Invalid payment status",
          code: "INVALID_STATUS",
        });
      }

      const payment = await prisma.payment.update({
        where: { id },
        data: {
          status,
          gatewayTransactionId,
          gatewayResponse,
          updatedAt: new Date(),
        },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              subscriptionTier: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      console.error("Update payment status error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * GET /api/finance/reports
 * Generate financial reports
 */
router.get(
  "/reports",
  requireAuth,
  requireActiveUser,
  requireRole(["SUPER_ADMIN", "INSTITUTION_ADMIN", "FINANCE_TEAM"]),
  async (req: AuthedRequest, res) => {
    try {
      const {
        type = "summary",
        period = "30d",
        format = "json",
        tenantId,
      } = req.query as {
        type?: string;
        period?: string;
        format?: string;
        tenantId?: string;
      };

      const userTenantId = req.auth?.ten;
      const allowedTenantId =
        req.auth?.rol === "SUPER_ADMIN" ? tenantId : userTenantId;

      if (!allowedTenantId) {
        return res.status(400).json({
          error: "Tenant ID is required",
          code: "MISSING_TENANT_ID",
        });
      }

      let reportData: any = {};

      switch (type) {
        case "summary":
          reportData = await getTenantFinancialMetrics(
            allowedTenantId,
            period as string
          );
          break;
        case "detailed":
          // Get detailed payment breakdown
          const payments = await prisma.payment.findMany({
            where: {
              tenantId: allowedTenantId,
            },
            include: {
              tenant: {
                select: {
                  name: true,
                  subscriptionTier: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          });

          reportData = {
            payments: payments.map((p) => ({
              id: p.id,
              amount: p.amount,
              platformFee: p.platformFee,
              institutionAmount: p.institutionAmount,
              status: p.status,
              createdAt: p.createdAt,
            })),
            summary: await getTenantFinancialMetrics(
              allowedTenantId,
              period as string
            ),
          };
          break;
        case "reconciliation":
          reportData = await reconcilePayments(allowedTenantId);
          break;
        default:
          return res.status(400).json({
            error: "Invalid report type",
            code: "INVALID_REPORT_TYPE",
          });
      }

      res.json({
        success: true,
        data: {
          type,
          period,
          generatedAt: new Date(),
          report: reportData,
        },
      });
    } catch (error) {
      console.error("Generate report error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

export default router;
