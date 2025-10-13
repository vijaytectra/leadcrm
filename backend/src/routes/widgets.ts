import { Router, Request, Response } from "express";
import { widgetService } from "../lib/widget-service";
import { prisma } from "../lib/prisma";
import {
  requireAuth,
  requireActiveUser,
  requireRole,
  AuthedRequest,
} from "../middleware/auth";
import {
  WidgetGenerationRequest,
  WidgetListResponse,
  WidgetAnalyticsResponse,
  WidgetViewRequest,
  WidgetSubmissionRequest,
  PublicFormData,
} from "../types/widget";
import { FormBuilderError } from "../types/form-builder";
import { z } from "zod";

const router = Router();

// Validation schemas
const createWidgetSchema = z.object({
  name: z.string().min(1, "Widget name is required"),
  styling: z.object({
    theme: z.enum(["light", "dark", "auto"]).default("light"),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
    borderRadius: z.number().min(0).max(50).default(8),
    width: z.string().default("100%"),
    height: z.string().default("600px"),
  }),
});

const updateWidgetSchema = z.object({
  name: z.string().min(1, "Widget name is required").optional(),
  styling: z
    .object({
      theme: z.enum(["light", "dark", "auto"]).optional(),
      primaryColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
        .optional(),
      borderRadius: z.number().min(0).max(50).optional(),
      width: z.string().optional(),
      height: z.string().optional(),
    })
    .optional(),
});

const analyticsQuerySchema = z.object({
  startDate: z
    .string()
    .datetime()
    .transform((val) => new Date(val)),
  endDate: z
    .string()
    .datetime()
    .transform((val) => new Date(val)),
});

// Widget Management Routes (Authenticated)

/**
 * POST /:tenant/forms/:formId/widgets
 * Create a new widget for a form
 */
router.post(
  "/:tenant/forms/:formId/widgets",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res: Response) => {
    try {
      const tenantSlug = req.params.tenant;
      const formId = req.params.formId;

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

      const validation = createWidgetSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const widgetData = {
        ...validation.data,
        formId,
      };
      const widget = await widgetService.generateWidget(
        formId,
        tenant.id,
        widgetData
      );

      res.status(201).json({
        success: true,
        data: widget,
        message: "Widget created successfully",
      });
    } catch (error) {
      console.error("Error creating widget:", error);
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        error: formError.message,
        code: formError.code,
      });
    }
  }
);

/**
 * GET /:tenant/forms/:formId/widgets
 * Get all widgets for a form
 */
router.get(
  "/:tenant/forms/:formId/widgets",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res: Response) => {
    try {
      const tenantSlug = req.params.tenant;
      const formId = req.params.formId;
      tenantSlug;
      formId;
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

      const widgets = await widgetService.getFormWidgets(formId, tenant.id);

      const response: WidgetListResponse = {
        success: true,
        data: {
          widgets,
          total: widgets.length,
          page: 1,
          limit: 50,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching widgets:", error);
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        error: formError.message,
        code: formError.code,
      });
    }
  }
);

/**
 * GET /:tenant/widgets
 * Get all widgets for a tenant
 */
