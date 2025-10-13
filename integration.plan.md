# Phase 8: Integration Hub Implementation Plan

## Overview

This phase implements the Integration Hub with ad platform integrations for lead capture, comprehensive analytics & reporting system, and WhatsApp messaging for telecallers. All code will be type-safe (no `any` keyword), follow server-side rendering patterns (90% server components), and adhere to industry-standard principles.

## Core Principles

### TypeScript Standards
- **Zero `any` usage**: All types must be explicitly defined
- Use `unknown` for truly unknown types, then narrow with type guards
- Define interfaces for all API responses and requests
- Use discriminated unions for complex state management
- Leverage TypeScript utility types (Pick, Omit, Partial, etc.)

### Component Architecture
- **90% Server Components**: All data fetching happens on server
- **10% Client Components**: Only for interactive elements (forms, modals, real-time updates)
- Use `"use client"` directive only when necessary
- Server components fetch data directly from backend
- Pass serializable props from server to client components

### API Communication Standards
- **Server Components**: Use `apiGet`, `apiPost`, `apiPut` from `utils.ts`
- **Client Components**: Use `apiGetClientNew`, `apiPostClientNew`, `apiPutClient`, `apiDeleteClient`
- All API methods include proper token handling
- Type all request/response interfaces

### Subscription Tier Integration Limits
- **STARTER**: 1 account per platform (Google Ads, Meta, LinkedIn, WhatsApp)
- **PRO**: 3 accounts per platform
- **MAX**: Unlimited accounts per platform
- Enforce limits at API level and UI level
- Display current usage vs. limit in UI

## Implementation Strategy

### Part 1: TypeScript Types & Interfaces (1 hour)

**File: `backend/src/types/integrations.ts`**

```typescript
// Integration platform types
export type IntegrationPlatform = 'GOOGLE_ADS' | 'META' | 'LINKEDIN' | 'WHATSAPP';

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
```

**File: `backend/src/types/analytics.ts`**

```typescript
export interface AnalyticsSnapshot {
  id: string;
  tenantId: string;
  date: Date;
  period: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  metrics: AnalyticsMetrics;
  createdAt: Date;
}

export interface AnalyticsMetrics {
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: number;
  leadsBySource: Record<string, number>;
  leadsByStatus: Record<string, number>;
  teamPerformance: TeamPerformanceMetric[];
}

export interface TeamPerformanceMetric {
  userId: string;
  userName: string;
  callsMade: number;
  callsAnswered: number;
  leadsConverted: number;
  conversionRate: number;
}

export interface FunnelData {
  stage: string;
  count: number;
  percentage: number;
  dropOffRate: number;
}

export interface ReportTemplate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: 'FUNNEL' | 'CONVERSION' | 'SOURCE' | 'TEAM' | 'ROI' | 'CUSTOM';
  config: ReportConfig;
  schedule?: ReportSchedule;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportConfig {
  metrics: string[];
  filters: Record<string, unknown>;
  groupBy: string[];
  dateRange: { start: Date; end: Date } | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH';
  chartTypes: ('bar' | 'line' | 'pie' | 'table')[];
}

export interface ReportSchedule {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  recipients: string[];
}
```

**File: `backend/src/types/whatsapp.ts`**

```typescript
export interface WhatsAppTemplate {
  id: string;
  tenantId: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  content: string;
  variables: string[];
  headerType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  headerContent?: string;
  buttons?: WhatsAppButton[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppButton {
  type: 'QUICK_REPLY' | 'CALL_TO_ACTION';
  text: string;
  url?: string;
  phoneNumber?: string;
}

export interface BulkMessageJob {
  id: string;
  tenantId: string;
  userId: string;
  templateId?: string;
  message: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BulkMessageRecipient {
  leadId: string;
  phoneNumber: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  messageId?: string;
  errorReason?: string;
}
```

**File: `frontend/src/types/integrations.ts`**

```typescript
// Frontend type definitions (mirrors backend)
export type IntegrationPlatform = 'GOOGLE_ADS' | 'META' | 'LINKEDIN' | 'WHATSAPP';
export type SubscriptionTier = 'STARTER' | 'PRO' | 'MAX';

export interface IntegrationLimits {
  tier: SubscriptionTier;
  limits: Record<IntegrationPlatform, number>; // -1 means unlimited
}

export interface IntegrationListItem {
  id: string;
  platform: IntegrationPlatform;
  name: string;
  isActive: boolean;
  lastSyncAt: string | null;
  webhookUrl: string;
  createdAt: string;
}

export interface IntegrationSetupFormData {
  platform: IntegrationPlatform;
  name: string;
  credentials: {
    [key: string]: string;
  };
}

export interface IntegrationStatusData {
  totalLeads: number;
  leadsToday: number;
  lastSyncStatus: 'success' | 'error' | 'pending';
  errorMessage?: string;
}
```

### Part 2: Database Schema Updates (2 hours)

**File: `backend/prisma/schema.prisma`**

Add these models:

