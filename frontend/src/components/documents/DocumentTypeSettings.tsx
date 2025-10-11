"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Edit, Trash2, CheckCircle, AlertCircle } from "lucide-react";

interface DocumentType {
    id: string;
    name: string;
    description: string;
    category: "GENERAL" | "ACADEMIC" | "IDENTITY" | "FINANCIAL";
    isRequired: boolean;
    maxFileSize: number;
    allowedFormats: string[];
    isActive: boolean;
    checklists: Array<{
        id: string;
        title: string;
        description: string;
        isRequired: boolean;
        order: number;
    }>;
}

interface DocumentTypeSettingsProps {
    documentTypes: DocumentType[];
}

export function DocumentTypeSettings({ documentTypes }: DocumentTypeSettingsProps) {
    const [types, setTypes] = useState<DocumentType[]>(documentTypes);
    const [editingType, setEditingType] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case "IDENTITY":
                return <Badge variant="outline" className="text-blue-600 border-blue-200">Identity</Badge>;
            case "ACADEMIC":
                return <Badge variant="outline" className="text-green-600 border-green-200">Academic</Badge>;
            case "FINANCIAL":
                return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Financial</Badge>;
            default:
                return <Badge variant="outline">General</Badge>;
        }
    };

    const toggleTypeStatus = (typeId: string) => {
        setTypes(prev =>
            prev.map(type =>
                type.id === typeId
                    ? { ...type, isActive: !type.isActive }
                    : type
            )
        );
    };

    const deleteType = (typeId: string) => {
        setTypes(prev => prev.filter(type => type.id !== typeId));
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Document Types
                        </CardTitle>
                        <CardDescription>
                            Configure document types and verification requirements
                        </CardDescription>
                    </div>
                    <Button onClick={() => setShowAddForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Type
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {showAddForm && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium mb-4">Add New Document Type</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" placeholder="e.g., Passport" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="IDENTITY">Identity</SelectItem>
                                        <SelectItem value="ACADEMIC">Academic</SelectItem>
                                        <SelectItem value="FINANCIAL">Financial</SelectItem>
                                        <SelectItem value="GENERAL">General</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" placeholder="Describe this document type..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxSize">Max File Size (MB)</Label>
                                <Input id="maxSize" type="number" placeholder="10" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="formats">Allowed Formats</Label>
                                <Input id="formats" placeholder="pdf, jpg, png" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            <Button size="sm">Save</Button>
                            <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {types.map((type) => (
                        <div key={type.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium">{type.name}</h3>
                                        {getCategoryBadge(type.category)}
                                        {type.isRequired && (
                                            <Badge variant="destructive" className="text-xs">Required</Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={type.isActive}
                                        onCheckedChange={() => toggleTypeStatus(type.id)}
                                    />
                                    <Button variant="ghost" size="sm">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => deleteType(type.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-3">{type.description}</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">Max Size:</span> {formatFileSize(type.maxFileSize)}
                                </div>
                                <div>
                                    <span className="font-medium">Formats:</span> {type.allowedFormats.join(", ")}
                                </div>
                                <div>
                                    <span className="font-medium">Status:</span>
                                    <Badge variant={type.isActive ? "default" : "secondary"} className="ml-2">
                                        {type.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </div>

                            {type.checklists.length > 0 && (
                                <div className="mt-4 pt-4 border-t">
                                    <h4 className="text-sm font-medium mb-2">Verification Checklist</h4>
                                    <div className="space-y-2">
                                        {type.checklists.map((item) => (
                                            <div key={item.id} className="flex items-start gap-2 text-sm">
                                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                                <div>
                                                    <span className="font-medium">{item.title}</span>
                                                    {item.isRequired && (
                                                        <span className="text-red-500 ml-1">*</span>
                                                    )}
                                                    <p className="text-gray-600 text-xs">{item.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {types.length === 0 && (
                    <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No document types configured
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Add document types to define what documents students can upload.
                        </p>
                        <Button onClick={() => setShowAddForm(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Document Type
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
