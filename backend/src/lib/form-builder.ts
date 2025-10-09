import { prisma } from "./prisma";
import {
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
  FormBuilderError,
  FormBuilderErrorCode,
  FieldType,
  SubmissionStatus,
  WidgetType,
  FormCategory,
} from "../types/form-builder";

export class FormBuilderService {
  // Form Management
  async createForm(
    tenantId: string,
    data: CreateFormRequest
  ): Promise<FormBuilderConfig> {
    try {
      const form = await prisma.form.create({
        data: {
          tenantId,
          title: data.title,
          description: data.description,
          requiresPayment: data.requiresPayment || false,
          paymentAmount: data.paymentAmount,
          allowMultipleSubmissions: data.allowMultipleSubmissions || false,
          maxSubmissions: data.maxSubmissions,
          submissionDeadline: data.submissionDeadline,
          settings: data.settings || this.getDefaultFormSettings(),
        },
      });

      return this.mapFormToConfig(form);
    } catch (error) {
      throw this.handleError(
        "FORM_CREATION_FAILED",
        "Failed to create form",
        error
      );
    }
  }

  async getForm(formId: string, tenantId: string): Promise<FormBuilderConfig> {
    const form = await prisma.form.findFirst({
      where: { id: formId, tenantId },
      include: {
        fields: { orderBy: { order: "asc" } },
        steps: { orderBy: { order: "asc" } },
        widgets: true,
      },
    });

    if (!form) {
      throw this.createError("FORM_NOT_FOUND", "Form not found");
    }

    return this.mapFormToConfig(form);
  }

  async updateForm(
    formId: string,
    tenantId: string,
    data: UpdateFormRequest
  ): Promise<FormBuilderConfig> {
    try {
      const form = await prisma.form.update({
        where: { id: formId, tenantId },
        data: {
          title: data.title,
          description: data.description,
          isActive: data.isActive,
          requiresPayment: data.requiresPayment,
          paymentAmount: data.paymentAmount,
          allowMultipleSubmissions: data.allowMultipleSubmissions,
          maxSubmissions: data.maxSubmissions,
          submissionDeadline: data.submissionDeadline,
          settings: data.settings,
        },
        include: {
          fields: { orderBy: { order: "asc" } },
          steps: { orderBy: { order: "asc" } },
          widgets: true,
        },
      });

      return this.mapFormToConfig(form);
    } catch (error) {
      throw this.handleError(
        "FORM_UPDATE_FAILED",
        "Failed to update form",
        error
      );
    }
  }

  async deleteForm(formId: string, tenantId: string): Promise<void> {
    try {
      await prisma.form.delete({
        where: { id: formId, tenantId },
      });
    } catch (error) {
      throw this.handleError(
        "FORM_DELETE_FAILED",
        "Failed to delete form",
        error
      );
    }
  }

