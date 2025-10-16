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

// Public Routes (No Authentication Required) - Must be defined before tenant-specific routes

/**
 * GET /public/widgets/:widgetId
 * Get public widget data
 */
router.get("/public/widgets/:widgetId", async (req: Request, res: Response) => {
  try {
    const widgetId = req.params.widgetId;
    console.log(widgetId);
    const formData = await widgetService.getPublicForm(widgetId);
    console.log(formData);

    res.json({
      success: true,
      data: formData,
    });
  } catch (error) {
    console.error("Error getting public widget:", error);
    const formError = error as FormBuilderError;
    res.status(404).json({
      success: false,
      message: formError.message,
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
 * Submit form via widget (public) with lead conversion
 */
router.post(
  "/public/widgets/:widgetId/submit",
  async (req: Request, res: Response) => {
    try {
      const widgetId = req.params.widgetId;
      const formData = req.body;
      console.log(formData);

      // Get widget and form info
      const widget = await prisma.formWidget.findUnique({
        where: { id: widgetId },
        include: {
          form: {
            include: {
              fields: true,
              tenant: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });
      console.log(widget);
      if (!widget || !widget.isActive) {
        return res.status(404).json({
          message: "Widget not found or inactive",
          code: "WIDGET_NOT_FOUND",
        });
      }

      if (!widget.form.isPublished) {
        return res.status(400).json({
          message: "Form is not published",
          code: "FORM_NOT_ACTIVE",
        });
      }

      // Import services
      const { FieldMappingService } = await import("../lib/field-mapping");
      const { leadScoringService } = await import("../lib/lead-scoring");
      const { emailService } = await import("../lib/email");
      const { notificationService } = await import("../lib/notifications");

      // Map form data to standardized lead fields
      // Check if form data has field metadata (new format)
      let formValues = formData;
      let fieldMetadata = null;

      if (formData.values && formData.fields) {
        // New format with field metadata
        formValues = formData.values;
        fieldMetadata = formData.fields;
      }

      const { mappedData, unmappedFields, mappingLog } =
        FieldMappingService.mapFormDataToLead(formValues, fieldMetadata);

      // Extract additional information
      const leadSource = FieldMappingService.extractLeadSource(formData);
      const courseInterest =
        FieldMappingService.extractCourseInterest(formData);

      // Calculate lead score
      const scoringData = {
        formType: widget.form.title.toLowerCase(),
        formData: mappedData,
        submissionTime: new Date(),
        source: leadSource,
        courseInterest: courseInterest || undefined,
        budget: mappedData.budget,
        responseTime: 0, // Immediate response
      };

      const scoringResult = leadScoringService.calculateScore(scoringData);

      // Validate mapped data
      const validation = FieldMappingService.validateMappedData(mappedData);

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Required fields missing",
          details: {
            missingFields: validation.missingFields,
            completeness: validation.score,
          },
          code: "VALIDATION_ERROR",
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
            mappingLog,
            unmappedFields,
          },
          status: "submitted",
        },
      });

      // Create lead from mapped data
      const lead = await prisma.lead.create({
        data: {
          tenant: {
            connect: { id: widget.form.tenantId },
          },
          formSubmission: {
            connect: { id: submission.id },
          },
          name: mappedData.name,
          email: mappedData.email,
          phone: mappedData.phone,
          source: leadSource,
          status: "NEW",
          score: isNaN(scoringResult.score) ? 0 : scoringResult.score,
          createdAt: new Date(),
        },
      });

      // Update submission with lead ID
      await prisma.formSubmission.update({
        where: { id: submission.id },
        data: { leadId: lead.id },
      });

      // Auto-assign lead using existing assignment algorithms
      try {
        const {
          roundRobinAssignment,
          loadBasedAssignment,
          skillBasedAssignment,
        } = await import("../routes/leads");

        // Get assignment configuration (default to round-robin)
        const assignmentConfig = {
          algorithm: "ROUND_ROBIN" as const,
          skillRequirements: {},
        };

        let assignments: Array<{ leadId: string; assigneeId: string }> = [];

        switch (assignmentConfig.algorithm) {
          case "ROUND_ROBIN":
            assignments = await roundRobinAssignment(widget.form.tenantId, [
              lead.id,
            ]);
            break;
          case "LOAD_BASED":
            assignments = await loadBasedAssignment(widget.form.tenantId, [
              lead.id,
            ]);
            break;
          case "SKILL_BASED":
            assignments = await skillBasedAssignment(
              widget.form.tenantId,
              [lead.id],
              assignmentConfig.skillRequirements
            );
            break;
        }

        if (assignments.length > 0) {
          await prisma.lead.update({
            where: { id: lead.id },
            data: { assigneeId: assignments[0].assigneeId },
          });
        }
      } catch (assignmentError) {
        console.error("Error auto-assigning lead:", assignmentError);
        // Continue without assignment
      }

      // Create lead source tracking
      try {
        await prisma.leadSourceTracking.create({
          data: {
            leadId: lead.id,
            integrationId: "widget", // Default integration
            platform: "WEBSITE" as any,
            externalId: widgetId,
            campaignId: widgetId,
            campaignName: widget.name,
            metadata: {
              widgetId,
              formId: widget.formId,
              scoringResult,
              mappingLog,
            },
          },
        });
      } catch (trackingError) {
        console.error("Error creating lead source tracking:", trackingError);
        // Continue without tracking
      }

      // Create admission form access if widget has admission form configured
      let formAccess = null;
      if (widget.admissionFormId && mappedData.email) {
        try {
          const { StudentFormAccessService } = await import(
            "../lib/student-form-access"
          );
          const { generateAdmissionFormAccessEmail } = await import(
            "../lib/email-templates"
          );

          // Create form access
          formAccess = await StudentFormAccessService.createFormAccess({
            leadId: lead.id,
            admissionFormId: widget.admissionFormId,
            email: mappedData.email,
            tenantId: widget.form.tenantId,
          });

          // Get admission form details
          const admissionForm = await prisma.form.findUnique({
            where: { id: widget.admissionFormId },
            select: {
              title: true,
              description: true,
              submissionDeadline: true,
            },
          });

          if (admissionForm) {
            // Generate form access URL
            const formUrl = `${process.env.FRONTEND_URL}/student/form/${formAccess.accessToken}`;

            // Generate and send admission form access email
            const emailContent = generateAdmissionFormAccessEmail(
              mappedData.name,
              widget.form.tenant.name,
              admissionForm.title,
              formUrl,
              admissionForm.submissionDeadline,
              admissionForm.description
            );

            await emailService.sendEmail(
              mappedData.email,
              emailContent.subject,
              emailContent.html,
              emailContent.text
            );
          }
        } catch (formAccessError) {
          console.error("Error creating form access:", formAccessError);
          // Continue without form access
        }
      }

      // Send notifications
      try {
        // Send notification to assigned telecaller
        if (lead.assigneeId) {
          await notificationService.createNotification({
            tenantId: widget.form.tenantId,
            userId: lead.assigneeId,
            title: "New Lead Assigned",
            message: `New lead ${lead.name} has been assigned to you`,
            type: "INFO",
            category: "LEAD",
            actionType: "LEAD_ASSIGNED",
            priority: "MEDIUM",
            leadId: lead.id,
            data: {
              leadName: lead.name,
              leadEmail: lead.email,
              leadPhone: lead.phone,
              leadSource: lead.source,
              leadScore: lead.score,
              formType: widget.form.title,
              hasAdmissionForm: !!formAccess,
            },
          });
        }

        // Send welcome email to lead (only if no admission form access was created)
        if (mappedData.email && !formAccess) {
          const welcomeEmailContent = `
            <h2>Welcome to ${widget.form.tenant.name}!</h2>
            <p>Thank you for your interest in our programs. We have received your application and our team will contact you soon.</p>
            <p><strong>Application Details:</strong></p>
            <ul>
              <li>Name: ${mappedData.name}</li>
              <li>Email: ${mappedData.email}</li>
              <li>Phone: ${mappedData.phone}</li>
              ${
                mappedData.course ? `<li>Course: ${mappedData.course}</li>` : ""
              }
            </ul>
            <p>Our admission team will review your application and contact you within 24 hours.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
          `;

          await emailService.sendEmail(
            mappedData.email,
            `Welcome to ${widget.form.tenant.name} - Application Received`,
            welcomeEmailContent
          );
        }
      } catch (notificationError) {
        console.error("Error sending notifications:", notificationError);
        // Continue without notifications
      }

      // Track submission analytics
      await widgetService.trackWidgetSubmission(widgetId, true);

      res.json({
        success: true,
        data: {
          submissionId: submission.id,
          leadId: lead.id,
          leadScore: scoringResult.score,
          leadPercentage: scoringResult.percentage,
          message: formAccess
            ? "Form submitted successfully and admission form access created"
            : "Form submitted successfully and lead created",
          nextSteps: formAccess
            ? [
                "Check your email for admission form access link",
                "Complete the admission form to proceed with your application",
                "Our team will review your application after form completion",
              ]
            : [
                "Our team will review your application",
                "You will receive a confirmation email shortly",
                "Our admission team will contact you within 24 hours",
              ],
          admissionFormAccess: formAccess
            ? {
                accessToken: formAccess.accessToken,
                formUrl: `${process.env.FRONTEND_URL}/student/form/${formAccess.accessToken}`,
                status: formAccess.status,
              }
            : null,
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
        message: "Failed to submit form",
        code: "SUBMISSION_ERROR",
      });
    }
  }
);

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
        message: formError.message,
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
        previewUrl: `${process.env.FRONTEND_URL}/institution-admin/forms/${widget.formId}/widgets?formId=${widget.formId}`,
        publicUrl: `${process.env.FRONTEND_URL}/widgets/${widget.id}`,
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
        message: formError.message,
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
          message: "Widget not found",
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
        previewUrl: `${process.env.FRONTEND_URL}/institution-admin/forms/${widget.formId}/widgets?formId=${widget.formId}`,
        publicUrl: `${process.env.FRONTEND_URL}/widgets/${widget.id}`,
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
        message: formError.message,
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

      const validation = updateWidgetSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Validation failed",
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
        message: formError.message,
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
        message: formError.message,
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
          message: "Invalid date range",
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
        message: formError.message,
        code: formError.code,
      });
    }
  }
);

export default router;