```prisma
model IntegrationConfig {
  id            String              @id @default(cuid())
  tenantId      String
  platform      IntegrationPlatform
  name          String
  credentials   String // Encrypted JSON
  isActive      Boolean             @default(true)
  webhookUrl    String
  webhookSecret String // For signature verification
  lastSyncAt    DateTime?
  lastSyncStatus String?
  metadata      Json                @default("{}")
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  tenant              Tenant                @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  leadSourceTrackings LeadSourceTracking[]

  @@index([tenantId])
  @@index([platform])
  @@index([isActive])
}

model LeadSourceTracking {
  id             String   @id @default(cuid())
  leadId         String
  integrationId  String
  platform       IntegrationPlatform
  externalId     String? // Platform's lead ID
  campaignId     String?
  campaignName   String?
  adGroupId      String?
  adGroupName    String?
  adId           String?
  adName         String?
  cost           Float? // Cost per lead in paise
  metadata       Json     @default("{}")
  createdAt      DateTime @default(now())

  lead        Lead              @relation(fields: [leadId], references: [id], onDelete: Cascade)
  integration IntegrationConfig @relation(fields: [integrationId], references: [id], onDelete: Cascade)

  @@unique([leadId])
  @@index([integrationId])
  @@index([platform])
  @@index([campaignId])
}

model AnalyticsSnapshot {
  id        String   @id @default(cuid())
  tenantId  String
  date      DateTime
  period    AnalyticsPeriod
  metrics   Json // Stores AnalyticsMetrics
  createdAt DateTime @default(now())

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, date, period])
  @@index([tenantId])
  @@index([date])
  @@index([period])
}

model ReportTemplate {
  id          String      @id @default(cuid())
  tenantId    String
  name        String
  description String?
  type        ReportType
  config      Json // ReportConfig
  schedule    Json? // ReportSchedule
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  tenant          Tenant            @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  generatedReports GeneratedReport[]

  @@index([tenantId])
  @@index([type])
  @@index([isActive])
}

model GeneratedReport {
  id             String   @id @default(cuid())
  templateId     String
  tenantId       String
  fileName       String
  fileUrl        String
  fileType       String // 'PDF' | 'EXCEL'
  generatedBy    String
  periodStart    DateTime
  periodEnd      DateTime
  createdAt      DateTime @default(now())

  template ReportTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  tenant   Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([templateId])
  @@index([tenantId])
  @@index([createdAt])
}

model WhatsAppTemplate {
  id            String               @id @default(cuid())
  tenantId      String
  name          String
  category      WhatsAppCategory
  language      String               @default("en")
  status        WhatsAppTemplateStatus @default(PENDING)
  content       String
  variables     Json // Array of variable names
  headerType    String?
  headerContent String?
  buttons       Json? // WhatsAppButton[]
  externalId    String? // Meta template ID
  createdAt     DateTime             @default(now())
  updatedAt     DateTime             @updatedAt

  tenant Tenant            @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  jobs   BulkMessageJob[]

  @@index([tenantId])
  @@index([status])
}

model BulkMessageJob {
  id             String           @id @default(cuid())
  tenantId       String
  userId         String
  templateId     String?
  message        String
  recipientCount Int              @default(0)
  sentCount      Int              @default(0)
  failedCount    Int              @default(0)
  deliveredCount Int              @default(0)
  status         BulkMessageStatus @default(PENDING)
  startedAt      DateTime?
  completedAt    DateTime?
  errorMessage   String?
  recipients     Json // BulkMessageRecipient[]
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt

  tenant   Tenant            @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  template WhatsAppTemplate? @relation(fields: [templateId], references: [id])

  @@index([tenantId])
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

// Add to Tenant model relations
model Tenant {
  // ... existing fields
  integrations      IntegrationConfig[]
  analyticsSnapshots AnalyticsSnapshot[]
  reportTemplates   ReportTemplate[]
  generatedReports  GeneratedReport[]
  whatsappTemplates WhatsAppTemplate[]
  bulkMessageJobs   BulkMessageJob[]
}

// Add to Lead model relations
model Lead {
  // ... existing fields
  sourceTracking LeadSourceTracking?
}

// Enums
enum IntegrationPlatform {
  GOOGLE_ADS
  META
  LINKEDIN
  WHATSAPP
}

enum AnalyticsPeriod {
  HOURLY
  DAILY
  WEEKLY
  MONTHLY
}

enum ReportType {
  FUNNEL
  CONVERSION
  SOURCE
  TEAM
  ROI
  CUSTOM
}

enum WhatsAppCategory {
  MARKETING
  UTILITY
  AUTHENTICATION
}

enum WhatsAppTemplateStatus {
  PENDING
  APPROVED
  REJECTED
}

enum BulkMessageStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
}
```

### Part 3: Backend - Integration Service Core (4 hours)

**File: `backend/src/lib/crypto.ts`**

```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function getKey(salt: Buffer): Buffer {
  const key = process.env.INTEGRATION_ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new Error('INTEGRATION_ENCRYPTION_KEY must be at least 32 characters');
  }
  return crypto.pbkdf2Sync(key, salt, 100000, KEY_LENGTH, 'sha512');
}

export function encrypt(text: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = getKey(salt);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'hex')]).toString('base64');
}

export function decrypt(encryptedData: string): string {
  const buffer = Buffer.from(encryptedData, 'base64');
  
  const salt = buffer.subarray(0, SALT_LENGTH);
  const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  
  const key = getKey(salt);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString('utf8');
}
```

**File: `backend/src/lib/integration-manager.ts`**

