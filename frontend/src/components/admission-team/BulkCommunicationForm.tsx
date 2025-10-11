"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    MessageSquare,
    Users,
    Mail,
    Phone,
    Send,
    Plus,
    X
} from "lucide-react";
import { Application } from "@/lib/api/admissions";

interface BulkCommunicationFormProps {
    applications: Application[];
    onSend: (data: {
        applicationIds: string[];
        type: 'EMAIL' | 'SMS' | 'WHATSAPP';
        subject?: string;
        message: string;
        templateId?: string;
    }) => Promise<void>;
    isLoading?: boolean;
}

export function BulkCommunicationForm({
    applications,
    onSend,
    isLoading = false
}: BulkCommunicationFormProps) {
    const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        type: 'EMAIL' as 'EMAIL' | 'SMS' | 'WHATSAPP',
        subject: '',
        message: '',
        templateId: '',
    });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedApplications.length === 0) {
            alert('Please select at least one application');
            return;
        }
        if (!formData.message.trim()) {
            alert('Please enter a message');
            return;
        }
        await onSend({
            applicationIds: selectedApplications,
            type: formData.type,
            subject: formData.subject || undefined,
            message: formData.message,
            templateId: formData.templateId || undefined,
        });
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'EMAIL':
                return <Mail className="h-4 w-4" />;
            case 'SMS':
                return <MessageSquare className="h-4 w-4" />;
            case 'WHATSAPP':
                return <Phone className="h-4 w-4" />;
            default:
                return <MessageSquare className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Send Bulk Communication
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="type">Communication Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value: 'EMAIL' | 'SMS' | 'WHATSAPP') =>
                                        setFormData(prev => ({ ...prev, type: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EMAIL">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                Email
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="SMS">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="h-4 w-4" />
                                                SMS
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="WHATSAPP">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                WhatsApp
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="templateId">Template (Optional)</Label>
                                <Select
                                    value={formData.templateId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, templateId: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">No template</SelectItem>
                                        <SelectItem value="welcome">Welcome Message</SelectItem>
                                        <SelectItem value="reminder">Reminder</SelectItem>
                                        <SelectItem value="update">Status Update</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {formData.type === 'EMAIL' && (
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    value={formData.subject}
                                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                    placeholder="Enter email subject"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                value={formData.message}
                                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="Enter your message here..."
                                rows={6}
                            />
                            <div className="text-sm text-muted-foreground">
                                Available variables: {`{studentName}`, `{course}`, `{applicationId}`}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={isLoading || selectedApplications.length === 0}>
                                {isLoading ? 'Sending...' : `Send to ${selectedApplications.length} applications`}
                            </Button>
                            <Button type="button" variant="outline">
                                Save as Draft
                            </Button>
                        </div>
                    </form>
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
                                {selectedApplications.length === applications.length ? 'Deselect All' : 'Select All'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {applications.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No applications available
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {applications.map((application) => (
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

            {/* Preview */}
            {selectedApplications.length > 0 && formData.message && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {getTypeIcon(formData.type)}
                            Preview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {formData.type === 'EMAIL' && formData.subject && (
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-1">Subject:</div>
                                    <div className="p-2 bg-gray-50 rounded text-sm">
                                        {formData.subject}
                                    </div>
                                </div>
                            )}
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Message:</div>
                                <div className="p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">
                                    {formData.message}
                                </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                This message will be sent to {selectedApplications.length} application{selectedApplications.length !== 1 ? 's' : ''}.
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
