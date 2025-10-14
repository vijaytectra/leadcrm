import { z } from "zod";
import { prisma } from "./prisma";
// import { Server as SocketIOServer } from "socket.io"; // Will be installed as dependency
// import { Server as HTTPServer } from "http";

// Notification schemas
export const NotificationSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.enum(["INFO", "SUCCESS", "WARNING", "ERROR", "SYSTEM"]),
  category: z.string().default("GENERAL"),
  data: z.record(z.string(), z.any()).optional(),
  read: z.boolean().default(false),
  createdAt: z.date(),
});

export type Notification = z.infer<typeof NotificationSchema>;

export const NotificationPreferenceSchema = z.object({
  emailEnabled: z.boolean().default(true),
  smsEnabled: z.boolean().default(false),
  whatsappEnabled: z.boolean().default(false),
  pushEnabled: z.boolean().default(true),
  frequency: z.enum(["IMMEDIATE", "DAILY", "WEEKLY"]).default("IMMEDIATE"),
  categories: z.record(z.string(), z.boolean()).default({}),
});

export type NotificationPreference = z.infer<
  typeof NotificationPreferenceSchema
>;

// Notification categories
export enum NotificationCategory {
  SYSTEM = "SYSTEM",
  LEAD = "LEAD",
  PAYMENT = "PAYMENT",
  DOCUMENT = "DOCUMENT",
  ADMISSION = "ADMISSION",
  FINANCE = "FINANCE",
  COMMUNICATION = "COMMUNICATION",
  PERFORMANCE = "PERFORMANCE",
}

// Enhanced notification service class
export class NotificationService {
  private io: any = null; // SocketIOServer instance
  private connectedUsers: Map<string, Set<string>> = new Map(); // tenantId -> Set of socketIds
  private sseConnections: Map<string, any> = new Map(); // userId -> SSE response object