  async listForms(
    tenantId: string,
    page = 1,
    limit = 10
  ): Promise<{
    forms: FormBuilderConfig[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }> {
    const skip = (page - 1) * limit;

    const [forms, total] = await Promise.all([
      prisma.form.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          fields: { orderBy: { order: "asc" } },
          steps: { orderBy: { order: "asc" } },
          widgets: true,
        },
      }),
      prisma.form.count({ where: { tenantId } }),
    ]);

    return {
      forms: forms.map((form) => this.mapFormToConfig(form)),
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    };
  }

  // Field Management
  async createField(
    formId: string,
    tenantId: string,
    data: CreateFieldRequest
  ): Promise<FormField> {
    try {
      // Verify form belongs to tenant
      await this.verifyFormAccess(formId, tenantId);

      const field = await prisma.formField.create({
        data: {
          formId,
          type: data.type,
          label: data.label,
          placeholder: data.placeholder,
          description: data.description,
          required: data.required || false,
          order: data.order,
          width: data.width || "full",
          validation: data.validation,
          conditionalLogic: data.conditionalLogic,
          options: data.options,
          styling: data.styling,
          advanced: data.advanced,
        },
      });

      return this.mapFieldToType(field);
    } catch (error) {
      throw this.handleError(
        "FIELD_CREATION_FAILED",
        "Failed to create field",
        error
      );
    }
  }

  async updateField(
    fieldId: string,
    formId: string,
    tenantId: string,
    data: UpdateFieldRequest
  ): Promise<FormField> {
    try {
      // Verify form belongs to tenant
      await this.verifyFormAccess(formId, tenantId);

      const field = await prisma.formField.update({
        where: { id: fieldId },
        data: {
          type: data.type,
          label: data.label,
          placeholder: data.placeholder,
          description: data.description,
          required: data.required,
          order: data.order,
          width: data.width,
          validation: data.validation,
          conditionalLogic: data.conditionalLogic,
          options: data.options,
          styling: data.styling,
          advanced: data.advanced,
        },
      });

      return this.mapFieldToType(field);
    } catch (error) {
      throw this.handleError(
        "FIELD_UPDATE_FAILED",
        "Failed to update field",
        error
      );
    }
  }

  async deleteField(
    fieldId: string,
    formId: string,
    tenantId: string
  ): Promise<void> {
    try {
      // Verify form belongs to tenant
      await this.verifyFormAccess(formId, tenantId);

      await prisma.formField.delete({
        where: { id: fieldId },
      });
    } catch (error) {
      throw this.handleError(
        "FIELD_DELETE_FAILED",
        "Failed to delete field",
        error
      );
    }
  }

  async getFormFields(formId: string, tenantId: string): Promise<FormField[]> {
    // Verify form belongs to tenant
    await this.verifyFormAccess(formId, tenantId);

    const fields = await prisma.formField.findMany({
      where: { formId },
      orderBy: { order: "asc" },
    });

    return fields.map((field) => this.mapFieldToType(field));
  }

  // Form Submission
  async submitForm(
    formId: string,
    data: SubmitFormRequest,
    metadata: Record<string, unknown>
  ): Promise<FormSubmission> {
    try {
      const form = await prisma.form.findUnique({
        where: { id: formId },
        include: { fields: true },
      });

      if (!form) {
        throw this.createError("FORM_NOT_FOUND", "Form not found");
      }

      if (!form.isActive) {
        throw this.createError("FORM_INACTIVE", "Form is not active");
      }

      // Check submission limits
      if (form.maxSubmissions) {
        const submissionCount = await prisma.formSubmission.count({
          where: { formId },
        });

        if (submissionCount >= form.maxSubmissions) {
          throw this.createError(
            "SUBMISSION_LIMIT_EXCEEDED",
            "Maximum submissions reached"
          );
        }
      }

      // Check deadline
      if (form.submissionDeadline && new Date() > form.submissionDeadline) {
        throw this.createError(
          "SUBMISSION_EXPIRED",
          "Form submission deadline has passed"
        );
      }

      // Validate form data
      await this.validateFormData(form, data.data);

      const submission = await prisma.formSubmission.create({
        data: {
          formId,
          data: data.data,
          metadata: {
            ...metadata,
            ...data.metadata,
          },
          status: "submitted" as SubmissionStatus,
        },
      });

      return this.mapSubmissionToType(submission);
    } catch (error) {
      if (error instanceof Error && error.message.includes("FORM_NOT_FOUND")) {
        throw error;
      }
      throw this.handleError(
        "SUBMISSION_FAILED",
        "Failed to submit form",
        error
      );
    }
  }

  async getFormSubmissions(
    formId: string,
    tenantId: string,
    page = 1,
    limit = 10
  ): Promise<{
    submissions: FormSubmission[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }> {
    // Verify form belongs to tenant
    await this.verifyFormAccess(formId, tenantId);

    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
      prisma.formSubmission.findMany({
        where: { formId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.formSubmission.count({ where: { formId } }),
    ]);

    return {
      submissions: submissions.map((submission) =>
        this.mapSubmissionToType(submission)
      ),
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    };
  }

  // Widget Management
  async createWidget(
    formId: string,
    tenantId: string,
    data: {
      name: string;
      type: WidgetType;
      settings: Record<string, unknown>;
    }
  ): Promise<FormWidget> {
    try {
      // Verify form belongs to tenant
      await this.verifyFormAccess(formId, tenantId);

      const embedCode = this.generateEmbedCode(
        formId,
        data.type,
        data.settings
      );

      const widget = await prisma.formWidget.create({
        data: {
          formId,
          name: data.name,
          type: data.type,
          settings: data.settings,
          embedCode,
        },
      });

      return this.mapWidgetToType(widget);
    } catch (error) {
      throw this.handleError(
        "WIDGET_CREATION_FAILED",
        "Failed to create widget",
        error
      );
    }
  }

  // Template Management
  async createTemplate(data: {
    name: string;
    description: string;
    category: FormCategory;
    isPublic: boolean;
    isPremium: boolean;
    formConfig: FormBuilderConfig;
    fields: FormField[];
    steps: any[];
    previewImage?: string;
    tags: string[];
  }): Promise<FormTemplate> {
    try {
      const template = await prisma.formTemplate.create({
        data: {
          name: data.name,
          description: data.description,
          category: data.category,
          isPublic: data.isPublic,
          isPremium: data.isPremium,
          formConfig: data.formConfig,
          fields: data.fields,
          steps: data.steps,
          previewImage: data.previewImage,
          tags: data.tags,
        },
      });

      return this.mapTemplateToType(template);
    } catch (error) {
      throw this.handleError(
        "TEMPLATE_CREATION_FAILED",
        "Failed to create template",
        error
      );
    }
  }

  async getTemplates(
    category?: FormCategory,
    isPublic = true
  ): Promise<FormTemplate[]> {
    const templates = await prisma.formTemplate.findMany({
      where: {
        ...(category && { category }),
        ...(isPublic && { isPublic: true }),
      },
      orderBy: { createdAt: "desc" },
    });

    return templates.map((template) => this.mapTemplateToType(template));
  }

  // Analytics
  async getFormAnalytics(
    formId: string,
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<FormAnalytics> {
    // Verify form belongs to tenant
    await this.verifyFormAccess(formId, tenantId);

    const analytics = await prisma.formAnalytics.findMany({
      where: {
        formId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
    });

    // Aggregate analytics data
    const aggregated = analytics.reduce(
      (acc, curr) => ({
        views: acc.views + curr.views,
        submissions: acc.submissions + curr.submissions,
        conversions: acc.conversions + curr.conversions,
        bounceRate: acc.bounceRate + curr.bounceRate,
        avgCompletionTime: acc.avgCompletionTime + curr.avgCompletionTime,
      }),
      {
        views: 0,
        submissions: 0,
        conversions: 0,
        bounceRate: 0,
        avgCompletionTime: 0,
      }
    );

    return {
      formId,
      period: "custom",
      startDate,
      endDate,
      metrics: {
        totalViews: aggregated.views,
        totalSubmissions: aggregated.submissions,
        conversionRate:
          aggregated.views > 0 ? aggregated.submissions / aggregated.views : 0,
        averageCompletionTime: aggregated.avgCompletionTime,
        bounceRate: aggregated.bounceRate,
        topSources: [],
        deviceBreakdown: [],
        fieldAnalytics: [],
      },
      charts: {
        viewsOverTime: [],
        submissionsOverTime: [],
        conversionFunnel: [],
        fieldPerformance: [],
      },
    };
  }

  // Private helper methods
  private async verifyFormAccess(
    formId: string,
    tenantId: string
  ): Promise<void> {
    const form = await prisma.form.findFirst({
      where: { id: formId, tenantId },
    });

    if (!form) {
      throw this.createError(
        "FORM_NOT_FOUND",
        "Form not found or access denied"
      );
    }
  }

  private async validateFormData(
    form: any,
    data: Record<string, unknown>
  ): Promise<void> {
    // Implement form validation logic
    for (const field of form.fields) {
      if (field.required && !data[field.id]) {
        throw this.createError(
          "VALIDATION_ERROR",
          `Field ${field.label} is required`
        );
      }

      // Add more validation logic based on field type
      await this.validateFieldData(field, data[field.id]);
    }
  }

  private async validateFieldData(field: any, value: unknown): Promise<void> {
    if (!value && !field.required) return;

    switch (field.type) {
      case "email":
        if (typeof value === "string" && !this.isValidEmail(value)) {
          throw this.createError("VALIDATION_ERROR", "Invalid email format");
        }
        break;
      case "phone":
        if (typeof value === "string" && !this.isValidPhone(value)) {
          throw this.createError("VALIDATION_ERROR", "Invalid phone format");
        }
        break;
      case "number":
        if (typeof value !== "number") {
          throw this.createError("VALIDATION_ERROR", "Invalid number format");
        }
        break;
      // Add more field type validations
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  }

  private generateEmbedCode(
    formId: string,
    type: WidgetType,
    settings: Record<string, unknown>
  ): string {
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const widgetUrl = `${baseUrl}/widget/${formId}`;

    switch (type) {
      case "embed":
        return `<iframe src="${widgetUrl}" width="100%" height="600" frameborder="0"></iframe>`;
      case "popup":
        return `<script src="${baseUrl}/widgets/popup.js" data-form-id="${formId}"></script>`;
      case "floating":
        return `<script src="${baseUrl}/widgets/floating.js" data-form-id="${formId}"></script>`;
      default:
        return `<script src="${baseUrl}/widgets/embed.js" data-form-id="${formId}"></script>`;
    }
  }

  private getDefaultFormSettings() {
    return {
      theme: {
        primaryColor: "#3b82f6",
        secondaryColor: "#6b7280",
        backgroundColor: "#ffffff",
        textColor: "#111827",
        borderColor: "#d1d5db",
        borderRadius: 8,
        fontFamily: "Inter",
        fontSize: 16,
      },
      layout: {
        width: "full",
        alignment: "left",
        spacing: "normal",
        showProgress: true,
        showStepNumbers: true,
      },
      validation: {
        validateOnSubmit: true,
        showInlineErrors: true,
        customValidationRules: [],
      },
      notifications: {
        emailOnSubmission: false,
        emailRecipients: [],
        smsOnSubmission: false,
        smsRecipients: [],
        autoResponse: false,
      },
      integrations: {
        customScripts: [],
      },
      security: {
        requireCaptcha: false,
        allowAnonymous: true,
        rateLimit: {
          enabled: false,
          maxSubmissions: 10,
          timeWindow: 60,
        },
      },
    };
  }

  // Mapping methods
  private mapFormToConfig(form: any): FormBuilderConfig {
    return {
      id: form.id,
      tenantId: form.tenantId,
      title: form.title,
      description: form.description,
      isActive: form.isActive,
      requiresPayment: form.requiresPayment,
      paymentAmount: form.paymentAmount,
      allowMultipleSubmissions: form.allowMultipleSubmissions,
      maxSubmissions: form.maxSubmissions,
      submissionDeadline: form.submissionDeadline,
      settings: form.settings,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    };
  }

  private mapFieldToType(field: any): FormField {
    return {
      id: field.id,
      formId: field.formId,
      type: field.type as FieldType,
      label: field.label,
      placeholder: field.placeholder,
      description: field.description,
      required: field.required,
      order: field.order,
      width: field.width as "full" | "half" | "third" | "quarter",
      validation: field.validation,
      conditionalLogic: field.conditionalLogic,
      options: field.options,
      styling: field.styling,
      advanced: field.advanced,
    };
  }

  private mapSubmissionToType(submission: any): FormSubmission {
    return {
      id: submission.id,
      formId: submission.formId,
      data: submission.data,
      metadata: submission.metadata,
      status: submission.status as SubmissionStatus,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
    };
  }

  private mapWidgetToType(widget: any): FormWidget {
    return {
      id: widget.id,
      formId: widget.formId,
      name: widget.name,
      type: widget.type as WidgetType,
      settings: widget.settings,
      embedCode: widget.embedCode,
      isActive: widget.isActive,
      createdAt: widget.createdAt,
      updatedAt: widget.updatedAt,
    };
  }

  private mapTemplateToType(template: any): FormTemplate {
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category as FormCategory,
      isPublic: template.isPublic,
      isPremium: template.isPremium,
      formConfig: template.formConfig,
      fields: template.fields,
      steps: template.steps,
      previewImage: template.previewImage,
      tags: template.tags,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  private createError(
    code: FormBuilderErrorCode,
    message: string
  ): FormBuilderError {
    return {
      code,
      message,
    };
  }

  private handleError(
    code: string,
    message: string,
    error: unknown
  ): FormBuilderError {
    console.error("FormBuilder Error:", error);
    return {
      code: code as FormBuilderErrorCode,
      message,
      details: error instanceof Error ? { stack: error.stack } : { error },
    };
  }
}

export const formBuilderService = new FormBuilderService();