```typescript
import { prisma } from './prisma';
import { encrypt, decrypt } from './crypto';
import type { IntegrationPlatform, IntegrationCredentials } from '../types/integrations';

interface SubscriptionLimits {
  STARTER: number;
  PRO: number;
  MAX: number;
}

const INTEGRATION_LIMITS: Record<IntegrationPlatform, SubscriptionLimits> = {
  GOOGLE_ADS: { STARTER: 1, PRO: 3, MAX: -1 },
  META: { STARTER: 1, PRO: 3, MAX: -1 },
  LINKEDIN: { STARTER: 1, PRO: 3, MAX: -1 },
  WHATSAPP: { STARTER: 1, PRO: 3, MAX: -1 },
};

export class IntegrationManager {
  async canAddIntegration(
    tenantId: string,
    platform: IntegrationPlatform
  ): Promise<{ allowed: boolean; reason?: string; current: number; limit: number }> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { subscriptionTier: true },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
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
      throw new Error('Integration not found');
    }

    const decrypted = decrypt(integration.credentials);
    return JSON.parse(decrypted) as IntegrationCredentials[P];
  }

  async updateIntegrationStatus(
    integrationId: string,
    isActive: boolean
  ) {
    return prisma.integrationConfig.update({
      where: { id: integrationId },
      data: { isActive },
    });
  }

  async recordSync(
    integrationId: string,
    status: 'success' | 'error',
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
    return crypto.randomBytes(32).toString('hex');
  }

  private generateWebhookUrl(tenantId: string, platform: IntegrationPlatform): string {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';
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
      .createHmac('sha256', integration.webhookSecret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

export const integrationManager = new IntegrationManager();
```

### Part 4: Backend - Ad Platform Integrations (6 hours)

**File: `backend/src/lib/lead-deduplication.ts`**

```typescript
import { prisma } from './prisma';
import type { WebhookLeadData } from '../types/integrations';

interface DeduplicationResult {
  isDuplicate: boolean;
  existingLeadId?: string;
  reason?: string;
}

export class LeadDeduplicator {
  async checkDuplicate(
    tenantId: string,
    leadData: WebhookLeadData
  ): Promise<DeduplicationResult> {
    // Check by external ID first
    if (leadData.externalId) {
      const existing = await prisma.leadSourceTracking.findFirst({
        where: {
          platform: leadData.source,
          externalId: leadData.externalId,
        },
        include: { lead: true },
      });

      if (existing) {
        return {
          isDuplicate: true,
          existingLeadId: existing.leadId,
          reason: 'Duplicate external ID from same platform',
        };
      }
    }

    // Check by email/phone combination
    if (leadData.email || leadData.phone) {
      const where: { tenantId: string; OR?: Array<{ email?: string; phone?: string }> } = {
        tenantId,
      };

      const conditions: Array<{ email?: string; phone?: string }> = [];
      if (leadData.email) conditions.push({ email: leadData.email });
      if (leadData.phone) conditions.push({ phone: leadData.phone });

      if (conditions.length > 0) {
        where.OR = conditions;
      }

      const existing = await prisma.lead.findFirst({ where });

      if (existing) {
        return {
          isDuplicate: true,
          existingLeadId: existing.id,
          reason: 'Matching email or phone number',
        };
      }
    }

    return { isDuplicate: false };
  }

  async createOrUpdateLead(
    tenantId: string,
    integrationId: string,
    leadData: WebhookLeadData
  ) {
    const dupeCheck = await this.checkDuplicate(tenantId, leadData);

    if (dupeCheck.isDuplicate && dupeCheck.existingLeadId) {
      // Update existing lead
      return prisma.lead.update({
        where: { id: dupeCheck.existingLeadId },
        data: {
          updatedAt: new Date(),
        },
      });
    }

    // Create new lead
    const lead = await prisma.lead.create({
      data: {
        tenantId,
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        source: leadData.source,
        status: 'NEW',
        score: 0,
      },
    });

    // Create source tracking
    await prisma.leadSourceTracking.create({
      data: {
        leadId: lead.id,
        integrationId,
        platform: leadData.source,
        externalId: leadData.externalId,
        campaignId: leadData.campaignId,
        metadata: leadData.metadata,
      },
    });

    return lead;
  }
}

export const leadDeduplicator = new LeadDeduplicator();
```

**File: `backend/src/lib/integrations/google-ads.ts`**

```typescript
import type { WebhookLeadData } from '../../types/integrations';

interface GoogleAdsWebhookPayload {
  gclid: string;
  google_key: string;
  form_id: string;
  campaign_id: string;
  ad_group_id: string;
  creative_id: string;
  user_column_data: Array<{
    column_id: string;
    string_value?: string;
    boolean_value?: boolean;
  }>;
}

export class GoogleAdsIntegration {
  parseWebhookPayload(payload: GoogleAdsWebhookPayload): WebhookLeadData {
    const userData = payload.user_column_data.reduce((acc, field) => {
      acc[field.column_id] = field.string_value || field.boolean_value;
      return acc;
    }, {} as Record<string, string | boolean | undefined>);

    return {
      source: 'GOOGLE_ADS',
      externalId: payload.gclid,
      name: this.extractName(userData),
      email: this.extractEmail(userData),
      phone: this.extractPhone(userData),
      campaignId: payload.campaign_id,
      adGroupId: payload.ad_group_id,
      metadata: {
        formId: payload.form_id,
        creativeId: payload.creative_id,
        googleKey: payload.google_key,
        userData,
      },
    };
  }

  private extractName(userData: Record<string, string | boolean | undefined>): string {
    const firstName = userData.FIRST_NAME as string || '';
    const lastName = userData.LAST_NAME as string || '';
    const fullName = userData.FULL_NAME as string || '';
    
    if (fullName) return fullName;
    if (firstName || lastName) return `${firstName} ${lastName}`.trim();
    
    return 'Unknown';
  }

  private extractEmail(userData: Record<string, string | boolean | undefined>): string | undefined {
    return (userData.EMAIL as string) || undefined;
  }

  private extractPhone(userData: Record<string, string | boolean | undefined>): string | undefined {
    const phone = userData.PHONE_NUMBER as string;
    return phone ? this.normalizePhone(phone) : undefined;
  }

  private normalizePhone(phone: string): string {
    // Remove all non-digit characters
    return phone.replace(/\D/g, '');
  }
}

export const googleAdsIntegration = new GoogleAdsIntegration();
```

