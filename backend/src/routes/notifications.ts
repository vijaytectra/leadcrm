import express from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import {
  requireAuth,
  requireActiveUser,
  requireTenantAccess,
  AuthedRequest,
} from "../middleware/auth";
import { notificationService } from "../lib/notifications";

const router = express.Router();

// Validation schemas
const NotificationPreferenceSchema = z.object({
  emailEnabled: z.boolean().default(true),
  smsEnabled: z.boolean().default(false),
  whatsappEnabled: z.boolean().default(false),
  pushEnabled: z.boolean().default(true),
  frequency: z.enum(["IMMEDIATE", "DAILY", "WEEKLY"]).default("IMMEDIATE"),
  categories: z.record(z.string(), z.boolean()).default({}),
});

const MarkReadSchema = z.object({
  notificationIds: z.array(z.string()).optional(),
  markAll: z.boolean().default(false),
});

/**
 * Get user notifications
 */
router.get(
  "/:tenant/notifications",
  requireAuth,
  requireActiveUser,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const userId = req.auth?.sub;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const { limit = 50, offset = 0, unreadOnly = false } = req.query;

      const notifications = await notificationService.getUserNotifications(
        userId,
        parseInt(limit as string),
        parseInt(offset as string),
        unreadOnly === "true"
      );

      res.json({ notifications });
    } catch (error) {
      console.error("Failed to get user notifications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Get user notification preferences
 */
router.get(
  "/:tenant/notifications/preferences",
  requireAuth,
  requireActiveUser,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const userId = req.auth?.sub;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const tenantSlug = req.params.tenant;

      // Get the actual tenant ID from the slug
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });
     
      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const preferences = await notificationService.getUserPreferences(
        userId,
        tenant.id
      );

      if (!preferences) {
        // Return default preferences if none exist
        const defaultPreferences = {
          emailEnabled: true,
          smsEnabled: false,
          whatsappEnabled: false,
          pushEnabled: true,
          frequency: "IMMEDIATE" as const,
          categories: {},
        };
        return res.json({ preferences: defaultPreferences });
      }

      res.json({ preferences });
    } catch (error) {
      console.error("Failed to get notification preferences:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Update user notification preferences
 */
router.put(
  "/:tenant/notifications/preferences",
  requireAuth,
  requireActiveUser,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const userId = req.auth?.sub;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const data = NotificationPreferenceSchema.parse(req.body);
      const tenantSlug = req.params.tenant;

      // Get the actual tenant ID from the slug
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      await notificationService.updateUserPreferences(userId, data, tenant.id);

      res.json({ success: true, preferences: data });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Validation error", details: error.issues });
      }
      console.error("Failed to update notification preferences:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Mark notifications as read
 */
router.put(
  "/:tenant/notifications/mark-read",
  requireAuth,
  requireActiveUser,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const userId = req.auth?.sub;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const data = MarkReadSchema.parse(req.body);

      if (data.markAll) {
        await notificationService.markAllAsRead(userId);
      } else if (data.notificationIds && data.notificationIds.length > 0) {
        for (const notificationId of data.notificationIds) {
          await notificationService.markNotificationAsRead(notificationId);
        }
      } else {
        return res
          .status(400)
          .json({ error: "Must specify notification IDs or markAll" });
      }

      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Validation error", details: error.issues });
      }
      console.error("Failed to mark notifications as read:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Delete notification
 */
router.delete(
  "/:tenant/notifications/:id",
  requireAuth,
  requireActiveUser,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.auth?.sub;

      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      // Verify notification belongs to user
      const notification = await prisma.notification.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }

      await notificationService.deleteNotification(id);

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete notification:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Get notification statistics for user
 */
router.get(
  "/:tenant/notifications/stats",
  requireAuth,
  requireActiveUser,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const userId = req.auth?.sub;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const { startDate, endDate } = req.query;

      const stats = await notificationService.getNotificationStats(
        undefined,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      // Get user-specific stats
      const userStats = await prisma.notification.aggregate({
        where: {
          userId,
          ...(startDate || endDate
            ? {
                createdAt: {
                  ...(startDate ? { gte: new Date(startDate as string) } : {}),
                  ...(endDate ? { lte: new Date(endDate as string) } : {}),
                },
              }
            : {}),
        },
        _count: {
          id: true,
        },
      });

      const unreadCount = await prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      });

      res.json({
        total: userStats._count.id,
        unread: unreadCount,
        global: stats,
      });
    } catch (error) {
      console.error("Failed to get notification stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Get notification categories
 */
router.get(
  "/:tenant/notifications/categories",
  requireAuth,
  requireActiveUser,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const categories = [
        {
          key: "SYSTEM",
          label: "System Notifications",
          description: "System updates and maintenance",
        },
        {
          key: "LEAD",
          label: "Lead Notifications",
          description: "New leads and lead updates",
        },
        {
          key: "PAYMENT",
          label: "Payment Notifications",
          description: "Payment confirmations and updates",
        },
        {
          key: "DOCUMENT",
          label: "Document Notifications",
          description: "Document verification and requests",
        },
        {
          key: "ADMISSION",
          label: "Admission Notifications",
          description: "Admission process updates",
        },
        {
          key: "FINANCE",
          label: "Finance Notifications",
          description: "Financial reports and updates",
        },
        {
          key: "COMMUNICATION",
          label: "Communication Notifications",
          description: "Message and call notifications",
        },
        {
          key: "PERFORMANCE",
          label: "Performance Notifications",
          description: "Performance metrics and reports",
        },
      ];

      res.json({ categories });
    } catch (error) {
      console.error("Failed to get notification categories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
