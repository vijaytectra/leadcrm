import express from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import {
  requireAuth,
  requireActiveUser,
  requireTenantAccess,
  AuthedRequest,
  requireRole,
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
      console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
      console.log("User ID:", userId);
      console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      // Handle pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      const unreadOnly = req.query.unreadOnly === "true";

      // Handle sorting parameters
      const sortBy = (req.query.sortBy as string) || "createdAt";
      const sortOrder = (req.query.sortOrder as string) || "desc";

      console.log("Query params:", {
        page,
        limit,
        offset,
        unreadOnly,
        sortBy,
        sortOrder,
      });

      const notifications = await notificationService.getUserNotifications(
        userId,
        limit,
        offset,
        unreadOnly,
        sortBy,
        sortOrder
      );
      console.log("Notifications:", notifications);

      // Get total count for pagination
      const totalCount = await notificationService.getUserNotificationCount(
        userId,
        unreadOnly
      );
      const totalPages = Math.ceil(totalCount / limit);

      res.json({
        notifications,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
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
      console.log("Getting notification stats for user:", userId);

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

/**
 * Mark notification as read
 */
router.patch(
  "/:tenant/notifications/:id/read",
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

      // Mark as read
      await prisma.notification.update({
        where: { id },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Mark all notifications as read
 */
router.patch(
  "/:tenant/notifications/mark-all-read",
  requireAuth,
  requireActiveUser,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const userId = req.auth?.sub;

      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
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

      await prisma.notification.delete({
        where: { id },
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete notification:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Delete all notifications
 */
router.delete(
  "/:tenant/notifications/delete-all",
  requireAuth,
  requireActiveUser,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const userId = req.auth?.sub;

      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      await prisma.notification.deleteMany({
        where: { userId },
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Send announcement
 */
router.post(
  "/:tenant/notifications/announcement",
  requireAuth,
  requireActiveUser,
  requireTenantAccess,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;
      if (!tenantSlug) {
        return res.status(400).json({ error: "Tenant slug required" });
      }

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const {
        title,
        message,
        priority = "MEDIUM",
        targetRoles,
        targetUsers,
      } = req.body;

      if (!title || !message) {
        return res
          .status(400)
          .json({ error: "Title and message are required" });
      }

      const { notificationService } = await import("../lib/notifications");
      const notificationIds = await notificationService.sendAnnouncement(
        tenant.id,
        title,
        message,
        priority,
        targetRoles,
        targetUsers
      );

      res.json({
        success: true,
        notificationIds,
        message: `Announcement sent to ${notificationIds.length} users`,
      });
    } catch (error) {
      console.error("Failed to send announcement:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * SSE endpoint for real-time notifications
 */
router.get("/:tenant/notifications/stream", async (req: AuthedRequest, res) => {
  try {
    console.log(
      `SSE route hit: ${req.method} ${req.path} for tenant: ${req.params.tenant}`
    );

    // For SSE, we need to handle authentication differently since EventSource doesn't support custom headers
    let token = req.cookies.accessToken;
    let tenantSlug = req.params.tenant;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice("Bearer ".length);
      }
    }

    // Check for token in query parameters (for EventSource)
    if (!token && req.query.token) {
      token = req.query.token as string;
    }

    if (!token) {
      console.log("SSE connection failed: No token provided");
      return res.status(401).json({ error: "Missing access token" });
    }

    // Verify token manually
    const { verifyAccessToken } = await import("../lib/jwt");
    const payload = verifyAccessToken(token);

    if (payload.typ !== "access") {
      console.log("SSE connection failed: Invalid token type");
      return res.status(401).json({ error: "Invalid token type" });
    }

    const userId = payload.sub;
    console.log(
      `SSE connection attempt for user: ${userId}, tenant: ${tenantSlug}`
    );

    if (!userId) {
      console.log("SSE connection failed: No user ID");
      return res.status(401).json({ error: "User ID required" });
    }

    // Verify tenant access
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      console.log("SSE connection failed: Tenant not found");
      return res.status(404).json({ error: "Tenant not found" });
    }

    // Verify user has access to this tenant
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId: tenant.id,
        isActive: true,
      },
    });

    if (!user) {
      console.log("SSE connection failed: User not found or inactive");
      return res.status(403).json({ error: "Access denied" });
    }

    // Set SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    });

    // Send initial connection event
    res.write(
      `data: ${JSON.stringify({
        type: "connected",
        message: "Connected to notification stream",
        timestamp: new Date().toISOString(),
      })}\n\n`
    );

    // Keep connection alive with heartbeat
    const heartbeat = setInterval(() => {
      res.write(
        `data: ${JSON.stringify({
          type: "heartbeat",
          timestamp: new Date().toISOString(),
        })}\n\n`
      );
    }, 30000); // Every 30 seconds

    // Store connection for this user
    const { notificationService } = await import("../lib/notifications");
    notificationService.addSSEConnection(userId, res);
    console.log(`SSE connection established for user ${userId}`);

    // Handle client disconnect
    req.on("close", () => {
      clearInterval(heartbeat);
      notificationService.removeSSEConnection(userId);
      console.log(`SSE connection closed for user ${userId}`);
    });
  } catch (error) {
    console.error("Failed to establish SSE connection:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