**File: `backend/src/lib/integrations/meta.ts`**

```typescript
import type { WebhookLeadData } from '../../types/integrations';

interface MetaWebhookPayload {
  entry: Array<{
    id: string;
    time: number;
    changes: Array<{
      field: string;
      value: {
        ad_id: string;
        form_id: string;
        leadgen_id: string;
        created_time: number;
        page_id: string;
        adgroup_id: string;
        campaign_id: string;
        platform: 'facebook' | 'instagram';
        field_data: Array<{
          name: string;
          values: string[];
        }>;
      };
    }>;
  }>;
}

export class MetaIntegration {
  parseWebhookPayload(payload: MetaWebhookPayload): WebhookLeadData[] {
    const leads: WebhookLeadData[] = [];

    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.field === 'leadgen') {
          const leadData = change.value;
          const fieldData = this.parseFieldData(leadData.field_data);

          leads.push({
            source: 'META',
            externalId: leadData.leadgen_id,
            name: fieldData.full_name || fieldData.first_name || 'Unknown',
            email: fieldData.email,
            phone: fieldData.phone_number ? this.normalizePhone(fieldData.phone_number) : undefined,
            campaignId: leadData.campaign_id,
            adGroupId: leadData.adgroup_id,
            metadata: {
              adId: leadData.ad_id,
              formId: leadData.form_id,
              pageId: leadData.page_id,
              platform: leadData.platform,
              createdTime: leadData.created_time,
              fieldData,
            },
          });
        }
      }
    }

    return leads;
  }

  private parseFieldData(fieldData: Array<{ name: string; values: string[] }>): Record<string, string> {
    return fieldData.reduce((acc, field) => {
      acc[field.name] = field.values[0] || '';
      return acc;
    }, {} as Record<string, string>);
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  verifyWebhookSignature(payload: string, signature: string, appSecret: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', appSecret)
      .update(payload)
      .digest('hex');

    return `sha256=${expectedSignature}` === signature;
  }
}

export const metaIntegration = new MetaIntegration();
```

**File: `backend/src/lib/integrations/linkedin.ts`**

```typescript
import type { WebhookLeadData } from '../../types/integrations';

interface LinkedInWebhookPayload {
  id: string;
  campaignId: string;
  creativeId: string;
  leadType: string;
  submittedAt: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  company?: string;
  title?: string;
  responses: Array<{
    questionId: string;
    answer: string;
  }>;
}

export class LinkedInIntegration {
  parseWebhookPayload(payload: LinkedInWebhookPayload): WebhookLeadData {
    const customData = payload.responses.reduce((acc, response) => {
      acc[response.questionId] = response.answer;
      return acc;
    }, {} as Record<string, string>);

    return {
      source: 'LINKEDIN',
      externalId: payload.id,
      name: `${payload.firstName} ${payload.lastName}`.trim(),
      email: payload.email,
      phone: payload.phoneNumber ? this.normalizePhone(payload.phoneNumber) : undefined,
      campaignId: payload.campaignId,
      metadata: {
        creativeId: payload.creativeId,
        leadType: payload.leadType,
        submittedAt: payload.submittedAt,
        company: payload.company,
        title: payload.title,
        customResponses: customData,
      },
    };
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  // LinkedIn uses OAuth2 with specific scopes
  async validateAccessToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.linkedin.com/v2/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const linkedInIntegration = new LinkedInIntegration();
```

### Part 5: Backend - Integration Routes (4 hours)

**File: `backend/src/routes/integrations.ts`**

