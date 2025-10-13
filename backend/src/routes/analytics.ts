import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { analyticsAggregator } from "../lib/analytics-aggregation";
import { reportGenerator } from "../lib/report-generator";
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
  requireRole(["INSTITUTION_ADMIN"]),
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

      const conversionRate =
        totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

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
        leadsByDay: leadsByDay.map((item) => ({
          date: item.createdAt.toISOString().split("T")[0],
          count: item._count.id,
        })),
        conversionsByDay: conversionsByDay.map((item) => ({
          date: item.createdAt.toISOString().split("T")[0],
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

/**
 * GET /api/:tenant/analytics/funnel
 * Get lead funnel analytics
 */
router.get(
  "/:tenant/analytics/funnel",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN", "ADMISSION_HEAD"]),
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;
      const { period = "30d" } = req.query;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const dateRange = getDateRange(period as string);

      const leads = await prisma.lead.findMany({
        where: {
          tenantId: tenant.id,
          createdAt: { gte: dateRange.start, lte: dateRange.end },
        },
        select: { status: true, createdAt: true },
      });

      const funnel = calculateFunnel(leads);

      res.json({ success: true, data: funnel });
    } catch (error) {
      console.error("Get funnel analytics error:", error);
      res.status(500).json({ error: "Failed to fetch funnel data" });
    }
  }
);

/**
 * GET /api/:tenant/analytics/conversions
 * Get conversion rate analytics
 */
router.get(
  "/:tenant/analytics/conversions",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN", "ADMISSION_HEAD"]),
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;
      const { period = "30d" } = req.query;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const dateRange = getDateRange(period as string);

      const leads = await prisma.lead.findMany({
        where: {
          tenantId: tenant.id,
          createdAt: { gte: dateRange.start, lte: dateRange.end },
        },
        select: { status: true, createdAt: true, sourceTracking: true },
      });

      const conversions = calculateConversions(leads);

      res.json({ success: true, data: conversions });
    } catch (error) {
      console.error("Get conversion analytics error:", error);
      res.status(500).json({ error: "Failed to fetch conversion data" });
    }
  }
);

/**
 * GET /api/:tenant/analytics/sources
 * Get source performance analytics
 */
router.get(
  "/:tenant/analytics/sources",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN", "ADMISSION_HEAD"]),
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;
      const { period = "30d" } = req.query;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const dateRange = getDateRange(period as string);

      const leads = await prisma.lead.findMany({
        where: {
          tenantId: tenant.id,
          createdAt: { gte: dateRange.start, lte: dateRange.end },
        },
        include: { sourceTracking: true },
      });

      const sources = calculateSourcePerformance(leads);

      res.json({ success: true, data: sources });
    } catch (error) {
      console.error("Get source analytics error:", error);
      res.status(500).json({ error: "Failed to fetch source data" });
    }
  }
);

/**
 * GET /api/:tenant/analytics/roi
 * Get campaign ROI analytics
 */
router.get(
  "/:tenant/analytics/roi",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN", "ADMISSION_HEAD"]),
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;
      const { period = "30d" } = req.query;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const dateRange = getDateRange(period as string);

      const sourceTrackings = await prisma.leadSourceTracking.findMany({
        where: {
          lead: {
            tenantId: tenant.id,
            createdAt: { gte: dateRange.start, lte: dateRange.end },
          },
        },
        include: { lead: true },
      });

      const roi = calculateROI(sourceTrackings);

      res.json({ success: true, data: roi });
    } catch (error) {
      console.error("Get ROI analytics error:", error);
      res.status(500).json({ error: "Failed to fetch ROI data" });
    }
  }
);

/**
 * POST /api/:tenant/analytics/reports/custom
 * Create custom report
 */
router.post(
  "/:tenant/analytics/reports/custom",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;
      const { name, description, type, config, schedule } = req.body;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const template = await prisma.reportTemplate.create({
        data: {
          tenantId: tenant.id,
          name,
          description,
          type,
          config,
          schedule,
        },
      });

      res.status(201).json({ success: true, data: template });
    } catch (error) {
      console.error("Create custom report error:", error);
      res.status(500).json({ error: "Failed to create report template" });
    }
  }
);

