import type { WebhookLeadData } from "../../types/integrations";

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
      source: "GOOGLE_ADS",
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

  private extractName(
    userData: Record<string, string | boolean | undefined>
  ): string {
    const firstName = (userData.FIRST_NAME as string) || "";
    const lastName = (userData.LAST_NAME as string) || "";
    const fullName = (userData.FULL_NAME as string) || "";

    if (fullName) return fullName;
    if (firstName || lastName) return `${firstName} ${lastName}`.trim();

    return "Unknown";
  }

  private extractEmail(
    userData: Record<string, string | boolean | undefined>
  ): string | undefined {
    return (userData.EMAIL as string) || undefined;
  }

  private extractPhone(
    userData: Record<string, string | boolean | undefined>
  ): string | undefined {
    const phone = userData.PHONE_NUMBER as string;
    return phone ? this.normalizePhone(phone) : undefined;
  }

  private normalizePhone(phone: string): string {
    // Remove all non-digit characters
    return phone.replace(/\D/g, "");
  }
}

export const googleAdsIntegration = new GoogleAdsIntegration();