```typescript
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { integrationManager } from '../lib/integration-manager';
import { leadDeduplicator } from '../lib/lead-deduplication';
import { googleAdsIntegration } from '../lib/integrations/google-ads';
import { metaIntegration } from '../lib/integrations/meta';
import { linkedInIntegration } from '../lib/integrations/linkedin';
import {
  requireAuth,
  requireActiveUser,
  requireRole,
  requireTenantAccess,
  type AuthedRequest,
} from '../middleware/auth';
import type { IntegrationPlatform } from '../types/integrations';

const router = Router();

// Validation schemas
const createIntegrationSchema = z.object({
  platform: z.enum(['GOOGLE_ADS', 'META', 'LINKEDIN', 'WHATSAPP']),
  name: z.string().min(1).max(100),
  credentials: z.record(z.string()),
  metadata: z.record(z.unknown()).optional(),
});

const updateIntegrationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  credentials: z.record(z.string()).optional(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * GET /:tenant/integrations
 * List all integrations for a tenant
 */
router.get(
  '/:tenant/integrations',
  requireAuth,
  requireActiveUser,
  requireRole(['INSTITUTION_ADMIN']),
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true, subscriptionTier: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
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
        orderBy: { createdAt: 'desc' },
      });

      // Get limits for each platform
      const limits: Record<string, { current: number; limit: number }> = {};
      const platforms: IntegrationPlatform[] = ['GOOGLE_ADS', 'META', 'LINKEDIN', 'WHATSAPP'];

      for (const platform of platforms) {
        const check = await integrationManager.canAddIntegration(tenant.id, platform);
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
      console.error('List integrations error:', error);
      res.status(500).json({ error: 'Failed to fetch integrations' });
    }
  }
);

/**
 * POST /:tenant/integrations
 * Create a new integration
 */
router.post(
  '/:tenant/integrations',
  requireAuth,
  requireActiveUser,
  requireRole(['INSTITUTION_ADMIN']),
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      const validation = createIntegrationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation error',
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
      console.error('Create integration error:', error);
      if (error instanceof Error && error.message.includes('Maximum')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to create integration' });
    }
  }
);

/**
 * PUT /:tenant/integrations/:id
 * Update an integration
 */
router.put(
  '/:tenant/integrations/:id',
  requireAuth,
  requireActiveUser,
  requireRole(['INSTITUTION_ADMIN']),
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
        return res.status(404).json({ error: 'Tenant not found' });
      }

      const validation = updateIntegrationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation error',
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
      console.error('Update integration error:', error);
      res.status(500).json({ error: 'Failed to update integration' });
    }
  }
);

/**
 * DELETE /:tenant/integrations/:id
 * Delete an integration
 */
router.delete(
  '/:tenant/integrations/:id',
  requireAuth,
  requireActiveUser,
  requireRole(['INSTITUTION_ADMIN']),
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
        return res.status(404).json({ error: 'Tenant not found' });
      }

      await prisma.integrationConfig.delete({
        where: {
          id,
          tenantId: tenant.id,
        },
      });

      res.json({
        success: true,
        message: 'Integration deleted successfully',
      });
    } catch (error) {
      console.error('Delete integration error:', error);
      res.status(500).json({ error: 'Failed to delete integration' });
    }
  }
);

/**
 * POST /webhooks/leads/:tenant/:platform
 * Webhook receiver for lead data from ad platforms (PUBLIC - no auth)
 */
router.post(
  '/webhooks/leads/:tenant/:platform',
  async (req, res) => {
    try {
      const { tenant: tenantSlug, platform } = req.params;
      const platformUpper = platform.toUpperCase() as IntegrationPlatform;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      const integration = await prisma.integrationConfig.findFirst({
        where: {
          tenantId: tenant.id,
          platform: platformUpper,
          isActive: true,
        },
      });

      if (!integration) {
        return res.status(404).json({ error: 'Integration not found or inactive' });
      }

      let leads: WebhookLeadData[] = [];

      // Parse based on platform
      switch (platformUpper) {
        case 'GOOGLE_ADS':
          leads = [googleAdsIntegration.parseWebhookPayload(req.body)];
          break;
        case 'META':
          leads = metaIntegration.parseWebhookPayload(req.body);
          break;
        case 'LINKEDIN':
          leads = [linkedInIntegration.parseWebhookPayload(req.body)];
          break;
        default:
          return res.status(400).json({ error: 'Unsupported platform' });
      }

      // Process each lead
      const results = await Promise.allSettled(
        leads.map((leadData) =>
          leadDeduplicator.createOrUpdateLead(tenant.id, integration.id, leadData)
        )
      );

      const created = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      // Update integration sync status
      await integrationManager.recordSync(
        integration.id,
        failed === 0 ? 'success' : 'error',
        failed > 0 ? `${failed} leads failed to process` : undefined
      );

      res.json({
        success: true,
        message: `Processed ${created} lead(s), ${failed} failed`,
      });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: 'Failed to process webhook' });
    }
  }
);

/**
 * GET /webhooks/leads/:tenant/meta (for Meta verification)
 */
router.get(
  '/webhooks/leads/:tenant/meta',
  async (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const verifyToken = process.env.META_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === verifyToken) {
      res.status(200).send(challenge);
    } else {
      res.status(403).json({ error: 'Verification failed' });
    }
  }
);

export default router;
```

### Part 6: Backend - Analytics & Reporting (8 hours)

**File: `backend/src/lib/analytics-aggregation.ts`**

```typescript
import { prisma } from './prisma';
import type { AnalyticsMetrics } from '../types/analytics';

export class AnalyticsAggregator {
  async aggregateDaily(tenantId: string, date: Date): Promise<void> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const metrics = await this.calculateMetrics(tenantId, startOfDay, endOfDay);

    await prisma.analyticsSnapshot.upsert({
      where: {
        tenantId_date_period: {
          tenantId,
          date: startOfDay,
          period: 'DAILY',
        },
      },
      create: {
        tenantId,
        date: startOfDay,
        period: 'DAILY',
        metrics,
      },
      update: {
        metrics,
      },
    });
  }

  private async calculateMetrics(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AnalyticsMetrics> {
    const [totalLeads, newLeads, convertedLeads, lostLeads, leadsBySource, leadsByStatus] =
      await Promise.all([
        prisma.lead.count({ where: { tenantId } }),
        prisma.lead.count({
          where: {
            tenantId,
            createdAt: { gte: startDate, lte: endDate },
          },
        }),
        prisma.lead.count({
          where: {
            tenantId,
            status: { in: ['ADMITTED', 'ENROLLED'] },
            updatedAt: { gte: startDate, lte: endDate },
          },
        }),
        prisma.lead.count({
          where: {
            tenantId,
            status: 'LOST',
            updatedAt: { gte: startDate, lte: endDate },
          },
        }),
        prisma.lead.groupBy({
          by: ['source'],
          where: {
            tenantId,
            createdAt: { gte: startDate, lte: endDate },
          },
          _count: { id: true },
        }),
        prisma.lead.groupBy({
          by: ['status'],
          where: { tenantId },
          _count: { id: true },
        }),
      ]);

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    return {
      totalLeads,
      newLeads,
      convertedLeads,
      lostLeads,
      conversionRate,
      leadsBySource: leadsBySource.reduce((acc, item) => {
        acc[item.source || 'Unknown'] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      leadsByStatus: leadsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      teamPerformance: [], // Will be populated from telecaller performance data
    };
  }

  async aggregateHourly(tenantId: string, date: Date): Promise<void> {
    // Similar logic for hourly aggregation
    const startOfHour = new Date(date);
    startOfHour.setMinutes(0, 0, 0);
    const endOfHour = new Date(startOfHour);
    endOfHour.setHours(endOfHour.getHours() + 1);

    const metrics = await this.calculateMetrics(tenantId, startOfHour, endOfHour);

    await prisma.analyticsSnapshot.upsert({
      where: {
        tenantId_date_period: {
          tenantId,
          date: startOfHour,
          period: 'HOURLY',
        },
      },
      create: {
        tenantId,
        date: startOfHour,
        period: 'HOURLY',
        metrics,
      },
      update: {
        metrics,
      },
    });
  }
}

export const analyticsAggregator = new AnalyticsAggregator();
```

