import { Router } from "express";
import { prisma } from "../lib/prisma";
import {
  requireAuth,
  requireRole,
  requireInstitutionAdmin,
  requireActiveUser,
  requireTenantAccess,
  AuthedRequest,
} from "../middleware/auth";

const router = Router();

/**
 * GET /api/:tenant/analytics/stats
 * Get institution analytics and statistics
 */
router.get(
  "/:tenant/analytics/stats",
  requireAuth,
  requireActiveUser,
  requireInstitutionAdmin,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;

      if (!tenantSlug) {
        return res.status(400).json({
          error: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true, name: true },
      });

      if (!tenant) {
        return res.status(404).json({
          error: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      // Get user statistics
      const totalUsers = await prisma.user.count({
        where: {
          tenantId: tenant.id,
          role: { not: "SUPER_ADMIN" },
        },
      });

      const activeUsers = await prisma.user.count({
        where: {
          tenantId: tenant.id,
          isActive: true,
          role: { not: "SUPER_ADMIN" },
        },
      });

      const newUsersThisMonth = await prisma.user.count({
        where: {
          tenantId: tenant.id,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
          role: { not: "SUPER_ADMIN" },
        },
      });

      // Get lead statistics
      const totalLeads = await prisma.lead.count({
        where: { tenantId: tenant.id },
      });

      const convertedLeads = await prisma.lead.count({
        where: {
          tenantId: tenant.id,
          status: { in: ["ADMITTED", "ENROLLED"] },
        },
      });

      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      // Get revenue statistics (mock data for now)
      const monthlyRevenue = 45000; // This would come from payment records
      const revenueGrowth = 12.5; // This would be calculated from historical data

      // Get upcoming appointments
      const upcomingAppointments = await prisma.appointment.count({
        where: {
          tenantId: tenant.id,
          scheduledAt: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
          },
          status: { in: ["SCHEDULED", "CONFIRMED"] },
        },
      });

      // Get pending tasks (mock data for now)
      const pendingTasks = 5; // This would come from task management system

      const stats = {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        totalLeads,
        convertedLeads,
        conversionRate: Math.round(conversionRate * 100) / 100,
        monthlyRevenue,
        revenueGrowth,
        upcomingAppointments,
        pendingTasks,
      };

      res.json({ stats });
    } catch (error) {
      console.error("Get analytics stats error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * GET /api/:tenant/analytics/performance
 * Get detailed performance analytics
 */
router.get(
  "/:tenant/analytics/performance",
  requireAuth,
  requireActiveUser,
  requireInstitutionAdmin,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const { period = "30d" } = req.query;

      if (!tenantSlug) {
        return res.status(400).json({
          error: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          error: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      // Calculate date range based on period
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

      // Get lead performance data
      const leadsByDay = await prisma.lead.groupBy({
        by: ["createdAt"],
        where: {
          tenantId: tenant.id,
          createdAt: { gte: startDate },
        },
        _count: { id: true },
        orderBy: { createdAt: "asc" },
      });

      // Get conversion data
      const conversionsByDay = await prisma.lead.groupBy({
        by: ["createdAt"],
        where: {
          tenantId: tenant.id,
          createdAt: { gte: startDate },
          status: { in: ["ADMITTED", "ENROLLED"] },
        },
        _count: { id: true },
        orderBy: { createdAt: "asc" },
      });

      // Get user activity data
      const userActivity = await prisma.user.findMany({
        where: {
          tenantId: tenant.id,
          lastLoginAt: { gte: startDate },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          lastLoginAt: true,
        },
        orderBy: { lastLoginAt: "desc" },
      });

      const performance = {
        leadsByDay: leadsByDay.map(item => ({
          date: item.createdAt.toISOString().split('T')[0],
          count: item._count.id,
        })),
        conversionsByDay: conversionsByDay.map(item => ({
          date: item.createdAt.toISOString().split('T')[0],
          count: item._count.id,
        })),
        userActivity,
        period,
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
      };

      res.json({ performance });
    } catch (error) {
      console.error("Get performance analytics error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

export default router;