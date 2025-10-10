// Unified Form Builder Types for Frontend
export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "number"
  | "date"
  | "time"
  | "datetime"
  | "url"
  | "password"
  | "select"
  | "multiselect"
  | "radio"
  | "checkbox"
  | "file"
  | "signature"
  | "rating"
  | "slider"
  | "address"
  | "calculation"
  | "payment"
  | "hidden"
  | "divider"
  | "heading"
  | "paragraph";

export type SubmissionStatus = "pending" | "approved" | "rejected" | "draft";
export type WidgetType =
  | "embed"
  | "popup"
  | "floating"
  | "slide_in"
  | "fullscreen"
  | "button";
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

// Core Form Types
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
  steps?: FormStep[]; // Add steps to settings
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
    timeWindow: number;
  };
}

// Field Types
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
  createdAt: Date;
  updatedAt: Date;
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
  fieldId: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "not_contains"
    | "greater_than"
    | "less_than";
  value: string | number;
}

export interface Action {
  type: "show" | "hide" | "require" | "disable";
  targetFieldId: string;
}

export interface FieldOptions {
  choices?: ChoiceOption[];
  allowOther?: boolean;
  otherLabel?: string;
  multiple?: boolean;
  maxSelections?: number;
  minSelections?: number;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string | number | boolean;
  // Payment field options
  amount?: number;
  currency?: string;
  paymentItems?: PaymentItem[];
  // Rating field options
  maxRating?: number;
  // Slider field options
  sliderStep?: number;
  // Calculation field options
  formula?: string;
}

export interface ChoiceOption {
  id: string;
  label: string;
  value: string;
  isDefault?: boolean;
}

export interface PaymentItem {
  id: string;
  name: string;
  description?: string;
  amount: number;
  required: boolean;
}

export interface FieldStyling {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderRadius?: number;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  textAlign?: "left" | "center" | "right";
  width?: string;
  height?: string;
}

export interface FieldAdvanced {
  customCSS?: string;
  customAttributes?: Record<string, string>;
  conditionalDisplay?: string;
  calculation?: string;
  integration?: string;
}

// Step Types
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
  createdAt: Date;
  updatedAt: Date;
}

export interface StepSettings {
  showProgress: boolean;
  allowBack: boolean;
  allowSkip: boolean;
  autoSave: boolean;
  validationMode: "onChange" | "onBlur" | "onSubmit";
}

// API Response Types
export interface FormResponse {
  success: boolean;
  data: FormBuilderConfig;
  message?: string;
  error?: string;
  code?: string;
}