**File: `backend/src/lib/report-generator.ts`**

```typescript
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import type { ReportTemplate } from '../types/analytics';

export class ReportGenerator {
  private reportStoragePath: string;

  constructor() {
    this.reportStoragePath = process.env.REPORT_STORAGE_PATH || './reports';
    if (!fs.existsSync(this.reportStoragePath)) {
      fs.mkdirSync(this.reportStoragePath, { recursive: true });
    }
  }

  async generateExcel(
    template: ReportTemplate,
    data: Record<string, unknown>
  ): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(template.name);

    // Add headers and data based on template config
    // This is a simplified example
    worksheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    // Add data rows
    Object.entries(data).forEach(([key, value]) => {
      worksheet.addRow({ metric: key, value });
    });

    // Save file
    const fileName = `${template.id}_${Date.now()}.xlsx`;
    const filePath = path.join(this.reportStoragePath, fileName);
    await workbook.xlsx.writeFile(filePath);

    return fileName;
  }

  async generatePDF(
    template: ReportTemplate,
    data: Record<string, unknown>
  ): Promise<string> {
    const fileName = `${template.id}_${Date.now()}.pdf`;
    const filePath = path.join(this.reportStoragePath, fileName);

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Add report content
    doc.fontSize(20).text(template.name, { align: 'center' });
    doc.moveDown();

    Object.entries(data).forEach(([key, value]) => {
      doc.fontSize(12).text(`${key}: ${value}`);
    });

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(fileName));
      stream.on('error', reject);
    });
  }

  getReportUrl(fileName: string): string {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    return `${baseUrl}/reports/${fileName}`;
  }
}

export const reportGenerator = new ReportGenerator();
```

### Part 7: Backend - WhatsApp Enhancements (3 hours)

**File: `backend/src/routes/telecaller.ts` (additions)**

```typescript
// Add these routes to existing telecaller routes

const bulkWhatsAppSchema = z.object({
  leadIds: z.array(z.string()).min(1).max(100),
  templateId: z.string().optional(),
  message: z.string().min(1).max(4096),
});

/**
 * GET /:tenant/telecaller/whatsapp/templates
 * Get approved WhatsApp templates
 */
router.get(
  '/:tenant/telecaller/whatsapp/templates',
  requireAuth,
  requireActiveUser,
  requireRole(['TELECALLER']),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      const templates = await prisma.whatsAppTemplate.findMany({
        where: {
          tenantId: tenant.id,
          status: 'APPROVED',
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: templates,
      });
    } catch (error) {
      console.error('Get WhatsApp templates error:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  }
);

/**
 * POST /:tenant/telecaller/whatsapp/send
 * Send individual WhatsApp message
 */
router.post(
  '/:tenant/telecaller/whatsapp/send',
  requireAuth,
  requireActiveUser,
  requireRole(['TELECALLER']),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;
      const userId = req.auth!.sub;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      const { leadId, message, templateId } = req.body;

      const lead = await prisma.lead.findFirst({
        where: {
          id: leadId,
          tenantId: tenant.id,
        },
      });

      if (!lead || !lead.phone) {
        return res.status(400).json({ error: 'Lead not found or no phone number' });
      }

      const { whatsappService } = await import('../lib/whatsapp');
      const result = await whatsappService.sendTextMessage(
        lead.phone,
        message,
        tenant.id,
        userId
      );

      res.json({
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      });
    } catch (error) {
      console.error('Send WhatsApp message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
);

/**
 * POST /:tenant/telecaller/whatsapp/bulk
 * Send bulk WhatsApp messages
 */
router.post(
  '/:tenant/telecaller/whatsapp/bulk',
  requireAuth,
  requireActiveUser,
  requireRole(['TELECALLER']),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;
      const userId = req.auth!.sub;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      const validation = bulkWhatsAppSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation error',
          details: validation.error.issues,
        });
      }

      const { leadIds, message, templateId } = validation.data;

      // Get leads with phone numbers
      const leads = await prisma.lead.findMany({
        where: {
          id: { in: leadIds },
          tenantId: tenant.id,
          phone: { not: null },
        },
        select: {
          id: true,
          phone: true,
        },
      });

      if (leads.length === 0) {
        return res.status(400).json({ error: 'No valid leads with phone numbers' });
      }

      // Create bulk job
      const job = await prisma.bulkMessageJob.create({
        data: {
          tenantId: tenant.id,
          userId,
          templateId,
          message,
          recipientCount: leads.length,
          recipients: leads.map((l) => ({
            leadId: l.id,
            phoneNumber: l.phone!,
            status: 'PENDING',
          })),
          status: 'PENDING',
        },
      });

      // Process in background (simplified - should use job queue)
      setImmediate(async () => {
        await this.processBulkMessages(job.id);
      });

      res.json({
        success: true,
        data: {
          jobId: job.id,
          recipientCount: leads.length,
        },
      });
    } catch (error) {
      console.error('Bulk WhatsApp send error:', error);
      res.status(500).json({ error: 'Failed to initiate bulk send' });
    }
  }
);

async function processBulkMessages(jobId: string): Promise<void> {
  try {
    const job = await prisma.bulkMessageJob.findUnique({
      where: { id: jobId },
    });

    if (!job) return;

    await prisma.bulkMessageJob.update({
      where: { id: jobId },
      data: { status: 'PROCESSING', startedAt: new Date() },
    });

    const { whatsappService } = await import('../lib/whatsapp');
    const recipients = job.recipients as BulkMessageRecipient[];
    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      try {
        const result = await whatsappService.sendTextMessage(
          recipient.phoneNumber,
          job.message,
          job.tenantId
        );

        if (result.success) {
          sentCount++;
          recipient.status = 'SENT';
          recipient.messageId = result.messageId;
        } else {
          failedCount++;
          recipient.status = 'FAILED';
          recipient.errorReason = result.error;
        }

        // Rate limiting: wait 1 second between messages
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        failedCount++;
        recipient.status = 'FAILED';
        recipient.errorReason = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    await prisma.bulkMessageJob.update({
      where: { id: jobId },
      data: {
        sentCount,
        failedCount,
        recipients,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Process bulk messages error:', error);
    await prisma.bulkMessageJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

/**
 * GET /:tenant/telecaller/whatsapp/history
 * Get WhatsApp message history
 */
router.get(
  '/:tenant/telecaller/whatsapp/history',
  requireAuth,
  requireActiveUser,
  requireRole(['TELECALLER']),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req;
      const userId = req.auth!.sub;
      const { page = '1', limit = '20' } = req.query;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const [messages, total] = await Promise.all([
        prisma.communication.findMany({
          where: {
            tenantId: tenant.id,
            senderId: userId,
            type: 'WHATSAPP',
          },
          orderBy: { sentAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.communication.count({
          where: {
            tenantId: tenant.id,
            senderId: userId,
            type: 'WHATSAPP',
          },
        }),
      ]);

      res.json({
        success: true,
        data: {
          messages,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error) {
      console.error('Get WhatsApp history error:', error);
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  }
);
```

