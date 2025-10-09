"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateLeadRequest, Lead } from "@/lib/api/leads";
import { X, User, Mail, Phone, Tag, Target, Users, FileText } from "lucide-react";

interface LeadFormProps {
    lead?: Lead | null;
    users: Array<{ id: string; firstName: string; lastName: string; email: string; role: string }>;
    onSave: (data: CreateLeadRequest) => void;
    onClose: () => void;
}

export const LeadForm = memo(function LeadForm({ lead, users, onSave, onClose }: LeadFormProps) {
    const [formData, setFormData] = useState<CreateLeadRequest>({
        name: "",
        email: "",
        phone: "",
        source: "",
        status: "NEW",
        score: 0,
        assigneeId: "unassigned",
        notes: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (lead) {
            setFormData({
                name: lead.name,
                email: lead.email || "",
                phone: lead.phone || "",
                source: lead.source || "",
                status: lead.status,
                score: lead.score,
                assigneeId: lead.assigneeId || "unassigned",
                notes: "",
            });
        }
    }, [lead]);

    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
            newErrors.phone = "Please enter a valid phone number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Convert "unassigned" back to empty string for API
            const dataToSave = {
                ...formData,
                assigneeId: formData.assigneeId === "unassigned" ? "" : formData.assigneeId
            };
            await onSave(dataToSave);
        } catch (error) {
            console.error("Error saving lead:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = useCallback((field: keyof CreateLeadRequest, value: string | number) => {
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

    const telecallers = users.filter(user => user.role === "TELECALLER");

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white shadow-2xl">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-semibold text-white flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            {lead ? "Edit Lead" : "Create New Lead"}
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-white hover:bg-white/10"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </CardHeader>

                <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <User className="w-5 h-5 mr-2 text-blue-600" />
                                    Basic Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                            Full Name *
                                        </Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleChange("name", e.target.value)}
                                            className={`transition-all text-black ${errors.name ? 'border-red-300 focus:border-red-500' : 'focus:border-blue-500'}`}
                                            placeholder="Enter full name"
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                            Email Address
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleChange("email", e.target.value)}
                                                className={`pl-10 transition-all text-black ${errors.email ? 'border-red-300 focus:border-red-500' : 'focus:border-blue-500'}`}
                                                placeholder="Enter email address"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                                            Phone Number
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="phone"
                                                value={formData.phone}
                                                onChange={(e) => handleChange("phone", e.target.value)}
                                                className={`pl-10 transition-all text-black ${errors.phone ? 'border-red-300 focus:border-red-500' : 'focus:border-blue-500'}`}
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="text-sm text-red-600">{errors.phone}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="source" className="text-sm font-medium text-gray-700">
                                            Lead Source
                                        </Label>
                                        <div className="relative">
                                            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="source"
                                                value={formData.source}
                                                onChange={(e) => handleChange("source", e.target.value)}
                                                className="pl-10 focus:border-blue-500 text-black"
                                                placeholder="e.g., Google Ads, Facebook, Referral"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lead Status & Assignment */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Target className="w-5 h-5 mr-2 text-green-600" />
                                    Status & Assignment
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                                            Lead Status
                                        </Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) => handleChange("status", value)}
                                        >
                                            <SelectTrigger className="focus:border-blue-500 text-black hover:bg-transparent hover:text-black">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="NEW">🆕 New</SelectItem>
                                                <SelectItem value="CONTACTED">📞 Contacted</SelectItem>
                                                <SelectItem value="QUALIFIED">✅ Qualified</SelectItem>
                                                <SelectItem value="INTERESTED">💡 Interested</SelectItem>
                                                <SelectItem value="APPLICATION_STARTED">📝 Application Started</SelectItem>
                                                <SelectItem value="DOCUMENTS_SUBMITTED">📄 Documents Submitted</SelectItem>
                                                <SelectItem value="UNDER_REVIEW">🔍 Under Review</SelectItem>
                                                <SelectItem value="ADMITTED">🎓 Admitted</SelectItem>
                                                <SelectItem value="ENROLLED">📚 Enrolled</SelectItem>
                                                <SelectItem value="REJECTED">❌ Rejected</SelectItem>
                                                <SelectItem value="LOST">💔 Lost</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="score" className="text-sm font-medium text-gray-700">
                                            Lead Score (0-100)
                                        </Label>
                                        <Input
                                            id="score"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={formData.score}
                                            onChange={(e) => handleChange("score", parseInt(e.target.value) || 0)}
                                            className="focus:border-blue-500 text-black"
                                            placeholder="0"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="assignee" className="text-sm font-medium text-gray-700">
                                            Assign to Telecaller
                                        </Label>
                                        <Select
                                            value={formData.assigneeId}
                                            onValueChange={(value) => handleChange("assigneeId", value)}
                                        >
                                            <SelectTrigger className="focus:border-blue-500 text-black hover:bg-transparent hover:text-black">
                                                <SelectValue placeholder="Select telecaller" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="unassigned">
                                                    <div className="flex items-center">
                                                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                                                        Unassigned
                                                    </div>
                                                </SelectItem>
                                                {telecallers.map(user => (
                                                    <SelectItem key={user.id} value={user.id}>
                                                        <div className="flex items-center">
                                                            <User className="w-4 h-4 mr-2 text-blue-500" />
                                                            {user.firstName} {user.lastName}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Notes */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-purple-600" />
                                    Additional Information
                                </h3>

                                <div className="space-y-2">
                                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                                        Notes & Comments
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => handleChange("notes", e.target.value)}
                                        placeholder="Add any additional notes about this lead..."
                                        rows={4}
                                        className="focus:border-blue-500 bg-white resize-none text-black"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="px-6"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6"
                                >
                                    {loading ? "Saving..." : lead ? "Update Lead" : "Create Lead"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </div>
            </Card>
        </div>
    );
});
