// Form Builder Types - Strong TypeScript definitions

export interface FormBuilderConfig {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  isActive: boolean;
  isPublished: boolean;
  requiresPayment: boolean;
  paymentAmount?: number;
  allowMultipleSubmissions: boolean;
  maxSubmissions?: number;
  submissionDeadline?: Date;
  settings: FormSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormSettings {
  theme: FormTheme;
  layout: FormLayout;
  validation: FormValidation;
  notifications: FormNotifications;
  integrations: FormIntegrations;
  security: FormSecurity;
}

export interface FormTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderRadius: number;
  fontFamily: string;
  fontSize: number;
}

export interface FormLayout {
  width: "full" | "narrow" | "wide";
  alignment: "left" | "center" | "right";
  spacing: "compact" | "normal" | "spacious";
  showProgress: boolean;
  showStepNumbers: boolean;
}

export interface FormValidation {
  validateOnSubmit: boolean;
  showInlineErrors: boolean;
  customValidationRules: ValidationRule[];
}

export interface ValidationRule {
  fieldId: string;
  type:
    | "required"
    | "email"
    | "phone"
    | "minLength"
    | "maxLength"
    | "pattern"
    | "custom";
  value?: string | number;
  message: string;
  customFunction?: string;
}

export interface FormNotifications {
  emailOnSubmission: boolean;
  emailRecipients: string[];
  smsOnSubmission: boolean;
  smsRecipients: string[];
  webhookUrl?: string;
  autoResponse: boolean;
  autoResponseMessage?: string;
}

export interface FormIntegrations {
  googleAnalytics?: {
    trackingId: string;
    events: string[];
  };
  facebookPixel?: {
    pixelId: string;
    events: string[];
  };
  customScripts: string[];
}

export interface FormSecurity {
  requireCaptcha: boolean;
  captchaType: "recaptcha" | "hcaptcha" | "turnstile";
  captchaSiteKey?: string;
  allowAnonymous: boolean;
  ipWhitelist?: string[];
  rateLimit: {
    enabled: boolean;
    maxSubmissions: number;
    timeWindow: number; // minutes
  };
}

// Form Field Types
export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "number"
  | "date"
  | "time"
  | "datetime"
  | "select"
  | "multiselect"
  | "radio"
  | "checkbox"
  | "file"
  | "signature"
  | "rating"
  | "slider"
  | "address"
  | "url"
  | "password"
  | "hidden"
  | "divider"
  | "heading"
  | "paragraph"
  | "calculation"
  | "payment";

export interface FormField {
  id: string;
  formId: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required: boolean;
  order: number;
  width: "full" | "half" | "third" | "quarter";
  validation: FieldValidation;
  conditionalLogic: ConditionalLogic;
  options: FieldOptions;
  styling: FieldStyling;
  advanced: FieldAdvanced;
}

export interface FieldValidation {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customValidation?: string;
  errorMessage?: string;
}

export interface ConditionalLogic {
  enabled: boolean;
  conditions: Condition[];
  actions: Action[];
}

export interface Condition {
  id: string;
  fieldId: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "not_contains"
    | "greater_than"
    | "less_than"
    | "is_empty"
    | "is_not_empty";
  value: string | number | boolean;
  logic: "and" | "or";
}

export interface Action {
  id: string;
  type:
    | "show"
    | "hide"
    | "require"
    | "make_optional"
    | "enable"
    | "disable"
    | "set_value"
    | "clear_value";
  targetFieldId: string;
  value?: string | number | boolean;
}

export interface FieldOptions {
  // For select, radio, checkbox
  choices?: ChoiceOption[];
  allowOther?: boolean;
  otherLabel?: string;

  // For file upload
  allowedTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;

  // For number fields
  numberStep?: number;
  prefix?: string;
  suffix?: string;

  // For date/time fields
  minDate?: Date;
  maxDate?: Date;
  timeFormat?: "12h" | "24h";

  // For rating
  maxRating?: number;
  ratingIcon?: string;

