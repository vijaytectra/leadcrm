"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Eye,
    EyeOff,
    Smartphone,
    Tablet,
    Monitor,
    X
} from "lucide-react";
import { useFormBuilder } from "./FormBuilderProvider";
import { FormFieldRenderer } from "./FormFieldRenderer";
import { StepBasedFormPreview } from "./StepBasedFormPreview";
import { getVisibleFields } from "@/lib/conditional-logic";
import { toast } from "sonner";
import type { FormField } from "@/types/form-builder";
import { ApiException } from "@/lib/utils";

interface FormPreviewModalProps {
    onClose: () => void;
}

type DeviceType = "desktop" | "tablet" | "mobile";

export function FormPreviewModal({ onClose }: FormPreviewModalProps) {
    const { state } = useFormBuilder();
    const [deviceType, setDeviceType] = useState<DeviceType>("desktop");
    const [formData, setFormData] = useState<Record<string, unknown>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showStepPreview, setShowStepPreview] = useState(false);

    const hasSteps = state.steps && state.steps.length > 0;
    const fields = state.fields || [];

    // Get visible fields based on conditional logic
    const getVisibleFieldsList = (): FormField[] => {
        return getVisibleFields(fields, formData, state.fields);
    };

    const handleFieldChange = (fieldId: string, value: unknown) => {
        setFormData(prev => ({
            ...prev,
            [fieldId]: value
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Simulate form submission
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Form submitted successfully!");
            onClose();
        } catch (error) {
            console.error("Error fetching preferences:", error);
            if (error instanceof ApiException) {
                console.error("Error fetching preferences:", error.message);
                toast.error(error.message);
            } else {
                console.error("Error fetching preferences:", error);
                toast.error("Failed to submit form");
            }
        } 
        finally {
            setIsSubmitting(false);
        }
    };

    const getDeviceClass = () => {
        switch (deviceType) {
            case "mobile":
                return "max-w-sm mx-auto";
            case "tablet":
                return "max-w-2xl mx-auto";
            default:
                return "max-w-4xl mx-auto";
        }
    };

    const getDeviceIcon = () => {
        switch (deviceType) {
            case "mobile":
                return <Smartphone className="h-4 w-4" />;
            case "tablet":
                return <Tablet className="h-4 w-4" />;
            default:
                return <Monitor className="h-4 w-4" />;
        }
    };

    const canSubmit = () => {
        const requiredFields = fields.filter(field => field.required);
        return requiredFields.every(field => {
            const value = formData[field.id];
            return value !== undefined && value !== null && value !== "";
        });
    };

    if (showStepPreview && hasSteps) {
        return <StepBasedFormPreview onClose={() => setShowStepPreview(false)} />;
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Form Preview
                    </DialogTitle>
                    <DialogDescription>
                        Preview how your form will look to users
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col h-full ">
                    {/* Preview Controls */}
                    <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Device:</span>
                                <Select value={deviceType} onValueChange={(value: DeviceType) => setDeviceType(value)}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="desktop">
                                            <div className="flex items-center gap-2">
                                                <Monitor className="h-4 w-4" />
                                                Desktop
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="tablet">
                                            <div className="flex items-center gap-2">
                                                <Tablet className="h-4 w-4" />
                                                Tablet
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="mobile">
                                            <div className="flex items-center gap-2">
                                                <Smartphone className="h-4 w-4" />
                                                Mobile
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {hasSteps && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowStepPreview(true)}
                                    className="flex items-center gap-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    Step Preview
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="flex items-center gap-1">
                                {getDeviceIcon()}
                                {deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}
                            </Badge>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Preview Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className={getDeviceClass()}>
                            <div className="bg-white border rounded-lg shadow-sm p-6 space-y-6">
                                {/* Form Header */}
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {state.currentForm?.title || "Untitled Form"}
                                    </h2>
                                    {state.currentForm?.description && (
                                        <p className="text-gray-600">
                                            {state.currentForm.description}
                                        </p>
                                    )}
                                </div>

                                {/* Form Fields */}
                                {fields.length > 0 ? (
                                    <div className="space-y-4">
                                        {getVisibleFieldsList()
                                            .sort((a, b) => a.order - b.order)
                                            .map(field => (
                                                <FormFieldRenderer
                                                    key={field.id}
                                                    field={field}
                                                    value={formData[field.id]}
                                                    onChange={(value) => handleFieldChange(field.id, value)}
                                                    isPreview={true}
                                                />
                                            ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <EyeOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium">No fields added</p>
                                        <p className="text-sm">Add fields to your form to see them here</p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                {fields.length > 0 && (
                                    <div className="flex justify-center pt-6">
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={!canSubmit() || isSubmitting}
                                            size="lg"
                                            className="px-8"
                                        >
                                            {isSubmitting ? "Submitting..." : "Submit Form"}
                                        </Button>
                                    </div>
                                )}

                                {/* Form Info */}
                                <div className="text-center text-sm text-gray-500 space-y-1">
                                    <p>Form Status: {state.isDraft ? "Draft" : "Published"}</p>
                                    <p>Fields: {fields.length}</p>
                                    {hasSteps && <p>Steps: {state.steps.length}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Data Debug (Development Only) */}
                    {process.env.NODE_ENV === 'development' && (
                        <details className="p-4 border-t bg-gray-50">
                            <summary className="cursor-pointer font-medium text-sm">Debug Info</summary>
                            <pre className="mt-2 text-xs overflow-auto max-h-32">
                                {JSON.stringify({
                                    form: state.currentForm?.title,
                                    fields: fields.length,
                                    steps: state.steps?.length || 0,
                                    formData,
                                    deviceType
                                }, null, 2)}
                            </pre>
                        </details>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}