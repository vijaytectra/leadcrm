import crypto from "crypto";
import type { WebhookLeadData } from "../../types/integrations";

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
        platform: "facebook" | "instagram";
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
        if (change.field === "leadgen") {
          const leadData = change.value;
          const fieldData = this.parseFieldData(leadData.field_data);

          leads.push({
            source: "META",
            externalId: leadData.leadgen_id,
            name: fieldData.full_name || fieldData.first_name || "Unknown",
            email: fieldData.email,
            phone: fieldData.phone_number
              ? this.normalizePhone(fieldData.phone_number)
              : undefined,
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

  private parseFieldData(
    fieldData: Array<{ name: string; values: string[] }>
  ): Record<string, string> {
    return fieldData.reduce((acc, field) => {
      acc[field.name] = field.values[0] || "";
      return acc;
    }, {} as Record<string, string>);
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, "");
  }

  verifyWebhookSignature(
    payload: string,
    signature: string,
    appSecret: string
  ): boolean {
    const expectedSignature = crypto
      .createHmac("sha256", appSecret)
      .update(payload)
      .digest("hex");

    return `sha256=${expectedSignature}` === signature;
  }
}

export const metaIntegration = new MetaIntegration();
