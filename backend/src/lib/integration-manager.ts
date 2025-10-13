import crypto from "crypto";
import { prisma } from "./prisma";
import { encrypt, decrypt } from "./crypto";
import type {
  IntegrationPlatform,
  IntegrationCredentials,
} from "../types/integrations";
import { INTEGRATION_LIMITS } from "../types/integrations";

interface SubscriptionLimits {
  STARTER: number;
  PRO: number;
  MAX: number;
}

export class IntegrationManager {
  async canAddIntegration(
    tenantId: string,
    platform: IntegrationPlatform
  ): Promise<{
    allowed: boolean;
    reason?: string;
    current: number;
    limit: number;
  }> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { subscriptionTier: true },
    });

    if (!tenant) {
      throw new Error("Tenant not found");
    }

    const limit = INTEGRATION_LIMITS[platform][tenant.subscriptionTier];

    const currentCount = await prisma.integrationConfig.count({
      where: { tenantId, platform },
    });

    if (limit === -1) {
      return { allowed: true, current: currentCount, limit: -1 };
    }

    if (currentCount >= limit) {
      return {
        allowed: false,
        reason: `Maximum ${limit} ${platform} integration(s) allowed for ${tenant.subscriptionTier} tier`,
        current: currentCount,
        limit,
      };
    }

    return { allowed: true, current: currentCount, limit };
  }

  async createIntegration(
    tenantId: string,
    platform: IntegrationPlatform,
    name: string,
    credentials: IntegrationCredentials[IntegrationPlatform],
    metadata: Record<string, unknown> = {}
  ) {
    const check = await this.canAddIntegration(tenantId, platform);
    if (!check.allowed) {
      throw new Error(check.reason);
    }

    const encryptedCredentials = encrypt(JSON.stringify(credentials));
    const webhookSecret = this.generateWebhookSecret();
    const webhookUrl = this.generateWebhookUrl(tenantId, platform);

    return prisma.integrationConfig.create({
      data: {
        tenantId,
        platform,
        name,
        credentials: encryptedCredentials,
        webhookUrl,
        webhookSecret,
        metadata,
      },
    });
  }

  async getIntegrationCredentials<P extends IntegrationPlatform>(
    integrationId: string
  ): Promise<IntegrationCredentials[P]> {
    const integration = await prisma.integrationConfig.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new Error("Integration not found");
    }

    const decrypted = decrypt(integration.credentials);
    return JSON.parse(decrypted) as IntegrationCredentials[P];
  }

  async updateIntegrationStatus(integrationId: string, isActive: boolean) {
    return prisma.integrationConfig.update({
      where: { id: integrationId },
      data: { isActive },
    });
  }

  async recordSync(
    integrationId: string,
    status: "success" | "error",
    errorMessage?: string
  ) {
    return prisma.integrationConfig.update({
      where: { id: integrationId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: errorMessage || status,
      },
    });
  }

  private generateWebhookSecret(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  private generateWebhookUrl(
    tenantId: string,
    platform: IntegrationPlatform
  ): string {
    const baseUrl = process.env.BACKEND_URL || "http://localhost:4000";
    return `${baseUrl}/api/webhooks/leads/${tenantId}/${platform.toLowerCase()}`;
  }

  async verifyWebhookSignature(
    integrationId: string,
    payload: string,
    signature: string
  ): Promise<boolean> {
    const integration = await prisma.integrationConfig.findUnique({
      where: { id: integrationId },
      select: { webhookSecret: true },
    });

    if (!integration) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac("sha256", integration.webhookSecret)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

export const integrationManager = new IntegrationManager();
