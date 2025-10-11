import { z } from "zod";
import { prisma } from "./prisma";

// WhatsApp Business API configuration
const whatsappConfig = {
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
  apiVersion: "v18.0",
  baseUrl: "https://graph.facebook.com",
};

// WhatsApp schemas
export const WhatsAppMessageSchema = z.object({
  to: z.string().regex(/^\d{10,15}$/, "Invalid phone number format"),
  message: z.string().min(1).max(4096),
  type: z.enum(["text", "template", "media", "interactive"]).default("text"),
  templateName: z.string().optional(),
  templateParams: z.array(z.string()).optional(),
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(["image", "video", "audio", "document"]).optional(),
  interactiveType: z.enum(["button", "list"]).optional(),
  interactiveData: z.any().optional(),
});

export type WhatsAppMessage = z.infer<typeof WhatsAppMessageSchema>;

export const WhatsAppTemplateSchema = z.object({
  name: z.string(),
  category: z.enum(["AUTHENTICATION", "MARKETING", "UTILITY"]),
  language: z.string().default("en"),
  components: z.array(z.any()),
});

export type WhatsAppTemplate = z.infer<typeof WhatsAppTemplateSchema>;

// WhatsApp service class
export class WhatsAppService {
  private isConfigured = false;
  private apiUrl: string;

  constructor() {
    this.apiUrl = `${whatsappConfig.baseUrl}/${whatsappConfig.apiVersion}/${whatsappConfig.phoneNumberId}`;
    this.initializeWhatsApp();
  }

  private initializeWhatsApp(): void {
    if (whatsappConfig.accessToken && whatsappConfig.phoneNumberId) {
      this.isConfigured = true;
      console.log("WhatsApp Business API service configured");
    } else {
      console.warn("WhatsApp service not configured - credentials missing");
      this.isConfigured = false;
    }
  }

  /**
   * Send text message
   */
  async sendTextMessage(
    to: string,
    message: string,
    tenantId: string,
    senderId?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured) {
      return {
        success: false,
        error: "WhatsApp service not configured",
      };
    }

