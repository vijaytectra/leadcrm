import { Router, Request, Response } from "express";
import { formBuilderService } from "../lib/form-builder";
import {
  requireAuth,
  requireInstitutionAdmin,
  requireActiveUser,
  requireRole,
  AuthedRequest,
} from "../middleware/auth";
import {
  CreateFormRequest,
  UpdateFormRequest,
  CreateFieldRequest,
  UpdateFieldRequest,
  SubmitFormRequest,
  FormResponse,
  FormListResponse,
  FieldListResponse,
  SubmissionListResponse,
  FormBuilderError,
} from "../types/form-builder";
import { prisma } from "../lib/prisma";
import { z } from "zod";

const router = Router();

// Validation schemas
const createFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(false),
  isPublished: z.boolean().optional().default(false),
  requiresPayment: z.boolean().optional().default(false),
  paymentAmount: z.number().optional(),
  allowMultipleSubmissions: z.boolean().optional().default(false),
  maxSubmissions: z.number().optional(),
  submissionDeadline: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .optional(),
  settings: z.object({}).passthrough().optional(),
});

const updateFormSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  requiresPayment: z.boolean().optional(),
  paymentAmount: z.number().optional(),
  allowMultipleSubmissions: z.boolean().optional(),
  maxSubmissions: z.number().optional(),
  submissionDeadline: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .optional(),
  settings: z.object({}).passthrough().optional(),
});

const createFieldSchema = z
  .object({
    type: z.string().min(1, "Field type is required"),
    label: z.string().min(1, "Label is required"),
    placeholder: z.string().optional(),
    description: z.string().optional(),
    required: z.boolean().optional().default(false),
    order: z.number().optional().default(0),
    width: z
      .enum(["full", "half", "third", "quarter"])
      .optional()
      .default("full"),
    validation: z.object({}).passthrough().optional(),
    conditionalLogic: z.object({}).passthrough().optional(),
    options: z.object({}).passthrough().optional(),
    styling: z.object({}).passthrough().optional(),
    advanced: z.object({}).passthrough().optional(),
  })
  .refine(
    (data) => {
      // Additional validation for payment fields
      if (data.type === "payment" && data.options) {
        const options = data.options as any;
        if (options.paymentItems && Array.isArray(options.paymentItems)) {
          // Validate payment items structure
          for (const item of options.paymentItems) {
            if (!item.id || !item.name || typeof item.amount !== "number") {
              return false;
            }
          }
        }
      }
      return true;
    },
    {
      message: "Payment field options must include valid paymentItems array",
      path: ["options"],
    }
  );

const updateFieldSchema = z
  .object({
    type: z.string().min(1, "Field type is required").optional(),
    label: z.string().min(1, "Label is required").optional(),
    placeholder: z.string().optional(),
    description: z.string().optional(),
    required: z.boolean().optional(),
    order: z.number().optional(),
    width: z.enum(["full", "half", "third", "quarter"]).optional(),
    validation: z.object({}).passthrough().optional(),
    conditionalLogic: z.object({}).passthrough().optional(),
    options: z.object({}).passthrough().optional(),
    styling: z.object({}).passthrough().optional(),
    advanced: z.object({}).passthrough().optional(),
  })
  .refine(
    (data) => {
      // Additional validation for payment fields
      if (data.type === "payment" && data.options) {
        const options = data.options as any;
        if (options.paymentItems && Array.isArray(options.paymentItems)) {
          // Validate payment items structure
          for (const item of options.paymentItems) {
            if (!item.id || !item.name || typeof item.amount !== "number") {
              return false;
            }
          }
        }
      }
      return true;
    },
    {
      message: "Payment field options must include valid paymentItems array",
      path: ["options"],
    }
  );

const formQuerySchema = z.object({
  page: z.string().transform(Number).optional().default(1),
  limit: z.string().transform(Number).optional().default(10),
  status: z.enum(["draft", "published", "archived"]).optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "title"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Form Management Routes
router.post(
  "/:tenant/forms",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res: Response) => {
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

      const validation = createFormSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const formData = validation.data;

      const form = await formBuilderService.createForm(tenant.id, formData);

      // Log form creation
      await prisma.auditLog.create({
        data: {
          tenantId: tenant.id,
          userId: req.auth!.sub,
          action: "FORM_CREATED",
          entity: "Form",
          entityId: form.id,
          newValues: JSON.parse(JSON.stringify(formData)),
        },
      });

      const response: FormResponse = {
        success: true,
        data: form,
        message: "Form created successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating form:", error);
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        message: formError.message,
        code: formError.code,
      });
    }
  }
);

