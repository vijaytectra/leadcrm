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
    Trash2,
} from "lucide-react";
import { ConfirmationDialog, DeleteDialog, SaveDialog } from "@/components/ui/confirmation-dialog";
import { FormStepManager } from "./FormStepManager";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFormBuilder } from "./FormBuilderProvider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface FormBuilderHeaderProps {
    onPreview?: () => void;
    onSave?: () => void;
    onPublish?: () => void;
    hasFormId?: boolean;
}

export function FormBuilderHeader({
    onPreview,
    onSave,
    onPublish,
    hasFormId = false
}: FormBuilderHeaderProps) {
    const { state, actions } = useFormBuilder();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [stepManagerOpen, setStepManagerOpen] = useState(false);

    const handleSave = async () => {
        console.log("Save button clicked", { onSave, currentForm: state.currentForm });

        if (onSave) {
            console.log("Using onSave prop");
            onSave();
        } else if (state.currentForm) {
            try {
                console.log("Saving form via actions.saveForm()");
                setIsSaving(true);
                await actions.saveForm();
                toast.success("Form saved successfully");
                setSaveDialogOpen(false); // Close the dialog after successful save
            } catch (error) {
                console.error("Save failed:", error);
                toast.error("Failed to save form");
            } finally {
                setIsSaving(false);
            }
        } else {
            console.log("No current form to save");
            toast.error("No form to save");
        }
    };

    const handlePreview = () => {
        if (onPreview) {
            onPreview();
        } else {
            actions.setPreviewMode(true);
        }
    };

    const handlePublish = () => {
        if (onPublish) {
            onPublish();
        } else if (state.currentForm) {
            setPublishDialogOpen(true);
        }
    };

    const confirmPublish = async () => {
        if (!state.currentForm) return;

        try {
            await actions.publishForm();
            toast.success("Form published successfully");
        } catch {
            toast.error("Failed to publish form");
        } finally {
            setPublishDialogOpen(false);
        }
    };

    const handleCopyForm = () => {
        if (!state.currentForm) return;

        const formData = {
            title: `${state.currentForm.title} (Copy)`,
            description: state.currentForm.description,
            requiresPayment: state.currentForm.requiresPayment,
            paymentAmount: state.currentForm.paymentAmount,
            allowMultipleSubmissions: state.currentForm.allowMultipleSubmissions,
            maxSubmissions: state.currentForm.maxSubmissions,
            submissionDeadline: state.currentForm.submissionDeadline,
            settings: state.currentForm.settings
        };

        // Copy form data to clipboard
        navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
        toast.success("Form data copied to clipboard");
    };

    const handleDeleteForm = () => {
        if (!state.currentForm) return;
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!state.currentForm) return;

        try {
            await actions.deleteForm(state.currentForm.id);
            toast.success("Form deleted successfully");
        } catch {
            toast.error("Failed to delete form");
        } finally {
            setDeleteDialogOpen(false);
        }
    };

    const handleBack = () => {
        router.push('/institution-admin/forms');
    };

    const handleDownload = () => {
        if (!state.currentForm) return;

        const formData = {
            form: state.currentForm,
            fields: state.fields,
            steps: state.steps
        };

        const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${state.currentForm.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Form exported successfully");
    };

    const handleShare = () => {
        if (!state.currentForm) return;

        const shareUrl = `${window.location.origin}/forms/${state.currentForm.id}`;
        navigator.clipboard.writeText(shareUrl);
        toast.success("Form link copied to clipboard");
    };

    return (
        <>
            <div className="flex items-center justify-between p-4 border-b bg-white">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBack}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>

                    <div className="flex items-center gap-2">
                        <Input
                            value={state.currentForm?.title || ""}
                            onChange={(e) => {
                                if (state.currentForm) {
                                    actions.setCurrentForm({
                                        ...state.currentForm,
                                        title: e.target.value
                                    });
                                }
                            }}
                            placeholder="Form title"
                            className="text-lg font-semibold border-none shadow-none focus:ring-0"
                        />
                        <Badge variant={state.isDraft ? "secondary" : "default"}>
                            {state.isDraft ? "Draft" : "Published"}
                        </Badge>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStepManagerOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <Settings className="h-4 w-4" />
                        Steps
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreview}
                        className="flex items-center gap-2"
                    >
                        <Eye className="h-4 w-4" />
                        Preview
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSaveDialogOpen(true)}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? "Saving..." : "Save"}
                    </Button>

                    <Button
                        size="sm"
                        onClick={handlePublish}
                        disabled={!hasFormId}
                        className="flex items-center gap-2"
                        title={!hasFormId ? "Save the form first to publish" : "Publish form"}
                    >
                        <Send className="h-4 w-4" />
                        Publish
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleCopyForm}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Form
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDownload}>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleShare}>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleDeleteForm}
                                className="text-red-600"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Reusable Dialogs */}
            <ConfirmationDialog
                open={publishDialogOpen}
                onOpenChange={setPublishDialogOpen}
                title="Publish Form"
                description="Are you sure you want to publish this form? Once published, it will be live and accessible to users."
                type="save"
                confirmText="Publish"
                onConfirm={confirmPublish}
                isLoading={state.isLoading}
            />

            <SaveDialog
                open={saveDialogOpen}
                onOpenChange={setSaveDialogOpen}
                title="Save Form"
                description="Do you want to save your changes as a draft?"
                onConfirm={handleSave}
                isLoading={isSaving}
            />

            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Form"
                description="Are you sure you want to delete this form? This action cannot be undone."
                itemName={state.currentForm?.title}
                onConfirm={confirmDelete}
                isLoading={state.isLoading}
            />

            <FormStepManager
                isOpen={stepManagerOpen}
                onClose={() => setStepManagerOpen(false)}
            />
        </>
    );
}