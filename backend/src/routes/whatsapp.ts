import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { whatsappService } from "../lib/whatsapp";
import {
  requireAuth,
  requireActiveUser,
  requireRole,
  requireTenantAccess,
  type AuthedRequest,
} from "../middleware/auth";
import type { BulkMessageRecipient } from "../types/whatsapp";

const router = Router();

// Validation schemas
const sendMessageSchema = z.object({
  leadId: z.string(),
  message: z.string().min(1).max(4096),
  templateId: z.string().optional(),
});

const bulkMessageSchema = z.object({
  message: z.string().min(1).max(4096),
  templateId: z.string().optional(),
  leadIds: z.array(z.string()).min(1),
});

/**
 * GET /:tenant/telecaller/whatsapp/templates
 * Get approved WhatsApp templates
 */
router.get(
  "/:tenant/telecaller/whatsapp/templates",
  requireAuth,
  requireActiveUser,
  requireRole(["TELECALLER", "ADMISSION_TEAM", "ADMISSION_HEAD"]),
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

      const templates = await prisma.whatsappTemplate.findMany({
        where: {
          tenantId: tenant.id,
          status: "APPROVED",
        },
        select: {
          id: true,
          name: true,
          category: true,
          language: true,
          content: true,
          variables: true,
          headerType: true,
          headerContent: true,
          buttons: true,
        },
        orderBy: { name: "asc" },
      });

      res.json({ success: true, data: templates });
    } catch (error) {
      console.error("Get WhatsApp templates error:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  }
);

/**
 * POST /:tenant/telecaller/whatsapp/send
 * Send individual WhatsApp message
 */
router.post(
  "/:tenant/telecaller/whatsapp/send",
  requireAuth,
  requireActiveUser,
  requireRole(["TELECALLER", "ADMISSION_TEAM", "ADMISSION_HEAD"]),
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;
      const validation = sendMessageSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: "Validation error",
          details: validation.error.issues,
        });
      }

      const { leadId, message, templateId } = validation.data;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      // Get lead details
      const lead = await prisma.lead.findFirst({
        where: {
          id: leadId,
          tenantId: tenant.id,
        },
        select: { id: true, name: true, phone: true },
      });

      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      if (!lead.phone) {
        return res.status(400).json({ error: "Lead has no phone number" });
      }

      // Send message
      const messageData = templateId
        ? await whatsappService.buildTemplateMessage(
            lead.phone,
            message,
            templateId
          )
        : whatsappService.buildTextMessage(lead.phone, message);

      const response = await whatsappService.makeAPIRequest("/messages", {
        method: "POST",
        body: JSON.stringify(messageData),
      });

      // Log communication
      await prisma.communication.create({
        data: {
          tenantId: tenant.id,
          leadId: lead.id,
          type: "WHATSAPP",
          content: message,
          sentBy: req.user!.id,
          status: "SENT",
          metadata: {
            messageId: response.messages?.[0]?.id,
            templateId,
          },
        },
      });

      res.json({
        success: true,
        data: {
          messageId: response.messages?.[0]?.id,
          status: "SENT",
        },
      });
    } catch (error) {
      console.error("Send WhatsApp message error:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  }
);

/**
 * POST /:tenant/telecaller/whatsapp/bulk
 * Send bulk WhatsApp messages
 */
router.post(
  "/:tenant/telecaller/whatsapp/bulk",
  requireAuth,
  requireActiveUser,
  requireRole(["TELECALLER", "ADMISSION_TEAM", "ADMISSION_HEAD"]),
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;
      const validation = bulkMessageSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: "Validation error",
          details: validation.error.issues,
        });
      }

      const { message, templateId, leadIds } = validation.data;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      // Get leads with phone numbers
      const leads = await prisma.lead.findMany({
        where: {
          id: { in: leadIds },
          tenantId: tenant.id,
          phone: { not: null },
        },
        select: { id: true, name: true, phone: true },
      });

      if (leads.length === 0) {
        return res
          .status(400)
          .json({ error: "No valid leads found with phone numbers" });
      }

      // Create recipients array
      const recipients: BulkMessageRecipient[] = leads.map((lead) => ({
        leadId: lead.id,
        phoneNumber: lead.phone!,
        status: "PENDING",
      }));

      // Create bulk message job
      const jobId = await whatsappService.createBulkMessageJob(
        tenant.id,
        req.user!.id,
        message,
        recipients,
        templateId
      );

      // Process job asynchronously
      whatsappService.processBulkMessageJob(jobId).catch((error) => {
        console.error("Bulk message processing error:", error);
      });

      res.json({
        success: true,
        data: {
          jobId,
          recipientCount: recipients.length,
          status: "PENDING",
        },
      });
    } catch (error) {
      console.error("Send bulk WhatsApp messages error:", error);
      res.status(500).json({ error: "Failed to send bulk messages" });
    }
  }
);

/**
 * GET /:tenant/telecaller/whatsapp/history
 * Get WhatsApp message history
 */
router.get(
  "/:tenant/telecaller/whatsapp/history",
  requireAuth,
  requireActiveUser,
  requireRole(["TELECALLER", "ADMISSION_TEAM", "ADMISSION_HEAD"]),
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;
      const { limit = "50", offset = "0" } = req.query;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const communications = await prisma.communication.findMany({
        where: {
          tenantId: tenant.id,
          type: "WHATSAPP",
          sentBy: req.user!.id,
        },
        include: {
          lead: {
            select: { id: true, name: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      });

      res.json({ success: true, data: communications });
    } catch (error) {
      console.error("Get WhatsApp history error:", error);
      res.status(500).json({ error: "Failed to fetch message history" });
    }
  }
);

/**
 * GET /:tenant/telecaller/whatsapp/bulk/:jobId
 * Get bulk message job status
 */
router.get(
  "/:tenant/telecaller/whatsapp/bulk/:jobId",
  requireAuth,
  requireActiveUser,
  requireRole(["TELECALLER", "ADMISSION_TEAM", "ADMISSION_HEAD"]),
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { jobId } = req.params;

      const job = await whatsappService.getBulkMessageJobStatus(jobId);

      if (!job) {
        return res.status(404).json({ error: "Bulk message job not found" });
      }

      res.json({ success: true, data: job });
    } catch (error) {
      console.error("Get bulk message status error:", error);
      res.status(500).json({ error: "Failed to fetch job status" });
    }
  }
);

/**
 * GET /:tenant/telecaller/whatsapp/bulk
 * Get bulk message job history
 */
router.get(
  "/:tenant/telecaller/whatsapp/bulk",
  requireAuth,
  requireActiveUser,
  requireRole(["TELECALLER", "ADMISSION_TEAM", "ADMISSION_HEAD"]),
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;
      const { limit = "50", offset = "0" } = req.query;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const jobs = await whatsappService.getBulkMessageHistory(
        tenant.id,
        req.user!.id,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.json({ success: true, data: jobs });
    } catch (error) {
      console.error("Get bulk message history error:", error);
      res.status(500).json({ error: "Failed to fetch bulk message history" });
    }
  }
);

export default router;
