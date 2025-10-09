// Import backend types for frontend use
import type {
  FormBuilderConfig,
  FormField,
  FormSubmission,
  FormWidget,
  FormTemplate,
  FormAnalytics,
  CreateFormRequest,
  UpdateFormRequest,
  CreateFieldRequest,
  UpdateFieldRequest,
  SubmitFormRequest,
  FormResponse,
  FormListResponse,
  FieldListResponse,
  SubmissionListResponse,
  FormBuilderError,
  FormBuilderErrorCode,
  FieldType,
  SubmissionStatus,
  WidgetType,
  FormCategory,
  FormSettings,
  FormTheme,
  FormLayout,
  FormValidation,
  ValidationRule,
  FormNotifications,
  FormIntegrations,
  FormSecurity,
  FieldValidation,
  ConditionalLogic,
  Condition,
  Action,
  FieldOptions,
  ChoiceOption,
  FieldStyling,
  FieldAdvanced,
  FormSubmissionValue,
  FileUpload,
  PaymentData,
  SubmissionMetadata,
  FormStep,
  StepSettings,
  WidgetSettings,
  WidgetTrigger,
  WidgetStyling,
  WidgetBehavior,
  WidgetAnalytics,
  FormMetrics,
  SourceMetric,
  DeviceMetric,
  FieldAnalytic,
  FormCharts,
  ChartDataPoint,
  FunnelStep,
  FieldPerformanceChart,
} from "../../../backend/src/types/form-builder";

// Re-export backend types
export type {
  FormBuilderConfig,
  FormField,
  FormSubmission,
  FormWidget,
  FormTemplate,
  FormAnalytics,
  CreateFormRequest,
  UpdateFormRequest,
  CreateFieldRequest,
  UpdateFieldRequest,
  SubmitFormRequest,
  FormResponse,
  FormListResponse,
  FieldListResponse,
  SubmissionListResponse,
  FormBuilderError,
  FormBuilderErrorCode,
  FieldType,
  SubmissionStatus,
  WidgetType,
  FormCategory,
  FormSettings,
  FormTheme,
  FormLayout,
  FormValidation,
  ValidationRule,
  FormNotifications,
  FormIntegrations,
  FormSecurity,
  FieldValidation,
  ConditionalLogic,
  Condition,
  Action,
  FieldOptions,
  ChoiceOption,
  FieldStyling,
  FieldAdvanced,
  FormSubmissionValue,
  FileUpload,
  PaymentData,
  SubmissionMetadata,
  FormStep,
  StepSettings,
  WidgetSettings,
  WidgetTrigger,
  WidgetStyling,
  WidgetBehavior,
  WidgetAnalytics,
  FormMetrics,
  SourceMetric,
  DeviceMetric,
  FieldAnalytic,
  FormCharts,
  ChartDataPoint,
  FunnelStep,
  FieldPerformanceChart,
};

// Frontend-specific types
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
  reset: () => void;
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
