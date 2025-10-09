import {
  apiGetClientNew,
  apiPostClientNew,
  apiPutClient,
  ApiRequestOptions,
} from "../utils";
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
  FormCategory,
  WidgetType,
} from "@/types/form-builder";

// Form Management API
export const formsApi = {
  // Form CRUD operations
  async createForm(
    data: CreateFormRequest,
    options?: ApiRequestOptions
  ): Promise<FormResponse> {
    return apiPostClientNew<FormResponse>("/forms", data, {
      token: "true",
      ...options,
    });
  },

  async getForms(
    page = 1,
    limit = 10,
    options?: ApiRequestOptions
  ): Promise<FormListResponse> {
    return apiGetClientNew<FormListResponse>(
      `/forms?page=${page}&limit=${limit}`,
      { token: "true", ...options }
    );
  },

  async getForm(
    formId: string,
    options?: ApiRequestOptions
  ): Promise<FormResponse> {
    return apiGetClientNew<FormResponse>(`/forms/${formId}`, {
      token: "true",
      ...options,
    });
  },

  async updateForm(
    formId: string,
    data: UpdateFormRequest,
    options?: ApiRequestOptions
  ): Promise<FormResponse> {
    return apiPutClient<FormResponse>(`/forms/${formId}`, data, {
      token: "true",
      ...options,
    });
  },

  async deleteForm(
    formId: string,
    options?: ApiRequestOptions
  ): Promise<{ success: boolean; message: string }> {
    return apiPostClientNew<{ success: boolean; message: string }>(
      `/forms/${formId}`,
      {},
      { token: "true", ...options }
    );
  },

  // Field Management
  async createField(
    formId: string,
    data: CreateFieldRequest,
    options?: ApiRequestOptions
  ): Promise<FormResponse> {
    return apiPostClientNew<FormResponse>(`/forms/${formId}/fields`, data, {
      token: "true",
      ...options,
    });
  },

  async getFormFields(
    formId: string,
    options?: ApiRequestOptions
  ): Promise<FieldListResponse> {
    return apiGetClientNew<FieldListResponse>(`/forms/${formId}/fields`, {
      token: "true",
      ...options,
    });
  },

  async updateField(
    formId: string,
    fieldId: string,
    data: UpdateFieldRequest,
    options?: ApiRequestOptions
  ): Promise<FormResponse> {
    return apiPutClient<FormResponse>(
      `/forms/${formId}/fields/${fieldId}`,
      data,
      { token: "true", ...options }
    );
  },

  async deleteField(
    formId: string,
    fieldId: string,
    options?: ApiRequestOptions
  ): Promise<{ success: boolean; message: string }> {
    return apiPostClientNew<{ success: boolean; message: string }>(
      `/forms/${formId}/fields/${fieldId}`,
      {},
      { token: "true", ...options }
    );
  },

  // Form Submissions
  async submitForm(
    formId: string,
    data: SubmitFormRequest,
    options?: ApiRequestOptions
  ): Promise<FormResponse> {
    return apiPostClientNew<FormResponse>(
      `/forms/${formId}/submit`,
      data,
      options
    );
  },

  async getFormSubmissions(
    formId: string,
    page = 1,
    limit = 10,
    options?: ApiRequestOptions
  ): Promise<SubmissionListResponse> {
    return apiGetClientNew<SubmissionListResponse>(
      `/forms/${formId}/submissions?page=${page}&limit=${limit}`,
      { token: "true", ...options }
    );
  },

  // Widget Management
  async createWidget(
    formId: string,
    data: {
      name: string;
      type: WidgetType;
      settings: Record<string, unknown>;
    },
    options?: ApiRequestOptions
  ): Promise<FormResponse> {
    return apiPostClientNew<FormResponse>(`/forms/${formId}/widgets`, data, {
      token: "true",
      ...options,
    });
  },

  // Analytics
  async getFormAnalytics(
    formId: string,
    startDate: Date,
    endDate: Date,
    options?: ApiRequestOptions
  ): Promise<{ success: boolean; data: FormAnalytics }> {
    return apiGetClientNew<{ success: boolean; data: FormAnalytics }>(
      `/forms/${formId}/analytics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      { token: "true", ...options }
    );
  },

  // Templates
  async getTemplates(
    category?: FormCategory,
    isPublic = true,
    options?: ApiRequestOptions
  ): Promise<{ success: boolean; data: FormTemplate[] }> {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (!isPublic) params.append("isPublic", "false");

    return apiGetClientNew<{ success: boolean; data: FormTemplate[] }>(
      `/forms/templates?${params.toString()}`,
      { token: "true", ...options }
    );
  },

  async createTemplate(
    data: {
      name: string;
      description: string;
      category: FormCategory;
      isPublic: boolean;
      isPremium: boolean;
      formConfig: FormBuilderConfig;
      fields: FormField[];
      steps: unknown[];
      previewImage?: string;
      tags: string[];
    },
    options?: ApiRequestOptions
  ): Promise<FormResponse> {
    return apiPostClientNew<FormResponse>("/forms/templates", data, {
      token: "true",
      ...options,
    });
  },
};

// Form Builder State Management
export interface FormBuilderState {
  currentForm: FormBuilderConfig | null;
  fields: FormField[];
  selectedField: FormField | null;
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;
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
  reset: () => void;
}

// Form Builder Utilities
export const formBuilderUtils = {
  generateFieldId: (): string => {
    return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  getFieldTypeIcon: (type: string): string => {
    const iconMap: Record<string, string> = {
      text: "Type",
      textarea: "FileText",
      email: "Mail",
      phone: "Phone",
      number: "Hash",
      date: "Calendar",
      time: "Clock",
      datetime: "Calendar",
      select: "ChevronDown",
      multiselect: "CheckSquare",
      radio: "Radio",
      checkbox: "CheckSquare",
      file: "Upload",
      signature: "PenTool",
      rating: "Star",
      slider: "Sliders",
      address: "MapPin",
      url: "Link",
      password: "Lock",
      hidden: "EyeOff",
      divider: "Minus",
      heading: "Heading",
      paragraph: "AlignLeft",
      calculation: "Calculator",
      payment: "CreditCard",
    };
    return iconMap[type] || "Type";
  },

  getFieldTypeLabel: (type: string): string => {
    const labelMap: Record<string, string> = {
      text: "Text Input",
      textarea: "Text Area",
      email: "Email",
      phone: "Phone",
      number: "Number",
      date: "Date",
      time: "Time",
      datetime: "Date & Time",
      select: "Dropdown",
      multiselect: "Multi Select",
      radio: "Radio Buttons",
      checkbox: "Checkboxes",
      file: "File Upload",
      signature: "Signature",
      rating: "Rating",
      slider: "Slider",
      address: "Address",
      url: "URL",
      password: "Password",
      hidden: "Hidden Field",
      divider: "Divider",
      heading: "Heading",
      paragraph: "Paragraph",
      calculation: "Calculation",
      payment: "Payment",
    };
    return labelMap[type] || "Unknown Field";
  },

  validateField: (field: FormField): string[] => {
    const errors: string[] = [];

    if (!field.label.trim()) {
      errors.push("Label is required");
    }

    if (field.required && !field.validation?.required) {
      errors.push("Required field must have validation enabled");
    }

    if (
      field.type === "select" ||
      field.type === "radio" ||
      field.type === "checkbox"
    ) {
      if (!field.options?.choices || field.options.choices.length === 0) {
        errors.push("Choice fields must have at least one option");
      }
    }

    if (
      field.type === "file" &&
      field.options?.maxFileSize &&
      field.options.maxFileSize > 10 * 1024 * 1024
    ) {
      errors.push("Maximum file size cannot exceed 10MB");
    }

    return errors;
  },

  getFieldWidthClass: (width: string): string => {
    const widthMap: Record<string, string> = {
      full: "w-full",
      half: "w-1/2",
      third: "w-1/3",
      quarter: "w-1/4",
    };
    return widthMap[width] || "w-full";
  },

  getFieldTypeCategory: (type: string): string => {
    const categoryMap: Record<string, string> = {
      text: "Input",
      textarea: "Input",
      email: "Input",
      phone: "Input",
      number: "Input",
      date: "Input",
      time: "Input",
      datetime: "Input",
      select: "Choice",
      multiselect: "Choice",
      radio: "Choice",
      checkbox: "Choice",
      file: "Media",
      signature: "Media",
      rating: "Input",
      slider: "Input",
      address: "Input",
      url: "Input",
      password: "Input",
      hidden: "Layout",
      divider: "Layout",
      heading: "Layout",
      paragraph: "Layout",
      calculation: "Advanced",
      payment: "Advanced",
    };
    return categoryMap[type] || "Input";
  },
};
