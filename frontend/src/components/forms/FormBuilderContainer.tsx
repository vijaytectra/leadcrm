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
import { useAuthStore } from "@/stores/auth";
import type { FormBuilderConfig, FormField, FormTemplate } from "@/types/form-builder";
import { ApiException } from "@/lib/utils";

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
    const { currentTenantSlug } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
    const [loadedForm, setLoadedForm] = useState<FormBuilderConfig | null>(null);
    const [loadedFields, setLoadedFields] = useState<FormField[]>([]);

    // Load form data
    const loadForm = useCallback(async () => {
        if (!formId || !currentTenantSlug) return;

        try {
            setIsLoading(true);
            setError(null);

            const [formResponse, fieldsResponse] = await Promise.all([
                formsApi.getForm(currentTenantSlug, formId),
                formsApi.getFormFields(currentTenantSlug, formId)
            ]);

            if (!formResponse.success || !fieldsResponse.success) {
                throw new Error("Failed to load form data");
            }

            // Validate response data
            if (!formResponse.data || !fieldsResponse.data) {
                throw new Error("Invalid form data received");
            }

            // Store loaded data for FormBuilderProvider
          

            // Ensure steps are properly loaded from the form settings
            const formData = formResponse.data as FormBuilderConfig;
            if (formData.settings && formData.settings.steps) {
              
            } else {
                
                // Create a default step if none exist
                formData.settings = {
                    ...formData.settings,
                    steps: [{
                        id: `step_${Date.now()}`,
                        formId: formData.id,
                        title: "Step 1",
                        description: "Basic information",
                        order: 0,
                        isActive: true,
                        isPayment: false,
                        fields: fieldsResponse.data.fields.map(f => f.id),
                        settings: {
                            showProgress: true,
                            allowBack: true,
                            allowSkip: false,
                            autoSave: false,
                            validationMode: "onSubmit"
                        },
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }]
                };
            }

            setLoadedForm(formData);
            setLoadedFields(fieldsResponse.data.fields);
        } catch (err) {
            console.error("Error fetching preferences:", err);
            if (err instanceof ApiException) {
                console.error("Error fetching preferences:", err.message)
                setError(err.message);
                toast.error(err.message);
            } else {
                console.error("Error fetching preferences:", err);
                setError("Failed to load form");
                toast.error("Failed to load form");
            }
           
        } finally {
            setIsLoading(false);
        }
    }, [formId, currentTenantSlug]);

    // Load template data
    const loadTemplate = useCallback(async () => {
        if (!templateId || !currentTenantSlug) return;

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
            
                   
            console.error("Error fetching preferences:", err);
            if (err instanceof ApiException) {
                console.error("Error fetching preferences:", err.message);
                setError(err.message);
                toast.error(err.message);
            } else {
                console.error("Error fetching preferences:", err);
                setError("Failed to load template");
                toast.error("Failed to load template");
            }

        } finally {
            setIsLoading(false);
        }
    }, [templateId, currentTenantSlug]);

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

    // Handle preview mode specifically
    useEffect(() => {
        if (mode === "preview" && formId) {
            loadForm();
        }
    }, [mode, formId, loadForm]);

    // Handle template selection
    const handleTemplateSelect = useCallback((template: FormTemplate) => {
        setSelectedTemplate(template);
        setShowTemplates(false);
        toast.success(`Template "${template.name}" selected`);
    }, []);


    // Handle form preview
    const handlePreview = useCallback(() => {
     
        setShowPreview(true);
       
    }, [mode, formId, showPreview]);

    // Handle form publish
    const handlePublish = useCallback(async () => {
        if (!currentTenantSlug) {
            toast.error("Missing tenant information");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const currentFormId = formId;

            // If form doesn't exist yet, we can't publish
            if (!currentFormId) {
                toast.error("Please save the form first, then publish it");
                return;
            }

            // Now publish the form
            const response = await formsApi.updateForm(currentTenantSlug, currentFormId, {
                isActive: true,
                isPublished: true
            });

            if (!response.success) {
                throw new Error("Failed to publish form");
            }

            toast.success("Form published successfully");

            // Navigate to forms list after successful publish
            setTimeout(() => {
                router.push("/institution-admin/forms");
            }, 1000);
        } catch (err) { 
            console.error("Error fetching preferences:", err);
            if (err instanceof ApiException) {
                console.error("Error fetching preferences:", err.message);
                setError(err.message);
                toast.error(err.message);
            } else {
                console.error("Error fetching preferences:", err);
                setError("Failed to publish form");
                toast.error("Failed to publish form");
            }
        } finally {
            setIsLoading(false);
        }
    }, [formId, currentTenantSlug, router]);

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

    // Don't render FormBuilderProvider until we have the data for edit and preview modes
    if ((mode === "edit" || mode === "preview") && !loadedForm) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-slate-600">Loading form data...</div>
                </div>
            </div>
        );
    }

    // Create default form for create mode
    const defaultForm: FormBuilderConfig = {
        id: "",
        title: "Untitled Form",
        description: "",
        isActive: false,
        isPublished: false,
        requiresPayment: false,
        paymentAmount: 0,
        allowMultipleSubmissions: true,
        settings: {
            theme: {
                primaryColor: "#3b82f6",
                secondaryColor: "#1e40af",
                backgroundColor: "#ffffff",
                textColor: "#1f2937",
                borderColor: "#e5e7eb",
                borderRadius: 8,
                fontFamily: "Inter, sans-serif",
                fontSize: 14
            },
            layout: {
                width: "narrow" as const,
                alignment: "left" as const,
                spacing: "normal" as const,
                showProgress: true,
                showStepNumbers: false
            },
            validation: {
                validateOnSubmit: true,
                showInlineErrors: true,
                customValidationRules: []
            },
            notifications: {
                emailOnSubmission: false,
                emailRecipients: [],
                smsOnSubmission: false,
                smsRecipients: [],
                autoResponse: false
            },
            integrations: {
                customScripts: []
            },
            security: {
                requireCaptcha: false,
                captchaType: "recaptcha" as const,
                allowAnonymous: true,
                rateLimit: {
                    enabled: false,
                    maxSubmissions: 10,
                    timeWindow: 60
                }
            }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        tenantId: ""
    };

    return (
        <FormBuilderProvider
            initialForm={mode === "create" ? defaultForm : (loadedForm || selectedTemplate?.formConfig)}
            initialFields={mode === "create" ? (selectedTemplate?.fields || []) : loadedFields}
            initialSteps={mode === "create" ? [] : (loadedForm?.settings?.steps || [])}
        >
            <div className="h-screen flex flex-col bg-slate-50">
                <FormBuilderHeader
                    onPreview={handlePreview}
                    onPublish={handlePublish}
                    hasFormId={!!formId}
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
                <>
                  
                    <FormPreviewModal
                        onClose={() => {
                     
                            setShowPreview(false);
                        }}
                    />
                </>
            )}

            {/* Show preview modal when in preview mode */}
            {mode === "preview" && loadedForm && (
                <FormPreviewModal
                    onClose={() => router.push("/institution-admin/forms")}
                />
            )}
        </FormBuilderProvider>
    );
}

