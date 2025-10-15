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

// Analytics query validation schemas
const analyticsQuerySchema = z.object({
  startDate: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .optional(),
  endDate: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .optional(),
  period: z
    .enum(["daily", "weekly", "monthly", "yearly"])
    .optional()
    .default("daily"),
  groupBy: z
    .enum(["source", "form", "widget", "course", "status"])
    .optional()
    .default("source"),
});

const leadConversionQuerySchema = z.object({
  startDate: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .optional(),
  endDate: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .optional(),
  source: z.string().optional(),
  formId: z.string().optional(),
  widgetId: z.string().optional(),
});

// Widget Analytics Routes

/**
 * GET /:tenant/analytics/widgets/:widgetId
 * Get widget-specific analytics
 */
router.get(
  "/:tenant/analytics/widgets/:widgetId",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const widgetId = req.params.widgetId;

      if (!tenantSlug) {
        return res.status(400).json({
          message: "Tenant slug is required",
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
          message: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const query = analyticsQuerySchema.safeParse(req.query);
      if (!query.success) {
        return res.status(400).json({
          message: "Invalid query parameters",
          details: query.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const { startDate, endDate, period, groupBy } = query.data;

      // Get widget analytics
      const widgetAnalytics = await prisma.formWidgetAnalytics.findMany({
        where: {
          widgetId,
          date: {
            gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default to last 30 days
            lte: endDate || new Date(),
          },
        },
        orderBy: { date: "asc" },
      });

      // Get widget details
      const widget = await prisma.formWidget.findUnique({
        where: { id: widgetId },
        include: {
          form: {
            select: {
              id: true,
              title: true,
              tenantId: true,
            },
          },
        },
      });

      if (!widget || widget.form.tenantId !== tenant.id) {
        return res.status(404).json({
          message: "Widget not found",
          code: "WIDGET_NOT_FOUND",
        });
      }

      // Calculate conversion metrics
      const totalViews = widgetAnalytics.reduce(
        (sum, day) => sum + day.views,
        0
      );
      const totalSubmissions = widgetAnalytics.reduce(
        (sum, day) => sum + day.submissions,
        0
      );
      const totalConversions = widgetAnalytics.reduce(
        (sum, day) => sum + day.conversions,
        0
      );

      const conversionRate =
        totalViews > 0 ? (totalSubmissions / totalViews) * 100 : 0;
      const leadConversionRate =
        totalSubmissions > 0 ? (totalConversions / totalSubmissions) * 100 : 0;

      // Get lead source breakdown
      const leadSources = await prisma.leadSourceTracking.findMany({
        where: {
          lead: {
            tenantId: tenant.id,
            formSubmission: {
              form: {
                widgets: {
                  some: { id: widgetId },
                },
              },
            },
          },
        },
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              status: true,
              score: true,
              createdAt: true,
            },
          },
        },
      });

      // Group by source
      const sourceBreakdown = leadSources.reduce((acc, tracking) => {
        const source = tracking.platform;
        if (!acc[source]) {
          acc[source] = {
            count: 0,
            leads: [],
            totalScore: 0,
          };
        }
        acc[source].count++;
        acc[source].leads.push(tracking.lead);
        acc[source].totalScore += tracking.lead.score || 0;
        return acc;
      }, {} as Record<string, { count: number; leads: any[]; totalScore: number; averageScore?: number }>);

      // Calculate average scores by source
      Object.keys(sourceBreakdown).forEach((source) => {
        sourceBreakdown[source].averageScore =
          sourceBreakdown[source].totalScore / sourceBreakdown[source].count;
      });

      res.json({
        success: true,
        data: {
          widget: {
            id: widget.id,
            name: widget.name,
            formTitle: widget.form.title,
            isActive: widget.isActive,
          },
          metrics: {
            totalViews,
            totalSubmissions,
            totalConversions,
            conversionRate: Math.round(conversionRate * 100) / 100,
            leadConversionRate: Math.round(leadConversionRate * 100) / 100,
          },
          analytics: widgetAnalytics,
          sourceBreakdown,
          period: {
            startDate:
              startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: endDate || new Date(),
            period,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching widget analytics:", error);
      res.status(500).json({
        message: "Failed to fetch widget analytics",
        code: "ANALYTICS_ERROR",
      });
    }
  }
);

/**
 * GET /:tenant/analytics/leads/conversion
 * Get lead conversion analytics
 */
router.get(
  "/:tenant/analytics/leads/conversion",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;

      if (!tenantSlug) {
        return res.status(400).json({
          message: "Tenant slug is required",
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
          message: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const query = leadConversionQuerySchema.safeParse(req.query);
      if (!query.success) {
        return res.status(400).json({
          message: "Invalid query parameters",
          details: query.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const { startDate, endDate, source, formId, widgetId } = query.data;

      // Build where clause
      const where: any = {
        tenantId: tenant.id,
        createdAt: {
          gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lte: endDate || new Date(),
        },
      };

      if (source) {
        where.source = source;
      }

      if (formId) {
        where.formSubmission = {
          formId,
        };
      }

      if (widgetId) {
        where.formSubmission = {
          form: {
            widgets: {
              some: { id: widgetId },
            },
          },
        };
      }

      // Get leads with conversion data
      const leads = await prisma.lead.findMany({
        where,
        include: {
          formSubmission: {
            include: {
              form: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          sourceTracking: {
            select: {
              platform: true,
              campaignName: true,
              cost: true,
            },
          },
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Calculate conversion metrics
      const totalLeads = leads.length;
      const convertedLeads = leads.filter((lead) =>
        ["ADMITTED", "ENROLLED"].includes(lead.status)
      ).length;
      const conversionRate =
        totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      // Calculate average lead score
      const averageScore =
        leads.length > 0
          ? leads.reduce((sum, lead) => sum + (lead.score || 0), 0) /
            leads.length
          : 0;

      // Group by source
      const sourceMetrics = leads.reduce((acc, lead) => {
        const leadSource = lead.source || "Unknown";
        if (!acc[leadSource]) {
          acc[leadSource] = {
            total: 0,
            converted: 0,
            averageScore: 0,
            totalScore: 0,
          };
        }
        acc[leadSource].total++;
        acc[leadSource].totalScore += lead.score || 0;
        if (["ADMITTED", "ENROLLED"].includes(lead.status)) {
          acc[leadSource].converted++;
        }
        return acc;
      }, {} as Record<string, { total: number; converted: number; averageScore: number; totalScore: number; conversionRate?: number }>);

      // Calculate conversion rates by source
      Object.keys(sourceMetrics).forEach((source) => {
        sourceMetrics[source].conversionRate =
          sourceMetrics[source].total > 0
            ? (sourceMetrics[source].converted / sourceMetrics[source].total) *
              100
            : 0;
        sourceMetrics[source].averageScore =
          sourceMetrics[source].total > 0
            ? sourceMetrics[source].totalScore / sourceMetrics[source].total
            : 0;
      });

      // Group by status
      const statusMetrics = leads.reduce((acc, lead) => {
        if (!acc[lead.status]) {
          acc[lead.status] = 0;
        }
        acc[lead.status]++;
        return acc;
      }, {} as Record<string, number>);

      // Group by form
      const formMetrics = leads.reduce((acc, lead) => {
        if (lead.formSubmission?.form) {
          const formTitle = lead.formSubmission.form.title;
          if (!acc[formTitle]) {
            acc[formTitle] = {
              total: 0,
              converted: 0,
              averageScore: 0,
              totalScore: 0,
            };
          }
          acc[formTitle].total++;
          acc[formTitle].totalScore += lead.score || 0;
          if (["ADMITTED", "ENROLLED"].includes(lead.status)) {
            acc[formTitle].converted++;
          }
        }
        return acc;
      }, {} as Record<string, { total: number; converted: number; averageScore: number; totalScore: number; conversionRate?: number }>);

      // Calculate conversion rates by form
      Object.keys(formMetrics).forEach((form) => {
        formMetrics[form].conversionRate =
          formMetrics[form].total > 0
            ? (formMetrics[form].converted / formMetrics[form].total) * 100
            : 0;
        formMetrics[form].averageScore =
          formMetrics[form].total > 0
            ? formMetrics[form].totalScore / formMetrics[form].total
            : 0;
      });

      res.json({
        success: true,
        data: {
          overview: {
            totalLeads,
            convertedLeads,
            conversionRate: Math.round(conversionRate * 100) / 100,
            averageScore: Math.round(averageScore * 100) / 100,
          },
          sourceMetrics,
          statusMetrics,
          formMetrics,
          leads: leads.slice(0, 50), // Return first 50 leads for detailed view
          period: {
            startDate:
              startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: endDate || new Date(),
          },
        },
      });
    } catch (error) {
      console.error("Error fetching lead conversion analytics:", error);
      res.status(500).json({
        error: "Failed to fetch lead conversion analytics",
        code: "ANALYTICS_ERROR",
      });
    }
  }
);

/**
 * GET /:tenant/analytics/forms/:formId
 * Get form-specific analytics
 */
router.get(
  "/:tenant/analytics/forms/:formId",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const formId = req.params.formId;

      if (!tenantSlug) {
        return res.status(400).json({
          message: "Tenant slug is required",
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

      const query = analyticsQuerySchema.safeParse(req.query);
      if (!query.success) {
        return res.status(400).json({
          error: "Invalid query parameters",
          details: query.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const { startDate, endDate, period } = query.data;

      // Get form details
      const form = await prisma.form.findFirst({
        where: {
          id: formId,
          tenantId: tenant.id,
        },
        include: {
          widgets: {
            select: {
              id: true,
              name: true,
              isActive: true,
            },
          },
        },
      });

      if (!form) {
        return res.status(404).json({
          error: "Form not found",
          code: "FORM_NOT_FOUND",
        });
      }

      // Get form submissions
      const submissions = await prisma.formSubmission.findMany({
        where: {
          formId,
          createdAt: {
            gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            lte: endDate || new Date(),
          },
        },
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              status: true,
              score: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Calculate form metrics
      const totalSubmissions = submissions.length;
      const convertedSubmissions = submissions.filter(
        (submission) =>
          submission.lead &&
          ["ADMITTED", "ENROLLED"].includes(submission.lead.status)
      ).length;
      const conversionRate =
        totalSubmissions > 0
          ? (convertedSubmissions / totalSubmissions) * 100
          : 0;

      // Calculate average completion time (if available in metadata)
      const completionTimes = submissions
        .map((submission) => {
          const metadata = submission.metadata as any;
          return metadata?.completionTime || 0;
        })
        .filter((time) => time > 0);

      const averageCompletionTime =
        completionTimes.length > 0
          ? completionTimes.reduce((sum, time) => sum + time, 0) /
            completionTimes.length
          : 0;

      // Group by widget
      const widgetMetrics = submissions.reduce((acc, submission) => {
        // Find which widget was used (this would need to be tracked in submission metadata)
        const widgetId = (submission.metadata as any)?.widgetId || "unknown";
        if (!acc[widgetId]) {
          acc[widgetId] = {
            total: 0,
            converted: 0,
            averageScore: 0,
            totalScore: 0,
          };
        }
        acc[widgetId].total++;
        if (
          submission.lead &&
          ["ADMITTED", "ENROLLED"].includes(submission.lead.status)
        ) {
          acc[widgetId].converted++;
        }
        if (submission.lead?.score) {
          acc[widgetId].totalScore += submission.lead.score;
        }
        return acc;
      }, {} as Record<string, { total: number; converted: number; averageScore: number; totalScore: number; conversionRate?: number }>);

      // Calculate conversion rates by widget
      Object.keys(widgetMetrics).forEach((widgetId) => {
        widgetMetrics[widgetId].conversionRate =
          widgetMetrics[widgetId].total > 0
            ? (widgetMetrics[widgetId].converted /
                widgetMetrics[widgetId].total) *
              100
            : 0;
        widgetMetrics[widgetId].averageScore =
          widgetMetrics[widgetId].total > 0
            ? widgetMetrics[widgetId].totalScore / widgetMetrics[widgetId].total
            : 0;
      });

      res.json({
        success: true,
        data: {
          form: {
            id: form.id,
            title: form.title,
            isPublished: form.isPublished,
            widgets: form.widgets,
          },
          metrics: {
            totalSubmissions,
            convertedSubmissions,
            conversionRate: Math.round(conversionRate * 100) / 100,
            averageCompletionTime: Math.round(averageCompletionTime),
          },
          widgetMetrics,
          submissions: submissions.slice(0, 50), // Return first 50 submissions
          period: {
            startDate:
              startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: endDate || new Date(),
            period,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching form analytics:", error);
      res.status(500).json({
        error: "Failed to fetch form analytics",
        code: "ANALYTICS_ERROR",
      });
    }
  }
);

/**
 * GET /:tenant/analytics/dashboard
 * Get comprehensive analytics dashboard
 */
router.get(
  "/:tenant/analytics/dashboard",
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
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          error: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const query = analyticsQuerySchema.safeParse(req.query);
      if (!query.success) {
        return res.status(400).json({
          error: "Invalid query parameters",
          details: query.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const { startDate, endDate, period } = query.data;

      const dateFilter = {
        gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lte: endDate || new Date(),
      };

      // Get comprehensive metrics
      const [
        totalLeads,
        totalForms,
        totalWidgets,
        totalSubmissions,
        leadsByStatus,
        leadsBySource,
        topPerformingForms,
        topPerformingWidgets,
        recentLeads,
        conversionFunnel,
      ] = await Promise.all([
        // Total leads
        prisma.lead.count({
          where: {
            tenantId: tenant.id,
            createdAt: dateFilter,
          },
        }),

        // Total forms
        prisma.form.count({
          where: {
            tenantId: tenant.id,
            isPublished: true,
          },
        }),

        // Total widgets
        prisma.formWidget.count({
          where: {
            form: {
              tenantId: tenant.id,
            },
            isActive: true,
          },
        }),

        // Total submissions
        prisma.formSubmission.count({
          where: {
            form: {
              tenantId: tenant.id,
            },
            createdAt: dateFilter,
          },
        }),

        // Leads by status
        prisma.lead.groupBy({
          by: ["status"],
          where: {
            tenantId: tenant.id,
            createdAt: dateFilter,
          },
          _count: { status: true },
        }),

        // Leads by source
        prisma.lead.groupBy({
          by: ["source"],
          where: {
            tenantId: tenant.id,
            createdAt: dateFilter,
          },
          _count: { source: true },
        }),

        // Top performing forms
        prisma.form.findMany({
          where: {
            tenantId: tenant.id,
            isPublished: true,
          },
          include: {
            _count: {
              select: {
                submissions: true,
              },
            },
          },
          take: 5,
        }),

        // Top performing widgets
        prisma.formWidget.findMany({
          where: {
            form: {
              tenantId: tenant.id,
            },
            isActive: true,
          },
          include: {
            form: {
              select: {
                title: true,
              },
            },
            _count: {
              select: {
                analytics: {
                  where: {
                    date: dateFilter,
                  },
                },
              },
            },
          },
          orderBy: {
            analytics: {
              _count: "desc",
            },
          },
          take: 5,
        }),

        // Recent leads
        prisma.lead.findMany({
          where: {
            tenantId: tenant.id,
            createdAt: dateFilter,
          },
          include: {
            assignee: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),

        // Conversion funnel
        prisma.lead.groupBy({
          by: ["status"],
          where: {
            tenantId: tenant.id,
            createdAt: dateFilter,
          },
          _count: { status: true },
          _avg: { score: true },
        }),
      ]);

      // Calculate conversion rates
      const totalConverted = leadsByStatus
        .filter((lead) => ["ADMITTED", "ENROLLED"].includes(lead.status))
        .reduce((sum, lead) => sum + lead._count.status, 0);

      const overallConversionRate =
        totalLeads > 0 ? (totalConverted / totalLeads) * 100 : 0;

      res.json({
        success: true,
        data: {
          overview: {
            totalLeads,
            totalForms,
            totalWidgets,
            totalSubmissions,
            overallConversionRate:
              Math.round(overallConversionRate * 100) / 100,
          },
          leadsByStatus: leadsByStatus.map((lead) => ({
            status: lead.status,
            count: lead._count.status,
          })),
          leadsBySource: leadsBySource.map((lead) => ({
            source: lead.source || "Unknown",
            count: lead._count.source,
          })),
          topPerformingForms: topPerformingForms.map((form) => ({
            id: form.id,
            title: form.title,
            submissions: form._count.submissions,
          })),
          topPerformingWidgets: topPerformingWidgets.map((widget) => ({
            id: widget.id,
            name: widget.name,
            formTitle: widget.form.title,
            analytics: widget._count.analytics,
          })),
          recentLeads: recentLeads.map((lead) => ({
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            status: lead.status,
            score: lead.score,
            assignee: lead.assignee
              ? `${lead.assignee.firstName} ${lead.assignee.lastName}`
              : null,
            createdAt: lead.createdAt,
          })),
          conversionFunnel: conversionFunnel.map((lead) => ({
            status: lead.status,
            count: lead._count.status,
            averageScore: lead._avg.score || 0,
          })),
          period: {
            startDate:
              startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: endDate || new Date(),
            period,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching analytics dashboard:", error);
      res.status(500).json({
        message: "Failed to fetch analytics dashboard",
        code: "ANALYTICS_ERROR",
      });
    }
  }
);

export default router;
