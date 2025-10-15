import express from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import {
  requireAuth,
  requireActiveUser,
  requireTenantAccess,
  AuthedRequest,
} from "../middleware/auth";
import { emailService } from "../lib/email";
import { emailQueueService } from "../lib/email-queue";
import { smsService } from "../lib/sms";
import { whatsappService } from "../lib/whatsapp";
import { notificationService } from "../lib/notifications";
import { TemplateEngine, EmailTemplateCategory } from "../lib/email-templates";

const router = express.Router();

// Validation schemas
const CreateEmailTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  subject: z.string().min(1).max(200),
  htmlContent: z.string().min(1),
  textContent: z.string().optional(),
  variables: z
    .array(
      z.object({
        name: z.string(),
        type: z.enum(["string", "number", "date", "boolean", "object"]),
        required: z.boolean().default(false),
        description: z.string().optional(),
        defaultValue: z.any().optional(),
      })
    )
    .default([]),
  category: z
    .nativeEnum(EmailTemplateCategory)
    .default(EmailTemplateCategory.GENERAL),
});

const SendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  htmlContent: z.string().min(1),
  textContent: z.string().optional(),
  variables: z.record(z.string(), z.any()).optional(),
  priority: z.number().min(0).max(3).default(1),
  scheduledAt: z.string().datetime().optional(),
});

const SendSMSSchema = z.object({
  to: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  message: z.string().min(1).max(1600),
  templateId: z.string().optional(),
  variables: z.record(z.string(), z.string()).optional(),
});

const SendWhatsAppSchema = z.object({
  to: z.string().regex(/^\d{10,15}$/),
  message: z.string().min(1).max(4096),
  type: z.enum(["text", "template", "media", "interactive"]).default("text"),
  templateName: z.string().optional(),
  templateParams: z.array(z.string()).optional(),
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(["image", "video", "audio", "document"]).optional(),
});

const SendNotificationSchema = z.object({
  userIds: z.array(z.string()).optional(),
  roles: z.array(z.string()).optional(),
  allUsers: z.boolean().default(false),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  type: z
    .enum(["INFO", "SUCCESS", "WARNING", "ERROR", "SYSTEM"])
    .default("INFO"),
  category: z.string().default("GENERAL"),
  data: z.record(z.string(), z.any()).optional(),
});

// Email Template Routes

/**
 * Get all email templates for tenant
 */
router.get(
  "/:tenant/communications/templates",
  requireAuth,
  requireActiveUser,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;
      if (!tenantSlug) {
        return res.status(400).json({ message: "Tenant slug required", code: "TENANT_SLUG_REQUIRED" });
      }

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found", code: "TENANT_NOT_FOUND" });
      }

      const templates = await (prisma as any).emailTemplate.findMany({
        where: { tenantId: tenant.id },
        orderBy: { createdAt: "desc" },
      });

      res.json({ templates });
    } catch (error) {
      console.error("Failed to get email templates:", error);
      res.status(500).json({ message: "Internal server error", code: "INTERNAL_ERROR" });
    }
  }
);

/**
 * Create new email template
 */
router.post(
  "/:tenant/communications/templates",
  requireAuth,
  requireActiveUser,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;
      if (!tenantSlug) {
        return res.status(400).json({ message: "Tenant slug required", code: "TENANT_SLUG_REQUIRED" });
      }

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found", code: "TENANT_NOT_FOUND" });
      }

      const data = CreateEmailTemplateSchema.parse(req.body);

      // Extract variables from template content
      const extractedVariables = TemplateEngine.extractVariables(
        data.htmlContent + " " + data.subject
      );

      const template = await (prisma as any).emailTemplate.create({
        data: {
          tenantId: tenant.id,
          name: data.name,
          subject: data.subject,
          htmlContent: data.htmlContent,
          textContent: data.textContent,
          variables: data.variables,
          category: data.category,
        },
      });

      res.status(201).json({ template });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Validation error", details: error.issues });
      }
      console.error("Failed to create email template:", error);
      res.status(500).json({ message: "Internal server error", code: "INTERNAL_ERROR" });
    }
  }
);

/**
 * Update email template
 */
