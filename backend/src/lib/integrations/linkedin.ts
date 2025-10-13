import type { WebhookLeadData } from "../../types/integrations";

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
      source: "LINKEDIN",
      externalId: payload.id,
      name: `${payload.firstName} ${payload.lastName}`.trim(),
      email: payload.email,
      phone: payload.phoneNumber
        ? this.normalizePhone(payload.phoneNumber)
        : undefined,
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
    return phone.replace(/\D/g, "");
  }

  // LinkedIn uses OAuth2 with specific scopes
  async validateAccessToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch("https://api.linkedin.com/v2/me", {
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
