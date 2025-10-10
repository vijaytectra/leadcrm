"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Eye,
    EyeOff
} from "lucide-react";
import { useFormBuilder } from "./FormBuilderProvider";
import { FormFieldRenderer } from "./FormFieldRenderer";
import { toast } from "sonner";
import type { FormField, Action } from "@/types/form-builder";

interface StepBasedFormPreviewProps {
    onClose: () => void;
}

export function StepBasedFormPreview({ onClose }: StepBasedFormPreviewProps) {
    const { state } = useFormBuilder();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [formData, setFormData] = useState<Record<string, unknown>>({});
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);

    const steps = state.steps || [];
    const currentStep = steps[currentStepIndex];
    const progress = steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;

    // Evaluate conditional logic for a field
    const evaluateConditionalLogic = (field: FormField): boolean => {
        console.log(`Evaluating conditional logic for field ${field.id} (${field.label}):`, {
            hasConditionalLogic: !!field.conditionalLogic,
            enabled: field.conditionalLogic?.enabled,
            conditions: field.conditionalLogic?.conditions,
            conditionsLength: field.conditionalLogic?.conditions?.length,
            stepConditions: currentStep?.conditions
        });

        // Check field-level conditional logic first
        if (field.conditionalLogic?.enabled && field.conditionalLogic?.conditions?.length) {
            console.log(`Field ${field.label} has field-level conditional logic`);
            return evaluateFieldConditionalLogic(field);
        }

        // Check step-level conditional logic
        if (currentStep?.conditions?.enabled && currentStep.conditions.conditions?.length) {
            console.log(`Field ${field.label} checking step-level conditional logic`);
            return evaluateStepConditionalLogic(field);
        }

        console.log(`Field ${field.label} has no conditional logic, showing by default`);
        return true; // Show field if no conditional logic
    };

    // Evaluate field-level conditional logic
    const evaluateFieldConditionalLogic = (field: FormField): boolean => {
        console.log(`Evaluating field-level conditional logic for field ${field.id}:`, {
            field: field.label,
            conditionalLogic: field.conditionalLogic,
            formData,
            currentStep: currentStepIndex
        });

        // Check if all conditions are met
        const conditionsMet = field.conditionalLogic.conditions.every((condition: { fieldId: string; value: unknown; operator: string }) => {
            const triggerField = state.fields.find(f => f.id === condition.fieldId);
            if (!triggerField) {
                console.log(`Trigger field not found for condition:`, condition);
                return false;
            }

            const triggerValue = formData[triggerField.id];
            const conditionValue = condition.value;

            console.log(`Condition check:`, {
                triggerField: triggerField.label,
                triggerValue,
                conditionValue,
                operator: condition.operator,
                result: evaluateCondition(triggerValue, conditionValue, condition.operator)
            });

            return Boolean(evaluateCondition(triggerValue, conditionValue, condition.operator));
        });

        console.log(`Field ${field.label} field-level conditional logic result:`, conditionsMet);
        return conditionsMet;
    };

    // Evaluate step-level conditional logic
    const evaluateStepConditionalLogic = (field: FormField): boolean => {
        console.log(`Evaluating step-level conditional logic for field ${field.id}:`, {
            field: field.label,
            stepConditions: currentStep?.conditions,
            formData,
            currentStep: currentStepIndex
        });

        if (!currentStep?.conditions?.conditions?.length) {
            return true;
        }

        // Find rules that target this field
        const targetRules = currentStep.conditions?.actions?.filter((action: Action) =>
            action.targetFieldId === field.id
        ) || [];

        if (targetRules.length === 0) {
            console.log(`No step-level rules target field ${field.label}`);
            return true;
        }

        // Check if any rule conditions are met
        const anyRuleMet = targetRules.some((action: Action) => {
            // Find the condition that matches this action
            // We need to find the condition that has the same fieldId as the rule that created this action
            const condition = currentStep.conditions?.conditions.find((_c: { fieldId: string }) => {
                // This is a simplified approach - in a real implementation, you'd need to track
                // which condition created which action
                return true; // For now, check all conditions
            });

            if (!condition) return false;

            const triggerField = state.fields.find(f => f.id === condition.fieldId);
            if (!triggerField) return false;

            const triggerValue = formData[triggerField.id];
            const conditionValue = condition.value;

            const conditionMet = evaluateCondition(triggerValue, conditionValue, condition.operator);
            console.log(`Step-level condition check:`, {
                triggerField: triggerField.label,
                triggerValue,
                conditionValue,
                operator: condition.operator,
                action: action.type,
                result: conditionMet
            });

            return conditionMet;
        });

        console.log(`Field ${field.label} step-level conditional logic result:`, anyRuleMet);
        return anyRuleMet;
    };

    // Helper function to evaluate individual conditions
    const evaluateCondition = (triggerValue: unknown, conditionValue: unknown, operator: string): boolean => {
        switch (operator) {
            case 'equals':
                return triggerValue === conditionValue;
            case 'not_equals':
                return triggerValue !== conditionValue;
            case 'contains':
                return String(triggerValue).includes(String(conditionValue));
            case 'not_contains':
                return !String(triggerValue).includes(String(conditionValue));
            case 'is_empty':
                return !triggerValue || triggerValue === '';
            case 'is_not_empty':
                return Boolean(triggerValue && triggerValue !== '');
            default:
                console.warn(`Unknown operator: ${operator}`);
                return true;
        }
    };

    // Get fields for current step with conditional logic evaluation
    const getCurrentStepFields = (): FormField[] => {
        if (!currentStep) return [];

        console.log('Getting fields for current step:', {
            currentStep: currentStep.title,
            stepFields: currentStep.fields,
            allFields: state.fields.map(f => ({ id: f.id, label: f.label, type: f.type }))
        });

        const stepFields = state.fields.filter(field => {
            // Check if field is assigned to current step
            const isAssignedToStep = currentStep.fields.includes(field.id);
            console.log(`Field ${field.label} (${field.id}) assigned to step:`, isAssignedToStep);

            if (!isAssignedToStep) return false;

            // Evaluate conditional logic
            const shouldShow = evaluateConditionalLogic(field);
            console.log(`Field ${field.label} should show:`, shouldShow);
            return shouldShow;
        }).sort((a, b) => a.order - b.order);

        console.log('Final step fields:', stepFields.map(f => ({ id: f.id, label: f.label, type: f.type })));
        return stepFields;
    };

    const currentStepFields = getCurrentStepFields();

    // Force re-render when form data changes to update conditional logic
    const [, forceUpdate] = useState({});
    const forceRerender = () => forceUpdate({});

    // Re-evaluate conditional logic when form data changes
    useEffect(() => {
        console.log('Form data changed, re-evaluating conditional logic:', formData);
        forceRerender();
    }, [formData]);

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const handleFieldChange = (fieldId: string, value: unknown) => {
        setFormData(prev => ({
            ...prev,
            [fieldId]: value
        }));
    };

    const handleStepComplete = () => {
        setCompletedSteps(prev => new Set([...prev, currentStepIndex]));

        if (currentStepIndex < steps.length - 1) {
            handleNext();
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Simulate form submission
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Form submitted successfully!");
            onClose();
        } catch {
            toast.error("Failed to submit form");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isStepCompleted = (stepIndex: number) => {
        return completedSteps.has(stepIndex);
    };

    const canProceed = () => {
        if (!currentStep) return false;

        // Check if all required fields in current step are filled
        const requiredFields = currentStepFields.filter(field => field.required);
        return requiredFields.every(field => {
            const value = formData[field.id];
            return value !== undefined && value !== null && value !== "";
        });
    };

    if (!currentStep) {
        return (
            <Dialog open onOpenChange={onClose}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Form Preview</DialogTitle>
                        <DialogDescription>
                            No steps configured for this form.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end">
                        <Button onClick={onClose}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Form Preview
                    </DialogTitle>
                    <DialogDescription>
                        Preview how your form will look to users
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Progress Bar */}
                    {steps.length > 1 && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Step {currentStepIndex + 1} of {steps.length}</span>
                                <span>{Math.round(progress)}% Complete</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    )}

                    {/* Step Navigation */}
                    {steps.length > 1 && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {steps.map((step, index) => (
                                    <div
                                        key={step.id}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${index === currentStepIndex
                                            ? "bg-primary text-primary-foreground"
                                            : index < currentStepIndex
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-500"
                                            }`}
                                    >
                                        {index < currentStepIndex && isStepCompleted(index) ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <span className="w-4 h-4 rounded-full bg-current flex items-center justify-center text-xs">
                                                {index + 1}
                                            </span>
                                        )}
                                        <span>{step.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Current Step Content */}
                    <div className="space-y-4">
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-semibold">{currentStep.title}</h3>
                            {currentStep.description && (
                                <p className="text-muted-foreground">{currentStep.description}</p>
                            )}
                        </div>

                        {/* Step Fields */}
                        <div className="space-y-4">
                            {currentStepFields.length > 0 ? (
                                currentStepFields.map(field => (
                                    <div key={field.id} className="space-y-2">
                                        {/* Debug info for conditional logic */}
                                        {process.env.NODE_ENV === 'development' && field.conditionalLogic?.enabled && (
                                            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                                🔗 Conditional Logic: {field.conditionalLogic.conditions.length} condition(s)
                                            </div>
                                        )}
                                        <FormFieldRenderer
                                            field={field}
                                            isPreview={true}
                                            value={formData[field.id]}
                                            onChange={(value) => handleFieldChange(field.id, value)}
                                            className="w-full"
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <EyeOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No fields assigned to this step</p>
                                    <p className="text-sm">Add fields to this step to see them here</p>
                                </div>
                            )}
                        </div>

                        {/* Payment Step */}
                        {currentStep.isPayment && (
                            <div className="border rounded-lg p-4 bg-blue-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold">Payment Required</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Complete your payment to proceed
                                        </p>
                                    </div>
                                    <Badge variant="secondary">
                                        ${currentStep.paymentAmount || 0}
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-6 border-t">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentStepIndex === 0}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Previous
                        </Button>

                        <div className="flex items-center gap-2">
                            {currentStepIndex === steps.length - 1 ? (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!canProceed() || isSubmitting}
                                    className="flex items-center gap-2"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Form"}
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleStepComplete}
                                    disabled={!canProceed()}
                                    className="flex items-center gap-2"
                                >
                                    Next
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Form Data Debug (Development Only) */}
                    {process.env.NODE_ENV === 'development' && (
                        <details className="mt-4 p-4 bg-gray-100 rounded-lg">
                            <summary className="cursor-pointer font-medium">Debug Info</summary>
                            <pre className="mt-2 text-xs overflow-auto">
                                {JSON.stringify({
                                    currentStep: currentStepIndex,
                                    totalSteps: steps.length,
                                    formData,
                                    completedSteps: Array.from(completedSteps),
                                    currentStepFields: currentStepFields.map(f => ({
                                        id: f.id,
                                        label: f.label,
                                        type: f.type,
                                        conditionalLogic: f.conditionalLogic,
                                        isVisible: evaluateConditionalLogic(f)
                                    })),
                                    allFieldsWithConditionalLogic: state.fields.map(f => ({
                                        id: f.id,
                                        label: f.label,
                                        type: f.type,
                                        hasConditionalLogic: !!f.conditionalLogic?.enabled,
                                        conditions: f.conditionalLogic?.conditions,
                                        isInCurrentStep: currentStep?.fields.includes(f.id),
                                        isVisible: currentStep?.fields.includes(f.id) ? evaluateConditionalLogic(f) : false
                                    }))
                                }, null, 2)}
                            </pre>
                        </details>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}