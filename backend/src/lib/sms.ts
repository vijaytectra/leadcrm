import { z } from "zod";
import { prisma } from "./prisma";

// Twilio configuration
const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
};

// SMS schemas
export const SMSTemplateSchema = z.object({
  name: z.string(),
  content: z.string(),
  variables: z.array(z.string()).default([]),
  category: z.string().default("GENERAL"),
});

export type SMSTemplate = z.infer<typeof SMSTemplateSchema>;

export const SMSMessageSchema = z.object({
  to: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  message: z.string().min(1).max(1600), // SMS character limit
  templateId: z.string().optional(),
  variables: z.record(z.string(), z.string()).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
});

export type SMSMessage = z.infer<typeof SMSMessageSchema>;

// SMS service class
export class SMSService {
  private isConfigured = false;
  private twilioClient: any = null;

  constructor() {
    this.initializeTwilio();
  }

  private async initializeTwilio(): Promise<void> {
    try {
      if (
        twilioConfig.accountSid &&
        twilioConfig.authToken &&
        twilioConfig.phoneNumber
      ) {
        // Dynamic import to avoid bundling Twilio in development
        const { default: twilio } = await import("twilio");
        this.twilioClient = twilio(
          twilioConfig.accountSid,
          twilioConfig.authToken
        );
        this.isConfigured = true;
        console.log("SMS service configured with Twilio");
      } else {
        console.warn("SMS service not configured - Twilio credentials missing");
        this.isConfigured = false;
      }
    } catch (error: any) {
      console.warn(
        "Twilio not available, SMS service disabled:",
        error.message
      );
      this.isConfigured = false;
    }
  }

  /**
   * Send SMS message
   */
  async sendSMS(
    to: string,
    message: string,
    tenantId: string,
    senderId?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured) {
      return {
        success: false,
        error: "SMS service not configured",
      };
    }

    try {
      // Validate phone number format
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(to)) {
        return {
          success: false,
          error: "Invalid phone number format",
        };
      }

      // Send SMS via Twilio
      const result = await this.twilioClient.messages.create({
        body: message,
        from: twilioConfig.phoneNumber,
        to: to,
      });

      // Log communication in database
      await prisma.communication.create({
        data: {
          tenantId,
          senderId: senderId || "system",
          recipient: to,
          type: "SMS",
          content: message,
          status: "SENT",
          sentAt: new Date(),
        },
      });

      return {
        success: true,
        messageId: result.sid,
      };
    } catch (error) {
      console.error("Failed to send SMS:", error);

      // Log failed communication
      await prisma.communication.create({
        data: {
          tenantId,
          senderId: senderId || "system",
          recipient: to,
          type: "SMS",
          content: message,
          status: "FAILED",
          sentAt: new Date(),
        },
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send SMS using template
   */
  async sendTemplateSMS(
    to: string,
    templateId: string,
    variables: Record<string, string>,
    tenantId: string,
    senderId?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Get template from database (you'll need to create this model)
      const template = await prisma.emailTemplate.findFirst({
        where: {
          id: templateId,
          tenantId,
          isActive: true,
        },
      });

      if (!template) {
        return {
          success: false,
          error: "SMS template not found",
        };
      }

      // Substitute variables in template content
      let message = template.textContent || template.htmlContent;
      for (const [key, value] of Object.entries(variables)) {
        message = message.replace(new RegExp(`{{${key}}}`, "g"), value);
      }

      return await this.sendSMS(to, message, tenantId, senderId);
    } catch (error) {
      console.error("Failed to send template SMS:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send bulk SMS messages
   */
  async sendBulkSMS(
    messages: Array<{ to: string; message: string }>,
    tenantId: string,
    senderId?: string
  ): Promise<{
    success: number;
    failed: number;
    results: Array<{ to: string; success: boolean; error?: string }>;
  }> {
    const results: Array<{ to: string; success: boolean; error?: string }> = [];
    let successCount = 0;
    let failedCount = 0;

    // Process messages in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);

      const batchPromises = batch.map(async (msg) => {
        const result = await this.sendSMS(
          msg.to,
          msg.message,
          tenantId,
          senderId
        );
        return {
          to: msg.to,
          success: result.success,
          error: result.error,
        };
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Count results
      batchResults.forEach((result) => {
        if (result.success) {
          successCount++;
        } else {
          failedCount++;
        }
      });

      // Add delay between batches to respect rate limits
      if (i + batchSize < messages.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return {
      success: successCount,
      failed: failedCount,
      results,
    };
  }

  /**
   * Get SMS delivery status
   */
  async getDeliveryStatus(messageId: string): Promise<{
    status: string;
    errorCode?: string;
    errorMessage?: string;
  }> {
    if (!this.isConfigured) {
      return {
        status: "UNKNOWN",
        errorMessage: "SMS service not configured",
      };
    }

    try {
      const message = await this.twilioClient.messages(messageId).fetch();

      return {
        status: message.status,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
      };
    } catch (error) {
      console.error("Failed to get SMS delivery status:", error);
      return {
        status: "UNKNOWN",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Validate phone number
   */
  validatePhoneNumber(phoneNumber: string): {
    valid: boolean;
    formatted?: string;
    error?: string;
  } {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, "");

    // Check if it's a valid length
    if (cleaned.length < 10 || cleaned.length > 15) {
      return {
        valid: false,
        error: "Phone number must be between 10 and 15 digits",
      };
    }

    // Add country code if not present (assuming India +91)
    let formatted = cleaned;
    if (cleaned.length === 10) {
      formatted = `+91${cleaned}`;
    } else if (!cleaned.startsWith("+")) {
      formatted = `+${cleaned}`;
    }

    return {
      valid: true,
      formatted,
    };
  }

  /**
   * Get SMS statistics
   */
  async getSMSStats(
    tenantId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    total: number;
    sent: number;
    delivered: number;
    failed: number;
    pending: number;
  }> {
    const where: any = { type: "SMS" };

    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (startDate || endDate) {
      where.sentAt = {};
      if (startDate) where.sentAt.gte = startDate;
      if (endDate) where.sentAt.lte = endDate;
    }

    const [total, sent, delivered, failed, pending] = await Promise.all([
      prisma.communication.count({ where }),
      prisma.communication.count({ where: { ...where, status: "SENT" } }),
      prisma.communication.count({ where: { ...where, status: "DELIVERED" } }),
      prisma.communication.count({ where: { ...where, status: "FAILED" } }),
      prisma.communication.count({ where: { ...where, status: "PENDING" } }),
    ]);

    return { total, sent, delivered, failed, pending };
  }

  /**
   * Test SMS configuration
   */
  async testConfiguration(): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured) {
      return {
        success: false,
        error: "SMS service not configured",
      };
    }

    try {
      // Test with a dummy message (won't actually send)
      await this.twilioClient.messages.list({ limit: 1 });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get service status
   */
  getStatus(): { configured: boolean; ready: boolean } {
    return {
      configured: this.isConfigured,
      ready: this.isConfigured && this.twilioClient !== null,
    };
  }
}

// Export singleton instance
export const smsService = new SMSService();
export default smsService;
