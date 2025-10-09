"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    X,
    Eye,
    Smartphone,
    Tablet,
    Monitor,
    RotateCcw,
    Download,
    Share2
} from "lucide-react";
import { useFormBuilder } from "./FormBuilderProvider";
import { FormFieldRenderer } from "./FormFieldRenderer";
import { toast } from "sonner";

interface FormPreviewModalProps {
    onClose: () => void;
}

type DeviceType = "desktop" | "tablet" | "mobile";

export function FormPreviewModal({ onClose }: FormPreviewModalProps) {
    const { state } = useFormBuilder();
    const [deviceType, setDeviceType] = useState<DeviceType>("desktop");
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (fieldId: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [fieldId]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Simulate form submission
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Form submitted successfully!");
            setFormData({});
        } catch (error) {
            toast.error("Failed to submit form");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getDeviceClass = () => {
        switch (deviceType) {
            case "mobile":
                return "max-w-sm";
            case "tablet":
                return "max-w-2xl";
            default:
                return "max-w-4xl";
        }
    };

    const getDeviceIcon = (type: DeviceType) => {
        switch (type) {
            case "mobile":
                return Smartphone;
            case "tablet":
                return Tablet;
            default:
                return Monitor;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Form Preview
                        </h3>
                        <Badge variant="outline" className="text-xs">
                            {state.fields.length} field{state.fields.length !== 1 ? 's' : ''}
                        </Badge>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Device Selector */}
                        <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
                            {(["desktop", "tablet", "mobile"] as DeviceType[]).map((device) => {
                                const IconComponent = getDeviceIcon(device);
                                return (
                                    <Button
                                        key={device}
                                        size="sm"
                                        variant={deviceType === device ? "default" : "ghost"}
                                        onClick={() => setDeviceType(device)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <IconComponent className="h-4 w-4" />
                                    </Button>
                                );
                            })}
                        </div>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setFormData({})}
                            className="text-slate-600"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success("Preview link copied to clipboard");
                            }}
                            className="text-slate-600"
                        >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onClose}
                            className="text-slate-600"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Preview Content */}
                <div className="flex-1 overflow-auto bg-slate-50 p-6">
                    <div className={`mx-auto ${getDeviceClass()}`}>
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            {/* Form Header */}
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                                    {state.currentForm?.title || "Untitled Form"}
                                </h1>
                                {state.currentForm?.description && (
                                    <p className="text-slate-600">
                                        {state.currentForm.description}
                                    </p>
                                )}
                            </div>

                            {/* Form Fields */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {state.fields.map((field) => (
                                    <div key={field.id} className="space-y-2">
                                        <FormFieldRenderer
                                            field={field}
                                            isPreview={true}
                                            isSelected={false}
                                            onUpdate={(updates) => {
                                                // In preview mode, we don't update the field
                                                // Instead, we update the form data
                                                if (updates.label !== undefined) {
                                                    handleInputChange(field.id, updates.label);
                                                }
                                            }}
                                        />
                                    </div>
                                ))}

                                {/* Submit Button */}
                                <div className="pt-6 border-t border-slate-200">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit Form"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-600">
                            Preview mode • {deviceType} view
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    const formData = {
                                        form: state.currentForm,
                                        fields: state.fields
                                    };
                                    const blob = new Blob([JSON.stringify(formData, null, 2)], {
                                        type: "application/json"
                                    });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = `${state.currentForm?.title || "form"}_preview.json`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                    toast.success("Form data exported");
                                }}
                                className="text-slate-600"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                            <Button
                                size="sm"
                                onClick={onClose}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Close Preview
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
