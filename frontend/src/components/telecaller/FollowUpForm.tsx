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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Calendar as CalendarIcon,
    Clock,
    Save,
    X,
    Phone,
    Mail,
    MessageSquare,
    Video,
    AlertCircle
} from "lucide-react";
import { format } from "date-fns";

interface FollowUpFormProps {
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

export const FollowUpForm = memo(function FollowUpForm({
    tenantSlug,
    leadId,
    onClose
}: FollowUpFormProps) {
    const [loading, setLoading] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [selectedTime, setSelectedTime] = useState("");

    const [formData, setFormData] = useState({
        leadId: leadId || "",
        type: "CALL",
        priority: "MEDIUM",
        scheduledAt: "",
        notes: "",
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

    const handleLeadSelect = useCallback((leadId: string) => {
        const lead = leads.find(l => l.id === leadId);
        if (lead) {
            setSelectedLead(lead);
            setFormData(prev => ({ ...prev, leadId }));
        }
    }, [leads]);

    const handleDateSelect = useCallback((date: Date | undefined) => {
        setSelectedDate(date);
        if (date && selectedTime) {
            const [hours, minutes] = selectedTime.split(':');
            const scheduledDateTime = new Date(date);
            scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));
            setFormData(prev => ({
                ...prev,
                scheduledAt: scheduledDateTime.toISOString()
            }));
        }
    }, [selectedTime]);

    const handleTimeChange = useCallback((time: string) => {
        setSelectedTime(time);
        if (selectedDate && time) {
            const [hours, minutes] = time.split(':');
            const scheduledDateTime = new Date(selectedDate);
            scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));
            setFormData(prev => ({
                ...prev,
                scheduledAt: scheduledDateTime.toISOString()
            }));
        }
    }, [selectedDate]);

    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {};

        if (!formData.leadId) {
            newErrors.leadId = "Please select a lead";
        }
        if (!formData.type) {
            newErrors.type = "Please select follow-up type";
        }
        if (!formData.scheduledAt) {
            newErrors.scheduledAt = "Please select date and time";
        }
        if (new Date(formData.scheduledAt) < new Date()) {
            newErrors.scheduledAt = "Scheduled time cannot be in the past";
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
            // await createFollowUpReminder(tenantSlug, formData);
            console.log("Creating follow-up reminder:", formData);

            // Close modal on success
            onClose();
        } catch (error) {
            console.error("Failed to create follow-up reminder:", error);
        } finally {
            setLoading(false);
        }
    }, [formData, validateForm, tenantSlug, onClose]);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "CALL":
                return <Phone className="h-4 w-4 text-blue-500" />;
            case "EMAIL":
                return <Mail className="h-4 w-4 text-green-500" />;
            case "SMS":
            case "WHATSAPP":
                return <MessageSquare className="h-4 w-4 text-purple-500" />;
            case "MEETING":
                return <Video className="h-4 w-4 text-orange-500" />;
            default:
                return <CalendarIcon className="h-4 w-4 text-gray-500" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "URGENT":
                return "bg-red-100 text-red-800";
            case "HIGH":
                return "bg-orange-100 text-orange-800";
            case "MEDIUM":
                return "bg-yellow-100 text-yellow-800";
            case "LOW":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Schedule Follow-up</DialogTitle>
                    <DialogDescription>
                        Create a reminder for future follow-up activities
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

                    {/* Follow-up Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Follow-up Type *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => handleInputChange("type", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CALL">
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            Call
                                        </div>
                                    </SelectItem>
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
                                            <MessageSquare className="h-4 w-4" />
                                            WhatsApp
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="MEETING">
                                        <div className="flex items-center gap-2">
                                            <Video className="h-4 w-4" />
                                            Meeting
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && (
                                <p className="text-sm text-red-600">{errors.type}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) => handleInputChange("priority", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            Low
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="MEDIUM">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                            Medium
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="HIGH">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                            High
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="URGENT">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                            Urgent
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Date and Time Selection */}
                    <div className="space-y-4">
                        <Label>Schedule Date & Time *</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={handleDateSelect}
                                            disabled={(date) => date < new Date()}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label>Time</Label>
                                <Input
                                    type="time"
                                    value={selectedTime}
                                    onChange={(e) => handleTimeChange(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        </div>
                        {errors.scheduledAt && (
                            <p className="text-sm text-red-600">{errors.scheduledAt}</p>
                        )}
                    </div>

                    {/* Follow-up Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Follow-up Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Enter details about the follow-up, what to discuss, objectives..."
                            value={formData.notes}
                            onChange={(e) => handleInputChange("notes", e.target.value)}
                            rows={4}
                        />
                    </div>

                    {/* Preview */}
                    {formData.scheduledAt && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Follow-up Preview</CardTitle>
                                <CardDescription>Review your scheduled follow-up</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        {getTypeIcon(formData.type)}
                                        <span className="font-medium">{formData.type}</span>
                                        <Badge className={getPriorityColor(formData.priority)}>
                                            {formData.priority}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>
                                            {new Date(formData.scheduledAt).toLocaleString()}
                                        </span>
                                    </div>
                                    {formData.notes && (
                                        <div className="text-sm">
                                            <span className="font-medium">Notes: </span>
                                            <span>{formData.notes}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

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
                            {loading ? "Saving..." : "Schedule Follow-up"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
});
