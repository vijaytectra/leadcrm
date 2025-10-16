"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Save,
    Send,
    Clock,
    CheckCircle,
    AlertCircle,
    User,
    Mail,
    Phone,
    Calendar,
    FileText,
    Building
} from "lucide-react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface FormField {
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    description?: string;
    required: boolean;
    order: number;
    width: string;
    options?: any;
    validation?: any;
    conditionalLogic?: any;
}

interface FormStep {
    id: string;
    title: string;
    description?: string;
    order: number;
    fields: string[];
}

interface FormAccess {
    id: string;
    status: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED";
    progressData?: any;
    lastAccessedAt?: string;
    submittedAt?: string;
}

interface FormData {
    id: string;
    title: string;
    description?: string;
    fields: FormField[];
    steps: FormStep[];
    settings: any;
    submissionDeadline?: string;
}

interface Lead {
    id: string;
    name: string;
    email: string;
    phone?: string;
}

interface Institution {
    id: string;
    name: string;
    slug: string;
}

interface FormResponse {
    success: boolean;
    data: {
        access: FormAccess;
        form: FormData;
        lead: Lead;
        institution: Institution;
    };
}

export default function StudentAdmissionFormPage() {
    const params = useParams();
    const accessToken = params.accessToken as string;

    const [formData, setFormData] = useState<FormResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [currentStep, setCurrentStep] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    useEffect(() => {
        if (accessToken) {
            loadFormData();
        }
    }, [accessToken]);

    const loadFormData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/student/form/${accessToken}`);
            const data = await response.json();

            if (data.success) {
                setFormData(data);
                setFormValues(data.data.access.progressData || {});
                setCurrentStep(0);
            } else {
                toast.error(data.message || "Failed to load form");
            }
        } catch (error) {
            console.error("Error loading form:", error);
            toast.error("Failed to load form");
        } finally {
            setLoading(false);
        }
    };

    const saveProgress = async () => {
        if (!formData) return;

        try {
            setSaving(true);
            const response = await fetch(`/api/student/form/${accessToken}/save`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    progressData: formValues,
                    status: "IN_PROGRESS",
                }),
            });

            const data = await response.json();

            if (data.success) {
                setLastSaved(new Date());
                toast.success("Progress saved");
            } else {
                toast.error(data.message || "Failed to save progress");
            }
        } catch (error) {
            console.error("Error saving progress:", error);
            toast.error("Failed to save progress");
        } finally {
            setSaving(false);
        }
    };

    const submitForm = async () => {
        if (!formData) return;

        // Validate required fields
        const validationErrors: Record<string, string> = {};
        formData.data.form.fields.forEach((field) => {
            if (field.required && (!formValues[field.id] || formValues[field.id] === "")) {
                validationErrors[field.id] = `${field.label} is required`;
            }
        });

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            setSubmitting(true);
            const response = await fetch(`/api/student/form/${accessToken}/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    formData: formValues,
                    metadata: {
                        submittedAt: new Date().toISOString(),
                        userAgent: navigator.userAgent,
                    },
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Form submitted successfully!");
                // Reload form data to get updated status
                await loadFormData();
            } else {
                toast.error(data.message || "Failed to submit form");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Failed to submit form");
        } finally {
            setSubmitting(false);
        }
    };

    const handleFieldChange = (fieldId: string, value: any) => {
        setFormValues(prev => ({
            ...prev,
            [fieldId]: value,
        }));

        // Clear error for this field
        if (errors[fieldId]) {
            setErrors(prev => ({
                ...prev,
                [fieldId]: "",
            }));
        }
    };

    const renderField = (field: FormField) => {
        const value = formValues[field.id] || "";
        const error = errors[field.id];

        const fieldProps = {
            id: field.id,
            value: value,
            onChange: (e: any) => handleFieldChange(field.id, e.target.value),
            placeholder: field.placeholder,
            className: error ? "border-red-500" : "",
        };

        switch (field.type) {
            case "text":
            case "email":
            case "tel":
                return (
                    <Input
                        {...fieldProps}
                        type={field.type}
                    />
                );

            case "textarea":
                return (
                    <Textarea
                        {...fieldProps}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    />
                );

            case "select":
                return (
                    <Select value={value} onValueChange={(val) => handleFieldChange(field.id, val)}>
                        <SelectTrigger className={error ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options?.choices?.map((choice: any) => (
                                <SelectItem key={choice.value} value={choice.value}>
                                    {choice.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            case "radio":
                return (
                    <RadioGroup value={value} onValueChange={(val) => handleFieldChange(field.id, val)}>
                        {field.options?.choices?.map((choice: any) => (
                            <div key={choice.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={choice.value} id={`${field.id}-${choice.value}`} />
                                <Label htmlFor={`${field.id}-${choice.value}`}>{choice.label}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                );

            case "checkbox":
                return (
                    <div className="space-y-2">
                        {field.options?.choices?.map((choice: any) => (
                            <div key={choice.value} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`${field.id}-${choice.value}`}
                                    checked={Array.isArray(value) ? value.includes(choice.value) : false}
                                    onCheckedChange={(checked) => {
                                        const currentValues = Array.isArray(value) ? value : [];
                                        if (checked) {
                                            handleFieldChange(field.id, [...currentValues, choice.value]);
                                        } else {
                                            handleFieldChange(field.id, currentValues.filter((v: any) => v !== choice.value));
                                        }
                                    }}
                                />
                                <Label htmlFor={`${field.id}-${choice.value}`}>{choice.label}</Label>
                            </div>
                        ))}
                    </div>
                );

            case "date":
                return (
                    <Input
                        {...fieldProps}
                        type="date"
                    />
                );

            case "number":
                return (
                    <Input
                        {...fieldProps}
                        type="number"
                    />
                );

            default:
                return (
                    <Input
                        {...fieldProps}
                        type="text"
                    />
                );
        }
    };

    const getProgressPercentage = () => {
        if (!formData) return 0;

        const totalFields = formData.data.form.fields.length;
        const filledFields = Object.keys(formValues).filter(
            key => formValues[key] !== "" && formValues[key] !== null && formValues[key] !== undefined
        ).length;

        return Math.round((filledFields / totalFields) * 100);
    };

    const getStatusBadge = () => {
        if (!formData) return null;

        const status = formData.data.access.status;

        switch (status) {
            case "NOT_STARTED":
                return <Badge variant="secondary">Not Started</Badge>;
            case "IN_PROGRESS":
                return <Badge variant="default">In Progress</Badge>;
            case "SUBMITTED":
                return <Badge variant="success" className="bg-green-100 text-green-800">Submitted</Badge>;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Loading form...</p>
                </div>
            </div>
        );
    }

    if (!formData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Alert className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Form not found or access expired. Please check your email for the correct link.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const { access, form, lead, institution } = formData.data;
    const isSubmitted = access.status === "SUBMITTED";

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    {form.title}
                                </CardTitle>
                                <p className="text-gray-600 mt-1">{institution.name}</p>
                            </div>
                            {getStatusBadge()}
                        </div>
                        {form.description && (
                            <p className="text-gray-600">{form.description}</p>
                        )}
                    </CardHeader>
                </Card>

                {/* Progress */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm text-gray-600">{getProgressPercentage()}%</span>
                        </div>
                        <Progress value={getProgressPercentage()} className="mb-4" />

                        {lastSaved && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Last saved: {lastSaved.toLocaleTimeString()}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Student Info */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Student Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{lead.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{lead.email}</span>
                            </div>
                            {lead.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">{lead.phone}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Form */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        {isSubmitted ? (
                            <div className="text-center py-8">
                                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Form Submitted Successfully!</h3>
                                <p className="text-gray-600 mb-4">
                                    Your application has been submitted. Our admission team will review your application and contact you soon.
                                </p>
                                {access.submittedAt && (
                                    <p className="text-sm text-gray-500">
                                        Submitted on: {new Date(access.submittedAt).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={(e) => e.preventDefault()}>
                                <div className="space-y-6">
                                    {form.fields
                                        .sort((a, b) => a.order - b.order)
                                        .map((field) => (
                                            <div key={field.id} className={`${field.width === "half" ? "md:w-1/2" : ""}`}>
                                                <Label htmlFor={field.id} className="text-sm font-medium">
                                                    {field.label}
                                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                                </Label>
                                                {field.description && (
                                                    <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                                                )}
                                                <div className="mt-2">
                                                    {renderField(field)}
                                                </div>
                                                {errors[field.id] && (
                                                    <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p>
                                                )}
                                            </div>
                                        ))}
                                </div>

                                <Separator className="my-6" />

                                <div className="flex items-center justify-between">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={saveProgress}
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <Save className="h-4 w-4 mr-2" />
                                        )}
                                        {saving ? "Saving..." : "Save Progress"}
                                    </Button>

                                    <Button
                                        type="button"
                                        onClick={submitForm}
                                        disabled={submitting}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {submitting ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <Send className="h-4 w-4 mr-2" />
                                        )}
                                        {submitting ? "Submitting..." : "Submit Form"}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {/* Deadline Notice */}
                {form.submissionDeadline && !isSubmitted && (
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-amber-600">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    Submission Deadline: {new Date(form.submissionDeadline).toLocaleDateString()}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
