import { prisma } from "./prisma";
import {
  WidgetGenerationRequest,
  WidgetResponse,
  WidgetAnalytics,
  PublicFormData,
  WidgetViewRequest,
  WidgetSubmissionRequest,
} from "../types/widget";
import { FormBuilderError as FormBuilderErrorType } from "../types/form-builder";

class FormBuilderError extends Error {
  public code: string;

  constructor({ code, message }: { code: string; message: string }) {
    super(message);
    this.code = code;
    this.name = "FormBuilderError";
  }
}

export class WidgetService {
  /**
   * Generate a new widget for a form
   */
  async generateWidget(
    formId: string,
    tenantId: string,
    config: WidgetGenerationRequest
  ): Promise<WidgetResponse> {
    try {
      // Verify form exists and belongs to tenant
      const form = await prisma.form.findFirst({
        where: {
          id: formId,
          tenantId: tenantId,
          isPublished: true,
        },
      });

      if (!form) {
        throw new FormBuilderError({
          code: "FORM_NOT_FOUND",
          message: "Form not found or not published",
        });
      }

      // Generate embed code
      const widgetId = `widget_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const embedCode = this.generateEmbedCode(widgetId, config.styling);
      const previewUrl = `${process.env.FRONTEND_URL}/institution-admin/forms/${formId}/widgets?formId=${formId}`;
      const publicUrl = `${process.env.FRONTEND_URL}/widgets/${widgetId}`;

      // Create widget in database
      const widget = await prisma.formWidget.create({
        data: {
          id: widgetId,
          formId: formId,
          name: config.name,
          type: "embed",
          settings: config.styling,
          embedCode: embedCode,
          isActive: true,
        },
      });

      return {
        id: widget.id,
        formId: widget.formId,
        name: widget.name,
        type: widget.type,
        settings: widget.settings as any,
        embedCode: widget.embedCode,
        previewUrl,
        publicUrl,
        isActive: widget.isActive,
        createdAt: widget.createdAt,
        updatedAt: widget.updatedAt,
      };
    } catch (error) {
      console.error("Error generating widget:", error);
      throw error;
    }
  }

  /**
   * Get public form data for widget
   */
  async getPublicForm(widgetId: string): Promise<PublicFormData> {
    try {
      const widget = await prisma.formWidget.findUnique({
        where: { id: widgetId },
        include: {
          form: {
            include: {
              fields: {
                orderBy: { order: "asc" },
              },
              steps: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });

      if (!widget || !widget.isActive) {
        throw new FormBuilderError({
          code: "WIDGET_NOT_FOUND",
          message: "Widget not found or inactive",
        });
      }

      const form = widget.form;
      if (!form.isPublished) {
        throw new FormBuilderError({
          code: "FORM_NOT_ACTIVE",
          message: "Form is not published",
        });
      }

      // Transform fields for public consumption
      const publicFields = form.fields.map((field) => ({
        id: field.id,
        type: field.type,
        label: field.label,
        placeholder: field.placeholder || undefined,
        description: field.description || undefined,
        required: field.required,
        order: field.order,
        width: field.width,
        validation: {
          required: field.required,
          minLength: (field.validation as any)?.minLength,
          maxLength: (field.validation as any)?.maxLength,
          pattern: (field.validation as any)?.pattern,
        },
        conditionalLogic: {
          enabled: (field.conditionalLogic as any)?.enabled || false,
          conditions: (field.conditionalLogic as any)?.conditions || [],
          actions: (field.conditionalLogic as any)?.actions || [],
        },
        options: (field.options as any) || {},
      }));

      // Transform steps for public consumption
      const publicSteps = form.steps.map((step) => ({
        id: step.id,
        title: step.title,
        description: step.description || undefined,
        order: step.order,
        isActive: step.isActive,
        isPayment: step.isPayment,
        paymentAmount: step.paymentAmount || undefined,
        fields: (step.fields as string[]) || [],
        conditions: step.conditions,
      }));

      return {
        id: form.id,
        title: form.title,
        description: form.description || undefined,
        fields: publicFields,
        steps: publicSteps,
        settings: {
          theme: {
            primaryColor: (widget.settings as any)?.primaryColor || "#3b82f6",
            borderRadius: (widget.settings as any)?.borderRadius || 8,
          },
          layout: {
            width: (widget.settings as any)?.width || "100%",
            alignment: "center",
          },
        },
      };
    } catch (error) {
      console.error("Error getting public form:", error);
      throw error;
    }
  }

  /**
   * Track widget view
   */
  async trackWidgetView(request: WidgetViewRequest): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.formWidgetAnalytics.upsert({
        where: {
          widgetId_date: {
            widgetId: request.widgetId,
            date: today,
          },
        },
        update: {
          views: {
            increment: 1,
          },
        },
        create: {
          widgetId: request.widgetId,
          date: today,
          views: 1,
          submissions: 0,
          conversions: 0,
        },
      });
    } catch (error) {
      console.error("Error tracking widget view:", error);
      // Don't throw error for analytics tracking
    }
  }

  /**
   * Track widget submission
   */
  async trackWidgetSubmission(
    widgetId: string,
    success: boolean
  ): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.formWidgetAnalytics.upsert({
        where: {
          widgetId_date: {
            widgetId: widgetId,
            date: today,
          },
        },
        update: {
          submissions: {
            increment: 1,
          },
          conversions: success
            ? {
                increment: 1,
              }
            : undefined,
        },
        create: {
          widgetId: widgetId,
          date: today,
          views: 0,
          submissions: 1,
          conversions: success ? 1 : 0,
        },
      });
    } catch (error) {
      console.error("Error tracking widget submission:", error);
      // Don't throw error for analytics tracking
    }
  }

  /**
   * Get widget analytics
   */
  async getWidgetAnalytics(
    widgetId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WidgetAnalytics> {
    try {
      const analytics = await prisma.formWidgetAnalytics.findMany({
        where: {
          widgetId: widgetId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: "asc" },
      });

      const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
      const totalSubmissions = analytics.reduce(
        (sum, a) => sum + a.submissions,
        0
      );
      const conversionRate =
        totalViews > 0 ? (totalSubmissions / totalViews) * 100 : 0;

      const dailyStats = analytics.map((a) => ({
        date: a.date,
        views: a.views,
        submissions: a.submissions,
      }));

      return {
        widgetId,
        dateRange: { start: startDate, end: endDate },
        totalViews,
        totalSubmissions,
        conversionRate,
        dailyStats,
      };
    } catch (error) {
      console.error("Error getting widget analytics:", error);
      throw error;
    }
  }

  /**
   * Get widgets for a form
   */
  async getFormWidgets(
    formId: string,
    tenantId: string
  ): Promise<WidgetResponse[]> {
    try {
      const widgets = await prisma.formWidget.findMany({
        where: {
          formId: formId,
          form: {
            tenantId: tenantId,
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return widgets.map((widget) => ({
        id: widget.id,
        formId: widget.formId,
        name: widget.name,
        type: widget.type,
        settings: widget.settings as any,
        embedCode: widget.embedCode,
        previewUrl: `${process.env.FRONTEND_URL}/institution-admin/forms/${widget.formId}/widgets?formId=${widget.formId}`,
        publicUrl: `${process.env.FRONTEND_URL}/widgets/${widget.id}`,
        isActive: widget.isActive,
        createdAt: widget.createdAt,
        updatedAt: widget.updatedAt,
      }));
    } catch (error) {
      console.error("Error getting form widgets:", error);
      throw error;
    }
  }

  /**
   * Update widget
   */
  async updateWidget(
    widgetId: string,
    tenantId: string,
    updates: Partial<WidgetGenerationRequest>
  ): Promise<WidgetResponse> {
    try {
      // Verify widget exists and belongs to tenant
      const widget = await prisma.formWidget.findFirst({
        where: {
          id: widgetId,
          form: {
            tenantId: tenantId,
          },
        },
      });

      if (!widget) {
        throw new FormBuilderError({
          code: "WIDGET_NOT_FOUND",
          message: "Widget not found",
        });
      }

      const updatedWidget = await prisma.formWidget.update({
        where: { id: widgetId },
        data: {
          ...(updates.name && { name: updates.name }),
          ...(updates.styling && { settings: updates.styling }),
          ...(updates.styling && {
            embedCode: this.generateEmbedCode(widgetId, updates.styling),
          }),
        },
      });

      return {
        id: updatedWidget.id,
        formId: updatedWidget.formId,
        name: updatedWidget.name,
        type: updatedWidget.type,
        settings: updatedWidget.settings as any,
        embedCode: updatedWidget.embedCode,
        previewUrl: `${process.env.FRONTEND_URL}/institution-admin/forms/${updatedWidget.formId}/widgets?formId=${updatedWidget.formId}`,
        publicUrl: `${process.env.FRONTEND_URL}/widgets/${updatedWidget.id}`,
        isActive: updatedWidget.isActive,
        createdAt: updatedWidget.createdAt,
        updatedAt: updatedWidget.updatedAt,
      };
    } catch (error) {
      console.error("Error updating widget:", error);
      throw error;
    }
  }

  /**
   * Delete widget
   */
  async deleteWidget(widgetId: string, tenantId: string): Promise<void> {
    try {
      // Verify widget exists and belongs to tenant
      const widget = await prisma.formWidget.findFirst({
        where: {
          id: widgetId,
          form: {
            tenantId: tenantId,
          },
        },
      });

      if (!widget) {
        throw new FormBuilderError({
          code: "WIDGET_NOT_FOUND",
          message: "Widget not found",
        });
      }

      await prisma.formWidget.delete({
        where: { id: widgetId },
      });
    } catch (error) {
      console.error("Error deleting widget:", error);
      throw error;
    }
  }

  /**
   * Generate embed code for widget
   */
  private generateEmbedCode(widgetId: string, styling: any): string {
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const width = styling?.width || "100%";
    const height = styling?.height || "600px";
    const borderRadius = styling?.borderRadius || 8;

    return `<iframe 
  src="${baseUrl}/widgets/${widgetId}"
  width="${width}"
  height="${height}"
  frameborder="0"
  style="border-radius: ${borderRadius}px; border: none;"
  allowtransparency="true"
></iframe>`;
  }
}

export const widgetService = new WidgetService();
