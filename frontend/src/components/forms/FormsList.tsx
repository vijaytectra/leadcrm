"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Plus,
    Search,
    MoreHorizontal,
    Edit,
    Eye,
    Copy,
    Trash2,
    Download,
    Share2,
    Calendar,
    FileText,
    BarChart3,
    ExternalLink
} from "lucide-react";
import { DeleteDialog } from "@/components/ui/confirmation-dialog";
import { formsApi, widgetAPI } from "@/lib/api/forms";
import { useAuthStore } from "@/stores/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { FormBuilderConfig } from "@/types/form-builder";
import { ApiException } from "@/lib/utils";
import { WidgetCreationModal } from "./WidgetCreationModal";

interface FormsListProps {
    onEditForm?: (formId: string) => void;
    onPreviewForm?: (formId: string) => void;
    onCreateForm?: () => void;
}

export function FormsList({
    onEditForm,
    onPreviewForm,
    onCreateForm
}: FormsListProps) {
    const { currentTenantSlug } = useAuthStore();
    const router = useRouter();
    const [forms, setForms] = useState<FormBuilderConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [widgetCounts, setWidgetCounts] = useState<Record<string, number>>({});
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [formToDelete, setFormToDelete] = useState<FormBuilderConfig | null>(null);
    const [widgetModalOpen, setWidgetModalOpen] = useState(false);
    const [selectedFormForWidget, setSelectedFormForWidget] = useState<FormBuilderConfig | null>(null);

    const loadForms = useCallback(async () => {
        if (!currentTenantSlug) return;

        try {
            setIsLoading(true);
            const response = await formsApi.getForms(currentTenantSlug);
            if (response.success && response.data) {
                setForms(response.data.forms);

                // Load widget counts for each form
                const widgetCounts: Record<string, number> = {};
                for (const form of response.data.forms) {
                    try {
                        const widgetResponse = await widgetAPI.getFormWidgets(currentTenantSlug, form.id);
                        if (widgetResponse.success) {
                            widgetCounts[form.id] = widgetResponse.data.total;
                        }
                    } catch (error) {
                        console.error(`Failed to load widget count for form ${form.id}:`, error);
                        widgetCounts[form.id] = 0;
                        if (error instanceof ApiException) {
                            console.error("Error fetching preferences:", error.message);

                        } else {
                            console.error("Error fetching preferences:", error);

                        }
                    }
                }
                setWidgetCounts(widgetCounts);
            }
        } catch (error) {
            console.error("Error deleting form:", error);
            toast.error("Failed to delete form");
            if (error instanceof ApiException) {
                console.error("Error fetching preferences:", error.message);
                toast.error(error.message);
            } else {
                console.error("Error fetching preferences:", error);
                toast.error("Failed to delete form");
            }
        } finally {
            setIsLoading(false);
        }
    }, [currentTenantSlug]);

    useEffect(() => {
        loadForms();
    }, [currentTenantSlug, loadForms]);

    const filteredForms = forms.filter(form =>
        form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (form.description && form.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleEditForm = (formId: string) => {
        if (onEditForm) {
            onEditForm(formId);
        } else {
            router.push(`/institution-admin/forms/edit/${formId}`);
        }
    };

    const handlePreviewForm = (formId: string) => {
        if (onPreviewForm) {
            onPreviewForm(formId);
        } else {
            router.push(`/institution-admin/forms/preview/${formId}`);
        }
    };

    const handleCreateForm = () => {
        if (onCreateForm) {
            onCreateForm();
        } else {
            router.push('/institution-admin/forms/create');
        }
    };

    const handleCreateWidget = (form: FormBuilderConfig) => {
        setSelectedFormForWidget(form);
        setWidgetModalOpen(true);
    };

    const handleWidgetCreated = () => {
        toast.success("Widget created successfully");
        setWidgetModalOpen(false);
        setSelectedFormForWidget(null);
        // Refresh widget counts
        loadForms();
    };

    const handleDeleteForm = (form: FormBuilderConfig) => {
        setFormToDelete(form);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!formToDelete || !currentTenantSlug) return;

        try {
            await formsApi.deleteForm(currentTenantSlug, formToDelete.id);
            setForms(prev => prev.filter(f => f.id !== formToDelete.id));
            toast.success("Form deleted successfully");
        } catch (error) {
            console.error("Error deleting form:", error);
            toast.error("Failed to delete form");
            if (error instanceof ApiException) {
                console.error("Error fetching preferences:", error.message);
                toast.error(error.message);
            } else {
                console.error("Error fetching preferences:", error);
                toast.error("Failed to delete form");
            }

        } finally {
            setDeleteDialogOpen(false);
            setFormToDelete(null);
        }
    };

    const handleCopyForm = (form: FormBuilderConfig) => {
        const formData = {
            title: `${form.title} (Copy)`,
            description: form.description,
            requiresPayment: form.requiresPayment,
            paymentAmount: form.paymentAmount,
            allowMultipleSubmissions: form.allowMultipleSubmissions,
            maxSubmissions: form.maxSubmissions,
            submissionDeadline: form.submissionDeadline,
            settings: form.settings
        };

        navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
        toast.success("Form data copied to clipboard");
    };

    const handleExportForm = (form: FormBuilderConfig) => {
        const blob = new Blob([JSON.stringify(form, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Form exported successfully");
    };

    const handleShareForm = (form: FormBuilderConfig) => {
        const shareUrl = `${window.location.origin}/forms/${form.id}`;
        navigator.clipboard.writeText(shareUrl);
        toast.success("Form link copied to clipboard");
    };

    const getStatusBadge = (form: FormBuilderConfig) => {
        if (form.isPublished && form.isActive) {
            return <Badge variant="default" className="bg-green-100 text-green-800">Published</Badge>;
        } else if (form.isActive) {
            return <Badge variant="secondary">Active</Badge>;
        } else {
            return <Badge variant="outline">Draft</Badge>;
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
                        <p className="text-gray-600">Manage your forms and track submissions</p>
                    </div>
                    <Button onClick={handleCreateForm} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create Form
                    </Button>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search forms..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Forms List */}
                {filteredForms.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <FileText className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {searchTerm ? "No forms found" : "No forms yet"}
                            </h3>
                            <p className="text-gray-600 text-center mb-6">
                                {searchTerm
                                    ? "Try adjusting your search terms"
                                    : "Create your first form to get started"
                                }
                            </p>
                            {!searchTerm && (
                                <Button onClick={handleCreateForm} className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create Your First Form
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredForms.map((form) => (
                            <Card key={form.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                {form.title}
                                                {getStatusBadge(form)}
                                            </CardTitle>
                                            {form.description && (
                                                <CardDescription className="mt-1">
                                                    {form.description}
                                                </CardDescription>
                                            )}
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditForm(form.id)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handlePreviewForm(form.id)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Preview
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleCreateWidget(form)}>
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    Create Widget
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleCopyForm(form)}>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Copy
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleExportForm(form)}>
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Export
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleShareForm(form)}>
                                                    <Share2 className="h-4 w-4 mr-2" />
                                                    Share
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteForm(form)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                Created {formatDate(form.createdAt)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                Updated {formatDate(form.updatedAt)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <BarChart3 className="h-4 w-4" />
                                                {widgetCounts[form.id] || 0} widget(s)
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditForm(form.id)}
                                                className="flex items-center gap-1"
                                            >
                                                <Edit className="h-3 w-3" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePreviewForm(form.id)}
                                                className="flex items-center gap-1"
                                            >
                                                <Eye className="h-3 w-3" />
                                                Preview
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.push(`/institution-admin/forms/${form.id}/widgets?tenant=${currentTenantSlug}`)}
                                                className="flex items-center gap-1"
                                            >
                                                <BarChart3 className="h-3 w-3" />
                                                Widgets
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Form"
                description="Are you sure you want to delete this form? This action cannot be undone."
                itemName={formToDelete?.title}
                onConfirm={confirmDelete}
                isLoading={false}
            />

            {/* Widget Creation Modal */}
            {selectedFormForWidget && (
                <WidgetCreationModal
                    formId={selectedFormForWidget.id}
                    formTitle={selectedFormForWidget.title}
                    tenantSlug={currentTenantSlug || ""}
                    isOpen={widgetModalOpen}
                    onClose={() => {
                        setWidgetModalOpen(false);
                        setSelectedFormForWidget(null);
                    }}
                    onWidgetCreated={handleWidgetCreated}
                />
            )}
        </>
    );
}