/**
 * GET /api/:tenant/analytics/reports
 * List saved reports
 */
router.get(
  "/:tenant/analytics/reports",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const templates = await prisma.reportTemplate.findMany({
        where: { tenantId: tenant.id },
        orderBy: { createdAt: "desc" },
      });

      res.json({ success: true, data: templates });
    } catch (error) {
      console.error("List reports error:", error);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  }
);

/**
 * POST /api/:tenant/analytics/reports/:id/export
 * Export report (PDF/Excel)
 */
router.post(
  "/:tenant/analytics/reports/:id/export",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;
      const { id } = req.params;
      const { format = "PDF", periodStart, periodEnd } = req.body;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const startDate = new Date(periodStart);
      const endDate = new Date(periodEnd);

      let result;
      if (format === "EXCEL") {
        result = await reportGenerator.generateExcelReport(
          id,
          req.user!.id,
          startDate,
          endDate
        );
      } else {
        result = await reportGenerator.generateReport(
          id,
          req.user!.id,
          startDate,
          endDate
        );
      }

      res.json({ success: true, data: result });
    } catch (error) {
      console.error("Export report error:", error);
      res.status(500).json({ error: "Failed to export report" });
    }
  }
);

// Helper methods
function getDateRange(period: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case "7d":
      start.setDate(end.getDate() - 7);
      break;
    case "30d":
      start.setDate(end.getDate() - 30);
      break;
    case "90d":
      start.setDate(end.getDate() - 90);
      break;
    default:
      start.setDate(end.getDate() - 30);
  }

  return { start, end };
}

function calculateFunnel(leads: any[]): any[] {
  const stages = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED"];
  const funnel = stages.map((stage, index) => {
    const count = leads.filter((lead) => lead.status === stage).length;
    const previousCount =
      index > 0
        ? leads.filter((lead) => stages.indexOf(lead.status) >= index - 1)
            .length
        : leads.length;

    return {
      stage,
      count,
      percentage: leads.length > 0 ? (count / leads.length) * 100 : 0,
      dropOffRate:
        previousCount > 0 ? ((previousCount - count) / previousCount) * 100 : 0,
    };
  });

  return funnel;
}

function calculateConversions(leads: any[]): any {
  const totalLeads = leads.length;
  const convertedLeads = leads.filter(
    (lead) => lead.status === "CONVERTED"
  ).length;
  const conversionRate =
    totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  return {
    totalLeads,
    convertedLeads,
    conversionRate,
    trends: {
      daily: [], // Would calculate daily trends
      weekly: [], // Would calculate weekly trends
    },
  };
}

function calculateSourcePerformance(leads: any[]): any[] {
  const sourceMap = new Map();

  leads.forEach((lead) => {
    const source = lead.sourceTracking?.platform || lead.source || "UNKNOWN";
    if (!sourceMap.has(source)) {
      sourceMap.set(source, { source, total: 0, converted: 0 });
    }

    const data = sourceMap.get(source);
    data.total++;
    if (lead.status === "CONVERTED") {
      data.converted++;
    }
  });

  return Array.from(sourceMap.values()).map((data) => ({
    ...data,
    conversionRate: data.total > 0 ? (data.converted / data.total) * 100 : 0,
  }));
}

function calculateROI(sourceTrackings: any[]): any {
  const totalCost = sourceTrackings.reduce(
    (sum, tracking) => sum + (tracking.cost || 0),
    0
  );
  const totalLeads = sourceTrackings.length;
  const convertedLeads = sourceTrackings.filter(
    (t) => t.lead.status === "CONVERTED"
  ).length;

  return {
    totalCost,
    totalLeads,
    convertedLeads,
    costPerLead: totalLeads > 0 ? totalCost / totalLeads : 0,
    costPerConversion: convertedLeads > 0 ? totalCost / convertedLeads : 0,
    roi: totalCost > 0 ? ((convertedLeads * 1000) / totalCost) * 100 : 0, // Assuming 1000 value per conversion
  };
}

export default router;