    try {
      const response = await this.makeAPIRequest("/messages", {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: {
          body: message,
        },
      });

      // Log communication in database
      await prisma.communication.create({
        data: {
          tenantId,
          senderId: senderId || "system",
          recipient: to,
          type: "WHATSAPP",
          content: message,
          status: "SENT",
          sentAt: new Date(),
        },
      });

      return {
        success: true,
        messageId: response.messages[0].id,
      };
    } catch (error) {
      console.error("Failed to send WhatsApp message:", error);

      // Log failed communication
      await prisma.communication.create({
        data: {
          tenantId,
          senderId: senderId || "system",
          recipient: to,
          type: "WHATSAPP",
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
   * Send template message
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    templateParams: string[],
    tenantId: string,
    senderId?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured) {
      return {
        success: false,
        error: "WhatsApp service not configured",
      };
    }

    try {
      const response = await this.makeAPIRequest("/messages", {
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: "en",
          },
          components:
            templateParams.length > 0
              ? [
                  {
                    type: "body",
                    parameters: templateParams.map((param) => ({
                      type: "text",
                      text: param,
                    })),
                  },
                ]
              : [],
        },
      });

      // Log communication
      await prisma.communication.create({
        data: {
          tenantId,
          senderId: senderId || "system",
          recipient: to,
          type: "WHATSAPP",
          content: `Template: ${templateName}`,
          status: "SENT",
          sentAt: new Date(),
        },
      });

      return {
        success: true,
        messageId: response.messages[0].id,
      };
    } catch (error) {
      console.error("Failed to send WhatsApp template message:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send media message
   */
  async sendMediaMessage(
    to: string,
    mediaUrl: string,
    mediaType: "image" | "video" | "audio" | "document",
    caption?: string,
    tenantId?: string,
    senderId?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured) {
      return {
        success: false,
        error: "WhatsApp service not configured",
      };
    }

    try {
      const messageData: any = {
        messaging_product: "whatsapp",
        to: to,
        type: mediaType,
        [mediaType]: {
          link: mediaUrl,
        },
      };

      if (
        caption &&
        (mediaType === "image" ||
          mediaType === "video" ||
          mediaType === "document")
      ) {
        messageData[mediaType].caption = caption;
      }

      const response = await this.makeAPIRequest("/messages", messageData);

      // Log communication
      if (tenantId) {
        await prisma.communication.create({
          data: {
            tenantId,
            senderId: senderId || "system",
            recipient: to,
            type: "WHATSAPP",
            content: `Media: ${mediaType} - ${caption || mediaUrl}`,
            status: "SENT",
            sentAt: new Date(),
          },
        });
      }

      return {
        success: true,
        messageId: response.messages[0].id,
      };
    } catch (error) {
      console.error("Failed to send WhatsApp media message:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send interactive message (buttons or list)
   */
  async sendInteractiveMessage(
    to: string,
    interactiveData: any,
    tenantId: string,
    senderId?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured) {
      return {
        success: false,
        error: "WhatsApp service not configured",
      };
    }

    try {
      const response = await this.makeAPIRequest("/messages", {
        messaging_product: "whatsapp",
        to: to,
        type: "interactive",
        interactive: interactiveData,
      });

      // Log communication
      await prisma.communication.create({
        data: {
          tenantId,
          senderId: senderId || "system",
          recipient: to,
          type: "WHATSAPP",
          content: "Interactive message",
          status: "SENT",
          sentAt: new Date(),
        },
      });

      return {
        success: true,
        messageId: response.messages[0].id,
      };
    } catch (error) {
      console.error("Failed to send WhatsApp interactive message:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageId: string): Promise<{
    status: string;
    timestamp: string;
    error?: string;
  }> {
    if (!this.isConfigured) {
      return {
        status: "UNKNOWN",
        timestamp: new Date().toISOString(),
        error: "WhatsApp service not configured",
      };
    }

    try {
      const response = await this.makeAPIRequest(`/messages/${messageId}`);
      return {
        status: response.statuses[0].status,
        timestamp: response.statuses[0].timestamp,
      };
    } catch (error) {
      console.error("Failed to get WhatsApp message status:", error);
      return {
        status: "UNKNOWN",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get available templates
   */
  async getTemplates(): Promise<{
    success: boolean;
    templates?: WhatsAppTemplate[];
    error?: string;
  }> {
    if (!this.isConfigured) {
      return {
        success: false,
        error: "WhatsApp service not configured",
      };
    }

    try {
      const response = await this.makeAPIRequest(
        `/${whatsappConfig.businessAccountId}/message_templates`
      );

      return {
        success: true,
        templates: response.data,
      };
    } catch (error) {
      console.error("Failed to get WhatsApp templates:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
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

    // WhatsApp requires 10-15 digit phone numbers
    if (cleaned.length < 10 || cleaned.length > 15) {
      return {
        valid: false,
        error: "Phone number must be between 10 and 15 digits",
      };
    }

    return {
      valid: true,
      formatted: cleaned,
    };
  }

  /**
   * Get WhatsApp statistics
   */
  async getWhatsAppStats(
    tenantId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    total: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  }> {
    const where: any = { type: "WHATSAPP" };

    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (startDate || endDate) {
      where.sentAt = {};
      if (startDate) where.sentAt.gte = startDate;
      if (endDate) where.sentAt.lte = endDate;
    }

    const [total, sent, delivered, read, failed] = await Promise.all([
      prisma.communication.count({ where }),
      prisma.communication.count({ where: { ...where, status: "SENT" } }),
      prisma.communication.count({ where: { ...where, status: "DELIVERED" } }),
      prisma.communication.count({ where: { ...where, status: "READ" } }),
      prisma.communication.count({ where: { ...where, status: "FAILED" } }),
    ]);

    return { total, sent, delivered, read, failed };
  }

  /**
   * Make API request to WhatsApp Business API
   */
  private async makeAPIRequest(endpoint: string, data?: any): Promise<any> {
    const url = `${this.apiUrl}${endpoint}`;

    const response = await fetch(url, {
      method: data ? "POST" : "GET",
      headers: {
        Authorization: `Bearer ${whatsappConfig.accessToken}`,
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `WhatsApp API error: ${response.status} - ${
          errorData.error?.message || response.statusText
        }`
      );
    }

    return await response.json();
  }

  /**
   * Test WhatsApp configuration
   */
  async testConfiguration(): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured) {
      return {
        success: false,
        error: "WhatsApp service not configured",
      };
    }

    try {
      // Test by getting business account info
      await this.makeAPIRequest(`/${whatsappConfig.businessAccountId}`);
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
      ready: this.isConfigured,
    };
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();
export default whatsappService;