router.get(
  "/:tenant/widgets",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res: Response) => {
    try {
      const tenantSlug = req.params.tenant;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const search = (req.query.search as string) || "";
      const status = (req.query.status as string) || "all";
      const form = (req.query.form as string) || "all";

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

      // Build where clause
      const where: any = {
        form: {
          tenantId: tenant.id,
        },
      };

      // Add search filter
      if (search) {
        where.name = {
          contains: search,
          mode: "insensitive",
        };
      }

      // Add status filter
      if (status === "active") {
        where.isActive = true;
      } else if (status === "inactive") {
        where.isActive = false;
      }

      // Add form filter
      if (form !== "all") {
        where.formId = form;
      }

      // Get widgets with pagination
      const [widgets, total] = await Promise.all([
        prisma.formWidget.findMany({
          where,
          include: {
            form: {
              select: {
                id: true,
                title: true,
                isPublished: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.formWidget.count({ where }),
      ]);

      // Get available forms for filtering
      const forms = await prisma.form.findMany({
        where: {
          tenantId: tenant.id,
        },
        select: {
          id: true,
          title: true,
        },
        orderBy: {
          title: "asc",
        },
      });

      // Transform widgets
      const transformedWidgets = widgets.map((widget) => ({
        id: widget.id,
        name: widget.name,
        type: widget.type,
        formId: widget.formId,
        formTitle: widget.form.title,
        settings: widget.settings,
        embedCode: widget.embedCode,
        previewUrl: `${process.env.FRONTEND_URL}/widgets/${widget.id}`,
        publicUrl: `${process.env.API_BASE_URL}/api/public/widgets/${widget.id}`,
        isActive: widget.isActive,
        createdAt: widget.createdAt,
        updatedAt: widget.updatedAt,
      }));

      res.json({
        success: true,
        data: {
          widgets: transformedWidgets,
          total,
          page,
          limit,
          forms,
        },
      });
    } catch (error) {
      console.error("Error fetching widgets:", error);
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        error: formError.message,
        code: formError.code,
      });
    }
  }
);

/**
 * GET /:tenant/widgets/:widgetId
 * Get widget details
 */
router.get(
  "/:tenant/widgets/:widgetId",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res: Response) => {
    try {
      const tenantSlug = req.params.tenant;
      const widgetId = req.params.widgetId;

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

      // Get widget with form info
      const widget = await prisma.formWidget.findFirst({
        where: {
          id: widgetId,
          form: {
            tenantId: tenant.id,
          },
        },
        include: {
          form: {
            select: {
              id: true,
              title: true,
              isPublished: true,
            },
          },
        },
      });

      if (!widget) {
        return res.status(404).json({
          error: "Widget not found",
          code: "WIDGET_NOT_FOUND",
        });
      }

      const widgetResponse = {
        id: widget.id,
        formId: widget.formId,
        name: widget.name,
        type: widget.type,
        settings: widget.settings,
        embedCode: widget.embedCode,
        previewUrl: `${process.env.FRONTEND_URL}/widgets/${widget.id}`,
        publicUrl: `${process.env.API_BASE_URL}/api/public/widgets/${widget.id}`,
        isActive: widget.isActive,
        createdAt: widget.createdAt,
        updatedAt: widget.updatedAt,
        form: widget.form,
      };

      res.json({
        success: true,
        data: widgetResponse,
      });
    } catch (error) {
      console.error("Error fetching widget:", error);
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        error: formError.message,
        code: formError.code,
      });
    }
  }
);

/**
 * PUT /:tenant/widgets/:widgetId
 * Update widget
 */
router.put(
  "/:tenant/widgets/:widgetId",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res: Response) => {
    try {
      const tenantSlug = req.params.tenant;
      const widgetId = req.params.widgetId;

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

      const validation = updateWidgetSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const widgetData = validation.data;

      // Filter out undefined values to match Partial<WidgetGenerationRequest>
      const updateData: Partial<WidgetGenerationRequest> = {};
      if (widgetData.name !== undefined) {
        updateData.name = widgetData.name;
      }
      if (widgetData.styling !== undefined) {
        updateData.styling = widgetData.styling as any;
      }

      const widget = await widgetService.updateWidget(
        widgetId,
        tenant.id,
        updateData
      );

      res.json({
        success: true,
        data: widget,
        message: "Widget updated successfully",
      });
    } catch (error) {
      console.error("Error updating widget:", error);
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        error: formError.message,
        code: formError.code,
      });
    }
  }
);

/**
 * DELETE /:tenant/widgets/:widgetId
 * Delete widget
 */
router.delete(
  "/:tenant/widgets/:widgetId",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res: Response) => {
    try {
      const tenantSlug = req.params.tenant;
      const widgetId = req.params.widgetId;

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

      await widgetService.deleteWidget(widgetId, tenant.id);

      res.json({
        success: true,
        message: "Widget deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting widget:", error);
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        error: formError.message,
        code: formError.code,
      });
    }
  }
);

