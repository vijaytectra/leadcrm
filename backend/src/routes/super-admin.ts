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

/**
 * GET /api/super-admin/dashboard
 * Get super admin dashboard data
 */
router.get(
  "/dashboard",
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

      // Get dashboard metrics
      const [
        totalInstitutions,
        activeInstitutions,
        totalUsers,
        totalLeads,
        totalApplications,
        totalRevenue,
        platformFees,
        recentInstitutions,
        subscriptionDistribution,
        revenueByTier,
        recentActivity,
        systemHealth,
      ] = await Promise.all([
        // Total institutions
        prisma.tenant.count(),

        // Active institutions
        prisma.tenant.count({
          where: { subscriptionStatus: "ACTIVE" },
        }),

        // Total users
        prisma.user.count({
          where: { role: { not: "SUPER_ADMIN" } },
        }),

        // Total leads
        prisma.lead.count(),

        // Total applications
        prisma.application.count(),

        // Total revenue
        prisma.payment.aggregate({
          where: {
            status: "COMPLETED",
            createdAt: { gte: startDate },
          },
          _sum: { amount: true },
        }),

        // Platform fees
        prisma.payment.aggregate({
          where: {
            status: "COMPLETED",
            createdAt: { gte: startDate },
          },
          _sum: { platformFee: true },
        }),

        // Recent institutions
        prisma.tenant.findMany({
          select: {
            id: true,
            slug: true,
            name: true,
            subscriptionTier: true,
            subscriptionStatus: true,
            createdAt: true,
            _count: {
              select: {
                users: true,
                leads: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),

        // Subscription distribution
        prisma.tenant.groupBy({
          by: ["subscriptionTier"],
          where: { subscriptionStatus: "ACTIVE" },
          _count: { subscriptionTier: true },
        }),

        // Revenue by tier
        prisma.$queryRaw`
          SELECT 
            t.subscriptionTier,
            SUM(p.amount) as revenue,
            COUNT(p.id) as payment_count
          FROM Tenant t
          LEFT JOIN Payment p ON t.id = p.tenantId
          WHERE p.status = 'COMPLETED' 
            AND p.createdAt >= ${startDate}
          GROUP BY t.subscriptionTier
        `,

        // Recent activity
        prisma.auditLog.findMany({
          where: { createdAt: { gte: startDate } },
          select: {
            action: true,
            entity: true,
            createdAt: true,
            tenant: {
              select: {
                name: true,
                slug: true,
              },
            },
            user: {
              select: {
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),

        // System health metrics
        prisma.$queryRaw`
          SELECT 
            COUNT(DISTINCT t.id) as active_tenants,
            COUNT(DISTINCT u.id) as active_users,
            COUNT(DISTINCT l.id) as total_leads,
            COUNT(DISTINCT a.id) as total_applications
          FROM Tenant t
          LEFT JOIN User u ON t.id = u.tenantId AND u.isActive = true
          LEFT JOIN Lead l ON t.id = l.tenantId
          LEFT JOIN Application a ON t.id = a.tenantId
          WHERE t.subscriptionStatus = 'ACTIVE'
        `,
      ]);

      res.json({
        dashboard: {
          overview: {
            totalInstitutions,
            activeInstitutions,
            totalUsers,
            totalLeads,
            totalApplications,
            totalRevenue: totalRevenue._sum.amount || 0,
            platformFees: platformFees._sum.platformFee || 0,
            netRevenue:
              (totalRevenue._sum.amount || 0) -
              (platformFees._sum.platformFee || 0),
          },
          recentInstitutions,
          subscriptionDistribution,
          revenueByTier: Array.isArray(revenueByTier) ? revenueByTier : [],
          recentActivity,
          systemHealth:
            Array.isArray(systemHealth) && systemHealth[0]
              ? systemHealth[0]
              : {},
        },
        period,
        dateRange: {
          start: startDate,
          end: now,
        },
      });
    } catch (error) {
      console.error("Get dashboard error:", error);
      res.status(500).json({
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * GET /api/super-admin/analytics
 * Get detailed analytics
 */
router.get(
  "/analytics",
  requireAuth,
  requireActiveUser,
  requireSuperAdmin,
  async (req: AuthedRequest, res) => {
    try {
      const { period = "30d", metric = "revenue", groupBy = "day" } = req.query;

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

      let analyticsData: any = {};

      switch (metric) {
        case "revenue":
          if (groupBy === "day") {
            analyticsData = await prisma.$queryRaw`
              SELECT 
                DATE(createdAt) as date,
                SUM(amount) as revenue,
                SUM(platformFee) as platform_fees,
                COUNT(*) as transactions
              FROM Payment
              WHERE status = 'COMPLETED' 
                AND createdAt >= ${startDate}
              GROUP BY DATE(createdAt)
              ORDER BY DATE(createdAt)
            `;
          } else if (groupBy === "week") {
            analyticsData = await prisma.$queryRaw`
              SELECT 
                strftime('%Y-%W', createdAt) as week,
                SUM(amount) as revenue,
                SUM(platformFee) as platform_fees,
                COUNT(*) as transactions
              FROM Payment
              WHERE status = 'COMPLETED' 
                AND createdAt >= ${startDate}
              GROUP BY strftime('%Y-%W', createdAt)
              ORDER BY strftime('%Y-%W', createdAt)
            `;
          } else if (groupBy === "month") {
            analyticsData = await prisma.$queryRaw`
              SELECT 
                strftime('%Y-%m', createdAt) as month,
                SUM(amount) as revenue,
                SUM(platformFee) as platform_fees,
                COUNT(*) as transactions
              FROM Payment
              WHERE status = 'COMPLETED' 
                AND createdAt >= ${startDate}
              GROUP BY strftime('%Y-%m', createdAt)
              ORDER BY strftime('%Y-%m', createdAt)
            `;
          }
          break;

        case "leads":
          if (groupBy === "day") {
            analyticsData = await prisma.$queryRaw`
              SELECT 
                DATE(createdAt) as date,
                COUNT(*) as leads,
                COUNT(CASE WHEN status = 'ENROLLED' THEN 1 END) as enrolled
              FROM Lead
              WHERE createdAt >= ${startDate}
              GROUP BY DATE(createdAt)
              ORDER BY DATE(createdAt)
            `;
          } else if (groupBy === "week") {
            analyticsData = await prisma.$queryRaw`
              SELECT 
                strftime('%Y-%W', createdAt) as week,
                COUNT(*) as leads,
                COUNT(CASE WHEN status = 'ENROLLED' THEN 1 END) as enrolled
              FROM Lead
              WHERE createdAt >= ${startDate}
              GROUP BY strftime('%Y-%W', createdAt)
              ORDER BY strftime('%Y-%W', createdAt)
            `;
          } else if (groupBy === "month") {
            analyticsData = await prisma.$queryRaw`
              SELECT 
                strftime('%Y-%m', createdAt) as month,
                COUNT(*) as leads,
                COUNT(CASE WHEN status = 'ENROLLED' THEN 1 END) as enrolled
              FROM Lead
              WHERE createdAt >= ${startDate}
              GROUP BY strftime('%Y-%m', createdAt)
              ORDER BY strftime('%Y-%m', createdAt)
            `;
          }
          break;

        case "institutions":
          if (groupBy === "day") {
            analyticsData = await prisma.$queryRaw`
              SELECT 
                DATE(createdAt) as date,
                COUNT(*) as institutions,
                COUNT(CASE WHEN subscriptionStatus = 'ACTIVE' THEN 1 END) as active
              FROM Tenant
              WHERE createdAt >= ${startDate}
              GROUP BY DATE(createdAt)
              ORDER BY DATE(createdAt)
            `;
          } else if (groupBy === "week") {
            analyticsData = await prisma.$queryRaw`
              SELECT 
                strftime('%Y-%W', createdAt) as week,
                COUNT(*) as institutions,
                COUNT(CASE WHEN subscriptionStatus = 'ACTIVE' THEN 1 END) as active
              FROM Tenant
              WHERE createdAt >= ${startDate}
              GROUP BY strftime('%Y-%W', createdAt)
              ORDER BY strftime('%Y-%W', createdAt)
            `;
          } else if (groupBy === "month") {
            analyticsData = await prisma.$queryRaw`
              SELECT 
                strftime('%Y-%m', createdAt) as month,
                COUNT(*) as institutions,
                COUNT(CASE WHEN subscriptionStatus = 'ACTIVE' THEN 1 END) as active
              FROM Tenant
              WHERE createdAt >= ${startDate}
              GROUP BY strftime('%Y-%m', createdAt)
              ORDER BY strftime('%Y-%m', createdAt)
            `;
          }
          break;
      }

      res.json({
        analytics: analyticsData,
        metric,
        groupBy,
        period,
        dateRange: {
          start: startDate,
          end: now,
        },
      });
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * GET /api/super-admin/reports
 * Get various reports
 */
router.get(
  "/reports",
  requireAuth,
  requireActiveUser,
  requireSuperAdmin,
  async (req: AuthedRequest, res) => {
    try {
      const { type = "financial", period = "30d" } = req.query;

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

      let reportData: any = {};

      switch (type) {
        case "financial":
          reportData = await prisma.$queryRaw`
            SELECT 
              t.name as institution_name,
              t.slug as institution_slug,
              t.subscriptionTier,
              COUNT(p.id) as total_payments,
              SUM(p.amount) as total_revenue,
              SUM(p.platformFee) as total_platform_fees,
              SUM(p.institutionAmount) as institution_revenue
            FROM Tenant t
            LEFT JOIN Payment p ON t.id = p.tenantId 
              AND p.status = 'COMPLETED' 
              AND p.createdAt >= ${startDate}
            GROUP BY t.id, t.name, t.slug, t.subscriptionTier
            ORDER BY total_revenue DESC
          `;
          break;

        case "institution-performance":
          reportData = await prisma.$queryRaw`
            SELECT 
              t.name as institution_name,
              t.slug as institution_slug,
              t.subscriptionTier,
              COUNT(DISTINCT l.id) as total_leads,
              COUNT(DISTINCT a.id) as total_applications,
              COUNT(DISTINCT CASE WHEN l.status = 'ENROLLED' THEN l.id END) as enrolled_students,
              ROUND(
                COUNT(DISTINCT CASE WHEN l.status = 'ENROLLED' THEN l.id END) * 100.0 / 
                NULLIF(COUNT(DISTINCT l.id), 0), 2
              ) as conversion_rate
            FROM Tenant t
            LEFT JOIN Lead l ON t.id = l.tenantId
            LEFT JOIN Application a ON t.id = a.tenantId
            WHERE t.createdAt >= ${startDate}
            GROUP BY t.id, t.name, t.slug, t.subscriptionTier
            ORDER BY conversion_rate DESC
          `;
          break;

        case "user-activity":
          reportData = await prisma.$queryRaw`
            SELECT 
              u.firstName,
              u.lastName,
              u.email,
              u.role,
              t.name as institution_name,
              COUNT(al.id) as activity_count,
              MAX(al.createdAt) as last_activity
            FROM User u
            LEFT JOIN Tenant t ON u.tenantId = t.id
            LEFT JOIN AuditLog al ON u.id = al.userId 
              AND al.createdAt >= ${startDate}
            WHERE u.role != 'SUPER_ADMIN'
            GROUP BY u.id, u.firstName, u.lastName, u.email, u.role, t.name
            ORDER BY activity_count DESC
          `;
          break;
      }

      res.json({
        report: reportData,
        type,
        period,
        dateRange: {
          start: startDate,
          end: now,
        },
        generatedAt: new Date(),
      });
    } catch (error) {
      console.error("Get report error:", error);
      res.status(500).json({
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * GET /api/super-admin/system-health
 * Get system health metrics
 */
router.get(
  "/system-health",
  requireAuth,
  requireActiveUser,
  requireSuperAdmin,
  async (req: AuthedRequest, res) => {
    try {
      const [
        databaseHealth,
        emailServiceHealth,
        recentErrors,
        performanceMetrics,
      ] = await Promise.all([
        // Database health
        prisma.$queryRaw`
          SELECT 
            COUNT(*) as total_tables,
            COUNT(CASE WHEN name LIKE 'Tenant%' THEN 1 END) as tenant_tables,
            COUNT(CASE WHEN name LIKE 'User%' THEN 1 END) as user_tables
          FROM sqlite_master 
          WHERE type = 'table'
        `,

        // Email service health (mock for now)
        { configured: true, ready: true, lastTest: new Date() },

        // Recent errors from audit logs
        prisma.auditLog.findMany({
          where: {
            action: { contains: "ERROR" },
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
          },
          select: {
            action: true,
            entity: true,
            createdAt: true,
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

        // Performance metrics
        prisma.$queryRaw`
          SELECT 
            COUNT(DISTINCT t.id) as active_tenants,
            COUNT(DISTINCT u.id) as active_users,
            COUNT(DISTINCT l.id) as total_leads,
            COUNT(DISTINCT p.id) as total_payments,
            AVG(CASE WHEN p.status = 'COMPLETED' THEN p.amount END) as avg_payment_amount
          FROM Tenant t
          LEFT JOIN User u ON t.id = u.tenantId AND u.isActive = true
          LEFT JOIN Lead l ON t.id = l.tenantId
          LEFT JOIN Payment p ON t.id = p.tenantId
          WHERE t.subscriptionStatus = 'ACTIVE'
        `,
      ]);

      res.json({
        systemHealth: {
          database:
            Array.isArray(databaseHealth) && databaseHealth[0]
              ? databaseHealth[0]
              : {},
          emailService: emailServiceHealth,
          recentErrors,
          performance:
            Array.isArray(performanceMetrics) && performanceMetrics[0]
              ? performanceMetrics[0]
              : {},
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error("Get system health error:", error);
      res.status(500).json({
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

export default router;