export interface FormListResponse {
  success: boolean;
  data: {
    forms: FormBuilderConfig[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FieldListResponse {
  success: boolean;
  data: {
    fields: FormField[];
    total: number;
  };
}

export interface SubmissionListResponse {
  success: boolean;
  data: {
    submissions: FormSubmission[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Request Types
export interface CreateFormRequest {
  title: string;
  description?: string;
  isActive?: boolean;
  isPublished?: boolean;
  requiresPayment?: boolean;
  paymentAmount?: number;
  allowMultipleSubmissions?: boolean;
  maxSubmissions?: number;
  submissionDeadline?: Date;
  settings?: Partial<FormSettings>;
}

export interface UpdateFormRequest {
  title?: string;
  description?: string;
  isActive?: boolean;
  isPublished?: boolean;
  requiresPayment?: boolean;
  paymentAmount?: number;
  allowMultipleSubmissions?: boolean;
  maxSubmissions?: number;
  submissionDeadline?: Date;
  settings?: Partial<FormSettings>;
}

export interface CreateFieldRequest {
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  order?: number;
  width?: "full" | "half" | "third" | "quarter";
  validation?: Partial<FieldValidation>;
  conditionalLogic?: Partial<ConditionalLogic>;
  options?: Partial<FieldOptions>;
  styling?: Partial<FieldStyling>;
  advanced?: Partial<FieldAdvanced>;
}

export interface UpdateFieldRequest {
  type?: FieldType;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  order?: number;
  width?: "full" | "half" | "third" | "quarter";
  validation?: Partial<FieldValidation>;
  conditionalLogic?: Partial<ConditionalLogic>;
  options?: Partial<FieldOptions>;
  styling?: Partial<FieldStyling>;
  advanced?: Partial<FieldAdvanced>;
}

export interface SubmitFormRequest {
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// Additional Types
export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  status: SubmissionStatus;
  submittedAt: Date;
  metadata?: Record<string, unknown>;
}

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

export interface FormWidget {
  id: string;
  formId: string;
  name: string;
  type: WidgetType;
  settings: WidgetSettings;
  trigger: WidgetTrigger;
  styling: WidgetStyling;
  behavior: WidgetBehavior;
  analytics: WidgetAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

export interface WidgetSettings {
  position:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "center";
  size: "small" | "medium" | "large";
  theme: "light" | "dark" | "auto";
  animation: "slide" | "fade" | "bounce" | "none";
}

export interface WidgetTrigger {
  type: "scroll" | "time" | "click" | "exit-intent" | "custom";
  value?: number;
  selector?: string;
  customCode?: string;
}

export interface WidgetStyling {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderRadius?: number;
  fontSize?: number;
  fontFamily?: string;
  customCSS?: string;
}

export interface WidgetBehavior {
  autoClose?: boolean;
  closeDelay?: number;
  preventScroll?: boolean;
  showCloseButton?: boolean;
  allowOutsideClick?: boolean;
}

export interface WidgetAnalytics {
  impressions: number;
  clicks: number;
  conversions: number;
  lastSeen?: Date;
}

// UI State Types
export interface FormBuilderUIState {
  currentForm: FormBuilderConfig | null;
  fields: FormField[];
  selectedField: FormField | null;
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;
  previewMode: boolean;
  activeStep: number;
  totalSteps: number;
  isDraft: boolean;
  isPublished: boolean;
  steps: FormStep[];
}

export interface DragDropState {
  draggedField: FormField | null;
  draggedFieldType: string | null;
  dropTarget: string | null;
  isDragging: boolean;
}

export interface FormBuilderContextType {
  state: FormBuilderUIState;
  actions: FormBuilderActions;
  dragDrop: DragDropState;
  dragDropActions: DragDropActions;
}

export interface FormBuilderActions {
  setCurrentForm: (form: FormBuilderConfig | null) => void;
  setFields: (fields: FormField[]) => void;
  addField: (field: FormField) => void;
  updateField: (fieldId: string, updates: Partial<FormField>) => void;
  deleteField: (fieldId: string) => void;
  reorderFields: (fieldIds: string[]) => void;
  setSelectedField: (field: FormField | null) => void;
  setDirty: (isDirty: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setPreviewMode: (previewMode: boolean) => void;
  setActiveStep: (step: number) => void;
  setDraftMode: (isDraft: boolean) => void;
  setPublished: (isPublished: boolean) => void;
  setSteps: (steps: FormStep[]) => void;
  addStep: (step: FormStep) => void;
  updateStep: (stepId: string, updates: Partial<FormStep>) => void;
  deleteStep: (stepId: string) => void;
  reorderSteps: (stepIds: string[]) => void;
  reset: () => void;
  // Enhanced actions
  addFieldByType: (type: string) => void;
  duplicateField: (fieldId: string) => void;
  saveForm: () => Promise<void>;
  publishForm: () => Promise<void>;
  loadForm: (formId: string) => Promise<void>;
  deleteForm: (formId: string) => Promise<void>;
  previewForm: () => void;
}

export interface DragDropActions {
  setDraggedField: (field: FormField | null) => void;
  setDraggedFieldType: (type: string | null) => void;
  setDropTarget: (target: string | null) => void;
  setIsDragging: (isDragging: boolean) => void;
  reset: () => void;
}

export interface FieldComponentProps {
  field: FormField;
  isSelected?: boolean;
  isPreview?: boolean;
  onSelect?: (field: FormField) => void;
  onUpdate?: (fieldId: string, updates: Partial<FormField>) => void;
  onDelete?: (fieldId: string) => void;
  className?: string;
}

export interface FormPreviewProps {
  form: FormBuilderConfig;
  fields: FormField[];
  onSubmit?: (data: Record<string, unknown>) => void;
  className?: string;
}

export interface FieldPropertyPanelProps {
  field: FormField | null;
  onUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  onClose: () => void;
  className?: string;
}

export interface ConditionalLogicBuilderProps {
  field: FormField;
  allFields: FormField[];
  onUpdate: (fieldId: string, conditionalLogic: ConditionalLogic) => void;
  onClose: () => void;
  className?: string;
}

export interface FormTemplatesProps {
  onSelectTemplate: (template: FormTemplate) => void;
  category?: FormCategory;
  className?: string;
}

export interface FormAnalyticsProps {
  formId: string;
  startDate: Date;
  endDate: Date;
  className?: string;
}

// Field type definitions for UI components
export const FIELD_TYPES = [
  {
    category: "Input",
    types: [
      {
        type: "text",
        label: "Text Input",
        icon: "Type",
        description: "Single line text input",
      },
      {
        type: "textarea",
        label: "Text Area",
        icon: "FileText",
        description: "Multi-line text input",
      },
      {
        type: "email",
        label: "Email",
        icon: "Mail",
        description: "Email address input",
      },
      {
        type: "phone",
        label: "Phone",
        icon: "Phone",
        description: "Phone number input",
      },
      {
        type: "number",
        label: "Number",
        icon: "Hash",
        description: "Numeric input",
      },
      {
        type: "date",
        label: "Date",
        icon: "Calendar",
        description: "Date picker",
      },
      {
        type: "time",
        label: "Time",
        icon: "Clock",
        description: "Time picker",
      },
      {
        type: "datetime",
        label: "Date & Time",
        icon: "Calendar",
        description: "Date and time picker",
      },
      { type: "url", label: "URL", icon: "Link", description: "URL input" },
      {
        type: "password",
        label: "Password",
        icon: "Lock",
        description: "Password input",
      },
    ],
  },
  {
    category: "Choice",
    types: [
      {
        type: "select",
        label: "Dropdown",
        icon: "ChevronDown",
        description: "Single selection dropdown",
      },
      {
        type: "multiselect",
        label: "Multi Select",
        icon: "CheckSquare",
        description: "Multiple selection dropdown",
      },
      {
        type: "radio",
        label: "Radio Buttons",
        icon: "Radio",
        description: "Single selection radio buttons",
      },
      {
        type: "checkbox",
        label: "Checkboxes",
        icon: "CheckSquare",
        description: "Multiple selection checkboxes",
      },
    ],
  },
  {
    category: "Media",
    types: [
      {
        type: "file",
        label: "File Upload",
        icon: "Upload",
        description: "File upload field",
      },
      {
        type: "signature",
        label: "Signature",
        icon: "PenTool",
        description: "Digital signature field",
      },
    ],
  },
  {
    category: "Layout",
    types: [
      {
        type: "heading",
        label: "Heading",
        icon: "Heading",
        description: "Section heading",
      },
      {
        type: "paragraph",
        label: "Paragraph",
        icon: "AlignLeft",
        description: "Text paragraph",
      },
      {
        type: "divider",
        label: "Divider",
        icon: "Minus",
        description: "Visual divider",
      },
    ],
  },
  {
    category: "Advanced",
    types: [
      {
        type: "rating",
        label: "Rating",
        icon: "Star",
        description: "Star rating input",
      },
      {
        type: "slider",
        label: "Slider",
        icon: "Sliders",
        description: "Range slider input",
      },
      {
        type: "address",
        label: "Address",
        icon: "MapPin",
        description: "Address input with autocomplete",
      },
      {
        type: "calculation",
        label: "Calculation",
        icon: "Calculator",
        description: "Calculated field",
      },
      {
        type: "payment",
        label: "Payment",
        icon: "CreditCard",
        description: "Payment processing field",
      },
    ],
  },
] as const;

export const FORM_CATEGORIES = [
  {
    value: "admission",
    label: "Admission Forms",
    description: "Student admission and application forms",
  },
  {
    value: "contact",
    label: "Contact Forms",
    description: "General contact and inquiry forms",
  },
  {
    value: "scholarship",
    label: "Scholarship Forms",
    description: "Scholarship application forms",
  },
  {
    value: "feedback",
    label: "Feedback Forms",
    description: "Customer feedback and survey forms",
  },
  {
    value: "survey",
    label: "Survey Forms",
    description: "Research and survey forms",
  },
  {
    value: "registration",
    label: "Registration Forms",
    description: "Event and course registration forms",
  },
  {
    value: "application",
    label: "Application Forms",
    description: "Job and program application forms",
  },
  {
    value: "payment",
    label: "Payment Forms",
    description: "Payment and billing forms",
  },
  {
    value: "custom",
    label: "Custom Forms",
    description: "Custom business forms",
  },
] as const;

export const WIDGET_TYPES = [
  { type: "embed", label: "Embed", description: "Embed form in website" },
  { type: "popup", label: "Popup", description: "Modal popup form" },
  {
    type: "floating",
    label: "Floating",
    description: "Floating action button",
  },
  { type: "slide_in", label: "Slide In", description: "Slide-in panel form" },
  {
    type: "fullscreen",
    label: "Fullscreen",
    description: "Fullscreen modal form",
  },
  { type: "button", label: "Button", description: "Trigger button form" },
] as const;
