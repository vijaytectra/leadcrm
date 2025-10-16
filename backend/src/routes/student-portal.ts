import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { StudentFormAccessService } from "../lib/student-form-access";
import { FormReminderService } from "../lib/form-reminder-service";
import { generateAdmissionFormSubmittedEmail } from "../lib/email-templates";
import { emailService } from "../lib/email";

const router = Router();

// Validation schemas
const saveFormProgressSchema = z.object({
  progressData: z.record(z.string(), z.any()).optional(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "SUBMITTED"]).optional(),
});

const submitFormSchema = z.object({
  formData: z.record(z.string(), z.any()),
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * GET /api/student/form/:accessToken
 * Get form access details and form configuration
 */
router.get("/form/:accessToken", async (req, res) => {
  try {
    const { accessToken } = req.params;

    // Validate access token format
    if (!StudentFormAccessService.isValidAccessToken(accessToken)) {
      return res.status(400).json({
        success: false,
        message: "Invalid access token format",
        code: "INVALID_TOKEN_FORMAT",
      });
    }

    // Get form access details
    const access = await StudentFormAccessService.getFormAccessByToken(
      accessToken
    );

    if (!access) {
      return res.status(404).json({
        success: false,
        message: "Form access not found or expired",
        code: "ACCESS_NOT_FOUND",
      });
    }

    if (!access.admissionForm.isPublished) {
      return res.status(400).json({
        success: false,
        message: "Form is not available",
        code: "FORM_NOT_AVAILABLE",
      });
    }

    // Get form configuration
    const form = await prisma.form.findUnique({
      where: { id: access.admissionFormId },
      include: {
        fields: {
          orderBy: { order: "asc" },
        },
        steps: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
        code: "FORM_NOT_FOUND",
      });
    }

    // Update last accessed time
    await StudentFormAccessService.updateFormProgress(
      accessToken,
      access.progressData || {},
      access.status
    );

    res.json({
      success: true,
      data: {
        access: {
          id: access.id,
          status: access.status,
          progressData: access.progressData,
          lastAccessedAt: access.lastAccessedAt,
          submittedAt: access.submittedAt,
        },
        form: {
          id: form.id,
          title: form.title,
          description: form.description,
          fields: form.fields,
          steps: form.steps,
          settings: form.settings,
          submissionDeadline: form.submissionDeadline,
        },
        lead: {
          id: access.lead.id,
          name: access.lead.name,
          email: access.lead.email,
          phone: access.lead.phone,
        },
        institution: {
          id: access.tenant.id,
          name: access.tenant.name,
          slug: access.tenant.slug,
        },
      },
    });
  } catch (error) {
    console.error("Error getting form access:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

/**
 * POST /api/student/form/:accessToken/save
 * Save form progress
 */
router.post("/form/:accessToken/save", async (req, res) => {
  try {
    const { accessToken } = req.params;
    const body = saveFormProgressSchema.parse(req.body);

    // Validate access token format
    if (!StudentFormAccessService.isValidAccessToken(accessToken)) {
      return res.status(400).json({
        success: false,
        message: "Invalid access token format",
        code: "INVALID_TOKEN_FORMAT",
      });
    }

    // Update form progress
    const access = await StudentFormAccessService.updateFormProgress(
      accessToken,
      body.progressData,
      body.status
    );

    if (!access) {
      return res.status(404).json({
        success: false,
        message: "Form access not found",
        code: "ACCESS_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      data: {
        status: access.status,
        progressData: access.progressData,
        lastAccessedAt: access.lastAccessedAt,
      },
      message: "Form progress saved successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        details: error.issues,
        code: "VALIDATION_ERROR",
      });
    }

    console.error("Error saving form progress:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

/**
 * POST /api/student/form/:accessToken/submit
 * Submit form
 */
router.post("/form/:accessToken/submit", async (req, res) => {
  try {
    const { accessToken } = req.params;
    const body = submitFormSchema.parse(req.body);

    // Validate access token format
    if (!StudentFormAccessService.isValidAccessToken(accessToken)) {
      return res.status(400).json({
        success: false,
        message: "Invalid access token format",
        code: "INVALID_TOKEN_FORMAT",
      });
    }

    // Submit form
    const result = await StudentFormAccessService.submitForm(
      accessToken,
      body.formData,
      body.metadata
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || "Failed to submit form",
        code: "SUBMISSION_FAILED",
      });
    }

    // Get updated access details
    const access = await StudentFormAccessService.getFormAccessByToken(
      accessToken
    );

    if (access) {
      // Send confirmation email
      try {
        const emailContent = generateAdmissionFormSubmittedEmail(
          access.lead.name,
          access.tenant.name,
          access.admissionForm.title,
          result.submissionId!,
          new Date(),
          "Your application has been submitted successfully. Our admission team will review your application and contact you within 2-3 business days."
        );

        if (access.lead.email) {
          await emailService.sendEmail(
            access.lead.email,
            emailContent.subject,
            emailContent.html,
            emailContent.text
          );
        }
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Continue without email
      }

      // Cancel any pending reminders
      try {
        await FormReminderService.cancelReminders(access.id);
      } catch (reminderError) {
        console.error("Error canceling reminders:", reminderError);
        // Continue without canceling reminders
      }
    }

    res.json({
      success: true,
      data: {
        submissionId: result.submissionId,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
      message: "Form submitted successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        details: error.issues,
        code: "VALIDATION_ERROR",
      });
    }

    console.error("Error submitting form:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

/**
 * GET /api/student/form/:accessToken/status
 * Get form access status
 */
router.get("/form/:accessToken/status", async (req, res) => {
  try {
    const { accessToken } = req.params;

    // Validate access token format
    if (!StudentFormAccessService.isValidAccessToken(accessToken)) {
      return res.status(400).json({
        success: false,
        message: "Invalid access token format",
        code: "INVALID_TOKEN_FORMAT",
      });
    }

    // Get form access details
    const access = await StudentFormAccessService.getFormAccessByToken(
      accessToken
    );

    if (!access) {
      return res.status(404).json({
        success: false,
        message: "Form access not found",
        code: "ACCESS_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      data: {
        status: access.status,
        progressData: access.progressData,
        lastAccessedAt: access.lastAccessedAt,
        submittedAt: access.submittedAt,
        formTitle: access.admissionForm.title,
        institutionName: access.tenant.name,
      },
    });
  } catch (error) {
    console.error("Error getting form status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

/**
 * POST /api/student/form/:accessToken/remind
 * Request reminder email
 */
router.post("/form/:accessToken/remind", async (req, res) => {
  try {
    const { accessToken } = req.params;

    // Validate access token format
    if (!StudentFormAccessService.isValidAccessToken(accessToken)) {
      return res.status(400).json({
        success: false,
        message: "Invalid access token format",
        code: "INVALID_TOKEN_FORMAT",
      });
    }

    // Get form access details
    const access = await StudentFormAccessService.getFormAccessByToken(
      accessToken
    );

    if (!access) {
      return res.status(404).json({
        success: false,
        message: "Form access not found",
        code: "ACCESS_NOT_FOUND",
      });
    }

    if (access.status === "SUBMITTED") {
      return res.status(400).json({
        success: false,
        message: "Form already submitted",
        code: "ALREADY_SUBMITTED",
      });
    }

    // Send reminder email
    try {
      const { generateAdmissionFormReminderEmail } = await import(
        "../lib/email-templates"
      );

      const formUrl = `${process.env.FRONTEND_URL}/student/form/${accessToken}`;
      const emailContent = generateAdmissionFormReminderEmail(
        access.lead.name,
        access.tenant.name,
        access.admissionForm.title,
        formUrl,
        undefined // submissionDeadline not available in this context
      );

      if (access.lead.email) {
        await emailService.sendEmail(
          access.lead.email,
          emailContent.subject,
          emailContent.html,
          emailContent.text
        );
      }

      res.json({
        success: true,
        message: "Reminder email sent successfully",
      });
    } catch (emailError) {
      console.error("Error sending reminder email:", emailError);
      res.status(500).json({
        success: false,
        message: "Failed to send reminder email",
        code: "EMAIL_SEND_FAILED",
      });
    }
  } catch (error) {
    console.error("Error sending reminder:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

export default router;
