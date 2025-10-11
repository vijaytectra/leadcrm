// import Redis from "ioredis"; // Will be installed as dependency
import { z } from "zod";
import { prisma } from "./prisma";
import {
  EmailTemplateBuilder,
  TemplateEngine,
  TemplateVariables,
} from "./email-templates";

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || "0"),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

// Email queue schemas
export const EmailQueueItemSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  to: z.string().email(),
  subject: z.string(),
  htmlContent: z.string(),
  textContent: z.string().optional(),
  variables: z.record(z.string(), z.any()).optional(),
  priority: z.number().default(0),
  scheduledAt: z.date().default(() => new Date()),
});

export type EmailQueueItem = z.infer<typeof EmailQueueItemSchema>;

// Queue priorities
export enum QueuePriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  URGENT = 3,
}

// Email queue service
export class EmailQueueService {
  private redis: any; // Redis instance
  private isConnected = false;
  private processing = false;

  constructor() {
    // Initialize Redis when available
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      const Redis = (await import("ioredis")).default;
      this.redis = new Redis(redisConfig);
      this.setupEventHandlers();
    } catch (error) {
      console.warn(
        "Redis not available, email queue will use database only:",
        error
      );
      this.isConnected = false;
    }
  }

  private setupEventHandlers(): void {
    if (!this.redis) return;

    this.redis.on("connect", () => {
      console.log("Redis connected for email queue");
      this.isConnected = true;
    });

    this.redis.on("error", (error: any) => {
      console.error("Redis connection error:", error);
      this.isConnected = false;
    });

    this.redis.on("close", () => {
      console.log("Redis connection closed");
      this.isConnected = false;
    });
  }

  /**
   * Add email to queue
   */
  async addToQueue(
    tenantId: string,
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
    variables?: TemplateVariables,
    priority: QueuePriority = QueuePriority.NORMAL,
    scheduledAt?: Date
  ): Promise<string> {
    try {
      // Create queue item in database
      const queueItem = await prisma.emailQueue.create({
        data: {
          tenantId,
          to,
          subject,
          htmlContent,
          textContent,
          variables: variables || {},
          priority,
          scheduledAt: scheduledAt || new Date(),
        },
      });

      // Add to Redis queue for processing
      if (this.isConnected) {
        const queueKey = `email_queue:${tenantId}`;
        const itemData = JSON.stringify({
          id: queueItem.id,
          priority,
          scheduledAt: scheduledAt || new Date(),
        });

        await this.redis.zadd(queueKey, priority, itemData);
      }

      return queueItem.id;
    } catch (error) {
      console.error("Failed to add email to queue:", error);
      throw new Error("Failed to add email to queue");
    }
  }

  /**
   * Add email using template
   */
  async addTemplateEmail(
    tenantId: string,
    templateId: string,
    to: string,
    variables: TemplateVariables,
    priority: QueuePriority = QueuePriority.NORMAL,
    scheduledAt?: Date
  ): Promise<string> {
    try {
      // Get template from database
      const template = await prisma.emailTemplate.findFirst({
        where: {
          id: templateId,
          tenantId,
          isActive: true,
        },
      });

      if (!template) {
        throw new Error("Template not found or inactive");
      }

      // Validate variables
      const templateVariables = template.variables as any[];
      const validation = TemplateEngine.validateVariables(
        variables,
        templateVariables
      );
      if (!validation.valid) {
        throw new Error(
          `Template validation failed: ${validation.errors.join(", ")}`
        );
      }

      // Substitute variables in template
      const subject = TemplateEngine.substituteVariables(
        template.subject,
        variables
      );
      const htmlContent = TemplateEngine.substituteVariables(
        template.htmlContent,
        variables
      );
      const textContent = template.textContent
        ? TemplateEngine.substituteVariables(template.textContent, variables)
        : undefined;

      return await this.addToQueue(
        tenantId,
        to,
        subject,
        htmlContent,
        textContent,
        variables,
        priority,
        scheduledAt
      );
    } catch (error) {
      console.error("Failed to add template email to queue:", error);
      throw error;
    }
  }

  /**
   * Process email queue
   */
  async processQueue(): Promise<void> {
    if (this.processing || !this.isConnected) {
      return;
    }

    this.processing = true;

    try {
      // Get all tenant queues
      const tenantKeys = await this.redis.keys("email_queue:*");

      for (const queueKey of tenantKeys) {
        const tenantId = queueKey.replace("email_queue:", "");

        // Process high priority items first
        await this.processTenantQueue(tenantId, QueuePriority.URGENT);
        await this.processTenantQueue(tenantId, QueuePriority.HIGH);
        await this.processTenantQueue(tenantId, QueuePriority.NORMAL);
        await this.processTenantQueue(tenantId, QueuePriority.LOW);
      }
    } catch (error) {
      console.error("Error processing email queue:", error);
    } finally {
      this.processing = false;
    }
  }

  /**
   * Process queue for specific tenant and priority
   */
  private async processTenantQueue(
    tenantId: string,
    priority: QueuePriority
  ): Promise<void> {
    const queueKey = `email_queue:${tenantId}`;
    const now = Date.now();

    try {
      // Get items for this priority that are ready to send
      const items = await this.redis.zrangebyscore(
        queueKey,
        priority,
        priority,
        "LIMIT",
        0,
        10 // Process max 10 items at once
      );

      for (const itemData of items) {
        const item = JSON.parse(itemData);
        const scheduledTime = new Date(item.scheduledAt).getTime();

        // Skip if not yet scheduled
        if (scheduledTime > now) {
          continue;
        }

        // Get full item from database
        const queueItem = await prisma.emailQueue.findUnique({
          where: { id: item.id },
        });

        if (!queueItem || queueItem.status !== "PENDING") {
          // Remove from Redis queue
          await this.redis.zrem(queueKey, itemData);
          continue;
        }

        // Process the email
        await this.processEmailItem(queueItem);

        // Remove from Redis queue
        await this.redis.zrem(queueKey, itemData);
      }
    } catch (error) {
      console.error(`Error processing queue for tenant ${tenantId}:`, error);
    }
  }

  /**
   * Process individual email item
   */
  private async processEmailItem(queueItem: any): Promise<void> {
    try {
      // Update status to processing
      await prisma.emailQueue.update({
        where: { id: queueItem.id },
        data: {
          status: "PROCESSING",
          attempts: queueItem.attempts + 1,
        },
      });

      // Import email service dynamically to avoid circular dependencies
      const { emailService } = await import("./email");

      // Send email
      const success = await emailService.sendEmail(
        queueItem.to,
        queueItem.subject,
        queueItem.htmlContent,
        queueItem.textContent
      );

      if (success) {
        // Mark as sent
        await prisma.emailQueue.update({
          where: { id: queueItem.id },
          data: {
            status: "SENT",
            processedAt: new Date(),
          },
        });

        // Log communication
        await prisma.communication.create({
          data: {
            tenantId: queueItem.tenantId,
            senderId: "system", // System sender
            recipient: queueItem.to,
            type: "EMAIL",
            subject: queueItem.subject,
            content: queueItem.htmlContent,
            status: "SENT",
            sentAt: new Date(),
          },
        });
      } else {
        throw new Error("Email sending failed");
      }
    } catch (error) {
      console.error(`Failed to process email ${queueItem.id}:`, error);

      // Update failure status
      await prisma.emailQueue.update({
        where: { id: queueItem.id },
        data: {
          status:
            queueItem.attempts >= queueItem.maxAttempts ? "FAILED" : "PENDING",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(tenantId?: string): Promise<{
    pending: number;
    processing: number;
    sent: number;
    failed: number;
  }> {
    const where = tenantId ? { tenantId } : {};

    const [pending, processing, sent, failed] = await Promise.all([
      prisma.emailQueue.count({ where: { ...where, status: "PENDING" } }),
      prisma.emailQueue.count({ where: { ...where, status: "PROCESSING" } }),
      prisma.emailQueue.count({ where: { ...where, status: "SENT" } }),
      prisma.emailQueue.count({ where: { ...where, status: "FAILED" } }),
    ]);

    return { pending, processing, sent, failed };
  }

  /**
   * Retry failed emails
   */
  async retryFailedEmails(tenantId?: string): Promise<number> {
    const where = tenantId ? { tenantId } : {};

    const failedEmails = await prisma.emailQueue.findMany({
      where: {
        ...where,
        status: "FAILED",
        attempts: { lt: 3 }, // Only retry if not maxed out
      },
    });

    let retried = 0;
    for (const email of failedEmails) {
      try {
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: {
            status: "PENDING",
            errorMessage: null,
          },
        });

        // Re-add to Redis queue
        const queueKey = `email_queue:${email.tenantId}`;
        const itemData = JSON.stringify({
          id: email.id,
          priority: email.priority,
          scheduledAt: email.scheduledAt,
        });

        await this.redis.zadd(queueKey, email.priority, itemData);
        retried++;
      } catch (error) {
        console.error(`Failed to retry email ${email.id}:`, error);
      }
    }

    return retried;
  }

  /**
   * Clean up old processed emails
   */
  async cleanupOldEmails(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.emailQueue.deleteMany({
      where: {
        status: { in: ["SENT", "FAILED"] },
        processedAt: { lt: cutoffDate },
      },
    });

    return result.count;
  }

  /**
   * Start queue processor
   */
  startProcessor(intervalMs: number = 30000): void {
    setInterval(async () => {
      await this.processQueue();
    }, intervalMs);

    console.log(`Email queue processor started with ${intervalMs}ms interval`);
  }

  /**
   * Stop queue processor
   */
  stopProcessor(): void {
    this.processing = false;
    console.log("Email queue processor stopped");
  }

  /**
   * Get connection status
   */
  getStatus(): { connected: boolean; processing: boolean } {
    return {
      connected: this.isConnected,
      processing: this.processing,
    };
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}

// Export singleton instance
export const emailQueueService = new EmailQueueService();
export default emailQueueService;
