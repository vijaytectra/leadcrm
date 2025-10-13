import { prisma } from "./prisma";
import type { WebhookLeadData } from "../types/integrations";

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
          reason: "Duplicate external ID from same platform",
        };
      }
    }

    // Check by email/phone combination
    if (leadData.email || leadData.phone) {
      const where: {
        tenantId: string;
        OR?: Array<{ email?: string; phone?: string }>;
      } = {
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
          reason: "Matching email or phone number",
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
        status: "NEW",
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
