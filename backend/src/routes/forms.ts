import { Router, Request, Response } from "express";
import { formBuilderService } from "../lib/form-builder";
import {
  requireAuth,
  requireInstitutionAdmin,
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

const router = Router();

// Form Management Routes
router.post(
  "/",
  requireAuth,
  requireInstitutionAdmin,
  async (req: AuthedRequest, res: Response) => {
    try {
      const tenantId = req.auth?.ten || "";
      const formData: CreateFormRequest = req.body;

      const form = await formBuilderService.createForm(tenantId, formData);

      const response: FormResponse = {
        success: true,
        data: form,
        message: "Form created successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        error: formError.message,
        code: formError.code,
      });
    }
  }
);

router.get(
  "/",
  requireAuth,
  requireInstitutionAdmin,
  async (req: AuthedRequest, res: Response) => {
    try {
      const tenantId = req.auth?.ten || "";
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await formBuilderService.listForms(tenantId, page, limit);

      const response: FormListResponse = {
        success: true,
        data: result,
      };

      res.json(response);
    } catch (error) {
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        error: formError.message,
        code: formError.code,
      });
    }
  }
);

router.get(
  "/:formId",
  requireAuth,
  requireInstitutionAdmin,
  async (req: AuthedRequest, res: Response) => {
    try {
      const tenantId = req.auth?.ten || "";
      const { formId } = req.params;

      const form = await formBuilderService.getForm(formId, tenantId);

      const response: FormResponse = {
        success: true,
        data: form,
      };

      res.json(response);
    } catch (error) {
      const formError = error as FormBuilderError;
      res.status(404).json({
        success: false,
        error: formError.message,
        code: formError.code,
      });
    }
  }
);

router.put(
  "/:formId",
  requireAuth,
  requireInstitutionAdmin,
  async (req: AuthedRequest, res: Response) => {
    try {
      const tenantId = req.auth?.ten || "";
      const { formId } = req.params;
      const formData: UpdateFormRequest = req.body;

      const form = await formBuilderService.updateForm(
        formId,
        tenantId,
        formData
      );

      const response: FormResponse = {
        success: true,
        data: form,
        message: "Form updated successfully",
      };

      res.json(response);
    } catch (error) {
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        error: formError.message,
        code: formError.code,
      });
    }
  }
);

router.delete(
  "/:formId",
  requireAuth,
  requireInstitutionAdmin,
  async (req: AuthedRequest, res: Response) => {
    try {
      const tenantId = req.auth?.ten || "";
      const { formId } = req.params;

      await formBuilderService.deleteForm(formId, tenantId);

      res.json({
        success: true,
        message: "Form deleted successfully",
      });
    } catch (error) {
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        error: formError.message,
        code: formError.code,
      });
    }
  }
);

// Field Management Routes
router.post(
  "/:formId/fields",
  requireAuth,
  requireInstitutionAdmin,
  async (req: AuthedRequest, res: Response) => {
    try {
      const tenantId = req.auth?.ten || "";
      const { formId } = req.params;
      const fieldData: CreateFieldRequest = req.body;

      const field = await formBuilderService.createField(
        formId,
        tenantId,
        fieldData
      );

      const response: FormResponse = {
        success: true,
        data: field,
        message: "Field created successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        error: formError.message,
        code: formError.code,
      });
    }
  }
);

router.get(
  "/:formId/fields",
  requireAuth,
  requireInstitutionAdmin,
  async (req: AuthedRequest, res: Response) => {
    try {
      const tenantId = req.auth?.ten || "";
      const { formId } = req.params;

      const fields = await formBuilderService.getFormFields(formId, tenantId);

      const response: FieldListResponse = {
        success: true,
        data: {
          fields,
          total: fields.length,
        },
      };

      res.json(response);
    } catch (error) {
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        error: formError.message,
        code: formError.code,
      });
    }
  }
);

router.put(
  "/:formId/fields/:fieldId",
  requireAuth,
  requireInstitutionAdmin,
  async (req: AuthedRequest, res: Response) => {
    try {
      const tenantId = req.auth?.ten || "";
      const { formId, fieldId } = req.params;
      const fieldData: UpdateFieldRequest = { ...req.body, id: fieldId };

      const field = await formBuilderService.updateField(
        fieldId,
        formId,
        tenantId,
        fieldData
      );

      const response: FormResponse = {
        success: true,
        data: field,
        message: "Field updated successfully",
      };

      res.json(response);
    } catch (error) {
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        error: formError.message,
        code: formError.code,
      });
    }
  }
);

router.delete(
  "/:formId/fields/:fieldId",
  requireAuth,
  requireInstitutionAdmin,
  async (req: AuthedRequest, res: Response) => {
    try {
      const tenantId = req.auth?.ten || "";
      const { formId, fieldId } = req.params;

      await formBuilderService.deleteField(fieldId, formId, tenantId);

      res.json({
        success: true,
        message: "Field deleted successfully",
      });
    } catch (error) {
      const formError = error as FormBuilderError;
      res.status(400).json({
        success: false,
        error: formError.message,
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
      error: formError.message,
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
        error: formError.message,
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
        error: formError.message,
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
        error: formError.message,
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
      error: formError.message,
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
        error: formError.message,
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
