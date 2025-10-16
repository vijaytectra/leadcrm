"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FormFieldRenderer } from './FormFieldRenderer';
import { getVisibleFields } from '@/lib/conditional-logic';
import { ApiException, apiGetPublic, apiPostPublic } from '@/lib/utils';
import { toast } from 'sonner';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import type { FormField } from '@/types/form-builder';

interface PublicFormData {
    id: string;
    title: string;
    description?: string;
    fields: FormField[];
    steps: Array<{
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
    }>;
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

interface PublicWidgetFormProps {
    widgetId: string;
    theme?: string;
    primaryColor?: string;
    borderRadius?: string;
}

export function PublicWidgetForm({
    widgetId,
    theme = 'light',
    primaryColor,
    borderRadius
}: PublicWidgetFormProps) {
    const [formData, setFormData] = useState<PublicFormData | null>(null);
    const [formValues, setFormValues] = useState<Record<string, unknown>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    // Load widget data
    useEffect(() => {
        const loadWidgetData = async () => {
            try {
                setIsLoading(true);
                const response = await apiGetPublic<{ success: boolean; data: PublicFormData }>(
                    `/public/widgets/${widgetId}`
                );

                if (response.success) {
                    setFormData(response.data);
                } else {
                    throw new Error('Failed to load widget data');
                }
            } catch (error) {
                if (error instanceof ApiException) {
                    console.error('Error loading widget:', error.message);
                    toast.error(error.message);
                } else {
                    console.error('Error loading widget:', error);
                    toast.error('Failed to load form. Please try again.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadWidgetData();
    }, [widgetId]);

    // Track widget view
    useEffect(() => {
        if (formData) {
            const trackView = async () => {
                try {
                    await apiPostPublic(`/public/widgets/${widgetId}/view`, {});
                } catch (error) {
                    console.error('Error tracking view:', error);
                }
            };
            trackView();
        }
    }, [formData, widgetId]);

    const handleFieldChange = (fieldId: string, value: unknown) => {
        setFormValues(prev => ({
            ...prev,
            [fieldId]: value
        }));
    };

    const getCurrentStepFields = (): FormField[] => {
        if (!formData || !formData.steps.length) {
            return getVisibleFields(formData?.fields || [], formValues, formData?.fields || []);
        }

        const currentStep = formData.steps[currentStepIndex];
        if (!currentStep) return [];

        const stepFields = formData.fields.filter(field =>
            currentStep.fields.includes(field.id)
        );

        return getVisibleFields(stepFields, formValues, formData.fields);
    };

    const canProceedToNextStep = (): boolean => {
        const currentStepFields = getCurrentStepFields();
        const requiredFields = currentStepFields.filter(field => field.required);

        return requiredFields.every(field => {
            const value = formValues[field.id];
            return value !== undefined && value !== null && value !== '';
        });
    };

    const handleNextStep = () => {
        if (canProceedToNextStep() && formData && currentStepIndex < formData.steps.length - 1) {
            setCompletedSteps(prev => new Set([...prev, currentStepIndex]));
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const handlePreviousStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!formData) return;

        try {
            setIsSubmitting(true);
            setSubmitStatus('idle');

            // Validate required fields
            const allFields = getVisibleFields(formData.fields, formValues, formData.fields);
            const requiredFields = allFields.filter(field => field.required);
            const missingFields = requiredFields.filter(field => {
                const value = formValues[field.id];
                return value === undefined || value === null || value === '';
            });

            if (missingFields.length > 0) {
                toast.error(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
                return;
            }

            // Prepare form data with field metadata for better mapping
            const formDataWithMetadata = {
                values: formValues,
                fields: formData.fields.map(field => ({
                    id: field.id,
                    label: field.label,
                    type: field.type,
                    required: field.required
                }))
            };

            const response = await apiPostPublic<{
                success: boolean;
                data: {
                    message?: string;
                    nextSteps?: string[];
                };
                message?: string;
            }>(`/public/widgets/${widgetId}/submit`, formDataWithMetadata);

            if (response.success) {
                setSubmitStatus('success');
                toast.success(response.data.message || 'Form submitted successfully!');

                // Show next steps if available
                if (response.data.nextSteps) {
                    setTimeout(() => {
                        toast.info(`Next steps: ${response.data.nextSteps?.join(', ')}`);
                    }, 1000);
                }
            } else {
                throw new Error(response.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitStatus('error');
            toast.error('Failed to submit form. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getWidgetStyles = () => {
        const primary = primaryColor || formData?.settings.theme.primaryColor || '#3b82f6';
        const radius = borderRadius ? parseInt(borderRadius) : formData?.settings.theme.borderRadius || 8;

        return {
            '--primary-color': primary,
            '--border-radius': `${radius}px`,
        } as React.CSSProperties;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-slate-600">Loading form...</p>
                </div>
            </div>
        );
    }

    if (!formData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
                    <h1 className="text-xl font-semibold text-slate-900 mb-2">Form Not Found</h1>
                    <p className="text-slate-600">The requested form could not be loaded.</p>
                </div>
            </div>
        );
    }

    const currentStep = formData.steps[currentStepIndex];
    const currentStepFields = getCurrentStepFields();
    const progress = formData.steps.length > 0 ? ((currentStepIndex + 1) / formData.steps.length) * 100 : 100;
    const isLastStep = currentStepIndex === formData.steps.length - 1;

    return (
        <div
            className="min-h-screen bg-slate-50 py-8"
            style={getWidgetStyles()}
        >
            <div className="max-w-2xl mx-auto px-4">
                <div
                    className="bg-white rounded-lg shadow-lg p-8"
                    style={{ borderRadius: 'var(--border-radius)' }}
                >
                    {/* Form Header */}
                    <div className="text-center mb-8">
                        <h1
                            className="text-2xl font-bold mb-2"
                            style={{ color: 'var(--primary-color)' }}
                        >
                            {formData.title}
                        </h1>
                        {formData.description && (
                            <p className="text-slate-600">{formData.description}</p>
                        )}
                    </div>

                    {/* Progress Bar for Multi-Step Forms */}
                    {formData.steps.length > 1 && (
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-700">
                                    Step {currentStepIndex + 1} of {formData.steps.length}
                                </span>
                                <span className="text-sm text-slate-500">{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${progress}%`,
                                        backgroundColor: 'var(--primary-color)'
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step Title */}
                    {currentStep && (
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-semibold text-slate-900 mb-2">
                                {currentStep.title}
                            </h2>
                            {currentStep.description && (
                                <p className="text-slate-600">{currentStep.description}</p>
                            )}
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-6">
                        {currentStepFields.length > 0 ? (
                            currentStepFields
                                .sort((a, b) => a.order - b.order)
                                .map(field => (
                                    <div key={field.id} className="space-y-2">
                                        <FormFieldRenderer
                                            field={field}
                                            value={formValues[field.id]}
                                            onChange={(value) => handleFieldChange(field.id, value)}
                                            isPreview={true}
                                            className="w-full"
                                        />
                                    </div>
                                ))
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <p>No fields available for this step.</p>
                            </div>
                        )}
                    </div>

                    {/* Submit Success/Error Messages */}
                    {submitStatus === 'success' && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                <p className="text-green-800 font-medium">Form submitted successfully!</p>
                            </div>
                        </div>
                    )}

                    {submitStatus === 'error' && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                                <p className="text-red-800 font-medium">Failed to submit form. Please try again.</p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
                        {formData.steps.length > 1 ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handlePreviousStep}
                                    disabled={currentStepIndex === 0}
                                >
                                    Previous
                                </Button>

                                <div className="flex space-x-2">
                                    {!isLastStep ? (
                                        <Button
                                            onClick={handleNextStep}
                                            disabled={!canProceedToNextStep()}
                                            style={{ backgroundColor: 'var(--primary-color)' }}
                                        >
                                            Next
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting || !canProceedToNextStep()}
                                            style={{ backgroundColor: 'var(--primary-color)' }}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                'Submit'
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="w-full flex justify-center">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !canProceedToNextStep()}
                                    className="w-full max-w-xs"
                                    style={{ backgroundColor: 'var(--primary-color)' }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit'
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
