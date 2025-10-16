"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    X,
    Plus,
    Settings,
    Palette,
    GraduationCap,
    Info,
} from "lucide-react";
import { toast } from "sonner";
import { formsApi } from "@/lib/api/forms";
import { ApiException } from "@/lib/utils";

interface WidgetCreationModalProps {
    formId: string;
    formTitle: string;
    tenantSlug: string;
    isOpen: boolean;
    onClose: () => void;
    onWidgetCreated: (widget: unknown) => void;
}

interface Form {
    id: string;
    title: string;
    description?: string;
    isPublished: boolean;
    submissionDeadline?: string;
}

interface WidgetFormData {
    name: string;
    type: "EMBED" | "POPUP" | "FULLSCREEN";
    settings: {
        theme: "light" | "dark" | "auto";
        primaryColor: string;
        secondaryColor: string;
        borderRadius: number;
        width: string;
        height: string;
        position: "center" | "bottom-right" | "bottom-left";
        trigger: "immediate" | "scroll" | "time" | "exit-intent";
        triggerDelay?: number;
        triggerScrollPercentage?: number;
    };
    behavior: {
        showProgress: boolean;
        allowSave: boolean;
        autoSave: boolean;
        showValidation: boolean;
        redirectAfterSubmit: boolean;
        redirectUrl?: string;
    };
    admissionFormId?: string;
    admissionFormSettings?: {
        sendEmail: boolean;
        emailTemplate?: string;
        reminderEnabled: boolean;
        reminderIntervals: number[];
    };
}