router.put(
  "/:tenant/communications/templates/:id",
  requireAuth,
  requireActiveUser,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { id } = req.params;
      const { tenantSlug } = req;

      if (!tenantSlug) {
        return res.status(400).json({ message: "Tenant slug required", code: "TENANT_SLUG_REQUIRED" });
      }

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found", code: "TENANT_NOT_FOUND" });
      }

      const data = CreateEmailTemplateSchema.partial().parse(req.body);

      const template = await (prisma as any).emailTemplate.update({
        where: {
          id,
          tenantId: tenant.id,
          isSystem: false, // Prevent updating system templates
        },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      res.json({ template });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Validation error", details: error.issues });
      }
      console.error("Failed to update email template:", error);
      res.status(500).json({ message: "Internal server error", code: "INTERNAL_ERROR" });
    }
  }
);

/**
 * Delete email template
 */
router.delete(
  "/:tenant/communications/templates/:id",
  requireAuth,
  requireActiveUser,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { id } = req.params;
      const { tenantSlug } = req;

      if (!tenantSlug) {
          return res.status(400).json({ message: "Tenant slug required", code: "TENANT_SLUG_REQUIRED" });
      }

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found", code: "TENANT_NOT_FOUND" });
      }

      await (prisma as any).emailTemplate.delete({
        where: {
          id,
          tenantId: tenant.id,
          isSystem: false, // Prevent deleting system templates
        },
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete email template:", error);
      res.status(500).json({ message: "Internal server error", code: "INTERNAL_ERROR" });
    }
  }
);

// Email Sending Routes

/**
 * Send email using template
 */
router.post(
  "/:tenant/communications/send/template",
  requireAuth,
  requireActiveUser,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;
      if (!tenantSlug) {
        return res.status(400).json({ message: "Tenant slug required", code: "TENANT_SLUG_REQUIRED" });
      }

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found", code: "TENANT_NOT_FOUND" });
      }

      const { templateId, to, variables, priority, scheduledAt } = req.body;

      const queueId = await emailQueueService.addTemplateEmail(
        tenant.id,
        templateId,
        to,
        variables || {},
        priority || 1,
        scheduledAt ? new Date(scheduledAt) : undefined
      );

      res.json({ success: true, queueId });
    } catch (error) {
      console.error("Failed to send template email:", error);
      res.status(500).json({ message: "Internal server error", code: "INTERNAL_ERROR" });
    }
  }
);

/**
 * Send direct email
 */
router.post(
  "/:tenant/communications/send/direct",
  requireAuth,
  requireActiveUser,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;
      if (!tenantSlug) {
        return res.status(400).json({ message: "Tenant slug required", code: "TENANT_SLUG_REQUIRED" });
      }

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found", code: "TENANT_NOT_FOUND" });
      }

      const data = SendEmailSchema.parse(req.body);

      const queueId = await emailQueueService.addToQueue(
        tenant.id,
        data.to,
        data.subject,
        data.htmlContent,
        data.textContent,
        data.variables,
        data.priority,
        data.scheduledAt ? new Date(data.scheduledAt) : undefined
      );

      res.json({ success: true, queueId });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Validation error", details: error.issues });
      }
      console.error("Failed to send direct email:", error);
      res.status(500).json({ message: "Internal server error", code: "INTERNAL_ERROR" });
    }
  }
);

// SMS Routes

/**
 * Send SMS message
 */
router.post(
  "/:tenant/communications/send/sms",
  requireAuth,
  requireActiveUser,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;
      if (!tenantSlug) {
        return res.status(400).json({ message: "Tenant slug required", code: "TENANT_SLUG_REQUIRED" });
      }

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found", code: "TENANT_NOT_FOUND" });
      }

      const data = SendSMSSchema.parse(req.body);

      if (data.templateId) {
        const result = await smsService.sendTemplateSMS(
          data.to,
          data.templateId,
          data.variables || {},
          tenant.id,
          req.auth?.sub
        );
        res.json(result);
      } else {
        const result = await smsService.sendSMS(
          data.to,
          data.message,
          tenant.id,
          req.auth?.sub
        );
        res.json(result);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
            .json({ message: "Validation error", details: error.issues });
      }
      console.error("Failed to send SMS:", error);
      res.status(500).json({ message: "Internal server error", code: "INTERNAL_ERROR" });
    }
  }
);

