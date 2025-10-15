"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye, Copy, Mail } from "lucide-react";

import { ApiException, apiDeleteClient, apiGetClientNew, apiPostClientNew, apiPutClient } from "@/lib/utils";
import { toast } from "sonner";
import { getClientToken } from "@/lib/client-token";

interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
    category: string;
    isActive: boolean;
    isSystem: boolean;
    createdAt: string;
    updatedAt: string;
}

interface EmailTemplateManagerProps {
    tenantSlug: string;
}

export function EmailTemplateManager({ tenantSlug }: EmailTemplateManagerProps) {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        subject: "",
        htmlContent: "",
        textContent: "",
        category: "GENERAL",
    });

    useEffect(() => {
        fetchTemplates();
    }, [tenantSlug]);

    const fetchTemplates = async () => {
        try {
            const data = await apiGetClientNew(`/${tenantSlug}/communications/templates`, { token: getClientToken() || undefined });
            if (data) {
                setTemplates(data as EmailTemplate[]);
            }
        } catch (error) {
            console.error("Error fetching templates:", error);
            console.error("Error fetching communication stats:", error);
            if (error instanceof ApiException) {
                console.error("Error fetching communication stats:", error.message);
            } else {
                console.error("Error fetching communication stats:", error);
            }

        } finally {
            setLoading(false);
        }
    };

    const handleCreateTemplate = async () => {
        try {
            const data = await apiPostClientNew(`/${tenantSlug}/communications/templates`, formData, { token: getClientToken() || undefined });
            if (data) {

                toast.success("Email template created successfully");

                setIsCreateDialogOpen(false);
                resetForm();
                fetchTemplates();
            }

        } catch (error) {
            console.error("Error creating template:", error);   
            console.error("Error creating template:", error);
            if (error instanceof ApiException) {
                console.error("Error creating template:", error.message);
            } else {
                console.error("Error creating template:", error);
            }
        }
    };

    const handleUpdateTemplate = async () => {
        if (!selectedTemplate) return;

        try {
            const data = await apiPutClient(`/${tenantSlug}/communications/templates/${selectedTemplate.id}`, formData, { token: getClientToken() || undefined });
            if (data) {

                toast.success("Email template updated successfully");


                setIsEditDialogOpen(false);
                setSelectedTemplate(null);
                resetForm();
                fetchTemplates();
            }
        } catch (error) {
            console.error("Error updating template:", error);
            console.error("Error updating template:", error);
            if (error instanceof ApiException) {
                console.error("Error updating template:", error.message);
            } else {
                console.error("Error updating template:", error);
            }

        }
    };

    const handleDeleteTemplate = async (templateId: string) => {
        if (!confirm("Are you sure you want to delete this template?")) return;

        try {
            const data = await apiDeleteClient(`/${tenantSlug}/communications/templates/${templateId}`, { token: getClientToken() || undefined });
            if (data) {
                toast.success("Email template deleted successfully");

            }



            fetchTemplates();
        } catch (error) {
            console.error("Error deleting template:", error);
            console.error("Error deleting template:", error);
            if (error instanceof ApiException) {
                console.error("Error deleting template:", error.message);
            } else {
                console.error("Error deleting template:", error);
            }

        }
    };

    const handleEditTemplate = (template: EmailTemplate) => {
        setSelectedTemplate(template);
        setFormData({
            name: template.name,
            subject: template.subject,
            htmlContent: template.htmlContent,
            textContent: template.textContent || "",
            category: template.category,
        });
        setIsEditDialogOpen(true);
    };

    const handlePreviewTemplate = (template: EmailTemplate) => {
        setSelectedTemplate(template);
        setIsPreviewDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            subject: "",
            htmlContent: "",
            textContent: "",
            category: "GENERAL",
        });
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            GENERAL: "bg-gray-100 text-gray-800",
            LEAD: "bg-blue-100 text-blue-800",
            PAYMENT: "bg-green-100 text-green-800",
            NOTIFICATION: "bg-yellow-100 text-yellow-800",
            SYSTEM: "bg-red-100 text-red-800",
            ADMISSION: "bg-purple-100 text-purple-800",
            DOCUMENT: "bg-orange-100 text-orange-800",
            FINANCE: "bg-indigo-100 text-indigo-800",
        };
        return colors[category] || "bg-gray-100 text-gray-800";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Email Templates</h2>
                    <p className="text-muted-foreground">
                        Manage email templates for automated communications
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Template
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create Email Template</DialogTitle>
                            <DialogDescription>
                                Create a new email template with dynamic variables
                            </DialogDescription>
                        </DialogHeader>
                        <EmailTemplateForm
                            formData={formData}
                            setFormData={setFormData}
                            onSubmit={handleCreateTemplate}
                            onCancel={() => setIsCreateDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {templates.map((template) => (
                                <TableRow key={template.id}>
                                    <TableCell className="font-medium">{template.name}</TableCell>
                                    <TableCell className="max-w-xs truncate">{template.subject}</TableCell>
                                    <TableCell>
                                        <Badge className={getCategoryColor(template.category)}>
                                            {template.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={template.isActive ? "default" : "secondary"}>
                                            {template.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(template.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handlePreviewTemplate(template)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            {!template.isSystem && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditTemplate(template)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteTemplate(template.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Email Template</DialogTitle>
                        <DialogDescription>
                            Update the email template details
                        </DialogDescription>
                    </DialogHeader>
                    <EmailTemplateForm
                        formData={formData}
                        setFormData={setFormData}
                        onSubmit={handleUpdateTemplate}
                        onCancel={() => setIsEditDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Template Preview</DialogTitle>
                        <DialogDescription>
                            Preview how the email template will look
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTemplate && (
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium">Subject</Label>
                                <div className="p-3 bg-gray-50 rounded-md">
                                    {selectedTemplate.subject}
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">HTML Content</Label>
                                <div
                                    className="p-4 border rounded-md max-h-96 overflow-y-auto"
                                    dangerouslySetInnerHTML={{ __html: selectedTemplate.htmlContent }}
                                />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

interface EmailTemplateFormProps {
    formData: {
        name: string;
        subject: string;
        htmlContent: string;
        textContent: string;
        category: string;
    };
    setFormData: (data: { name: string; subject: string; htmlContent: string; textContent: string; category: string }) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

function EmailTemplateForm({ formData, setFormData, onSubmit, onCancel }: EmailTemplateFormProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter template name"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="GENERAL">General</SelectItem>
                            <SelectItem value="LEAD">Lead</SelectItem>
                            <SelectItem value="PAYMENT">Payment</SelectItem>
                            <SelectItem value="NOTIFICATION">Notification</SelectItem>
                            <SelectItem value="ADMISSION">Admission</SelectItem>
                            <SelectItem value="DOCUMENT">Document</SelectItem>
                            <SelectItem value="FINANCE">Finance</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Enter email subject (use {{variable}} for dynamic content)"
                />
            </div>

            <Tabs defaultValue="html" className="w-full">
                <TabsList>
                    <TabsTrigger value="html">HTML Content</TabsTrigger>
                    <TabsTrigger value="text">Text Content</TabsTrigger>
                </TabsList>
                <TabsContent value="html" className="space-y-2">
                    <Label htmlFor="htmlContent">HTML Content</Label>
                    <Textarea
                        id="htmlContent"
                        value={formData.htmlContent}
                        onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                        placeholder="Enter HTML content (use {{variable}} for dynamic content)"
                        className="min-h-[300px] font-mono text-sm"
                    />
                </TabsContent>
                <TabsContent value="text" className="space-y-2">
                    <Label htmlFor="textContent">Text Content</Label>
                    <Textarea
                        id="textContent"
                        value={formData.textContent}
                        onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
                        placeholder="Enter text content (use {{variable}} for dynamic content)"
                        className="min-h-[300px] font-mono text-sm"
                    />
                </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button onClick={onSubmit}>
                    Save Template
                </Button>
            </div>
        </div>
    );
}
