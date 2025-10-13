"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    FileText,
    Save,
    Eye,
    Plus,
    Bold,
    Italic,
    Underline,
    List,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Type,
    User,
    Calendar,
    DollarSign
} from "lucide-react";

interface OfferLetterTemplateBuilderProps {
    template?: {
        id: string;
        name: string;
        description?: string;
        content: Record<string, unknown>;
        variables: Record<string, unknown>;
        isActive: boolean;
    };
    onSave: (data: {
        name: string;
        description?: string;
        content: Record<string, unknown>;
        variables: Record<string, unknown>;
        isActive: boolean;
    }) => Promise<void>;
    onPreview: (content: Record<string, unknown>) => void;
    isLoading?: boolean;
}

export function OfferLetterTemplateBuilder({
    template,
    onSave,
    onPreview,
    isLoading = false
}: OfferLetterTemplateBuilderProps) {
    const [formData, setFormData] = useState({
        name: template?.name || '',
        description: template?.description || '',
        isActive: template?.isActive ?? true,
    });

    const [content, setContent] = useState<Record<string, unknown>>(
        template?.content || {
            type: 'doc',
            content: [
                {
                    type: 'heading',
                    attrs: { level: 1 },
                    content: [{ type: 'text', text: 'Offer Letter' }]
                },
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: 'Dear ' },
                        { type: 'text', text: '{studentName}', marks: [{ type: 'bold' }] },
                        { type: 'text', text: ',' }
                    ]
                },
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: 'Congratulations! We are pleased to offer you admission to our ' },
                        { type: 'text', text: '{course}', marks: [{ type: 'bold' }] },
                        { type: 'text', text: ' program.' }
                    ]
                }
            ]
        }
    );

    const [variables, setVariables] = useState<Record<string, unknown>>(
        template?.variables || {
            studentName: 'Student Name',
            course: 'Course Name',
            institutionName: 'Institution Name',
            programStartDate: 'Program Start Date',
            feeAmount: 'Fee Amount',
            deadline: 'Acceptance Deadline'
        }
    );

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave({
            name: formData.name,
            description: formData.description,
            content,
            variables,
            isActive: formData.isActive,
        });
    };

    const insertVariable = (variable: string) => {
        // This would integrate with a rich text editor
        // For now, we'll just show how it would work
    
    };

    const formatText = (format: string) => {
        // This would integrate with a rich text editor
        
    };

    return (
        <div className="space-y-6">
            {/* Template Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Template Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Template Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter template name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="isActive">Status</Label>
                                <Select
                                    value={formData.isActive.toString()}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value === 'true' }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Active</SelectItem>
                                        <SelectItem value="false">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter template description"
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Save Template'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => onPreview(content)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Rich Text Editor */}
            <Card>
                <CardHeader>
                    <CardTitle>Template Content</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Toolbar */}
                    <div className="border rounded-lg mb-4">
                        <div className="flex items-center gap-1 p-2 border-b">
                            <Button variant="ghost" size="sm" onClick={() => formatText('bold')}>
                                <Bold className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => formatText('italic')}>
                                <Italic className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => formatText('underline')}>
                                <Underline className="h-4 w-4" />
                            </Button>
                            <div className="w-px h-6 bg-gray-300 mx-1" />
                            <Button variant="ghost" size="sm" onClick={() => formatText('align-left')}>
                                <AlignLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => formatText('align-center')}>
                                <AlignCenter className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => formatText('align-right')}>
                                <AlignRight className="h-4 w-4" />
                            </Button>
                            <div className="w-px h-6 bg-gray-300 mx-1" />
                            <Button variant="ghost" size="sm" onClick={() => formatText('list')}>
                                <List className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Editor Area */}
                        <div className="p-4 min-h-[400px] focus:outline-none">
                            <div className="prose max-w-none">
                                <h1>Offer Letter</h1>
                                <p>
                                    Dear <strong>{'{studentName}'}</strong>,
                                </p>
                                <p>
                                    Congratulations! We are pleased to offer you admission to our <strong>{'{course}'}</strong> program.
                                </p>
                                <p>
                                    Your program will begin on <strong>{'{programStartDate}'}</strong> and the total fee is <strong>{'{feeAmount}'}</strong>.
                                </p>
                                <p>
                                    Please confirm your acceptance by <strong>{'{deadline}'}</strong>.
                                </p>
                                <p>
                                    We look forward to welcoming you to <strong>{'{institutionName}'}</strong>.
                                </p>
                                <p>
                                    Best regards,<br />
                                    Admissions Team
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Variables Panel */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Type className="h-5 w-5" />
                        Available Variables
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(variables).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <div className="font-medium">{`{${key}}`}</div>
                                    <div className="text-sm text-muted-foreground">{value as string}</div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => insertVariable(key)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-blue-800">
                            <Type className="h-4 w-4" />
                            <span className="font-medium">Tip:</span>
                            <span>Click on a variable to insert it into your template</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Variables */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Insert Variables</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => insertVariable('studentName')}
                            className="flex items-center gap-2"
                        >
                            <User className="h-4 w-4" />
                            Student Name
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => insertVariable('course')}
                            className="flex items-center gap-2"
                        >
                            <FileText className="h-4 w-4" />
                            Course
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => insertVariable('programStartDate')}
                            className="flex items-center gap-2"
                        >
                            <Calendar className="h-4 w-4" />
                            Start Date
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => insertVariable('feeAmount')}
                            className="flex items-center gap-2"
                        >
                            <DollarSign className="h-4 w-4" />
                            Fee Amount
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => insertVariable('deadline')}
                            className="flex items-center gap-2"
                        >
                            <Calendar className="h-4 w-4" />
                            Deadline
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