  /**
   * Initialize Socket.IO server
   */
  async initializeSocketIO(httpServer: any): Promise<void> {
    try {
      const { Server: SocketIOServer } = await import("socket.io");
      this.io = new SocketIOServer(httpServer, {
        cors: {
          origin: process.env.CORS_ORIGIN || "http://localhost:3000",
          methods: ["GET", "POST"],
          credentials: true,
        },
        path: "/socket.io",
      });

      this.setupSocketHandlers();
      console.log("Socket.IO server initialized for real-time notifications");
    } catch (error) {
      console.warn(
        "Socket.IO not available, real-time notifications disabled:",
        error
      );
    }
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupSocketHandlers(): void {
    if (!this.io) return;

    this.io.on("connection", (socket: any) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle user authentication and tenant assignment
      socket.on(
        "authenticate",
        async (data: { userId: string; tenantId: string; token: string }) => {
          try {
            // Verify JWT token (you'll need to implement this)
            // const payload = verifyAccessToken(data.token);

            // Add user to tenant room
            socket.join(`tenant:${data.tenantId}`);
            socket.join(`user:${data.userId}`);

            // Track connected users
            if (!this.connectedUsers.has(data.tenantId)) {
              this.connectedUsers.set(data.tenantId, new Set());
            }
            this.connectedUsers.get(data.tenantId)?.add(socket.id);

            socket.emit("authenticated", { success: true });
            console.log(
              `User ${data.userId} authenticated for tenant ${data.tenantId}`
            );
          } catch (error) {
            socket.emit("authentication_error", { error: "Invalid token" });
            socket.disconnect();
          }
        }
      );

      // Handle notification preferences
      socket.on(
        "update_preferences",
        async (data: {
          userId: string;
          preferences: NotificationPreference;
        }) => {
          try {
            await this.updateUserPreferences(data.userId, data.preferences);
            socket.emit("preferences_updated", { success: true });
          } catch (error) {
            socket.emit("preferences_error", {
              error: "Failed to update preferences",
            });
          }
        }
      );

      // Handle notification read status
      socket.on("mark_read", async (data: { notificationId: string }) => {
        try {
          await this.markNotificationAsRead(data.notificationId);
          socket.emit("notification_read", { success: true });
        } catch (error) {
          socket.emit("read_error", {
            error: "Failed to mark notification as read",
          });
        }
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);

        // Remove from connected users tracking
        for (const [tenantId, socketIds] of this.connectedUsers.entries()) {
          socketIds.delete(socket.id);
          if (socketIds.size === 0) {
            this.connectedUsers.delete(tenantId);
          }
        }
      });
    });
  }

  /**
   * Add SSE connection for user
   */
  addSSEConnection(userId: string, res: any): void {
    this.sseConnections.set(userId, res);
    console.log(`SSE connection added for user ${userId}`);
  }

  /**
   * Remove SSE connection for user
   */
  removeSSEConnection(userId: string): void {
    this.sseConnections.delete(userId);
    console.log(`SSE connection removed for user ${userId}`);
  }

  /**
   * Send real-time notification via SSE
   */
  private sendSSENotification(userId: string, notification: any): void {
    const connection = this.sseConnections.get(userId);
    if (connection && !connection.destroyed) {
      try {
        connection.write(
          `data: ${JSON.stringify({
            type: "notification",
            notification: {
              id: notification.id,
              title: notification.title,
              message: notification.message,
              type: notification.type,
              category: notification.category,
              actionType: notification.actionType,
              priority: notification.priority,
              leadId: notification.leadId,
              data: notification.data,
              read: notification.read,
              createdAt: notification.createdAt,
            },
          })}\n\n`
        );
      } catch (error) {
        console.error(
          `Failed to send SSE notification to user ${userId}:`,
          error
        );
        this.sseConnections.delete(userId);
      }
    }
  }

  /**
   * Send enhanced real-time notification
   */
  async sendNotification(
    tenantId: string,
    userId: string,
    title: string,
    message: string,
    type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "SYSTEM" = "INFO",
    category: string = "GENERAL",
    actionType?: string,
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" = "MEDIUM",
    leadId?: string,
    data?: Record<string, any>
  ): Promise<string> {
    try {
      // Create notification in database
      const notification = await (prisma as any).notification.create({
        data: {
          tenantId,
          userId,
          title,
          message,
          type,
          category,
          actionType,
          priority,
          leadId,
          data: data || {},
        },
      });

      // Send real-time notification via SSE
      this.sendSSENotification(userId, notification);

      // Send real-time notification via Socket.IO (if available)
      if (this.io) {
        this.io.to(`user:${userId}`).emit("notification", {
          id: notification.id,
          title,
          message,
          type,
          category,
          actionType,
          priority,
          leadId,
          data,
          createdAt: notification.createdAt,
        });
      }

      // Check user preferences and send via other channels
      await this.sendNotificationChannels(
        tenantId,
        userId,
        title,
        message,
        type,
        category
      );

      return notification.id;
    } catch (error) {
      console.error("Failed to send notification:", error);
      throw new Error("Failed to send notification");
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendBulkNotification(
    tenantId: string,
    userIds: string[],
    title: string,
    message: string,
    type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "SYSTEM" = "INFO",
    category: string = "GENERAL",
    data?: Record<string, any>
  ): Promise<string[]> {
    const notificationIds: string[] = [];

    for (const userId of userIds) {
      try {
        const notificationId = await this.sendNotification(
          tenantId,
          userId,
          title,
          message,
          type,
          category,
          undefined, // actionType
          "MEDIUM", // priority
          undefined, // leadId
          data
        );
        notificationIds.push(notificationId);
      } catch (error) {
        console.error(`Failed to send notification to user ${userId}:`, error);
      }
    }

    return notificationIds;
  }

  /**
   * Send notification to all users in tenant
   */
  async sendTenantNotification(
    tenantId: string,
    title: string,
    message: string,
    type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "SYSTEM" = "INFO",
    category: string = "GENERAL",
    data?: Record<string, any>
  ): Promise<string[]> {
    // Get all active users in tenant
    const users = await prisma.user.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      select: { id: true },
    });

    const userIds = users.map((user) => user.id);
    return await this.sendBulkNotification(
      tenantId,
      userIds,
      title,
      message,
      type,
      category,
      data
    );
  }

  /**
   * Send notification to users by role
   */
  async sendRoleNotification(
    tenantId: string,
    roles: string[],
    title: string,
    message: string,
    type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "SYSTEM" = "INFO",
    category: string = "GENERAL",
    data?: Record<string, any>
  ): Promise<string[]> {
    // Get users with specified roles
    const users = await prisma.user.findMany({
      where: {
        tenantId,
        role: { in: roles as any[] },
        isActive: true,
      },
      select: { id: true },
    });

    const userIds = users.map((user) => user.id);
    return await this.sendBulkNotification(
      tenantId,
      userIds,
      title,
      message,
      type,
      category,
      data
    );
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    unreadOnly: boolean = false,
    sortBy: string = "createdAt",
    sortOrder: string = "desc"
  ): Promise<Notification[]> {
    const where: any = { userId };
    if (unreadOnly) {
      where.read = false;
    }

    // Build orderBy object
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const notifications = await (prisma as any).notification.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
    });

    return notifications.map((notification: any) => ({
      id: notification.id,
      tenantId: notification.tenantId,
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type as any,
      category: notification.category,
      data: notification.data as Record<string, any>,
      read: notification.read,
      createdAt: notification.createdAt,
    }));
  }

  /**
   * Get user notification count
   */
  async getUserNotificationCount(
    userId: string,
    unreadOnly: boolean = false
  ): Promise<number> {
    const where: any = { userId };
    if (unreadOnly) {
      where.read = false;
    }

    return await (prisma as any).notification.count({ where });
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    await (prisma as any).notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  /**
   * Mark all user notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    await (prisma as any).notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await (prisma as any).notification.delete({
      where: { id: notificationId },
    });
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(
    userId: string,
    tenantId?: string
  ): Promise<NotificationPreference | null> {
    // If no tenantId provided, try to get it from the user
    let finalTenantId = tenantId;
    if (!finalTenantId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tenantId: true },
      });
      finalTenantId = user?.tenantId;
    }

    const preferences = await (prisma as any).notificationPreference.findUnique(
      {
        where: finalTenantId
          ? { tenantId_userId: { tenantId: finalTenantId, userId } }
          : { userId },
      }
    );

    if (!preferences) {
      return null;
    }

    return {
      emailEnabled: preferences.emailEnabled,
      smsEnabled: preferences.smsEnabled,
      whatsappEnabled: preferences.whatsappEnabled,
      pushEnabled: preferences.pushEnabled,
      frequency: preferences.frequency as any,
      categories: preferences.categories as Record<string, boolean>,
    };
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: NotificationPreference,
    tenantId?: string
  ): Promise<void> {
    // If no tenantId provided, try to get it from the user
    let finalTenantId = tenantId;
    if (!finalTenantId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tenantId: true },
      });
      finalTenantId = user?.tenantId;
    }

    await (prisma as any).notificationPreference.upsert({
      where: finalTenantId
        ? { tenantId_userId: { tenantId: finalTenantId, userId } }
        : { userId },
      update: {
        emailEnabled: preferences.emailEnabled,
        smsEnabled: preferences.smsEnabled,
        whatsappEnabled: preferences.whatsappEnabled,
        pushEnabled: preferences.pushEnabled,
        frequency: preferences.frequency,
        categories: preferences.categories,
        updatedAt: new Date(),
      },
      create: {
        userId,
        tenantId: finalTenantId || "", // Use provided tenantId or empty string
        emailEnabled: preferences.emailEnabled,
        smsEnabled: preferences.smsEnabled,
        whatsappEnabled: preferences.whatsappEnabled,
        pushEnabled: preferences.pushEnabled,
        frequency: preferences.frequency,
        categories: preferences.categories,
      },
    });
  }

  /**
   * Send notification via other channels based on preferences
   */
  private async sendNotificationChannels(
    tenantId: string,
    userId: string,
    title: string,
    message: string,
    type: string,
    category: string
  ): Promise<void> {
    try {
      const preferences = await this.getUserPreferences(userId);
      if (!preferences) return;

      // Send email notification if enabled
      if (preferences.emailEnabled) {
        // Import email service dynamically
        const { emailService } = await import("./email");
        await emailService.sendEmail(
          userId, // You'll need to get actual email from user
          title,
          `<h2>${title}</h2><p>${message}</p>`,
          message
        );
      }

      // Send SMS notification if enabled
      if (preferences.smsEnabled) {
        // Import SMS service dynamically
        const { smsService } = await import("./sms");
        await smsService.sendSMS(userId, `${title}: ${message}`, tenantId);
      }

      // Send WhatsApp notification if enabled
      if (preferences.whatsappEnabled) {
        // Import WhatsApp service dynamically
        const { whatsappService } = await import("./whatsapp");
        await whatsappService.sendTextMessage(
          userId,
          `${title}: ${message}`,
          tenantId
        );
      }
    } catch (error) {
      console.error("Failed to send notification channels:", error);
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(
    tenantId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
  }> {
    const where: any = {};

    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [total, unread, byType, byCategory] = await Promise.all([
      (prisma as any).notification.count({ where }),
      (prisma as any).notification.count({ where: { ...where, read: false } }),
      (prisma as any).notification.groupBy({
        by: ["type"],
        where,
        _count: { type: true },
      }),
      (prisma as any).notification.groupBy({
        by: ["category"],
        where,
        _count: { category: true },
      }),
    ]);

    return {
      total,
      unread,
      byType: byType.reduce((acc: Record<string, number>, item: any) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as Record<string, number>),
      byCategory: byCategory.reduce(
        (acc: Record<string, number>, item: any) => {
          acc[item.category] = item._count.category;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(tenantId?: string): number {
    if (tenantId) {
      return this.connectedUsers.get(tenantId)?.size || 0;
    }

    let total = 0;
    for (const socketIds of this.connectedUsers.values()) {
      total += socketIds.size;
    }
    return total;
  }

  /**
   * Send lead assignment notification
   */
  async sendLeadAssignmentNotification(
    tenantId: string,
    assigneeId: string,
    leadId: string,
    leadName: string,
    assignedBy: string
  ): Promise<string> {
    return await this.sendNotification(
      tenantId,
      assigneeId,
      "New Lead Assigned",
      `You have been assigned a new lead: ${leadName}`,
      "INFO",
      "LEAD",
      "LEAD_ASSIGNED",
      "HIGH",
      leadId,
      {
        leadName,
        assignedBy,
        assignedAt: new Date().toISOString(),
      }
    );
  }

  /**
   * Send announcement to team members
   */
  async sendAnnouncement(
    tenantId: string,
    title: string,
    message: string,
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" = "MEDIUM",
    targetRoles?: string[],
    targetUsers?: string[]
  ): Promise<string[]> {
    let userIds: string[] = [];

    if (targetUsers && targetUsers.length > 0) {
      // Send to specific users
      userIds = targetUsers;
    } else if (targetRoles && targetRoles.length > 0) {
      // Send to users with specific roles
      const users = await prisma.user.findMany({
        where: {
          tenantId,
          role: { in: targetRoles as any[] },
          isActive: true,
        },
        select: { id: true },
      });
      userIds = users.map((user) => user.id);
    } else {
      // Send to all active users in tenant
      const users = await prisma.user.findMany({
        where: {
          tenantId,
          isActive: true,
        },
        select: { id: true },
      });
      userIds = users.map((user) => user.id);
    }

    const notificationIds: string[] = [];
    for (const userId of userIds) {
      try {
        const notificationId = await this.sendNotification(
          tenantId,
          userId,
          title,
          message,
          "SYSTEM",
          "ANNOUNCEMENT",
          "ANNOUNCEMENT",
          priority,
          undefined,
          {
            announcementType: "TEAM_ANNOUNCEMENT",
            sentAt: new Date().toISOString(),
          }
        );
        notificationIds.push(notificationId);
      } catch (error) {
        console.error(`Failed to send announcement to user ${userId}:`, error);
      }
    }

    return notificationIds;
  }

  /**
   * Get service status
   */
  getStatus(): {
    initialized: boolean;
    connectedUsers: number;
    sseConnections: number;
  } {
    return {
      initialized: this.io !== null,
      connectedUsers: this.getConnectedUsersCount(),
      sseConnections: this.sseConnections.size,
    };
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
