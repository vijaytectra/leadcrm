"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Phone, Clock, FileText, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface CallLogFormProps {
    tenantSlug: string;
    leadId?: string;
    leadName?: string;
    leadPhone?: string;
    onSave?: (callLog: CallLog) => void;
    onCancel?: () => void;
    initialData?: Partial<CallLog>;
    isEditing?: boolean;
}

interface CallLog {
    id: string;
    leadId: string;
    callType: string;
    status: string;
    outcome?: string;
    duration?: number;
    notes?: string;
    recordingUrl?: string;
    recordingId?: string;
    scheduledAt?: string;
    startedAt?: string;
    endedAt?: string;
    createdAt: string;
}

export function CallLogForm({
    tenantSlug,
    leadId,
    leadName,
    leadPhone,
    onSave,
    onCancel,
    initialData,
    isEditing = false
}: CallLogFormProps) {
    const [formData, setFormData] = useState({
        callType: initialData?.callType || "OUTBOUND",
        status: initialData?.status || "INITIATED",
        outcome: initialData?.outcome || "",
        duration: initialData?.duration || 0,
        notes: initialData?.notes || "",
        recordingUrl: initialData?.recordingUrl || "",
        scheduledAt: initialData?.scheduledAt || "",
        startedAt: initialData?.startedAt || "",
        endedAt: initialData?.endedAt || ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // This would be replaced with actual API call
            // const response = await createCallLog(tenantSlug, {
            //   leadId: leadId || initialData?.leadId,
            //   ...formData
            // });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const callLog: CallLog = {
                id: Date.now().toString(),
                leadId: leadId || initialData?.leadId || "",
                ...formData,
                createdAt: new Date().toISOString()
            };

            onSave?.(callLog);
        } catch (error) {
            console.error("Failed to save call log:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED": return "bg-green-100 text-green-800 border-green-200";
            case "NO_ANSWER": return "bg-red-100 text-red-800 border-red-200";
            case "BUSY": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "CANCELLED": return "bg-gray-100 text-gray-800 border-gray-200";
            default: return "bg-blue-100 text-blue-800 border-blue-200";
        }
    };

    const getOutcomeColor = (outcome: string) => {
        switch (outcome) {
            case "INTERESTED":
            case "QUALIFIED":
                return "bg-green-100 text-green-800 border-green-200";
            case "NOT_INTERESTED":
            case "WRONG_NUMBER":
                return "bg-red-100 text-red-800 border-red-200";
            case "CALLBACK_REQUESTED":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Phone className="h-5 w-5" />
                    <span>{isEditing ? "Edit Call Log" : "Log New Call"}</span>
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

                    {/* Call Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="callType">Call Type</Label>
                            <Select
                                value={formData.callType}
                                onValueChange={(value) => handleInputChange("callType", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INBOUND">Inbound</SelectItem>
                                    <SelectItem value="OUTBOUND">Outbound</SelectItem>
                                    <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
                                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleInputChange("status", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INITIATED">Initiated</SelectItem>
                                    <SelectItem value="RINGING">Ringing</SelectItem>
                                    <SelectItem value="ANSWERED">Answered</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="NO_ANSWER">No Answer</SelectItem>
                                    <SelectItem value="BUSY">Busy</SelectItem>
                                    <SelectItem value="FAILED">Failed</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Outcome and Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="outcome">Outcome</Label>
                            <Select
                                value={formData.outcome}
                                onValueChange={(value) => handleInputChange("outcome", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select outcome" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SUCCESSFUL">Successful</SelectItem>
                                    <SelectItem value="NO_ANSWER">No Answer</SelectItem>
                                    <SelectItem value="BUSY">Busy</SelectItem>
                                    <SelectItem value="WRONG_NUMBER">Wrong Number</SelectItem>
                                    <SelectItem value="NOT_INTERESTED">Not Interested</SelectItem>
                                    <SelectItem value="CALLBACK_REQUESTED">Callback Requested</SelectItem>
                                    <SelectItem value="INTERESTED">Interested</SelectItem>
                                    <SelectItem value="QUALIFIED">Qualified</SelectItem>
                                    <SelectItem value="NOT_QUALIFIED">Not Qualified</SelectItem>
                                    <SelectItem value="FOLLOW_UP_SCHEDULED">Follow-up Scheduled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="duration">Duration (seconds)</Label>
                            <Input
                                id="duration"
                                type="number"
                                value={formData.duration}
                                onChange={(e) => handleInputChange("duration", parseInt(e.target.value) || 0)}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Timing */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="scheduledAt">Scheduled At</Label>
                            <Input
                                id="scheduledAt"
                                type="datetime-local"
                                value={formData.scheduledAt}
                                onChange={(e) => handleInputChange("scheduledAt", e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="startedAt">Started At</Label>
                            <Input
                                id="startedAt"
                                type="datetime-local"
                                value={formData.startedAt}
                                onChange={(e) => handleInputChange("startedAt", e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="endedAt">Ended At</Label>
                            <Input
                                id="endedAt"
                                type="datetime-local"
                                value={formData.endedAt}
                                onChange={(e) => handleInputChange("endedAt", e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleInputChange("notes", e.target.value)}
                            placeholder="Add call notes..."
                            rows={4}
                        />
                    </div>

                    {/* Recording */}
                    <div>
                        <Label htmlFor="recordingUrl">Recording URL</Label>
                        <div className="flex space-x-2">
                            <Input
                                id="recordingUrl"
                                value={formData.recordingUrl}
                                onChange={(e) => handleInputChange("recordingUrl", e.target.value)}
                                placeholder="https://example.com/recording.mp3"
                            />
                            <Button type="button" variant="outline" size="sm">
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                            </Button>
                        </div>
                    </div>

                    {/* Status Preview */}
                    {(formData.status || formData.outcome) && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                            <div className="flex flex-wrap gap-2">
                                {formData.status && (
                                    <Badge className={getStatusColor(formData.status)}>
                                        {formData.status.replace("_", " ")}
                                    </Badge>
                                )}
                                {formData.outcome && (
                                    <Badge className={getOutcomeColor(formData.outcome)}>
                                        {formData.outcome.replace("_", " ")}
                                    </Badge>
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
                            {isSubmitting ? "Saving..." : isEditing ? "Update Call Log" : "Save Call Log"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}