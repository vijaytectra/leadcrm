"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormBuilderProvider } from "./FormBuilderProvider";
import { FormBuilderHeader } from "./FormBuilderHeader";
import { FormBuilderSidebar } from "./FormBuilderSidebar";
import { FormBuilderCanvas } from "./FormBuilderCanvas";
import { FormBuilderPropertyPanel } from "./FormBuilderPropertyPanel";
import { FormPreviewModal } from "./FormPreviewModal";
import { FormTemplatesModal } from "./FormTemplatesModal";
import { formsApi } from "@/lib/api/forms";
import type { FormBuilderConfig, FormField, FormTemplate } from "@/types/form-builder";

interface FormBuilderContainerProps {
    formId?: string;
    templateId?: string;
    mode: "create" | "edit" | "preview";
}

export function FormBuilderContainer({
    formId,
    templateId,
    mode
}: FormBuilderContainerProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);

    // Load form data
    const loadForm = useCallback(async () => {
        if (!formId) return;

        try {
            setIsLoading(true);
            setError(null);

            const [formResponse, fieldsResponse] = await Promise.all([
                formsApi.getForm(formId),
                formsApi.getFormFields(formId)
            ]);

            if (!formResponse.success || !fieldsResponse.success) {
                throw new Error("Failed to load form data");
            }

            // Validate response data
            if (!formResponse.data || !fieldsResponse.data) {
                throw new Error("Invalid form data received");
            }

            // Initialize form builder with loaded data
            // This will be handled by the FormBuilderProvider
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load form";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [formId]);

    // Load template data
    const loadTemplate = useCallback(async () => {
        if (!templateId) return;

        try {
            setIsLoading(true);
            setError(null);

            const templatesResponse = await formsApi.getTemplates();

            if (!templatesResponse.success) {
                throw new Error("Failed to load templates");
            }

            const template = templatesResponse.data.find(t => t.id === templateId);
            if (!template) {
                throw new Error("Template not found");
            }

            setSelectedTemplate(template);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load template";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [templateId]);

    // Initialize form builder
    useEffect(() => {
        if (mode === "create" && !templateId) {
            setIsLoading(false);
        } else if (formId) {
            loadForm();
        } else if (templateId) {
            loadTemplate();
        }
    }, [mode, formId, templateId, loadForm, loadTemplate]);

    // Handle template selection
    const handleTemplateSelect = useCallback((template: FormTemplate) => {
        setSelectedTemplate(template);
        setShowTemplates(false);
        toast.success(`Template "${template.name}" selected`);
    }, []);

    // Handle form save
    const handleSave = useCallback(async (formData: FormBuilderConfig, fields: FormField[]) => {
        try {
            setIsLoading(true);
            setError(null);

            if (mode === "create") {
                const response = await formsApi.createForm({
                    title: formData.title,
                    description: formData.description,
                    requiresPayment: formData.requiresPayment,
                    paymentAmount: formData.paymentAmount,
                    allowMultipleSubmissions: formData.allowMultipleSubmissions,
                    maxSubmissions: formData.maxSubmissions,
                    submissionDeadline: formData.submissionDeadline,
                    settings: formData.settings
                });

                if (!response.success || !response.data) {
                    throw new Error("Failed to create form");
                }

                // Create fields
                for (const field of fields) {
                    await formsApi.createField(response.data.id, {
                        type: field.type,
                        label: field.label,
                        placeholder: field.placeholder,
                        description: field.description,
                        required: field.required,
                        order: field.order,
                        width: field.width,
                        validation: field.validation,
                        conditionalLogic: field.conditionalLogic,
                        options: field.options,
                        styling: field.styling,
                        advanced: field.advanced
                    });
                }

                toast.success("Form created successfully");
                router.push(`/institution-admin/forms?formId=${response.data.id}&mode=edit`);
            } else if (mode === "edit" && formId) {
                const response = await formsApi.updateForm(formId, {
                    title: formData.title,
                    description: formData.description,
                    isActive: formData.isActive,
                    requiresPayment: formData.requiresPayment,
                    paymentAmount: formData.paymentAmount,
                    allowMultipleSubmissions: formData.allowMultipleSubmissions,
                    maxSubmissions: formData.maxSubmissions,
                    submissionDeadline: formData.submissionDeadline,
                    settings: formData.settings
                });

                if (!response.success) {
                    throw new Error("Failed to update form");
                }

                toast.success("Form updated successfully");
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to save form";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [mode, formId, router]);

    // Handle form preview
    const handlePreview = useCallback(() => {
        setShowPreview(true);
    }, []);

    // Handle form publish
    const handlePublish = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            if (!formId) {
                throw new Error("Form ID is required for publishing");
            }

            const response = await formsApi.updateForm(formId, {
                isActive: true
            });

            if (!response.success) {
                throw new Error("Failed to publish form");
            }

            toast.success("Form published successfully");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to publish form";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [formId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading form builder...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Form</h3>
                    <p className="text-slate-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <FormBuilderProvider
            initialForm={selectedTemplate?.formConfig}
            initialFields={selectedTemplate?.fields || []}
            onSave={handleSave}
            onPreview={handlePreview}
            onPublish={handlePublish}
        >
            <div className="h-screen flex flex-col bg-slate-50">
                <FormBuilderHeader
                    mode={mode}
                    onShowTemplates={() => setShowTemplates(true)}
                    onPreview={handlePreview}
                />
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar - Hidden on mobile, visible on desktop */}
                    <div className="hidden lg:block w-56 border-r bg-white">
                        <FormBuilderSidebar />
                    </div>

                    {/* Main Canvas Area */}
                    <div className="flex-1 flex flex-col lg:flex-row">
                        <div className="flex-1 min-w-0">
                            <FormBuilderCanvas />
                        </div>

                        {/* Property Panel - Hidden on mobile, visible on desktop */}
                        <div className="hidden lg:block w-80 border-l bg-white">
                            <FormBuilderPropertyPanel />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showTemplates && (
                <FormTemplatesModal
                    onSelectTemplate={handleTemplateSelect}
                    onClose={() => setShowTemplates(false)}
                />
            )}

            {showPreview && (
                <FormPreviewModal
                    onClose={() => setShowPreview(false)}
                />
            )}
        </FormBuilderProvider>
    );
}