### Part 8: Frontend - Type Definitions (1 hour)

**File: `frontend/src/lib/api/integrations.ts`**

```typescript
import { apiGet, apiPost, apiPut, apiDeleteClient } from '@/lib/utils';
import type {
  IntegrationListItem,
  IntegrationSetupFormData,
  IntegrationStatusData,
  IntegrationPlatform,
  IntegrationLimits,
} from '@/types/integrations';

export interface IntegrationsResponse {
  integrations: IntegrationListItem[];
  limits: Record<IntegrationPlatform, { current: number; limit: number }>;
  tier: 'STARTER' | 'PRO' | 'MAX';
}

export async function getIntegrations(tenantSlug: string): Promise<IntegrationsResponse> {
  const response = await apiGet<{ success: boolean; data: IntegrationsResponse }>(
    `/${tenantSlug}/integrations`,
    { token: true }
  );
  return response.data;
}

export async function createIntegration(
  tenantSlug: string,
  data: IntegrationSetupFormData
): Promise<IntegrationListItem> {
  const response = await apiPost<{ success: boolean; data: IntegrationListItem }>(
    `/${tenantSlug}/integrations`,
    data,
    { token: true }
  );
  return response.data;
}

export async function updateIntegration(
  tenantSlug: string,
  integrationId: string,
  data: Partial<IntegrationSetupFormData>
): Promise<IntegrationListItem> {
  const response = await apiPut<{ success: boolean; data: IntegrationListItem }>(
    `/${tenantSlug}/integrations/${integrationId}`,
    data,
    { token: true }
  );
  return response.data;
}

export async function deleteIntegration(
  tenantSlug: string,
  integrationId: string
): Promise<void> {
  await apiDeleteClient<{ success: boolean }>(
    `/${tenantSlug}/integrations/${integrationId}`,
    { token: true }
  );
}
```

### Part 9: Frontend - Server Components (10 hours)

**File: `frontend/src/app/(institution-admin)/institution-admin/integrations/page.tsx`**

```typescript
import { getIntegrations } from '@/lib/api/integrations';
import { IntegrationHub } from '@/components/institution-admin/IntegrationHub';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Integration Hub | LEAD101',
  description: 'Manage your ad platform integrations',
};

interface IntegrationsPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function IntegrationsPage({ params }: IntegrationsPageProps) {
  const { tenant } = await params;
  
  try {
    const data = await getIntegrations(tenant);

    return (
      <div className="container mx-auto py-8">
        <IntegrationHub
          tenantSlug={tenant}
          initialData={data}
        />
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error Loading Integrations</h1>
          <p className="text-gray-600 mt-2">
            {error instanceof Error ? error.message : 'Failed to load integrations'}
          </p>
        </div>
      </div>
    );
  }
}
```

