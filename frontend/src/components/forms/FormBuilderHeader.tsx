"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Save,
    Eye,
    Send,
    Settings,
    MoreHorizontal,
    ArrowLeft,
    Download,
    Share2,
    Copy,
    Trash2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFormBuilder } from "./FormBuilderProvider";
import { toast } from "sonner";

interface FormBuilderHeaderProps {
    mode: "create" | "edit" | "preview";
    onShowTemplates?: () => void;
    onPreview?: () => void;
}

export function FormBuilderHeader({
    mode,
    onShowTemplates,
    onPreview
}: FormBuilderHeaderProps) {
    const { state, actions } = useFormBuilder();
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!state.currentForm) return;

        try {
            setIsSaving(true);
            await actions.saveForm();
            toast.success("Form saved successfully");
        } catch (error) {
            toast.error("Failed to save form");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePreview = () => {
        if (onPreview) {
            onPreview();
        } else {
            actions.previewForm();
        }
    };

    const handlePublish = async () => {
        if (!state.currentForm) return;

        try {
            await actions.publishForm();
            toast.success("Form published successfully");
        } catch (error) {
            toast.error("Failed to publish form");
        }
    };

    const handleCopyForm = () => {
        if (!state.currentForm) return;

        const formData = {
            title: `${state.currentForm.title} (Copy)`,
            description: state.currentForm.description,
            settings: state.currentForm.settings,
            fields: state.fields
        };

        // Copy to clipboard or create new form
        navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
        toast.success("Form data copied to clipboard");
    };

    const handleExportForm = () => {
        if (!state.currentForm) return;

        const formData = {
            form: state.currentForm,
            fields: state.fields
        };

        const blob = new Blob([JSON.stringify(formData, null, 2)], {
            type: "application/json"
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${state.currentForm.title.replace(/\s+/g, "_")}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("Form exported successfully");
    };

    const handleShareForm = () => {
        if (!state.currentForm) return;

        const shareUrl = `${window.location.origin}/forms/${state.currentForm.id}`;
        navigator.clipboard.writeText(shareUrl);
        toast.success("Form link copied to clipboard");
    };

    return (
        <div className="flex items-center  justify-between p-4 border-b border-slate-200 bg-white">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.history.back()}
                    className="text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                <div className="flex items-center space-x-2">
                    <Input
                        value={state.currentForm?.title || "Untitled Form"}
                        onChange={(e) => {
                            if (state.currentForm) {
                                actions.setCurrentForm({
                                    ...state.currentForm,
                                    title: e.target.value
                                });
                            }
                        }}
                        className="text-lg font-semibold border-none shadow-none px-0 focus:ring-0"
                        placeholder="Form Title"
                    />
                    {state.isDirty && (
                        <Badge variant="secondary" className="text-xs">
                            Unsaved
                        </Badge>
                    )}
                </div>
            </div>

            {/* Center Section - Mode Indicator */}
            <div className="flex items-center space-x-2">
                <Badge
                    variant={mode === "create" ? "default" : mode === "edit" ? "secondary" : "outline"}
                    className="capitalize"
                >
                    {mode}
                </Badge>
                {state.currentForm?.isActive && (
                    <Badge variant="success" className="bg-green-100 text-green-800">
                        Published
                    </Badge>
                )}
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center space-x-2">
                {/* Quick Actions */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving || !state.isDirty}
                    className="text-slate-600"
                >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save"}
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreview}
                    className="text-slate-600"
                >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                </Button>

                {mode === "edit" && (
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handlePublish}
                        disabled={!state.currentForm || state.currentForm.isActive}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Send className="h-4 w-4 mr-2" />
                        {state.currentForm?.isActive ? "Published" : "Publish"}
                    </Button>
                )}

                {/* More Actions Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-slate-600">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={onShowTemplates}>
                            <Settings className="h-4 w-4 mr-2" />
                            Templates
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleCopyForm}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate Form
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportForm}>
                            <Download className="h-4 w-4 mr-2" />
                            Export Form
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleShareForm}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Form
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => {
                                if (confirm("Are you sure you want to delete this form?")) {
                                    // Handle delete
                                    toast.success("Form deleted");
                                }
                            }}
                            className="text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Form
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