  // For slider
  min?: number;
  max?: number;
  sliderStep?: number;
  showLabels?: boolean;

  // For calculation
  formula?: string;
  decimalPlaces?: number;

  // For payment
  amount?: number;
  currency?: string;
  description?: string;
}

export interface ChoiceOption {
  id: string;
  label: string;
  value: string;
  isDefault?: boolean;
  isDisabled?: boolean;
}

export interface FieldStyling {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  textAlign?: "left" | "center" | "right";
  customCSS?: string;
}

export interface FieldAdvanced {
  helpText?: string;
  tooltip?: string;
  customAttributes?: Record<string, string>;
  dataAttributes?: Record<string, string>;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  tabIndex?: number;
  autoComplete?: string;
  autoFocus?: boolean;
  readonly?: boolean;
  disabled?: boolean;
}

// Form Submission Types
export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, FormSubmissionValue>;
  metadata: SubmissionMetadata;
  status: SubmissionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type FormSubmissionValue =
  | string
  | number
  | boolean
  | Date
  | string[]
  | FileUpload
  | PaymentData;

export interface FileUpload {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedAt: Date;
}

export interface PaymentData {
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  transactionId?: string;
  gatewayResponse?: Record<string, unknown>;
}

export interface SubmissionMetadata {
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  sessionId: string;
  deviceType: "desktop" | "tablet" | "mobile";
  browser: string;
  os: string;
  country?: string;
  city?: string;
}

export type SubmissionStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "payment_pending"
  | "payment_completed"
  | "completed";

// Multi-step Form Types
export interface FormStep {
  id: string;
  formId: string;
  title: string;
  description?: string;
  order: number;
  isActive: boolean;
  isPayment: boolean;
  paymentAmount?: number;
  fields: string[]; // Field IDs
  conditions?: ConditionalLogic;
  settings: StepSettings;
}

export interface StepSettings {
  showProgress: boolean;
  allowBack: boolean;
  allowSkip: boolean;
  autoSave: boolean;
  validationMode: "immediate" | "on_next" | "on_submit";
}

// Form Template Types
export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: FormCategory;
  isPublic: boolean;
  isPremium: boolean;
  formConfig: FormBuilderConfig;
  fields: FormField[];
  steps: FormStep[];
  previewImage?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type FormCategory =
  | "admission"
  | "contact"
  | "scholarship"
  | "feedback"
  | "survey"
  | "registration"
  | "application"
  | "payment"
  | "custom";

