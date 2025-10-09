import { Router } from "express";
import { prisma } from "../lib/prisma";
import {
  requireAuth,
  requireInstitutionAdmin,
  requireActiveUser,
  requireTenantAccess,
  AuthedRequest,
} from "../middleware/auth";
import { z } from "zod";

const router = Router();

// Validation schemas
const updateSettingsSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  maxUsers: z.number().int().positive().optional(),
  maxLeads: z.number().int().positive().optional(),
  features: z.object({
    formBuilder: z.boolean().optional(),
    analytics: z.boolean().optional(),
    integrations: z.boolean().optional(),
    customBranding: z.boolean().optional(),
    apiAccess: z.boolean().optional(),
  }).optional(),
  notifications: z.object({
    emailNotifications: z.boolean().optional(),
    smsNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    weeklyReports: z.boolean().optional(),
    monthlyReports: z.boolean().optional(),
  }).optional(),
  security: z.object({
    twoFactorAuth: z.boolean().optional(),
    sessionTimeout: z.number().int().positive().optional(),
    passwordPolicy: z.string().optional(),
    ipWhitelist: z.array(z.string()).optional(),
  }).optional(),
});

/**
 * GET /api/:tenant/settings
 * Get institution settings
 */
router.get(
  "/:tenant/settings",
  requireAuth,
  requireActiveUser,
  requireInstitutionAdmin,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;

      if (!tenantSlug) {
        return res.status(400).json({
          error: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          subscriptionTier: true,
          maxLeads: true,
          maxTeamMembers: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!tenant) {
        return res.status(404).json({
          error: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      // For now, return mock settings data
      // In a real implementation, you'd have a separate settings table
      const settings = {
        id: tenant.id,
        name: tenant.name,
        email: tenant.email || "",
        phone: tenant.phone || "",
        address: tenant.address || "",
        website: "https://www.example.edu", // This would come from settings table
        description: "A leading educational institution committed to excellence in learning.",
        timezone: "America/New_York",
        currency: "USD",
        maxUsers: tenant.maxTeamMembers,
        maxLeads: tenant.maxLeads,
        features: {
          formBuilder: tenant.subscriptionTier !== "STARTER",
          analytics: tenant.subscriptionTier !== "STARTER",
          integrations: tenant.subscriptionTier === "MAX",
          customBranding: tenant.subscriptionTier === "MAX",
          apiAccess: tenant.subscriptionTier === "MAX",
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          weeklyReports: true,
          monthlyReports: true,
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 30,
          passwordPolicy: "medium",
          ipWhitelist: [],
        },
      };

      res.json({ settings });
    } catch (error) {
      console.error("Get settings error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * PUT /api/:tenant/settings
 * Update institution settings
 */
router.put(
  "/:tenant/settings",
  requireAuth,
  requireActiveUser,
  requireInstitutionAdmin,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const validation = updateSettingsSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const updateData = validation.data;

      // Check if tenant exists
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

      // Update tenant basic information
      const tenantUpdateData: any = {};
      if (updateData.name) tenantUpdateData.name = updateData.name;
      if (updateData.email) tenantUpdateData.email = updateData.email;
      if (updateData.phone) tenantUpdateData.phone = updateData.phone;
      if (updateData.address) tenantUpdateData.address = updateData.address;
      if (updateData.maxUsers) tenantUpdateData.maxTeamMembers = updateData.maxUsers;
      if (updateData.maxLeads) tenantUpdateData.maxLeads = updateData.maxLeads;

      if (Object.keys(tenantUpdateData).length > 0) {
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: tenantUpdateData,
        });
      }

      // In a real implementation, you would also update settings in a separate settings table
      // For now, we'll just return the updated data

      const updatedSettings = {
        id: tenant.id,
        name: updateData.name || "Example Institution",
        email: updateData.email || "contact@example.edu",
        phone: updateData.phone || "+1 (555) 123-4567",
        address: updateData.address || "123 Education Street, City, State 12345",
        website: updateData.website || "https://www.example.edu",
        description: updateData.description || "A leading educational institution committed to excellence in learning.",
        timezone: updateData.timezone || "America/New_York",
        currency: updateData.currency || "USD",
        maxUsers: updateData.maxUsers || 50,
        maxLeads: updateData.maxLeads || 1000,
        features: {
          formBuilder: updateData.features?.formBuilder ?? true,
          analytics: updateData.features?.analytics ?? true,
          integrations: updateData.features?.integrations ?? false,
          customBranding: updateData.features?.customBranding ?? false,
          apiAccess: updateData.features?.apiAccess ?? false,
        },
        notifications: {
          emailNotifications: updateData.notifications?.emailNotifications ?? true,
          smsNotifications: updateData.notifications?.smsNotifications ?? false,
          pushNotifications: updateData.notifications?.pushNotifications ?? true,
          weeklyReports: updateData.notifications?.weeklyReports ?? true,
          monthlyReports: updateData.notifications?.monthlyReports ?? true,
        },
        security: {
          twoFactorAuth: updateData.security?.twoFactorAuth ?? false,
          sessionTimeout: updateData.security?.sessionTimeout ?? 30,
          passwordPolicy: updateData.security?.passwordPolicy ?? "medium",
          ipWhitelist: updateData.security?.ipWhitelist ?? [],
        },
      };

      res.json({ settings: updatedSettings });
    } catch (error) {
      console.error("Update settings error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

export default router;
