"use client";

import { memo, useCallback, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Save,
    X,
    User,
    Phone,
    Mail,
    AlertCircle,
    CheckCircle,
    Clock
} from "lucide-react";

interface LeadStatusUpdateProps {
    tenantSlug: string;
    leadId: string;
    onClose: () => void;
}

interface Lead {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    status: string;
    source?: string;
    score: number;
}

export const LeadStatusUpdate = memo(function LeadStatusUpdate({
    tenantSlug,
    leadId,
    onClose
}: LeadStatusUpdateProps) {
    const [loading, setLoading] = useState(false);
    const [lead, setLead] = useState<Lead | null>(null);
    const [fetchingLead, setFetchingLead] = useState(true);

    const [formData, setFormData] = useState({
        status: "",
        notes: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const fetchLead = useCallback(async () => {
        try {
            setFetchingLead(true);
            // This would be replaced with actual API call
            // const response = await getLead(tenantSlug, leadId);
            // setLead(response.data);
            // setFormData(prev => ({ ...prev, status: response.data.status }));

            // Mock data for now
            setLead({
                id: leadId,
                name: "Sample Lead",
                phone: "+1234567890",
                email: "sample@example.com",
                status: "NEW",
                source: "Website",
                score: 75
            });
            setFormData(prev => ({ ...prev, status: "NEW" }));
        } catch (error) {
            console.error("Failed to fetch lead:", error);
        } finally {
            setFetchingLead(false);
        }
    }, [tenantSlug, leadId]);

    useEffect(() => {
        fetchLead();
    }, [fetchLead]);

    const handleInputChange = useCallback((field: string, value: string) => {
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

    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {};

        if (!formData.status) {
            newErrors.status = "Please select a status";
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
            // await updateLeadStatus(tenantSlug, leadId, formData);
            console.log("Updating lead status:", formData);

            // Close modal on success
            onClose();
        } catch (error) {
            console.error("Failed to update lead status:", error);
        } finally {
            setLoading(false);
        }
    }, [formData, validateForm, tenantSlug, leadId, onClose]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "NEW": return "bg-blue-100 text-blue-800";
            case "CONTACTED": return "bg-yellow-100 text-yellow-800";
            case "QUALIFIED": return "bg-green-100 text-green-800";
            case "INTERESTED": return "bg-purple-100 text-purple-800";
            case "APPLICATION_STARTED": return "bg-indigo-100 text-indigo-800";
            case "DOCUMENTS_SUBMITTED": return "bg-cyan-100 text-cyan-800";
            case "UNDER_REVIEW": return "bg-orange-100 text-orange-800";
            case "ADMITTED": return "bg-emerald-100 text-emerald-800";
            case "ENROLLED": return "bg-green-100 text-green-800";
            case "REJECTED": return "bg-red-100 text-red-800";
            case "LOST": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "NEW": return <AlertCircle className="h-4 w-4 text-blue-500" />;
            case "CONTACTED": return <Phone className="h-4 w-4 text-yellow-500" />;
            case "QUALIFIED": return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "INTERESTED": return <CheckCircle className="h-4 w-4 text-purple-500" />;
            case "APPLICATION_STARTED": return <Clock className="h-4 w-4 text-indigo-500" />;
            case "DOCUMENTS_SUBMITTED": return <Clock className="h-4 w-4 text-cyan-500" />;
            case "UNDER_REVIEW": return <Clock className="h-4 w-4 text-orange-500" />;
            case "ADMITTED": return <CheckCircle className="h-4 w-4 text-emerald-500" />;
            case "ENROLLED": return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "REJECTED": return <X className="h-4 w-4 text-red-500" />;
            case "LOST": return <X className="h-4 w-4 text-gray-500" />;
            default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusDescription = (status: string) => {
        switch (status) {
            case "NEW": return "Fresh lead, no contact made yet";
            case "CONTACTED": return "Initial contact has been made";
            case "QUALIFIED": return "Lead meets basic qualification criteria";
            case "INTERESTED": return "Lead has shown interest in the program";
            case "APPLICATION_STARTED": return "Lead has begun the application process";
            case "DOCUMENTS_SUBMITTED": return "Required documents have been submitted";
            case "UNDER_REVIEW": return "Application is being reviewed by admission team";
            case "ADMITTED": return "Lead has been admitted to the program";
            case "ENROLLED": return "Lead has completed enrollment";
            case "REJECTED": return "Application has been rejected";
            case "LOST": return "Lead is no longer interested or qualified";
            default: return "Unknown status";
        }
    };

    if (fetchingLead) {
        return (
            <Dialog open={true} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <div className="flex items-center justify-center h-32">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p>Loading lead details...</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!lead) {
        return (
            <Dialog open={true} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                        <h3 className="text-lg font-semibold mb-2">Lead not found</h3>
                        <p className="text-muted-foreground mb-4">
                            The lead you're trying to update could not be found.
                        </p>
                        <Button onClick={onClose}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Update Lead Status</DialogTitle>
                    <DialogDescription>
                        Change the status of this lead and add notes about the update
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Lead Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Lead Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Name</Label>
                                    <p className="text-sm">{lead.name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Phone</Label>
                                    <p className="text-sm">{lead.phone || "No phone"}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Email</Label>
                                    <p className="text-sm">{lead.email || "No email"}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Source</Label>
                                    <p className="text-sm">{lead.source || "Unknown"}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Current Status</Label>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(lead.status)}
                                        <Badge className={getStatusColor(lead.status)}>
                                            {lead.status}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Lead Score</Label>
                                    <p className="text-sm font-bold">{lead.score}/100</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status Update */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">New Status *</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleInputChange("status", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select new status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NEW">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-blue-500" />
                                            <div>
                                                <div className="font-medium">New</div>
                                                <div className="text-xs text-muted-foreground">Fresh lead, no contact made yet</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="CONTACTED">
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-yellow-500" />
                                            <div>
                                                <div className="font-medium">Contacted</div>
                                                <div className="text-xs text-muted-foreground">Initial contact has been made</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="QUALIFIED">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <div>
                                                <div className="font-medium">Qualified</div>
                                                <div className="text-xs text-muted-foreground">Lead meets basic qualification criteria</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="INTERESTED">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-purple-500" />
                                            <div>
                                                <div className="font-medium">Interested</div>
                                                <div className="text-xs text-muted-foreground">Lead has shown interest in the program</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="APPLICATION_STARTED">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-indigo-500" />
                                            <div>
                                                <div className="font-medium">Application Started</div>
                                                <div className="text-xs text-muted-foreground">Lead has begun the application process</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="DOCUMENTS_SUBMITTED">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-cyan-500" />
                                            <div>
                                                <div className="font-medium">Documents Submitted</div>
                                                <div className="text-xs text-muted-foreground">Required documents have been submitted</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="UNDER_REVIEW">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-orange-500" />
                                            <div>
                                                <div className="font-medium">Under Review</div>
                                                <div className="text-xs text-muted-foreground">Application is being reviewed by admission team</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="ADMITTED">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                                            <div>
                                                <div className="font-medium">Admitted</div>
                                                <div className="text-xs text-muted-foreground">Lead has been admitted to the program</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="ENROLLED">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <div>
                                                <div className="font-medium">Enrolled</div>
                                                <div className="text-xs text-muted-foreground">Lead has completed enrollment</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="REJECTED">
                                        <div className="flex items-center gap-2">
                                            <X className="h-4 w-4 text-red-500" />
                                            <div>
                                                <div className="font-medium">Rejected</div>
                                                <div className="text-xs text-muted-foreground">Application has been rejected</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="LOST">
                                        <div className="flex items-center gap-2">
                                            <X className="h-4 w-4 text-gray-500" />
                                            <div>
                                                <div className="font-medium">Lost</div>
                                                <div className="text-xs text-muted-foreground">Lead is no longer interested or qualified</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <p className="text-sm text-red-600">{errors.status}</p>
                            )}
                        </div>

                        {/* Status Preview */}
                        {formData.status && (
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(formData.status)}
                                        <div>
                                            <div className="font-medium">New Status: {formData.status}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {getStatusDescription(formData.status)}
                                            </div>
                                        </div>
                                        <Badge className={getStatusColor(formData.status)}>
                                            {formData.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Update Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Update Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Enter details about the status change, conversation summary, next steps..."
                            value={formData.notes}
                            onChange={(e) => handleInputChange("notes", e.target.value)}
                            rows={4}
                        />
                        <p className="text-xs text-muted-foreground">
                            These notes will be added to the lead's activity history
                        </p>
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
                            {loading ? "Updating..." : "Update Status"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
});
