"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    FileText,
    Users,
    Send,
    CheckCircle,
    Clock,
    AlertCircle
} from "lucide-react";
import { Application, OfferLetterTemplate } from "@/lib/api/admissions";

interface BulkOfferGeneratorProps {
    applications: Application[];
    templates: OfferLetterTemplate[];
    onGenerate: (data: {
        applicationIds: string[];
        templateId?: string;
    }) => Promise<void>;
    isLoading?: boolean;
}

export function BulkOfferGenerator({
    applications,
    templates,
    onGenerate,
    isLoading = false
}: BulkOfferGeneratorProps) {
    const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');

    const handleApplicationToggle = (applicationId: string) => {
        setSelectedApplications(prev =>
            prev.includes(applicationId)
                ? prev.filter(id => id !== applicationId)
                : [...prev, applicationId]
        );
    };

    const handleSelectAll = () => {
        if (selectedApplications.length === applications.length) {
            setSelectedApplications([]);
        } else {
            setSelectedApplications(applications.map(app => app.id));
        }
    };

    const handleGenerate = async () => {
        if (selectedApplications.length === 0) {
            alert('Please select at least one application');
            return;
        }
        await onGenerate({
            applicationIds: selectedApplications,
            templateId: selectedTemplate || undefined,
        });
    };

    const approvedApplications = applications.filter(app =>
        app.admissionReview?.decision === 'APPROVED'
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            case 'WAITLISTED':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Bulk Offer Generation</h2>
                    <p className="text-muted-foreground">
                        Generate offer letters for multiple approved applications
                    </p>
                </div>
                <div className="text-sm text-muted-foreground">
                    {approvedApplications.length} approved applications
                </div>
            </div>

            {/* Template Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Template Selection
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="template">Select Template</Label>
                            <Select
                                value={selectedTemplate}
                                onValueChange={setSelectedTemplate}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a template" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">No template (use default)</SelectItem>
                                    {templates.map((template) => (
                                        <SelectItem key={template.id} value={template.id}>
                                            <div className="flex items-center gap-2">
                                                <span>{template.name}</span>
                                                {template.isActive && (
                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedTemplate && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <div className="text-sm text-blue-800">
                                    <strong>Selected Template:</strong> {
                                        templates.find(t => t.id === selectedTemplate)?.name
                                    }
                                </div>
                                <div className="text-xs text-blue-600 mt-1">
                                    {templates.find(t => t.id === selectedTemplate)?.description}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Application Selection */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Select Applications ({selectedApplications.length} selected)
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleSelectAll}>
                                {selectedApplications.length === approvedApplications.length ? 'Deselect All' : 'Select All'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {approvedApplications.length === 0 ? (
                        <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No approved applications</h3>
                            <p className="text-muted-foreground">
                                There are no approved applications available for offer letter generation.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {approvedApplications.map((application) => (
                                <div
                                    key={application.id}
                                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                                >
                                    <Checkbox
                                        id={application.id}
                                        checked={selectedApplications.includes(application.id)}
                                        onCheckedChange={() => handleApplicationToggle(application.id)}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label
                                                    htmlFor={application.id}
                                                    className="font-medium cursor-pointer"
                                                >
                                                    {application.studentName}
                                                </label>
                                                <div className="text-sm text-muted-foreground">
                                                    {application.course} • {application.studentEmail}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.admissionReview?.decision || '')}`}>
                                                        {application.admissionReview?.decision || 'No decision'}
                                                    </span>
                                                    {application.admissionReview?.academicScore && (
                                                        <span className="text-xs text-muted-foreground">
                                                            Score: {application.admissionReview.academicScore}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {new Date(application.submittedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Generation Summary */}
            {selectedApplications.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Generation Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="text-center p-4 border rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {selectedApplications.length}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Applications Selected
                                    </div>
                                </div>
                                <div className="text-center p-4 border rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {selectedApplications.length}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Offer Letters to Generate
                                    </div>
                                </div>
                                <div className="text-center p-4 border rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {selectedTemplate ? 'Custom' : 'Default'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Template Type
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-2 text-yellow-800">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-medium">Estimated Time:</span>
                                    <span>{Math.ceil(selectedApplications.length * 0.5)} minutes</span>
                                </div>
                                <div className="text-sm text-yellow-700 mt-1">
                                    This process will generate offer letters for all selected applications.
                                    You can review and edit them before sending.
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Actions */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        <Button
                            onClick={handleGenerate}
                            disabled={isLoading || selectedApplications.length === 0}
                            className="flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Clock className="h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Generate {selectedApplications.length} Offer Letters
                                </>
                            )}
                        </Button>
                        <Button variant="outline" disabled={isLoading}>
                            Save as Draft
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
