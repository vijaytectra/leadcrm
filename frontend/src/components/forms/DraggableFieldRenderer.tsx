"use client";

import { useRef, useState } from "react";
import { FormField } from "@/types/form-builder";
import { FormFieldRenderer } from "./FormFieldRenderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Copy, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { formBuilderUtils } from "@/lib/api/forms";
import { useFormBuilder } from "./FormBuilderProvider";
import { toast } from "sonner";

interface DraggableFieldRendererProps {
    field: FormField;
    index: number;
    onMove: (dragIndex: number, hoverIndex: number) => void;
}

export function DraggableFieldRenderer({ field, index, onMove }: DraggableFieldRendererProps) {
    const { state, actions } = useFormBuilder();
    const ref = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (e: React.DragEvent) => {
        setIsDragging(true);
        const dragData = { id: field.id, index };
        e.dataTransfer.setData("text/plain", JSON.stringify(dragData));
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        try {
            const dragData = e.dataTransfer.getData("text/plain");
            if (!dragData || dragData.trim() === '') {
                return;
            }

            const data = JSON.parse(dragData);
            if (data && typeof data === 'object' && data.id && data.index !== undefined && data.id !== field.id) {
                onMove(data.index, index);
            }
        } catch (error) {
            console.error("Error parsing drag data:", error);
            // Silently fail to prevent app crash
        }
    };

    const handleFieldSelect = () => {
        actions.setSelectedField(field);
    };

    const handleFieldDelete = () => {
        if (confirm("Are you sure you want to delete this field?")) {
            actions.deleteField(field.id);
            if (state.selectedField?.id === field.id) {
                actions.setSelectedField(null);
            }
            toast.success("Field deleted");
        }
    };

    const handleFieldDuplicate = () => {
        const duplicatedField = {
            ...field,
            id: formBuilderUtils.generateFieldId(),
            label: `${field.label} (Copy)`,
            order: state.fields.length
        };
        actions.addField(duplicatedField);
        toast.success("Field duplicated");
    };

    const handleFieldUpdate = (fieldId: string, updates: Partial<FormField>) => {
        actions.updateField(fieldId, updates);
    };

    const isSelected = state.selectedField?.id === field.id;

    return (
        <div
            ref={ref}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative group transition-all duration-200 ${isSelected
                ? "ring-2 ring-blue-500 ring-opacity-50"
                : ""
                } ${isDragging
                    ? "opacity-50"
                    : "hover:bg-blue-50"
                } rounded-lg border border-slate-200 hover:border-blue-300`}
            onClick={handleFieldSelect}
        >
            {/* Field Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center space-x-2">
                    <div className="cursor-move">
                        <GripVertical className="h-4 w-4 text-slate-400" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                        {formBuilderUtils.getFieldTypeLabel(field.type)}
                    </Badge>
                    {field.required && (
                        <Badge variant="destructive" className="text-xs">
                            Required
                        </Badge>
                    )}
                </div>

                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleFieldDuplicate();
                        }}
                        className="h-8 w-8 p-0"
                    >
                        <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleFieldDelete();
                        }}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* Field Content */}
            <div className="p-4">
                <FormFieldRenderer
                    field={field}
                    isPreview={false}
                    isSelected={isSelected}
                    onUpdate={handleFieldUpdate}
                />
            </div>

            {/* Field Validation Status */}
            {field.validation && (
                <div className="px-4 pb-3">
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                        {field.validation.required && (
                            <div className="flex items-center space-x-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span>Required</span>
                            </div>
                        )}
                        {field.validation.minLength && (
                            <div className="flex items-center space-x-1">
                                <AlertCircle className="h-3 w-3 text-blue-500" />
                                <span>Min: {field.validation.minLength}</span>
                            </div>
                        )}
                        {field.validation.maxLength && (
                            <div className="flex items-center space-x-1">
                                <AlertCircle className="h-3 w-3 text-blue-500" />
                                <span>Max: {field.validation.maxLength}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
