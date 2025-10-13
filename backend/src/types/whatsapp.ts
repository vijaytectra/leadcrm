export interface WhatsAppTemplate {
  id: string;
  tenantId: string;
  name: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  language: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  content: string;
  variables: string[];
  headerType?: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT";
  headerContent?: string;
  buttons?: WhatsAppButton[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppButton {
  type: "QUICK_REPLY" | "CALL_TO_ACTION";
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
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BulkMessageRecipient {
  leadId: string;
  phoneNumber: string;
  status: "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED";
  messageId?: string;
  errorReason?: string;
}
