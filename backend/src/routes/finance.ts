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

// Refund management schemas
const refundRequestSchema = z.object({
  applicationId: z.string().optional(),
  paymentId: z.string().optional(),
  studentName: z.string().min(1, "Student name is required"),
  studentEmail: z.string().email("Valid email is required"),
  studentPhone: z.string().optional(),
  amount: z.number().int().min(1, "Amount must be greater than 0"),
  reason: z.string().min(1, "Reason is required"),
});

const refundApprovalSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  comments: z.string().optional(),
  rejectionReason: z.string().optional(),
});

const financialReportSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  reportType: z
    .enum(["SUMMARY", "REVENUE", "REFUNDS", "PAYMENTS"])
    .default("SUMMARY"),
  format: z.enum(["JSON", "EXCEL", "PDF"]).default("JSON"),
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
  "/:tenant/metrics",
  requireAuth,
  requireActiveUser,
  requireRole(["SUPER_ADMIN", "INSTITUTION_ADMIN", "FINANCE_TEAM"]),
  async (req: AuthedRequest, res) => {
    try {
      console.log("req.query", req.query);
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
  "/:tenant/platform-metrics",
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
  "/:tenant/create-payment",
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
  "/:tenant/reconciliation",
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
  "/:tenant/payments",
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
      console.log(req.query);

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
  "/:tenant/payments/:id/status",
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
  "/:tenant/reports",
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

/**
 * GET /api/:tenant/finance/dashboard
 * Get financial dashboard metrics
 */
router.get(
  "/:tenant/finance/dashboard",
  requireAuth,
  requireActiveUser,
  requireRole(["FINANCE_TEAM", "INSTITUTION_ADMIN", "SUPER_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const { period = "30d" } = req.query;

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: {
            code: "TENANT_NOT_FOUND",
            message: "Tenant not found",
          },
        });
      }

      const metrics = await getTenantFinancialMetrics(
        tenant.id,
        period as string
      );

      // Get recent transactions
      const recentTransactions = await prisma.payment.findMany({
        where: { tenantId: tenant.id },
        include: {
          application: {
            select: {
              studentName: true,
              studentEmail: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      // Get pending refunds
      const pendingRefunds = await prisma.refundRequest.count({
        where: {
          tenantId: tenant.id,
          status: "PENDING",
        },
      });

      res.json({
        success: true,
        data: {
          metrics,
          recentTransactions,
          pendingRefunds,
        },
      });
    } catch (error) {
      console.error("Get finance dashboard error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "DASHBOARD_ERROR",
          message: "Failed to fetch dashboard data",
        },
      });
    }
  }
);

/**
 * POST /api/:tenant/finance/refunds
 * Create a refund request
 */
router.post(
  "/:tenant/finance/refunds",
  requireAuth,
  requireActiveUser,
  requireRole(["FINANCE_TEAM", "STUDENT", "PARENT"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const body = refundRequestSchema.parse(req.body);

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: {
            code: "TENANT_NOT_FOUND",
            message: "Tenant not found",
          },
        });
      }

      const refundRequest = await prisma.refundRequest.create({
        data: {
          tenantId: tenant.id,
          ...body,
          requestedBy: req.auth?.sub,
        },
        include: {
          application: {
            select: {
              studentName: true,
              studentEmail: true,
            },
          },
          payment: {
            select: {
              amount: true,
              status: true,
            },
          },
        },
      });

      // Create audit log
      await prisma.financialAuditLog.create({
        data: {
          tenantId: tenant.id,
          refundRequestId: refundRequest.id,
          action: "REFUND_REQUESTED",
          details: {
            amount: body.amount,
            reason: body.reason,
            studentName: body.studentName,
          },
          performedBy: req.auth?.sub || "",
        },
      });

      res.status(201).json({
        success: true,
        data: refundRequest,
      });
    } catch (error) {
      console.error("Create refund request error:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: error.issues,
          },
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: "REFUND_REQUEST_ERROR",
          message: "Failed to create refund request",
        },
      });
    }
  }
);

/**
 * GET /api/:tenant/finance/refunds
 * Get refund requests
 */
router.get(
  "/:tenant/finance/refunds",
  requireAuth,
  requireActiveUser,
  requireRole(["FINANCE_TEAM", "INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const { status, page = "1", limit = "20" } = req.query;

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: {
            code: "TENANT_NOT_FOUND",
            message: "Tenant not found",
          },
        });
      }

      const where: any = {
        tenantId: tenant.id,
      };

      if (status) {
        where.status = status;
      }

      const refunds = await prisma.refundRequest.findMany({
        where,
        include: {
          application: {
            select: {
              studentName: true,
              studentEmail: true,
            },
          },
          payment: {
            select: {
              amount: true,
              status: true,
            },
          },
          approvals: {
            include: {
              approver: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { requestedAt: "desc" },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
      });

      const total = await prisma.refundRequest.count({ where });

      res.json({
        success: true,
        data: {
          refunds,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            pages: Math.ceil(total / parseInt(limit as string)),
          },
        },
      });
    } catch (error) {
      console.error("Get refunds error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: "Failed to fetch refunds",
        },
      });
    }
  }
);

