"use client";

import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Eye
} from "lucide-react";
import { useFormBuilder } from "./FormBuilderProvider";
import { DraggableFieldRenderer } from "./DraggableFieldRenderer";
import { DragDropProvider } from "./DragDropProvider";
import { toast } from "sonner";
import { formBuilderUtils } from "@/lib/api/forms";
import type { FieldType } from "@/types/form-builder";

export function FormBuilderCanvas() {
    const { state, actions, dragDrop, dragDropActions } = useFormBuilder();
    const canvasRef = useRef<HTMLDivElement>(null);

    // Debug logging
    console.log("FormBuilderCanvas render:", {
        fields: state.fields,
        fieldsLength: state.fields.length,
        currentForm: state.currentForm
    });


    const handleFieldMove = useCallback((dragIndex: number, hoverIndex: number) => {
        const dragField = state.fields[dragIndex];
        const newFields = [...state.fields];
        newFields.splice(dragIndex, 1);
        newFields.splice(hoverIndex, 0, dragField);

        // Update order property
        const reorderedFields = newFields.map((field, index) => ({
            ...field,
            order: index
        }));

        actions.setFields(reorderedFields);
    }, [state.fields, actions]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const fieldType = dragDrop.draggedFieldType;

        if (fieldType) {
            const newField = {
                id: formBuilderUtils.generateFieldId(),
                formId: state.currentForm?.id || '',
                type: fieldType as FieldType,
                label: formBuilderUtils.getFieldTypeLabel(fieldType),
                required: false,
                order: state.fields.length,
                width: 'full' as const,
                validation: {
                    required: false,
                    minLength: undefined,
                    maxLength: undefined,
                    min: undefined,
                    max: undefined,
                    pattern: undefined,
                    customValidation: undefined,
                    errorMessage: undefined
                },
                options: {},
                conditionalLogic: {
                    enabled: false,
                    conditions: [],
                    actions: []
                },
                styling: {},
                advanced: {},
                createdAt: new Date(),
                updatedAt: new Date()
            };
            actions.addField(newField);
            toast.success(`${formBuilderUtils.getFieldTypeLabel(fieldType)} added`);
        }

        dragDropActions.reset();
    }, [actions, dragDrop.draggedFieldType, dragDropActions, state.currentForm?.id, state.fields.length]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const handleAddField = useCallback((fieldType: string) => {
        const newField = {
            id: formBuilderUtils.generateFieldId(),
            formId: state.currentForm?.id || '',
            type: fieldType as FieldType,
            label: formBuilderUtils.getFieldTypeLabel(fieldType),
            required: false,
            order: state.fields.length,
            width: 'full' as const,
            validation: {
                required: false,
                minLength: undefined,
                maxLength: undefined,
                min: undefined,
                max: undefined,
                pattern: undefined,
                customValidation: undefined,
                errorMessage: undefined
            },
            options: {},
            conditionalLogic: {
                enabled: false,
                conditions: [],
                actions: []
            },
            styling: {},
            advanced: {},
            createdAt: new Date(),
            updatedAt: new Date()
        };
        console.log("Adding field:", newField);
        actions.addField(newField);
        console.log("Field added, current fields count:", state.fields.length + 1);
        toast.success(`${formBuilderUtils.getFieldTypeLabel(fieldType)} added`);
    }, [actions, state.fields.length, state.currentForm?.id]);

    const renderEmptyState = () => (
        <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
                Start Building Your Form
            </h3>
            <p className="text-slate-500 mb-4 max-w-sm">
                Drag fields from the sidebar or click the button below to add your first field.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
                <Button
                    size="sm"
                    onClick={() => handleAddField("text")}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Text Field
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddField("email")}
                >
                    Add Email Field
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddField("select")}
                >
                    Add Dropdown
                </Button>
            </div>
        </div>
    );

    const renderFormFields = () => (
        <div className="space-y-4">
            {state.fields.map((field, index) => (
                <DraggableFieldRenderer
                    key={field.id}
                    field={field}
                    index={index}
                    onMove={handleFieldMove}
                />
            ))}
        </div>
    );

    return (
        <DragDropProvider>
            <div className="flex-1 flex flex-col overflow-auto bg-slate-50 h-full">
                {/* Canvas Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
                    <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Form Canvas
                        </h3>
                        <Badge variant="outline" className="text-xs">
                            {state.fields.length} field{state.fields.length !== 1 ? 's' : ''}
                        </Badge>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => actions.setPreviewMode(!state.previewMode)}
                            className="text-slate-600"
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            {state.previewMode ? "Edit" : "Preview"}
                        </Button>
                    </div>
                </div>

                {/* Canvas Content */}
                <div className="flex-1 overflow-auto">
                    <div className="max-w-4xl mx-auto p-6">
                        <div
                            ref={canvasRef}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            className={`min-h-[400px] transition-all duration-200 ${dragDrop.isDragging
                                ? "bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg"
                                : "bg-white"
                                }`}
                        >
                            {state.fields.length === 0 ? (
                                renderEmptyState()
                            ) : (
                                <div className="space-y-4">
                                    {renderFormFields()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Canvas Footer */}
                {state.fields.length > 0 && (
                    <div className="border-t border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-600">
                                {state.fields.length} field{state.fields.length !== 1 ? 's' : ''} •
                                {state.fields.filter(f => f.required).length} required
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => actions.setPreviewMode(true)}
                                    className="text-slate-600"
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview Form
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DragDropProvider>
    );
}
