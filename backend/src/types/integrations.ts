// Integration platform types
export type IntegrationPlatform =
  | "GOOGLE_ADS"
  | "META"
  | "LINKEDIN"
  | "WHATSAPP";

export interface IntegrationCredentials {
  googleAds?: {
    developerToken: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    customerId: string;
  };
  meta?: {
    appId: string;
    appSecret: string;
    accessToken: string;
    pageId: string;
  };
  linkedin?: {
    clientId: string;
    clientSecret: string;
    accessToken: string;
    organizationId: string;
  };
  whatsapp?: {
    accessToken: string;
    phoneNumberId: string;
    businessAccountId: string;
  };
}

export interface IntegrationConfig {
  id: string;
  tenantId: string;
  platform: IntegrationPlatform;
  name: string;
  credentials: string; // encrypted JSON
  isActive: boolean;
  webhookUrl: string;
  lastSyncAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookLeadData {
  source: IntegrationPlatform;
  externalId: string;
  name: string;
  email?: string;
  phone?: string;
  campaignId?: string;
  adGroupId?: string;
  metadata: Record<string, unknown>;
}

export interface LeadSourceTracking {
  id: string;
  leadId: string;
  integrationId: string;
  platform: IntegrationPlatform;
  campaignId?: string;
  campaignName?: string;
  adGroupId?: string;
  adGroupName?: string;
  adId?: string;
  adName?: string;
  cost?: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface SubscriptionLimits {
  STARTER: number;
  PRO: number;
  MAX: number;
}

export const INTEGRATION_LIMITS: Record<
  IntegrationPlatform,
  SubscriptionLimits
> = {
  GOOGLE_ADS: { STARTER: 1, PRO: 3, MAX: -1 },
  META: { STARTER: 1, PRO: 3, MAX: -1 },
  LINKEDIN: { STARTER: 1, PRO: 3, MAX: -1 },
  WHATSAPP: { STARTER: 1, PRO: 3, MAX: -1 },
};