/**
 * GET /:tenant/widgets/:widgetId/analytics
 * Get widget analytics
 */
router.get(
  "/:tenant/widgets/:widgetId/analytics",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res: Response) => {
    try {
      const tenantSlug = req.params.tenant;
      const widgetId = req.params.widgetId;

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
          error: "Invalid date range",
          details: query.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const { startDate, endDate } = query.data;
      const analytics = await widgetService.getWidgetAnalytics(
        widgetId,
        startDate,
        endDate
      );

      const response: WidgetAnalyticsResponse = {
        success: true,
        data: analytics,
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching widget analytics:", error);
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        error: formError.message,
        code: formError.code,
      });
    }
  }
);

// Public Routes (No Authentication Required)

/**
 * GET /public/widgets/:widgetId
 * Get public widget data
 */
router.get("/public/widgets/:widgetId", async (req: Request, res: Response) => {
  try {
    const widgetId = req.params.widgetId;
    const formData = await widgetService.getPublicForm(widgetId);

    res.json({
      success: true,
      data: formData,
    });
  } catch (error) {
    console.error("Error getting public widget:", error);
    const formError = error as FormBuilderError;
    res.status(404).json({
      success: false,
      error: formError.message,
      code: formError.code,
    });
  }
});

/**
 * POST /public/widgets/:widgetId/view
 * Track widget view
 */
router.post(
  "/public/widgets/:widgetId/view",
  async (req: Request, res: Response) => {
    try {
      const widgetId = req.params.widgetId;
      const viewRequest: WidgetViewRequest = {
        widgetId,
        userAgent: req.get("User-Agent"),
        referrer: req.get("Referer"),
        ipAddress: req.ip,
      };

      await widgetService.trackWidgetView(viewRequest);

      res.json({
        success: true,
        message: "View tracked successfully",
      });
    } catch (error) {
      console.error("Error tracking widget view:", error);
      // Don't return error for analytics tracking
      res.json({
        success: true,
        message: "View tracking failed silently",
      });
    }
  }
);

/**
 * POST /public/widgets/:widgetId/submit
 * Submit form via widget (public)
 */
router.post(
  "/public/widgets/:widgetId/submit",
  async (req: Request, res: Response) => {
    try {
      const widgetId = req.params.widgetId;
      const formData = req.body;

      // Get widget and form info
      const widget = await prisma.formWidget.findUnique({
        where: { id: widgetId },
        include: {
          form: {
            include: {
              fields: true,
            },
          },
        },
      });

      if (!widget || !widget.isActive) {
        return res.status(404).json({
          error: "Widget not found or inactive",
          code: "WIDGET_NOT_FOUND",
        });
      }

      if (!widget.form.isPublished) {
        return res.status(400).json({
          error: "Form is not published",
          code: "FORM_NOT_ACTIVE",
        });
      }

      // Create form submission
      const submission = await prisma.formSubmission.create({
        data: {
          formId: widget.formId,
          data: formData,
          metadata: {
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
            referrer: req.get("Referer"),
            sessionId: (req as any).sessionID || "anonymous",
            deviceType: "unknown",
            browser: "unknown",
            os: "unknown",
          },
          status: "submitted",
        },
      });

      // Track submission analytics
      await widgetService.trackWidgetSubmission(widgetId, true);

      res.json({
        success: true,
        data: {
          submissionId: submission.id,
          message: "Form submitted successfully",
        },
      });
    } catch (error) {
      console.error("Error submitting widget form:", error);

      // Track failed submission
      try {
        await widgetService.trackWidgetSubmission(req.params.widgetId, false);
      } catch (analyticsError) {
        console.error("Error tracking failed submission:", analyticsError);
      }

      res.status(400).json({
        success: false,
        error: "Failed to submit form",
        code: "SUBMISSION_ERROR",
      });
    }
  }
);

export default router;