/**
 * PUT /api/:tenant/finance/refunds/:id/approve
 * Approve or reject a refund request
 */
router.put(
  "/:tenant/finance/refunds/:id/approve",
  requireAuth,
  requireActiveUser,
  requireRole(["FINANCE_TEAM", "INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const refundId = req.params.id;
      const body = refundApprovalSchema.parse(req.body);

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: {
            code: "TENANT_NOT_FOUND",
            message: "Tenant not found",
          },
        });
      }

      const updateData: any = {
        status: body.status,
        [body.status === "APPROVED" ? "approvedBy" : "rejectedBy"]:
          req.auth?.sub,
        [body.status === "APPROVED" ? "approvedAt" : "rejectedAt"]: new Date(),
      };

      if (body.status === "REJECTED") {
        updateData.rejectionReason = body.rejectionReason;
      }

      const refundRequest = await prisma.refundRequest.update({
        where: {
          id: refundId,
          tenantId: tenant.id,
        },
        data: updateData,
        include: {
          application: {
            select: {
              studentName: true,
              studentEmail: true,
            },
          },
          payment: {
            select: {
              amount: true,
              status: true,
            },
          },
        },
      });

      // Create approval record
      await prisma.refundApproval.create({
        data: {
          refundRequestId: refundId,
          approverId: req.auth?.sub || "",
          status: body.status,
          comments: body.comments,
          approvedAt: body.status === "APPROVED" ? new Date() : undefined,
        },
      });

      // Create audit log
      await prisma.financialAuditLog.create({
        data: {
          tenantId: tenant.id,
          refundRequestId: refundId,
          action:
            body.status === "APPROVED" ? "REFUND_APPROVED" : "REFUND_REJECTED",
          details: {
            status: body.status,
            comments: body.comments,
            rejectionReason: body.rejectionReason,
          },
          performedBy: req.auth?.sub || "",
        },
      });

      res.json({
        success: true,
        data: refundRequest,
      });
    } catch (error) {
      console.error("Approve refund error:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: error.issues,
          },
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: "APPROVAL_ERROR",
          message: "Failed to approve/reject refund",
        },
      });
    }
  }
);

/**
 * GET /api/:tenant/finance/refunds/:id/audit-trail
 * Get audit trail for a refund request
 */
router.get(
  "/:tenant/finance/refunds/:id/audit-trail",
  requireAuth,
  requireActiveUser,
  requireRole(["FINANCE_TEAM", "INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const refundId = req.params.id;

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: {
            code: "TENANT_NOT_FOUND",
            message: "Tenant not found",
          },
        });
      }

      const auditLogs = await prisma.financialAuditLog.findMany({
        where: {
          tenantId: tenant.id,
          refundRequestId: refundId,
        },
        orderBy: { performedAt: "desc" },
      });

      res.json({
        success: true,
        data: auditLogs,
      });
    } catch (error) {
      console.error("Get audit trail error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "AUDIT_TRAIL_ERROR",
          message: "Failed to fetch audit trail",
        },
      });
    }
  }
);

/**
 * GET /api/:tenant/finance/reports/summary
 * Get financial summary report
 */
router.get(
  "/:tenant/finance/reports/summary",
  requireAuth,
  requireActiveUser,
  requireRole(["FINANCE_TEAM", "INSTITUTION_ADMIN", "SUPER_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const { startDate, endDate } = req.query;

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: {
            code: "TENANT_NOT_FOUND",
            message: "Tenant not found",
          },
        });
      }

      const where: any = { tenantId: tenant.id };

      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      // Get payment summary
      const payments = await prisma.payment.findMany({
        where,
        select: {
          amount: true,
          platformFee: true,
          institutionAmount: true,
          status: true,
          createdAt: true,
        },
      });

      // Get refund summary
      const refunds = await prisma.refundRequest.findMany({
        where: { tenantId: tenant.id },
        select: {
          amount: true,
          status: true,
          requestedAt: true,
        },
      });

      const totalRevenue = payments
        .filter((p) => p.status === "COMPLETED")
        .reduce((sum, p) => sum + p.amount, 0);

      const totalPlatformFees = payments
        .filter((p) => p.status === "COMPLETED")
        .reduce((sum, p) => sum + p.platformFee, 0);

      const totalInstitutionAmount = payments
        .filter((p) => p.status === "COMPLETED")
        .reduce((sum, p) => sum + p.institutionAmount, 0);

      const totalRefunds = refunds
        .filter((r) => r.status === "APPROVED")
        .reduce((sum, r) => sum + r.amount, 0);

      res.json({
        success: true,
        data: {
          summary: {
            totalRevenue,
            totalPlatformFees,
            totalInstitutionAmount,
            totalRefunds,
            netRevenue: totalInstitutionAmount - totalRefunds,
          },
          payments: payments.length,
          refunds: refunds.length,
          period: {
            startDate: startDate || null,
            endDate: endDate || null,
          },
        },
      });
    } catch (error) {
      console.error("Get financial summary error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "REPORT_ERROR",
          message: "Failed to generate financial summary",
        },
      });
    }
  }
);

export default router;
