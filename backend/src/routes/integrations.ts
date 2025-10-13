import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { integrationManager } from "../lib/integration-manager";
import { leadDeduplicator } from "../lib/lead-deduplication";
import { googleAdsIntegration } from "../lib/integrations/google-ads";
import { metaIntegration } from "../lib/integrations/meta";
import { linkedInIntegration } from "../lib/integrations/linkedin";
import {
  requireAuth,
  requireActiveUser,
  requireRole,
  requireTenantAccess,
  type AuthedRequest,
} from "../middleware/auth";
import type {
  IntegrationPlatform,
  WebhookLeadData,
} from "../types/integrations";

const router = Router();

// Validation schemas
const createIntegrationSchema = z.object({
  platform: z.enum(["GOOGLE_ADS", "META", "LINKEDIN", "WHATSAPP"]),
  name: z.string().min(1).max(100),
  credentials: z.record(z.string(), z.string()),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const updateIntegrationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  credentials: z.record(z.string(), z.string()).optional(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * GET /:tenant/integrations
 * List all integrations for a tenant
 */
router.get(
  "/:tenantSlug/integrations",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req.params;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true, subscriptionTier: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const integrations = await prisma.integrationConfig.findMany({
        where: { tenantId: tenant.id },
        select: {
          id: true,
          platform: true,
          name: true,
          isActive: true,
          webhookUrl: true,
          lastSyncAt: true,
          lastSyncStatus: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              leadSourceTrackings: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Get limits for each platform
      const limits: Record<string, { current: number; limit: number }> = {};
      const platforms: IntegrationPlatform[] = [
        "GOOGLE_ADS",
        "META",
        "LINKEDIN",
        "WHATSAPP",
      ];

      for (const platform of platforms) {
        const check = await integrationManager.canAddIntegration(
          tenant.id,
          platform
        );
        limits[platform] = { current: check.current, limit: check.limit };
      }

      res.json({
        success: true,
        data: {
          integrations,
          limits,
          tier: tenant.subscriptionTier,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch integrations" });
    }
  }
);

/**
 * POST /:tenant/integrations
 * Create a new integration
 */
router.post(
  "/:tenantSlug/integrations",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req.params;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const validation = createIntegrationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Validation error",
          details: validation.error.issues,
        });
      }

      const { platform, name, credentials, metadata } = validation.data;

      const integration = await integrationManager.createIntegration(
        tenant.id,
        platform,
        name,
        credentials,
        metadata || {}
      );

      res.status(201).json({
        success: true,
        data: {
          id: integration.id,
          platform: integration.platform,
          name: integration.name,
          webhookUrl: integration.webhookUrl,
          isActive: integration.isActive,
          createdAt: integration.createdAt,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Maximum")) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to create integration" });
    }
  }
);

/**
 * PUT /:tenant/integrations/:id
 * Update an integration
 */
router.put(
  "/:tenantSlug/integrations/:id",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req.params;
      const { id } = req.params;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const validation = updateIntegrationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Validation error",
          details: validation.error.issues,
        });
      }

      const updateData = validation.data;

      const integration = await prisma.integrationConfig.update({
        where: {
          id,
          tenantId: tenant.id,
        },
        data: updateData,
      });

      res.json({
        success: true,
        data: integration,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update integration" });
    }
  }
);

/**
 * DELETE /:tenant/integrations/:id
 * Delete an integration
 */
router.delete(
  "/:tenantSlug/integrations/:id",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;
      const { id } = req.params;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      await prisma.integrationConfig.delete({
        where: {
          id,
          tenantId: tenant.id,
        },
      });

      res.json({
        success: true,
        message: "Integration deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete integration" });
    }
  }
);

/**
 * POST /webhooks/leads/:tenant/:platform
 * Webhook receiver for lead data from ad platforms (PUBLIC - no auth)
 */
router.post("/webhooks/leads/:tenantSlug/:platform", async (req, res) => {
  try {
    const { tenantSlug, platform } = req.params;
    const platformUpper = platform.toUpperCase() as IntegrationPlatform;

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    const integration = await prisma.integrationConfig.findFirst({
      where: {
        tenantId: tenant.id,
        platform: platformUpper,
        isActive: true,
      },
    });

    if (!integration) {
      return res
        .status(404)
        .json({ error: "Integration not found or inactive" });
    }

    let leads: WebhookLeadData[] = [];

    // Parse based on platform
    switch (platformUpper) {
      case "GOOGLE_ADS":
        leads = [googleAdsIntegration.parseWebhookPayload(req.body)];
        break;
      case "META":
        leads = metaIntegration.parseWebhookPayload(req.body);
        break;
      case "LINKEDIN":
        leads = [linkedInIntegration.parseWebhookPayload(req.body)];
        break;
      default:
        return res.status(400).json({ error: "Unsupported platform" });
    }

    // Process each lead
    const results = await Promise.allSettled(
      leads.map((leadData) =>
        leadDeduplicator.createOrUpdateLead(tenant.id, integration.id, leadData)
      )
    );

    const created = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    // Update integration sync status
    await integrationManager.recordSync(
      integration.id,
      failed === 0 ? "success" : "error",
      failed > 0 ? `${failed} leads failed to process` : undefined
    );

    res.json({
      success: true,
      message: `Processed ${created} lead(s), ${failed} failed`,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to process webhook" });
  }
});

/**
 * GET /webhooks/leads/:tenant/meta (for Meta verification)
 */
router.get("/webhooks/leads/:tenantSlug/meta", async (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env.META_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    res.status(200).send(challenge);
  } else {
    res.status(403).json({ error: "Verification failed" });
  }
});

export default router;