export function WidgetCreationModal({
    formId,
    formTitle,
    tenantSlug,
    isOpen,
    onClose,
    onWidgetCreated
}: WidgetCreationModalProps) {
    const [saving, setSaving] = useState(false);
    const [admissionForms, setAdmissionForms] = useState<Form[]>([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<WidgetFormData>({
        name: "",
        type: "EMBED",
        settings: {
            theme: "light",
            primaryColor: "#3b82f6",
            secondaryColor: "#6b7280",
            borderRadius: 8,
            width: "100%",
            height: "600px",
            position: "center",
            trigger: "immediate",
            triggerDelay: 0,
            triggerScrollPercentage: 50
        },
        behavior: {
            showProgress: true,
            allowSave: true,
            autoSave: true,
            showValidation: true,
            redirectAfterSubmit: false,
            redirectUrl: ""
        },
        admissionFormId: "",
        admissionFormSettings: {
            sendEmail: true,
            emailTemplate: "default",
            reminderEnabled: true,
            reminderIntervals: [1, 3, 7, 14]
        }
    });

    const loadForms = useCallback(async () => {
        try {
            const response = await formsApi.getForms(tenantSlug);
            if (response.success) {
                // Filter for published forms that could be admission forms
                setAdmissionForms(response.data.forms.filter(form =>
                    form.isPublished && form.id !== formId
                ).map(form => ({
                    id: form.id,
                    title: form.title,
                    description: form.description,
                    isPublished: form.isPublished,
                    submissionDeadline: form.submissionDeadline?.toISOString()
                })));
            }
        } catch (error) {
            console.error("Error loading forms:", error);
            toast.error("Failed to load forms");
        }
    }, [tenantSlug, formId]);

    useEffect(() => {
        if (isOpen) {
            loadForms();
        }
    }, [isOpen, loadForms]);

    const handleInputChange = (field: string, value: unknown) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSettingsChange = (field: string, value: unknown) => {
        setFormData(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                [field]: value
            }
        }));
    };

    const handleBehaviorChange = (field: string, value: unknown) => {
        setFormData(prev => ({
            ...prev,
            behavior: {
                ...prev.behavior,
                [field]: value
            }
        }));
    };

    const handleAdmissionFormChange = (field: string, value: unknown) => {
        setFormData(prev => ({
            ...prev,
            admissionFormSettings: {
                ...prev.admissionFormSettings!,
                [field]: value
            }
        }));
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast.error("Widget name is required");
            return;
        }

        try {
            setSaving(true);

            const widgetData = {
                name: formData.name,
                styling: {
                    theme: formData.settings.theme,
                    primaryColor: formData.settings.primaryColor,
                    borderRadius: formData.settings.borderRadius,
                    width: formData.settings.width,
                    height: formData.settings.height,
                }
            };

            const response = await formsApi.createWidget(tenantSlug, formId, widgetData);
            if (response.success) {
                toast.success("Widget created successfully");
                onWidgetCreated(response.data);
                onClose();
            } else {

                toast.error(response.message || "Failed to create widget");
            }
        } catch (error) {
            if (error instanceof ApiException) {
                console.error("Error creating widget:", error.message);
                toast.error(error.message);
                return;
            }
            else {
                console.error("Error creating widget:", error instanceof Error ? error.message : String(error));
                toast.error("Failed to create widget");
            }
        } finally {
            setSaving(false);
        }
    };

    const nextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white shadow-2xl">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-semibold text-white flex items-center">
                            <Plus className="h-5 w-5 mr-2" />
                            Create Widget for &ldquo;{formTitle}&rdquo;
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-white hover:bg-white/10"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>

                <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                    <CardContent className="p-6">
                        {/* Progress Steps */}
                        <div className="flex items-center justify-center mb-8">
                            <div className="flex items-center space-x-4">
                                {[1, 2, 3, 4].map((step) => (
                                    <div key={step} className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-200 text-gray-600"
                                            }`}>
                                            {step}
                                        </div>
                                        {step < 4 && (
                                            <div className={`w-8 h-0.5 mx-2 ${currentStep > step ? "bg-blue-600" : "bg-gray-200"
                                                }`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Step 1: Basic Information */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                                        <Settings className="h-5 w-5 mr-2" />
                                        Basic Information
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="name">Widget Name *</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange("name", e.target.value)}
                                                placeholder="Enter widget name"
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="type">Widget Type *</Label>
                                            <Select
                                                value={formData.type}
                                                onValueChange={(value) => handleInputChange("type", value)}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select widget type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="EMBED">Embedded Form</SelectItem>
                                                    <SelectItem value="POPUP">Popup Form</SelectItem>
                                                    <SelectItem value="FULLSCREEN">Fullscreen Form</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Styling & Appearance */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                                        <Palette className="h-5 w-5 mr-2" />
                                        Styling & Appearance
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="theme">Theme</Label>
                                            <Select
                                                value={formData.settings.theme}
                                                onValueChange={(value) => handleSettingsChange("theme", value)}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select theme" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="light">Light</SelectItem>
                                                    <SelectItem value="dark">Dark</SelectItem>
                                                    <SelectItem value="auto">Auto</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="borderRadius">Border Radius</Label>
                                            <Input
                                                id="borderRadius"
                                                type="number"
                                                value={formData.settings.borderRadius}
                                                onChange={(e) => handleSettingsChange("borderRadius", parseInt(e.target.value))}
                                                className="mt-1"
                                                min="0"
                                                max="20"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="primaryColor">Primary Color</Label>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Input
                                                    id="primaryColor"
                                                    type="color"
                                                    value={formData.settings.primaryColor}
                                                    onChange={(e) => handleSettingsChange("primaryColor", e.target.value)}
                                                    className="w-16 h-10 p-1"
                                                />
                                                <Input
                                                    value={formData.settings.primaryColor}
                                                    onChange={(e) => handleSettingsChange("primaryColor", e.target.value)}
                                                    placeholder="#3b82f6"
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="secondaryColor">Secondary Color</Label>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Input
                                                    id="secondaryColor"
                                                    type="color"
                                                    value={formData.settings.secondaryColor}
                                                    onChange={(e) => handleSettingsChange("secondaryColor", e.target.value)}
                                                    className="w-16 h-10 p-1"
                                                />
                                                <Input
                                                    value={formData.settings.secondaryColor}
                                                    onChange={(e) => handleSettingsChange("secondaryColor", e.target.value)}
                                                    placeholder="#6b7280"
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Behavior & Settings */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                                        <Settings className="h-5 w-5 mr-2" />
                                        Behavior & Settings
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="showProgress"
                                                checked={formData.behavior.showProgress}
                                                onCheckedChange={(checked) => handleBehaviorChange("showProgress", checked)}
                                            />
                                            <Label htmlFor="showProgress">Show progress bar</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="allowSave"
                                                checked={formData.behavior.allowSave}
                                                onCheckedChange={(checked) => handleBehaviorChange("allowSave", checked)}
                                            />
                                            <Label htmlFor="allowSave">Allow saving progress</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="autoSave"
                                                checked={formData.behavior.autoSave}
                                                onCheckedChange={(checked) => handleBehaviorChange("autoSave", checked)}
                                            />
                                            <Label htmlFor="autoSave">Auto-save progress</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="showValidation"
                                                checked={formData.behavior.showValidation}
                                                onCheckedChange={(checked) => handleBehaviorChange("showValidation", checked)}
                                            />
                                            <Label htmlFor="showValidation">Show validation errors</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="redirectAfterSubmit"
                                                checked={formData.behavior.redirectAfterSubmit}
                                                onCheckedChange={(checked) => handleBehaviorChange("redirectAfterSubmit", checked)}
                                            />
                                            <Label htmlFor="redirectAfterSubmit">Redirect after submission</Label>
                                        </div>

                                        {formData.behavior.redirectAfterSubmit && (
                                            <div className="ml-6">
                                                <Label htmlFor="redirectUrl">Redirect URL</Label>
                                                <Input
                                                    id="redirectUrl"
                                                    value={formData.behavior.redirectUrl || ""}
                                                    onChange={(e) => handleBehaviorChange("redirectUrl", e.target.value)}
                                                    placeholder="https://example.com/thank-you"
                                                    className="mt-1"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Admission Form Integration */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                                        <GraduationCap className="h-5 w-5 mr-2" />
                                        Admission Form Integration
                                    </h3>

                                    <Alert className="mb-6">
                                        <Info className="h-4 w-4" />
                                        <AlertDescription>
                                            When a user submits this widget form, you can automatically send them an admission form to complete their application.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="space-y-6">
                                        <div>
                                            <Label htmlFor="admissionForm">Admission Form (Optional)</Label>
                                            <Select
                                                value={formData.admissionFormId || "none"}
                                                onValueChange={(value) => handleInputChange("admissionFormId", value === "none" ? "" : value)}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select admission form" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">No admission form</SelectItem>
                                                    {admissionForms.map((form) => (
                                                        <SelectItem key={form.id} value={form.id}>
                                                            {form.title}
                                                            {form.submissionDeadline && (
                                                                <span className="text-xs text-gray-500 ml-2">
                                                                    (Deadline: {new Date(form.submissionDeadline).toLocaleDateString()})
                                                                </span>
                                                            )}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {formData.admissionFormId && (
                                            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                                                <h4 className="font-medium text-blue-900">Admission Form Settings</h4>

                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="sendEmail"
                                                        checked={formData.admissionFormSettings?.sendEmail || false}
                                                        onCheckedChange={(checked) => handleAdmissionFormChange("sendEmail", checked)}
                                                    />
                                                    <Label htmlFor="sendEmail">Send email with form access link</Label>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="reminderEnabled"
                                                        checked={formData.admissionFormSettings?.reminderEnabled || false}
                                                        onCheckedChange={(checked) => handleAdmissionFormChange("reminderEnabled", checked)}
                                                    />
                                                    <Label htmlFor="reminderEnabled">Send reminder emails for incomplete forms</Label>
                                                </div>

                                                {formData.admissionFormSettings?.reminderEnabled && (
                                                    <div className="ml-6">
                                                        <Label>Reminder Intervals (days)</Label>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {[1, 3, 7, 14, 30].map((day) => (
                                                                <div key={day} className="flex items-center space-x-1">
                                                                    <Checkbox
                                                                        id={`reminder-${day}`}
                                                                        checked={formData.admissionFormSettings?.reminderIntervals?.includes(day) || false}
                                                                        onCheckedChange={(checked) => {
                                                                            const current = formData.admissionFormSettings?.reminderIntervals || [];
                                                                            if (checked) {
                                                                                handleAdmissionFormChange("reminderIntervals", [...current, day]);
                                                                            } else {
                                                                                handleAdmissionFormChange("reminderIntervals", current.filter(d => d !== day));
                                                                            }
                                                                        }}
                                                                    />
                                                                    <Label htmlFor={`reminder-${day}`} className="text-sm">
                                                                        {day} day{day > 1 ? 's' : ''}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t">
                            <Button
                                variant="outline"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                            >
                                Previous
                            </Button>

                            <div className="flex items-center space-x-2">
                                <Button variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                {currentStep < 4 ? (
                                    <Button onClick={nextStep}>
                                        Next
                                    </Button>
                                ) : (
                                    <Button onClick={handleSubmit} disabled={saving}>
                                        {saving ? "Creating..." : "Create Widget"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </div>
            </Card>
        </div>
    );
}