// Widget Types
export interface FormWidget {
  id: string;
  formId: string;
  name: string;
  type: WidgetType;
  settings: WidgetSettings;
  embedCode: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type WidgetType =
  | "popup"
  | "embed"
  | "floating"
  | "slide_in"
  | "fullscreen"
  | "button";

export interface WidgetSettings {
  trigger: WidgetTrigger;
  styling: WidgetStyling;
  behavior: WidgetBehavior;
  analytics: WidgetAnalytics;
}

export interface WidgetTrigger {
  type: "immediate" | "delay" | "scroll" | "exit_intent" | "click" | "custom";
  delay?: number; // seconds
  scrollPercentage?: number;
  customSelector?: string;
  customEvent?: string;
}

export interface WidgetStyling {
  position:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "center";
  size: "small" | "medium" | "large" | "fullscreen";
  theme: "light" | "dark" | "custom";
  customCSS?: string;
  borderRadius?: number;
  shadow?: boolean;
  animation?: "fade" | "slide" | "bounce" | "none";
}

export interface WidgetBehavior {
  showCloseButton: boolean;
  allowOutsideClick: boolean;
  preventBodyScroll: boolean;
  autoClose?: number; // seconds
  rememberClose: boolean;
  cookieExpiry: number; // days
}

export interface WidgetAnalytics {
  trackViews: boolean;
  trackSubmissions: boolean;
  trackConversions: boolean;
  customEvents: string[];
}

// API Request/Response Types
export interface CreateFormRequest {
  title: string;
  description?: string;
  requiresPayment?: boolean;
  paymentAmount?: number;
  allowMultipleSubmissions?: boolean;
  maxSubmissions?: number;
  submissionDeadline?: Date;
  settings?: Partial<FormSettings>;
}

export interface UpdateFormRequest extends Partial<CreateFormRequest> {
  isActive?: boolean;
}

export interface CreateFieldRequest {
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  order: number;
  width?: "full" | "half" | "third" | "quarter";
  validation?: Partial<FieldValidation>;
  conditionalLogic?: Partial<ConditionalLogic>;
  options?: Partial<FieldOptions>;
  styling?: Partial<FieldStyling>;
  advanced?: Partial<FieldAdvanced>;
}

export interface UpdateFieldRequest extends Partial<CreateFieldRequest> {
  id: string;
}

export interface SubmitFormRequest {
  data: Record<string, FormSubmissionValue>;
  metadata?: Partial<SubmissionMetadata>;
}

export interface FormResponse {
  success: boolean;
  data?: FormBuilderConfig | FormField | FormSubmission | FormWidget;
  error?: string;
  message?: string;
}

export interface FormListResponse {
  success: boolean;
  data: {
    forms: FormBuilderConfig[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
  error?: string;
}

export interface FieldListResponse {
  success: boolean;
  data: {
    fields: FormField[];
    total: number;
  };
  error?: string;
}

export interface SubmissionListResponse {
  success: boolean;
  data: {
    submissions: FormSubmission[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
  error?: string;
}

// Form Analytics Types
export interface FormAnalytics {
  formId: string;
  period: "day" | "week" | "month" | "year" | "custom";
  startDate: Date;
  endDate: Date;
  metrics: FormMetrics;
  charts: FormCharts;
}

export interface FormMetrics {
  totalViews: number;
  totalSubmissions: number;
  conversionRate: number;
  averageCompletionTime: number; // seconds
  bounceRate: number;
  topSources: SourceMetric[];
  deviceBreakdown: DeviceMetric[];
  fieldAnalytics: FieldAnalytic[];
}

export interface SourceMetric {
  source: string;
  views: number;
  submissions: number;
  conversionRate: number;
}

export interface DeviceMetric {
  device: "desktop" | "tablet" | "mobile";
  views: number;
  submissions: number;
  conversionRate: number;
}

export interface FieldAnalytic {
  fieldId: string;
  fieldLabel: string;
  fieldType: FieldType;
  views: number;
  completions: number;
  abandonmentRate: number;
  averageTime: number; // seconds
}

export interface FormCharts {
  viewsOverTime: ChartDataPoint[];
  submissionsOverTime: ChartDataPoint[];
  conversionFunnel: FunnelStep[];
  fieldPerformance: FieldPerformanceChart[];
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface FunnelStep {
  step: string;
  views: number;
  completions: number;
  dropOffRate: number;
}

export interface FieldPerformanceChart {
  fieldId: string;
  fieldLabel: string;
  completionRate: number;
  averageTime: number;
}

// Error Types
export interface FormBuilderError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export type FormBuilderErrorCode =
  | "FORM_NOT_FOUND"
  | "FORM_NOT_ACTIVE"
  | "FIELD_NOT_FOUND"
  | "INVALID_FIELD_TYPE"
  | "VALIDATION_ERROR"
  | "SUBMISSION_LIMIT_EXCEEDED"
  | "PAYMENT_REQUIRED"
  | "PAYMENT_FAILED"
  | "TEMPLATE_NOT_FOUND"
  | "WIDGET_NOT_FOUND"
  | "INSUFFICIENT_PERMISSIONS"
  | "TENANT_NOT_FOUND"
  | "INVALID_CONFIGURATION"
  | "RATE_LIMIT_EXCEEDED"
  | "FILE_TOO_LARGE"
  | "INVALID_FILE_TYPE"
  | "CAPTCHA_FAILED"
  | "SUBMISSION_EXPIRED";
