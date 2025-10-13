// Widget System Types for Backend

export interface WidgetGenerationRequest {
  formId: string;
  name: string;
  styling: WidgetStyling;
}

export interface WidgetStyling {
  theme: "light" | "dark" | "auto";
  primaryColor: string;
  borderRadius: number;
  width: string;
  height: string;
}

export interface WidgetResponse {
  id: string;
  formId: string;
  name: string;
  type: string;
  settings: WidgetStyling;
  embedCode: string;
  previewUrl: string;
  publicUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WidgetAnalytics {
  widgetId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  totalViews: number;
  totalSubmissions: number;
  conversionRate: number;
  dailyStats: Array<{
    date: Date;
    views: number;
    submissions: number;
  }>;
}

export interface WidgetViewRequest {
  widgetId: string;
  userAgent?: string;
  referrer?: string;
  ipAddress?: string;
}

export interface WidgetSubmissionRequest {
  widgetId: string;
  formData: Record<string, unknown>;
  userAgent?: string;
  referrer?: string;
  ipAddress?: string;
}

export interface PublicFormData {
  id: string;
  title: string;
  description?: string;
  fields: PublicFormField[];
  steps: PublicFormStep[];
  settings: {
    theme: {
      primaryColor: string;
      borderRadius: number;
    };
    layout: {
      width: string;
      alignment: string;
    };
  };
}

export interface PublicFormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  description?: string;
  required: boolean;
  order: number;
  width: string;
  validation: {
    required: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  conditionalLogic: {
    enabled: boolean;
    conditions: Array<{
      fieldId: string;
      operator: string;
      value: string | number;
    }>;
    actions: Array<{
      type: "show" | "hide" | "require" | "setValue";
      targetFieldId: string;
      value?: string | number;
    }>;
  };
  options?: {
    choices?: Array<{ id: string; label: string; value: string }>;
    multiple?: boolean;
    maxFileSize?: number;
    allowedFormats?: string[];
  };
}

export interface PublicFormStep {
  id: string;
  title: string;
  description?: string;
  order: number;
  isActive: boolean;
  isPayment: boolean;
  paymentAmount?: number;
  fields: string[];
  conditions?: {
    enabled: boolean;
    rules: Array<{
      fieldId: string;
      operator: string;
      value: string | number;
    }>;
  };
}

export interface WidgetListResponse {
  success: boolean;
  data: {
    widgets: WidgetResponse[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface WidgetAnalyticsResponse {
  success: boolean;
  data: WidgetAnalytics;
}