router.get(
  "/:tenant/forms",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res: Response) => {
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

      const query = formQuerySchema.parse(req.query);
      const { page, limit, status, search, sortBy, sortOrder } = query;

      const result = await formBuilderService.listForms(tenant.id, page, limit);

      // Filter by status if provided
      let filteredForms = result.forms;
      if (status) {
        filteredForms = result.forms.filter((form) => {
          if (status === "draft") return !form.isActive;
          if (status === "published") return form.isActive;
          if (status === "archived") return false; // Add archived logic if needed
          return true;
        });
      }

      // Filter by search if provided
      if (search) {
        filteredForms = filteredForms.filter(
          (form) =>
            form.title.toLowerCase().includes(search.toLowerCase()) ||
            (form.description &&
              form.description.toLowerCase().includes(search.toLowerCase()))
        );
      }

      const response: FormListResponse = {
        success: true,
        data: {
          ...result,
          forms: filteredForms,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching forms:", error);
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        message: formError.message,
        code: formError.code,
      });
    }
  }
);

router.get(
  "/:tenant/forms/:formId",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res: Response) => {
    try {
     
      const { formId, tenant } = req.params;
      const tenantSlug = tenant;

      if (!tenantSlug) {
        return res.status(400).json({
          message: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenantRecord = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenantRecord) {
        return res.status(404).json({
          message: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const form = await formBuilderService.getForm(formId, tenantRecord.id);

      const response: FormResponse = {
        success: true,
        data: form,
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching form:", error);
      const formError = error as FormBuilderError;
      res.status(404).json({
        success: false,
        message: formError.message,
        code: formError.code,
      });
    }
  }
);

router.put(
  "/:tenant/forms/:formId",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res: Response) => {
    try {
     
      const { formId, tenant } = req.params;
      const tenantSlug = tenant;

      if (!tenantSlug) {
        return res.status(400).json({
          message: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenantRecord = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenantRecord) {
        return res.status(404).json({
          message: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const validation = updateFormSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const formData = validation.data;

      const form = await formBuilderService.updateForm(
        formId,
        tenantRecord.id,
        formData
      );

      // Log form update
      await prisma.auditLog.create({
        data: {
          tenantId: tenantRecord.id,
          userId: req.auth!.sub,
          action: "FORM_UPDATED",
          entity: "Form",
          entityId: formId,
          newValues: JSON.parse(JSON.stringify(formData)),
        },
      });

      const response: FormResponse = {
        success: true,
        data: form,
        message: "Form updated successfully",
      };

      res.json(response);
    } catch (error) {
      console.error("Error updating form:", error);
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        message: formError.message,
        code: formError.code,
      });
    }
  }
);

router.delete(
  "/:tenant/forms/:formId",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res: Response) => {
    try {
      const { formId, tenant } = req.params;
      const tenantSlug = tenant;

      if (!tenantSlug) {
        return res.status(400).json({
          message: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenantRecord = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenantRecord) {
        return res.status(404).json({
          message: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      await formBuilderService.deleteForm(formId, tenantRecord.id);

      // Log form deletion
      await prisma.auditLog.create({
        data: {
          tenantId: tenantRecord.id,
          userId: req.auth!.sub,
          action: "FORM_DELETED",
          entity: "Form",
          entityId: formId,
        },
      });

      res.json({
        success: true,
        message: "Form deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting form:", error);
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        message: formError.message,
        code: formError.code,
      });
    }
  }
);

// Field Management Routes
router.post(
  "/:tenant/forms/:formId/fields",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res: Response) => {
    try {
   
      const { formId, tenant } = req.params;
      const tenantSlug = tenant;

      if (!tenantSlug) {
        return res.status(400).json({
          message: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenantRecord = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenantRecord) {
        return res.status(404).json({
          message: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const validation = createFieldSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const fieldData = validation.data;

      const field = await formBuilderService.createField(
        formId,
        tenantRecord.id,
        {
          ...fieldData,
          type: fieldData.type as any,
        }
      );

      // Log field creation
      await prisma.auditLog.create({
        data: {
          tenantId: tenantRecord.id,
          userId: req.auth!.sub,
          action: "FIELD_CREATED",
          entity: "FormField",
          entityId: field.id,
          newValues: JSON.parse(JSON.stringify(fieldData)),
        },
      });

      const response: FormResponse = {
        success: true,
        data: field,
        message: "Field created successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating field:", error);
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        message: formError.message,
        code: formError.code,
      });
    }
  }
);

router.get(
  "/:tenant/forms/:formId/fields",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res: Response) => {
    try {
     
      const { formId, tenant } = req.params;
      const tenantSlug = tenant;

      if (!tenantSlug) {
        return res.status(400).json({
          message: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenantRecord = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenantRecord) {
        return res.status(404).json({
          message: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const fields = await formBuilderService.getFormFields(
        formId,
        tenantRecord.id
      );

      const response: FieldListResponse = {
        success: true,
        data: {
          fields,
          total: fields.length,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching fields:", error);
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        message: formError.message,
        code: formError.code,
      });
    }
  }
);

router.put(
  "/:tenant/forms/:formId/fields/:fieldId",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res: Response) => {
    try {

      const { formId, fieldId, tenant } = req.params;
      const tenantSlug = tenant;

      if (!tenantSlug) {
        return res.status(400).json({
          message: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenantRecord = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenantRecord) {
        return res.status(404).json({
          message: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const validation = updateFieldSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const fieldData = validation.data;

      const field = await formBuilderService.updateField(
        fieldId,
        formId,
        tenantRecord.id,
        {
          ...fieldData,
          id: fieldId,
          type: fieldData.type as any,
        }
      );

      // Log field update
      await prisma.auditLog.create({
        data: {
          tenantId: tenantRecord.id,
          userId: req.auth!.sub,
          action: "FIELD_UPDATED",
          entity: "FormField",
          entityId: fieldId,
          newValues: JSON.parse(JSON.stringify(fieldData)),
        },
      });

      const response: FormResponse = {
        success: true,
        data: field,
        message: "Field updated successfully",
      };

      res.json(response);
    } catch (error) {
      console.error("Error updating field:", error);
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        message: formError.message,
        code: formError.code,
      });
    }
  }
);

router.delete(
  "/:tenant/forms/:formId/fields/:fieldId",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res: Response) => {
    try {
    
      const { formId, fieldId, tenant } = req.params;
      const tenantSlug = tenant;

      if (!tenantSlug) {
        return res.status(400).json({
          message: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenantRecord = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenantRecord) {
        return res.status(404).json({
          message: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      await formBuilderService.deleteField(fieldId, formId, tenantRecord.id);

      // Log field deletion
      await prisma.auditLog.create({
        data: {
          tenantId: tenantRecord.id,
          userId: req.auth!.sub,
          action: "FIELD_DELETED",
          entity: "FormField",
          entityId: fieldId,
        },
      });

      res.json({
        success: true,
        message: "Field deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting field:", error);
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        message: formError.message,
        code: formError.code,
      });
    }
  }
);

// Form Submission Routes (Public - no auth required for submissions)
router.post("/:formId/submit", async (req: Request, res: Response) => {
  try {
    const { formId } = req.params;
    const submissionData: SubmitFormRequest = req.body;

    // Extract metadata from request
    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress || "unknown",
      userAgent: req.get("User-Agent") || "unknown",
      referrer: req.get("Referer"),
      utmSource: req.query.utm_source as string,
      utmMedium: req.query.utm_medium as string,
      utmCampaign: req.query.utm_campaign as string,
      utmTerm: req.query.utm_term as string,
      utmContent: req.query.utm_content as string,
      sessionId: (req as { sessionID?: string }).sessionID || "unknown",
      deviceType: getDeviceType(req.get("User-Agent") || ""),
      browser: getBrowser(req.get("User-Agent") || ""),
      os: getOS(req.get("User-Agent") || ""),
    };

    const submission = await formBuilderService.submitForm(
      formId,
      submissionData,
      metadata
    );

    const response: FormResponse = {
      success: true,
      data: submission,
      message: "Form submitted successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    const formError = error as FormBuilderError;
    res.status(400).json({
      success: false,
      message: formError.message,
      code: formError.code,
    });
  }
});

// Form Submissions Management (Admin only)
router.get(
  "/:formId/submissions",
  requireAuth,
  requireInstitutionAdmin,
  async (req: AuthedRequest, res: Response) => {
    try {
      const tenantId = req.auth?.ten || "";
      const { formId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await formBuilderService.getFormSubmissions(
        formId,
        tenantId,
        page,
        limit
      );

      const response: SubmissionListResponse = {
        success: true,
        data: result,
      };

      res.json(response);
    } catch (error) {
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        message: formError.message,
        code: formError.code,
      });
    }
  }
);

// Widget Management Routes
router.post(
  "/:formId/widgets",
  requireAuth,
  requireInstitutionAdmin,
  async (req: AuthedRequest, res: Response) => {
    try {
      const tenantId = req.auth?.ten || "";
      const { formId } = req.params;
      const widgetData = req.body;

      const widget = await formBuilderService.createWidget(
        formId,
        tenantId,
        widgetData
      );

      const response: FormResponse = {
        success: true,
        data: widget,
        message: "Widget created successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        message: formError.message,
        code: formError.code,
      });
    }
  }
);

// Analytics Routes
router.get(
  "/:formId/analytics",
  requireAuth,
  requireInstitutionAdmin,
  async (req: AuthedRequest, res: Response) => {
    try {
      const tenantId = req.auth?.ten || "";
      const { formId } = req.params;
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      const analytics = await formBuilderService.getFormAnalytics(
        formId,
        tenantId,
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        message: formError.message,
        code: formError.code,
      });
    }
  }
);

// Step Management Routes
router.post(
  "/:tenant/forms/:formId/steps",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res: Response) => {
    try {
     
      const { formId, tenant } = req.params;
      const tenantSlug = tenant;

      if (!tenantSlug) {
        return res.status(400).json({
          message: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenantRecord = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenantRecord) {
        return res.status(404).json({
          message: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const stepData = req.body;
      const step = await formBuilderService.createStep(
        formId,
        tenantRecord.id,
        stepData
      );

      // Log step creation
      await prisma.auditLog.create({
        data: {
          tenantId: tenantRecord.id,
          userId: req.auth!.sub,
          action: "STEP_CREATED",
          entity: "FormStep",
          entityId: step.id,
          newValues: JSON.parse(JSON.stringify(stepData)),
        },
      });

      const response: FormResponse = {
        success: true,
        data: step,
        message: "Step created successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating step:", error);
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        message: formError.message,
        code: formError.code,
      });
    }
  }
);

router.get(
  "/:tenant/forms/:formId/steps",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res: Response) => {
    try {
 
      const { formId, tenant } = req.params;
      const tenantSlug = tenant;

      if (!tenantSlug) {
        return res.status(400).json({
          message: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenantRecord = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenantRecord) {
        return res.status(404).json({
          message: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const steps = await formBuilderService.getFormSteps(
        formId,
        tenantRecord.id
      );

      const response: FieldListResponse = {
        success: true,
        data: {
          fields: steps,
          total: steps.length,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching steps:", error);
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        message: formError.message,
        code: formError.code,
      });
    }
  }
);

router.put(
  "/:tenant/forms/:formId/steps/:stepId",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res: Response) => {
    try {
     
      const { formId, stepId, tenant } = req.params;
      const tenantSlug = tenant;

      if (!tenantSlug) {
        return res.status(400).json({
          message: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenantRecord = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenantRecord) {
        return res.status(404).json({
          message: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const stepData = req.body;
      const step = await formBuilderService.updateStep(
        stepId,
        formId,
        tenantRecord.id,
        stepData
      );

      // Log step update
      await prisma.auditLog.create({
        data: {
          tenantId: tenantRecord.id,
          userId: req.auth!.sub,
          action: "STEP_UPDATED",
          entity: "FormStep",
          entityId: stepId,
          newValues: JSON.parse(JSON.stringify(stepData)),
        },
      });

      const response: FormResponse = {
        success: true,
        data: step,
        message: "Step updated successfully",
      };

      res.json(response);
    } catch (error) {
      console.error("Error updating step:", error);
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        message: formError.message,
        code: formError.code,
      });
    }
  }
);

router.delete(
  "/:tenant/forms/:formId/steps/:stepId",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res: Response) => {
    try {
  
      const { formId, stepId, tenant } = req.params;
      const tenantSlug = tenant;

      if (!tenantSlug) {
        return res.status(400).json({
          message: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenantRecord = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenantRecord) {
        return res.status(404).json({
          message: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      await formBuilderService.deleteStep(stepId, formId, tenantRecord.id);

      // Log step deletion
      await prisma.auditLog.create({
        data: {
          tenantId: tenantRecord.id,
          userId: req.auth!.sub,
          action: "STEP_DELETED",
          entity: "FormStep",
          entityId: stepId,
        },
      });

      res.json({
        success: true,
        message: "Step deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting step:", error);
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        message: formError.message,
        code: formError.code,
      });
    }
  }
);

// Payment Field Validation Route
router.post(
  "/:tenant/forms/:formId/validate-payment",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res: Response) => {
    try {
    
      const { formId, tenant } = req.params;
      const tenantSlug = tenant;

      if (!tenantSlug) {
        return res.status(400).json({
          message: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenantRecord = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenantRecord) {
        return res.status(404).json({
          message: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const { paymentData } = req.body;

      // Validate payment data structure
      if (!paymentData || !Array.isArray(paymentData.paymentItems)) {
        return res.status(400).json({
          success: false,
          error: "Invalid payment data structure",
          code: "INVALID_PAYMENT_DATA",
        });
      }

      // Validate each payment item
      for (const item of paymentData.paymentItems) {
        if (
          !item.id ||
          !item.name ||
          typeof item.amount !== "number" ||
          item.amount < 0
        ) {
          return res.status(400).json({
            success: false,
            error: "Invalid payment item structure",
            code: "INVALID_PAYMENT_ITEM",
          });
        }
      }

      // Calculate total amount
      const totalAmount = paymentData.paymentItems.reduce(
        (sum: number, item: any) => sum + item.amount,
        0
      );

      res.json({
        success: true,
        data: {
          isValid: true,
          totalAmount,
          itemCount: paymentData.paymentItems.length,
        },
        message: "Payment data is valid",
      });
    } catch (error) {
      console.error("Error validating payment:", error);
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        message: formError.message,
        code: formError.code,
      });
    }
  }
);

// Template Routes
router.get("/templates", async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const isPublic = req.query.isPublic !== "false";

    const templates = await formBuilderService.getTemplates(
      category as any,
      isPublic
    );

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    const formError = error as FormBuilderError;
    res.status(400).json({
      success: false,
      message: formError.message,
      code: formError.code,
    });
  }
});

router.post(
  "/templates",
  requireAuth,
  requireInstitutionAdmin,
  async (req: AuthedRequest, res: Response) => {
    try {
      const templateData = req.body;

      const template = await formBuilderService.createTemplate(templateData);

      const response = {
        success: true,
        data: template,
        message: "Template created successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        message: formError.message,
        code: formError.code,
      });
    }
  }
);

// Helper functions for metadata extraction
function getDeviceType(userAgent: string): "desktop" | "tablet" | "mobile" {
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const tabletRegex = /iPad|Android(?=.*Tablet)|Kindle|Silk/i;

  if (tabletRegex.test(userAgent)) return "tablet";
  if (mobileRegex.test(userAgent)) return "mobile";
  return "desktop";
}

function getBrowser(userAgent: string): string {
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Safari")) return "Safari";
  if (userAgent.includes("Edge")) return "Edge";
  if (userAgent.includes("Opera")) return "Opera";
  return "Unknown";
}

function getOS(userAgent: string): string {
  if (userAgent.includes("Windows")) return "Windows";
  if (userAgent.includes("Mac")) return "macOS";
  if (userAgent.includes("Linux")) return "Linux";
  if (userAgent.includes("Android")) return "Android";
  if (userAgent.includes("iOS")) return "iOS";
  return "Unknown";
}

export default router;
