"use client";

import { memo, useCallback, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Phone,
    Clock,
    Upload,
    Save,
    X,
    Play,
    Pause,
    Square
} from "lucide-react";

interface CallLogFormProps {
    tenantSlug: string;
    leadId?: string | null;
    onClose: () => void;
}

interface Lead {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    status: string;
}

export const CallLogForm = memo(function CallLogForm({
    tenantSlug,
    leadId,
    onClose
}: CallLogFormProps) {
    const [loading, setLoading] = useState(false);
    const [recording, setRecording] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);

    const [formData, setFormData] = useState({
        leadId: leadId || "",
        callType: "OUTBOUND",
        status: "INITIATED",
        duration: 0,
        outcome: "",
        notes: "",
        recordingUrl: "",
        recordingId: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const fetchLeads = useCallback(async () => {
        try {
            // This would be replaced with actual API call
            // const response = await getLeads(tenantSlug);
            // setLeads(response.data.leads);
            setLeads([]);
        } catch (error) {
            console.error("Failed to fetch leads:", error);
        }
    }, [tenantSlug]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    useEffect(() => {
        if (leadId && leads.length > 0) {
            const lead = leads.find(l => l.id === leadId);
            if (lead) {
                setSelectedLead(lead);
                setFormData(prev => ({ ...prev, leadId }));
            }
        }
    }, [leadId, leads]);

    const handleInputChange = useCallback((field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ""
            }));
        }
    }, [errors]);

    const handleLeadSelect = useCallback((leadId: string) => {
        const lead = leads.find(l => l.id === leadId);
        if (lead) {
            setSelectedLead(lead);
            setFormData(prev => ({ ...prev, leadId }));
        }
    }, [leads]);

    const startRecording = useCallback(() => {
        setRecording(true);
        setCallDuration(0);
        // Start timer
        const interval = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);

        // Store interval ID for cleanup
        (window as any).callTimer = interval;
    }, []);

    const stopRecording = useCallback(() => {
        setRecording(false);
        if ((window as any).callTimer) {
            clearInterval((window as any).callTimer);
        }
        setFormData(prev => ({ ...prev, duration: callDuration }));
    }, [callDuration]);

    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {};

        if (!formData.leadId) {
            newErrors.leadId = "Please select a lead";
        }
        if (!formData.status) {
            newErrors.status = "Please select call status";
        }
        if (formData.status === "COMPLETED" && !formData.outcome) {
            newErrors.outcome = "Please select call outcome";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // This would be replaced with actual API call
            // await createCallLog(tenantSlug, formData);
            console.log("Creating call log:", formData);

            // Close modal on success
            onClose();
        } catch (error) {
            console.error("Failed to create call log:", error);
        } finally {
            setLoading(false);
        }
    }, [formData, validateForm, tenantSlug, onClose]);

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Log Call</DialogTitle>
                    <DialogDescription>
                        Record call details and outcomes for lead follow-up
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Lead Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="leadId">Select Lead *</Label>
                        <Select
                            value={formData.leadId}
                            onValueChange={handleLeadSelect}
                            disabled={!!leadId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a lead" />
                            </SelectTrigger>
                            <SelectContent>
                                {leads.map((lead) => (
                                    <SelectItem key={lead.id} value={lead.id}>
                                        <div className="flex items-center gap-2">
                                            <span>{lead.name}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {lead.status}
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.leadId && (
                            <p className="text-sm text-red-600">{errors.leadId}</p>
                        )}
                    </div>

                    {/* Selected Lead Info */}
                    {selectedLead && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Lead Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium">Name</Label>
                                        <p className="text-sm">{selectedLead.name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Phone</Label>
                                        <p className="text-sm">{selectedLead.phone || "No phone"}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Email</Label>
                                        <p className="text-sm">{selectedLead.email || "No email"}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Status</Label>
                                        <Badge variant="outline">{selectedLead.status}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Call Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="callType">Call Type *</Label>
                            <Select
                                value={formData.callType}
                                onValueChange={(value) => handleInputChange("callType", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="OUTBOUND">Outbound</SelectItem>
                                    <SelectItem value="INBOUND">Inbound</SelectItem>
                                    <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
                                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Call Status *</Label>
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
                            {errors.status && (
                                <p className="text-sm text-red-600">{errors.status}</p>
                            )}
                        </div>
                    </div>

                    {/* Call Outcome */}
                    {formData.status === "COMPLETED" && (
                        <div className="space-y-2">
                            <Label htmlFor="outcome">Call Outcome *</Label>
                            <Select
                                value={formData.outcome}
                                onValueChange={(value) => handleInputChange("outcome", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select outcome" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SUCCESSFUL">Successful</SelectItem>
                                    <SelectItem value="INTERESTED">Interested</SelectItem>
                                    <SelectItem value="QUALIFIED">Qualified</SelectItem>
                                    <SelectItem value="NOT_INTERESTED">Not Interested</SelectItem>
                                    <SelectItem value="NOT_QUALIFIED">Not Qualified</SelectItem>
                                    <SelectItem value="CALLBACK_REQUESTED">Callback Requested</SelectItem>
                                    <SelectItem value="WRONG_NUMBER">Wrong Number</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.outcome && (
                                <p className="text-sm text-red-600">{errors.outcome}</p>
                            )}
                        </div>
                    )}

                    {/* Call Duration */}
                    <div className="space-y-2">
                        <Label>Call Duration</Label>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span className="font-mono text-lg">
                                    {formatDuration(callDuration)}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                {!recording ? (
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={startRecording}
                                        className="flex items-center gap-2"
                                    >
                                        <Play className="h-4 w-4" />
                                        Start Timer
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        onClick={stopRecording}
                                        className="flex items-center gap-2"
                                    >
                                        <Square className="h-4 w-4" />
                                        Stop Timer
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Call Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Call Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Enter call details, conversation summary, next steps..."
                            value={formData.notes}
                            onChange={(e) => handleInputChange("notes", e.target.value)}
                            rows={4}
                        />
                    </div>

                    {/* Recording Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="recording">Call Recording (Optional)</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                id="recording"
                                type="file"
                                accept="audio/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        // Handle file upload
                                        console.log("Recording file:", file);
                                    }
                                }}
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Upload className="h-4 w-4" />
                                Upload
                            </Button>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            {loading ? "Saving..." : "Save Call Log"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
});
