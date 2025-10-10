"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FollowUpFormProps {
    tenantSlug: string;
    leadId?: string;
    leadName?: string;
    leadPhone?: string;
    onSave?: (followUp: FollowUpReminder) => void;
    onCancel?: () => void;
    initialData?: Partial<FollowUpReminder>;
    isEditing?: boolean;
}

interface FollowUpReminder {
    id: string;
    leadId: string;
    type: string;
    priority: string;
    scheduledAt: string;
    notes: string;
    status: string;
    createdAt: string;
}

export function FollowUpForm({
    tenantSlug,
    leadId,
    leadName,
    leadPhone,
    onSave,
    onCancel,
    initialData,
    isEditing = false
}: FollowUpFormProps) {
    const [formData, setFormData] = useState({
        type: initialData?.type || "CALL",
        priority: initialData?.priority || "MEDIUM",
        scheduledAt: initialData?.scheduledAt || "",
        notes: initialData?.notes || ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // This would be replaced with actual API call
            // const response = await createFollowUpReminder(tenantSlug, {
            //   leadId: leadId || initialData?.leadId,
            //   ...formData
            // });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const followUp: FollowUpReminder = {
                id: Date.now().toString(),
                leadId: leadId || initialData?.leadId || "",
                ...formData,
                status: "PENDING",
                createdAt: new Date().toISOString()
            };

            onSave?.(followUp);
        } catch (error) {
            console.error("Failed to save follow-up:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "URGENT": return "bg-red-100 text-red-800 border-red-200";
            case "HIGH": return "bg-orange-100 text-orange-800 border-orange-200";
            case "MEDIUM": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "LOW": return "bg-green-100 text-green-800 border-green-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "CALL": return "📞";
            case "EMAIL": return "📧";
            case "SMS": return "💬";
            case "WHATSAPP": return "💚";
            case "MEETING": return "🤝";
            default: return "📋";
        }
    };

    const isOverdue = (scheduledAt: string) => {
        return new Date(scheduledAt) < new Date();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>{isEditing ? "Edit Follow-up" : "Schedule Follow-up"}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Lead Information */}
                    {leadName && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Lead Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm text-gray-600">Name</Label>
                                    <div className="text-sm font-medium text-gray-900">{leadName}</div>
                                </div>
                                <div>
                                    <Label className="text-sm text-gray-600">Phone</Label>
                                    <div className="text-sm font-medium text-gray-900">{leadPhone}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Follow-up Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="type">Follow-up Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => handleInputChange("type", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CALL">📞 Call</SelectItem>
                                    <SelectItem value="EMAIL">📧 Email</SelectItem>
                                    <SelectItem value="SMS">💬 SMS</SelectItem>
                                    <SelectItem value="WHATSAPP">💚 WhatsApp</SelectItem>
                                    <SelectItem value="MEETING">🤝 Meeting</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) => handleInputChange("priority", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">🟢 Low</SelectItem>
                                    <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                                    <SelectItem value="HIGH">🟠 High</SelectItem>
                                    <SelectItem value="URGENT">🔴 Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Scheduled Time */}
                    <div>
                        <Label htmlFor="scheduledAt">Scheduled Date & Time</Label>
                        <Input
                            id="scheduledAt"
                            type="datetime-local"
                            value={formData.scheduledAt}
                            onChange={(e) => handleInputChange("scheduledAt", e.target.value)}
                            required
                        />
                        {formData.scheduledAt && isOverdue(formData.scheduledAt) && (
                            <div className="flex items-center space-x-2 mt-2 text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">This follow-up is overdue</span>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleInputChange("notes", e.target.value)}
                            placeholder="Add follow-up notes..."
                            rows={4}
                        />
                    </div>

                    {/* Preview */}
                    {formData.type && formData.priority && formData.scheduledAt && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-3">Preview</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-lg">{getTypeIcon(formData.type)}</span>
                                        <span className="font-medium">{formData.type}</span>
                                    </div>
                                    <Badge className={getPriorityColor(formData.priority)}>
                                        {formData.priority}
                                    </Badge>
                                </div>

                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                        {new Date(formData.scheduledAt).toLocaleString()}
                                        {isOverdue(formData.scheduledAt) && (
                                            <span className="text-red-600 ml-2">(Overdue)</span>
                                        )}
                                    </span>
                                </div>

                                {formData.notes && (
                                    <div className="flex items-start space-x-2 text-sm text-gray-600">
                                        <FileText className="h-4 w-4 mt-0.5" />
                                        <span>{formData.notes}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isSubmitting ? "Saving..." : isEditing ? "Update Follow-up" : "Schedule Follow-up"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}