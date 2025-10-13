import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import { prisma } from "../lib/prisma";
import { integrationManager } from "../lib/integration-manager";
import { leadDeduplicator } from "../lib/lead-deduplication";
import { analyticsAggregator } from "../lib/analytics-aggregation";
import { reportGenerator } from "../lib/report-generator";
import { whatsappService } from "../lib/whatsapp";
import { googleAdsIntegration } from "../lib/integrations/google-ads";
import { metaIntegration } from "../lib/integrations/meta";
import { linkedInIntegration } from "../lib/integrations/linkedin";

describe("Integration Hub Tests", () => {
  let testTenant: any;
  let testUser: any;

  beforeAll(async () => {
    // Create test tenant
    testTenant = await prisma.tenant.create({
      data: {
        name: "Test Institution",
        slug: "test-institution",
        subscriptionTier: "PRO",
        isActive: true,
      },
    });

    // Create test user
    testUser = await prisma.user.create({
      data: {
        name: "Test Admin",
        email: "admin@test.com",
        password: "hashedpassword",
        role: "INSTITUTION_ADMIN",
        tenantId: testTenant.id,
        isActive: true,
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({ where: { tenantId: testTenant.id } });
    await prisma.tenant.delete({ where: { id: testTenant.id } });
  });

  describe("Integration Manager", () => {
    it("should check integration limits correctly", async () => {
      const canAdd = await integrationManager.canAddIntegration(
        testTenant.id,
        "GOOGLE_ADS"
      );
      expect(canAdd.allowed).toBe(true);
      expect(canAdd.limit).toBe(3); // PRO tier limit
    });

    it("should create integration with encrypted credentials", async () => {
      const credentials = {
        developerToken: "test-token",
        clientId: "test-client",
        clientSecret: "test-secret",
        refreshToken: "test-refresh",
        customerId: "test-customer",
      };

      const integration = await integrationManager.createIntegration(
        testTenant.id,
        "GOOGLE_ADS",
        "Test Google Ads",
        credentials
      );

      expect(integration).toBeDefined();
      expect(integration.platform).toBe("GOOGLE_ADS");
      expect(integration.credentials).not.toContain("test-token"); // Should be encrypted
    });

    it("should retrieve and decrypt credentials", async () => {
      const credentials = {
        developerToken: "test-token-2",
        clientId: "test-client-2",
        clientSecret: "test-secret-2",
        refreshToken: "test-refresh-2",
        customerId: "test-customer-2",
      };

      const integration = await integrationManager.createIntegration(
        testTenant.id,
        "META",
        "Test Meta",
        credentials
      );

      const retrievedCredentials =
        await integrationManager.getIntegrationCredentials(integration.id);
      expect(retrievedCredentials.developerToken).toBe("test-token-2");
    });
  });

  describe("Lead Deduplication", () => {
    it("should detect duplicate leads by external ID", async () => {
      const leadData = {
        source: "GOOGLE_ADS" as const,
        externalId: "test-external-123",
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        campaignId: "campaign-123",
        metadata: {},
      };

      // Create first lead
      const integration = await prisma.integrationConfig.create({
        data: {
          tenantId: testTenant.id,
          platform: "GOOGLE_ADS",
          name: "Test Integration",
          credentials: "encrypted",
          webhookUrl: "https://test.com/webhook",
          webhookSecret: "secret",
        },
      });

      const lead1 = await leadDeduplicator.createOrUpdateLead(
        testTenant.id,
        integration.id,
        leadData
      );

      // Try to create duplicate
      const dupeCheck = await leadDeduplicator.checkDuplicate(
        testTenant.id,
        leadData
      );
      expect(dupeCheck.isDuplicate).toBe(true);
      expect(dupeCheck.existingLeadId).toBe(lead1.id);
    });

    it("should detect duplicate leads by email/phone", async () => {
      const leadData = {
        source: "META" as const,
        externalId: "meta-123",
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "+1234567891",
        campaignId: "meta-campaign-123",
        metadata: {},
      };

      const integration = await prisma.integrationConfig.create({
        data: {
          tenantId: testTenant.id,
          platform: "META",
          name: "Test Meta Integration",
          credentials: "encrypted",
          webhookUrl: "https://test.com/webhook",
          webhookSecret: "secret",
        },
      });

      // Create first lead
      await leadDeduplicator.createOrUpdateLead(
        testTenant.id,
        integration.id,
        leadData
      );

      // Try to create duplicate with same email
      const duplicateData = { ...leadData, externalId: "meta-456" };
      const dupeCheck = await leadDeduplicator.checkDuplicate(
        testTenant.id,
        duplicateData
      );
      expect(dupeCheck.isDuplicate).toBe(true);
    });
  });

  describe("Ad Platform Integrations", () => {
    it("should parse Google Ads webhook payload", () => {
      const payload = {
        gclid: "test-gclid-123",
        google_key: "test-key",
        form_id: "form-123",
        campaign_id: "campaign-123",
        ad_group_id: "adgroup-123",
        creative_id: "creative-123",
        user_column_data: [
          { column_id: "FIRST_NAME", string_value: "John" },
          { column_id: "LAST_NAME", string_value: "Doe" },
          { column_id: "EMAIL", string_value: "john@example.com" },
          { column_id: "PHONE_NUMBER", string_value: "+1234567890" },
        ],
      };

      const result = googleAdsIntegration.parseWebhookPayload(payload);
      expect(result.source).toBe("GOOGLE_ADS");
      expect(result.externalId).toBe("test-gclid-123");
      expect(result.name).toBe("John Doe");
      expect(result.email).toBe("john@example.com");
      expect(result.phone).toBe("1234567890");
    });

    it("should parse Meta webhook payload", () => {
      const payload = {
        entry: [
          {
            id: "page-123",
            time: 1234567890,
            changes: [
              {
                field: "leadgen",
                value: {
                  ad_id: "ad-123",
                  form_id: "form-123",
                  leadgen_id: "lead-123",
                  created_time: 1234567890,
                  page_id: "page-123",
                  adgroup_id: "adgroup-123",
                  campaign_id: "campaign-123",
                  platform: "facebook",
                  field_data: [
                    { name: "full_name", values: ["John Doe"] },
                    { name: "email", values: ["john@example.com"] },
                    { name: "phone_number", values: ["+1234567890"] },
                  ],
                },
              },
            ],
          },
        ],
      };

      const results = metaIntegration.parseWebhookPayload(payload);
      expect(results).toHaveLength(1);
      expect(results[0].source).toBe("META");
      expect(results[0].externalId).toBe("lead-123");
      expect(results[0].name).toBe("John Doe");
      expect(results[0].email).toBe("john@example.com");
    });

    it("should parse LinkedIn webhook payload", () => {
      const payload = {
        id: "linkedin-lead-123",
        campaignId: "campaign-123",
        creativeId: "creative-123",
        leadType: "leadgen",
        submittedAt: 1234567890,
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phoneNumber: "+1234567890",
        company: "Test Company",
        title: "Manager",
        responses: [
          { questionId: "q1", answer: "Answer 1" },
          { questionId: "q2", answer: "Answer 2" },
        ],
      };

      const result = linkedInIntegration.parseWebhookPayload(payload);
      expect(result.source).toBe("LINKEDIN");
      expect(result.externalId).toBe("linkedin-lead-123");
      expect(result.name).toBe("John Doe");
      expect(result.email).toBe("john@example.com");
      expect(result.phone).toBe("1234567890");
    });
  });

  describe("Analytics Aggregation", () => {
    it("should aggregate hourly data", async () => {
      const now = new Date();
      await analyticsAggregator.aggregateHourlyData(testTenant.id, now);

      const snapshot = await prisma.analyticsSnapshot.findFirst({
        where: {
          tenantId: testTenant.id,
          period: "HOURLY",
        },
      });

      expect(snapshot).toBeDefined();
      expect(snapshot?.metrics).toBeDefined();
    });

    it("should aggregate daily data", async () => {
      const now = new Date();
      await analyticsAggregator.aggregateDailyData(testTenant.id, now);

      const snapshot = await prisma.analyticsSnapshot.findFirst({
        where: {
          tenantId: testTenant.id,
          period: "DAILY",
        },
      });

      expect(snapshot).toBeDefined();
    });
  });

  describe("Report Generation", () => {
    it("should create report template", async () => {
      const template = await prisma.reportTemplate.create({
        data: {
          tenantId: testTenant.id,
          name: "Test Report",
          description: "Test report template",
          type: "FUNNEL",
          config: {
            metrics: ["totalLeads", "conversionRate"],
            chartTypes: ["bar", "line"],
            dateRange: "LAST_30_DAYS",
          },
        },
      });

      expect(template).toBeDefined();
      expect(template.name).toBe("Test Report");
    });

    it("should generate report data", async () => {
      const template = await prisma.reportTemplate.create({
        data: {
          tenantId: testTenant.id,
          name: "Test Report 2",
          description: "Test report template 2",
          type: "CONVERSION",
          config: {
            metrics: ["totalLeads", "convertedLeads"],
            chartTypes: ["pie"],
            dateRange: "LAST_7_DAYS",
          },
        },
      });

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();

      const result = await reportGenerator.generateReport(
        template.id,
        testUser.id,
        startDate,
        endDate
      );

      expect(result).toBeDefined();
      expect(result.fileName).toContain("Test Report 2");
      expect(result.fileType).toBe("PDF");
    });
  });

  describe("WhatsApp Service", () => {
    it("should create bulk message job", async () => {
      const recipients = [
        { leadId: "lead-1", phoneNumber: "+1234567890", status: "PENDING" },
        { leadId: "lead-2", phoneNumber: "+1234567891", status: "PENDING" },
      ];

      const jobId = await whatsappService.createBulkMessageJob(
        testTenant.id,
        testUser.id,
        "Test message",
        recipients
      );

      expect(jobId).toBeDefined();

      const job = await whatsappService.getBulkMessageJobStatus(jobId);
      expect(job).toBeDefined();
      expect(job?.status).toBe("PENDING");
      expect(job?.recipientCount).toBe(2);
    });

    it("should get bulk message history", async () => {
      const history = await whatsappService.getBulkMessageHistory(
        testTenant.id,
        testUser.id,
        10,
        0
      );

      expect(Array.isArray(history)).toBe(true);
    });
  });
});