**File: `frontend/src/components/institution-admin/IntegrationHub.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Trash2, RefreshCw } from 'lucide-react';
import type { IntegrationsResponse } from '@/lib/api/integrations';
import { IntegrationSetupForm } from './IntegrationSetupForm';
import { IntegrationStatus } from './IntegrationStatus';

interface IntegrationHubProps {
  tenantSlug: string;
  initialData: IntegrationsResponse;
}

export function IntegrationHub({ tenantSlug, initialData }: IntegrationHubProps) {
  const [showSetupForm, setShowSetupForm] = useState(false);
  const [data, setData] = useState(initialData);

  const canAddIntegration = (platform: string): boolean => {
    const limit = data.limits[platform as keyof typeof data.limits];
    return limit.limit === -1 || limit.current < limit.limit;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Hub</h1>
          <p className="text-muted-foreground">
            Connect your ad platforms and manage integrations
          </p>
        </div>
        <Button onClick={() => setShowSetupForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Integration Limits Card */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Limits ({data.tier})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(data.limits).map(([platform, limit]) => (
              <div key={platform} className="flex flex-col">
                <span className="text-sm font-medium">{platform.replace('_', ' ')}</span>
                <span className="text-2xl font-bold">
                  {limit.current} / {limit.limit === -1 ? '∞' : limit.limit}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integrations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{integration.name}</CardTitle>
                <Badge variant={integration.isActive ? 'default' : 'secondary'}>
                  {integration.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{integration.platform}</p>
            </CardHeader>
            <CardContent>
              <IntegrationStatus integrationId={integration.id} tenantSlug={tenantSlug} />
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Setup Form Modal */}
      {showSetupForm && (
        <IntegrationSetupForm
          tenantSlug={tenantSlug}
          limits={data.limits}
          onClose={() => setShowSetupForm(false)}
          onSuccess={() => {
            setShowSetupForm(false);
            // Refresh data
          }}
        />
      )}
    </div>
  );
}
```

### Part 10: Testing Plan (4 hours)

**File: `backend/src/test/integrations.test.ts`**

```typescript
import request from 'supertest';
import { app } from '../index';
import { prisma } from '../lib/prisma';

describe('Integration Routes', () => {
  let tenantId: string;
  let authToken: string;

  beforeAll(async () => {
    // Setup test data
  });

  afterAll(async () => {
    // Cleanup
  });

  describe('POST /:tenant/integrations', () => {
    it('should create a Google Ads integration', async () => {
      const response = await request(app)
        .post('/api/test-tenant/integrations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          platform: 'GOOGLE_ADS',
          name: 'Test Google Ads',
          credentials: {
            developerToken: 'test',
            clientId: 'test',
            clientSecret: 'test',
            refreshToken: 'test',
            customerId: '123',
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should enforce subscription limits', async () => {
      // Create integrations up to limit
      // Attempt to create one more
      // Expect 400 error
    });
  });

  describe('POST /webhooks/leads/:tenant/:platform', () => {
    it('should process Google Ads webhook', async () => {
      const payload = {
        gclid: 'test123',
        google_key: 'key',
        form_id: 'form1',
        campaign_id: 'camp1',
        ad_group_id: 'adgroup1',
        creative_id: 'creative1',
        user_column_data: [
          { column_id: 'FIRST_NAME', string_value: 'John' },
          { column_id: 'LAST_NAME', string_value: 'Doe' },
          { column_id: 'EMAIL', string_value: 'john@example.com' },
        ],
      };

      const response = await request(app)
        .post('/api/webhooks/leads/test-tenant/google-ads')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
```

## Implementation Timeline

### Week 1: Backend Foundation
- **Day 1**: Database schema, TypeScript types, encryption utilities
- **Day 2**: Integration manager, webhook verification
- **Day 3**: Google Ads, Meta, LinkedIn integrations
- **Day 4**: Lead deduplication, integration routes
- **Day 5**: Testing backend integrations

### Week 2: Analytics & WhatsApp
- **Day 1**: Analytics aggregation service
- **Day 2**: Analytics routes, report generation
- **Day 3**: WhatsApp bulk messaging enhancements
- **Day 4**: Testing analytics and WhatsApp
- **Day 5**: Backend refinements

### Week 3: Frontend
- **Day 1-2**: Integration Hub UI (server components)
- **Day 3**: Integration setup forms (client components)
- **Day 4-5**: Analytics dashboards and report builder

### Week 4: WhatsApp UI & Final Testing
- **Day 1-2**: WhatsApp composer and bulk sender for telecallers
- **Day 3**: E2E testing all features
- **Day 4**: Bug fixes and refinements
- **Day 5**: Documentation and deployment

## Environment Variables

```env
# Backend .env additions
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=

META_APP_ID=
META_APP_SECRET=
META_ACCESS_TOKEN=
META_VERIFY_TOKEN=

LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_ACCESS_TOKEN=

WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=

REPORT_STORAGE_PATH=./reports
ENABLE_ANALYTICS_CRON=true
ANALYTICS_AGGREGATION_INTERVAL=hourly

INTEGRATION_ENCRYPTION_KEY=your_32_character_encryption_key_here
BACKEND_URL=http://localhost:4000
```

## Success Criteria

- [ ] Zero usage of `any` keyword in entire codebase
- [ ] 90% server components, 10% client components
- [ ] Subscription limits enforced for all platforms
- [ ] Multiple accounts per platform working correctly
- [ ] Google Ads, Meta, LinkedIn webhooks receiving leads
- [ ] Lead deduplication working properly
- [ ] Analytics aggregation running on schedule
- [ ] Custom reports generating PDF and Excel
- [ ] WhatsApp bulk messaging functional
- [ ] All E2E tests passing
- [ ] Complete type safety across frontend and backend