// WhatsApp Routes

/**
 * Send WhatsApp message
 */
router.post(
  "/:tenant/communications/send/whatsapp",
  requireAuth,
  requireActiveUser,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;
      if (!tenantSlug) {
        return res.status(400).json({ message: "Tenant slug required", code: "TENANT_SLUG_REQUIRED" });
      }

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found", code: "TENANT_NOT_FOUND" });
      }

      const data = SendWhatsAppSchema.parse(req.body);

      let result;
      switch (data.type) {
        case "text":
          result = await whatsappService.sendTextMessage(
            data.to,
            data.message,
            tenant.id,
            req.auth?.sub
          );
          break;
        case "template":
          result = await whatsappService.sendTemplateMessage(
            data.to,
            data.templateName!,
            data.templateParams || [],
            tenant.id,
            req.auth?.sub
          );
          break;
        case "media":
          result = await whatsappService.sendMediaMessage(
            data.to,
            data.mediaUrl!,
            data.mediaType!,
            data.message,
            tenant.id,
            req.auth?.sub
          );
          break;
        default:
          return res.status(400).json({ error: "Invalid message type" });
      }

      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Validation error", details: error.issues });
      }
      console.error("Failed to send WhatsApp message:", error);
      res.status(500).json({ message: "Internal server error", code: "INTERNAL_ERROR" });
    }
  }
);

// Notification Routes

/**
 * Send notification
 */
router.post(
  "/:tenant/communications/send/notification",
  requireAuth,
  requireActiveUser,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;
      if (!tenantSlug) {
        return res.status(400).json({ message: "Tenant slug required", code: "TENANT_SLUG_REQUIRED" });
      }

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found", code: "TENANT_NOT_FOUND" });
      }

      const data = SendNotificationSchema.parse(req.body);

      let notificationIds: string[] = [];

      if (data.allUsers) {
        notificationIds = await notificationService.sendTenantNotification(
          tenant.id,
          data.title,
          data.message,
          data.type,
          data.category,
          data.data
        );
      } else if (data.userIds && data.userIds.length > 0) {
        notificationIds = await notificationService.sendBulkNotification(
          tenant.id,
          data.userIds,
          data.title,
          data.message,
          data.type,
          data.category,
          data.data
        );
      } else if (data.roles && data.roles.length > 0) {
        notificationIds = await notificationService.sendRoleNotification(
          tenant.id,
          data.roles,
          data.title,
          data.message,
          data.type,
          data.category,
          data.data
        );
      } else {
        return res
          .status(400)
          .json({ message: "Must specify users, roles, or allUsers", code: "MUST_SPECIFY_USERS_ROLES_OR_ALL_USERS" });
      }

      res.json({ success: true, notificationIds });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Validation error", details: error.issues });
      }
      console.error("Failed to send notification:", error);
      res.status(500).json({ message: "Internal server error", code: "INTERNAL_ERROR" });
    }
  }
);

// Statistics Routes

/**
 * Get communication statistics
 */
router.get(
  "/:tenant/communications/stats",
  requireAuth,
  requireActiveUser,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;
      if (!tenantSlug) {
        return res.status(400).json({ message: "Tenant slug required", code: "TENANT_SLUG_REQUIRED" });
      }

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found", code: "TENANT_NOT_FOUND" });
      }

      const [emailStats, smsStats, whatsappStats, notificationStats] =
        await Promise.all([
          emailQueueService.getQueueStats(tenant.id),
          smsService.getSMSStats(tenant.id),
          whatsappService.getWhatsAppStats(tenant.id),
          notificationService.getNotificationStats(tenant.id),
        ]);

      res.json({
        email: emailStats,
        sms: smsStats,
        whatsapp: whatsappStats,
        notifications: notificationStats,
      });
    } catch (error) {
      console.error("Failed to get communication stats:", error);
        res.status(500).json({ message: "Internal server error", code: "INTERNAL_ERROR" });
    }
  }
);

export default router;
