"use client";

import { useState } from "react";
import { Send, X } from "lucide-react";
import { AnnouncementRequest } from "@/types/notifications";
import { sendAnnouncement } from "@/lib/api/notifications";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface AnnouncementModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

const PRIORITIES = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "URGENT", label: "Urgent" },
];

const TARGET_ROLES = [
    { value: "TELECALLER", label: "Telecallers" },
    { value: "ADMISSION_TEAM", label: "Admission Team" },
    { value: "ADMISSION_HEAD", label: "Admission Head" },
    { value: "FINANCE_TEAM", label: "Finance Team" },
    { value: "DOCUMENT_VERIFIER", label: "Document Verifiers" },
];

export function AnnouncementModal({
    open,
    onOpenChange,
    onSuccess
}: AnnouncementModalProps) {
    const { currentTenantSlug } = useAuthStore();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<AnnouncementRequest>({
        title: "",
        message: "",
        priority: "MEDIUM",
        targetRoles: [],
        targetUsers: []
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentTenantSlug) {
            toast({
                title: "Error",
                description: "No tenant selected",
                variant: "destructive",
            });
            return;
        }

        if (!formData.title.trim() || !formData.message.trim()) {
            toast({
                title: "Error",
                description: "Title and message are required",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const result = await sendAnnouncement(currentTenantSlug, formData);

            toast({
                title: "Success",
                description: result.message,
            });

            // Reset form
            setFormData({
                title: "",
                message: "",
                priority: "MEDIUM",
                targetRoles: [],
                targetUsers: []
            });

            onSuccess?.();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send announcement",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRoleToggle = (role: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            targetRoles: checked
                ? [...prev.targetRoles!, role]
                : prev.targetRoles!.filter(r => r !== role)
        }));
    };

    const handleClose = () => {
        if (!loading) {
            setFormData({
                title: "",
                message: "",
                priority: "MEDIUM",
                targetRoles: [],
                targetUsers: []
            });
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <Send className="h-5 w-5" />
                        <span>Send Announcement</span>
                    </DialogTitle>
                    <DialogDescription>
                        Send an announcement to your team members. You can target specific roles or send to all users.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            placeholder="Enter announcement title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                            id="message"
                            placeholder="Enter announcement message"
                            value={formData.message}
                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                            rows={4}
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                            value={formData.priority}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
                            disabled={loading}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PRIORITIES.map((priority) => (
                                    <SelectItem key={priority.value} value={priority.value}>
                                        {priority.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Target Roles */}
                    <div className="space-y-2">
                        <Label>Target Roles</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {TARGET_ROLES.map((role) => (
                                <div key={role.value} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={role.value}
                                        checked={formData.targetRoles?.includes(role.value) || false}
                                        onCheckedChange={(checked) => handleRoleToggle(role.value, !!checked)}
                                        disabled={loading}
                                    />
                                    <Label htmlFor={role.value} className="text-sm">
                                        {role.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500">
                            Leave empty to send to all active users
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Announcement
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
