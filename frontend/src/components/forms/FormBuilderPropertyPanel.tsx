"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    X,
    Settings,
    Palette,
    Shield,
    Zap,
    Type,
    CheckSquare,
    Plus,
    Trash2,
    GripVertical
} from "lucide-react";
import { useFormBuilder } from "./FormBuilderProvider";
import { formBuilderUtils } from "@/lib/api/forms";
import type { ChoiceOption, FormField } from "@/types/form-builder";
import { ConditionalLogicBuilder } from "./ConditionalLogicBuilder";

export function FormBuilderPropertyPanel() {
    const { state, actions } = useFormBuilder();
    const [activeTab, setActiveTab] = useState("general");
    const [showConditionalLogic, setShowConditionalLogic] = useState(false);

    const selectedField = state.selectedField;

    if (!selectedField) {
        return (
            <div className="w-80 bg-slate-50 border-l border-slate-200 flex flex-col overflow-auto">
                <div className="p-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900">Properties</h3>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Settings className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h4 className="text-sm font-medium text-slate-600 mb-2">
                            No Field Selected
                        </h4>
                        <p className="text-xs text-slate-500">
                            Select a field to edit its properties
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const handleFieldUpdate = (updates: Partial<FormField>) => {
        actions.updateField(selectedField.id, updates);
    };

    const handleAddChoice = () => {
        const newChoice = {
            id: `choice_${Date.now()}`,
            label: "New Option",
            value: `option_${Date.now()}`, // Dynamic value based on timestamp
            isDefault: false,
            isDisabled: false
        };

        handleFieldUpdate({
            options: {
                ...selectedField.options,
                choices: [...(selectedField.options?.choices || []), newChoice]
            }
        });
    };

    const handleUpdateChoice = (choiceId: string, updates: Partial<ChoiceOption>) => {
        const updatedChoices = selectedField.options?.choices?.map(choice =>
            choice.id === choiceId ? { ...choice, ...updates } : choice
        ) || [];

        handleFieldUpdate({
            options: {
                ...selectedField.options,
                choices: updatedChoices
            }
        });
    };

    const handleDeleteChoice = (choiceId: string) => {
        const updatedChoices = selectedField.options?.choices?.filter(
            choice => choice.id !== choiceId
        ) || [];

        handleFieldUpdate({
            options: {
                ...selectedField.options,
                choices: updatedChoices
            }
        });
    };

    const renderGeneralTab = () => (
        <div className="space-y-4 h-screen overflow-auto">
            {/* Basic Properties */}
            <div>
                <Label htmlFor="field-label" className="text-sm font-medium text-slate-700">
                    Field Label
                </Label>
                <Input
                    id="field-label"
                    value={selectedField.label}
                    onChange={(e) => handleFieldUpdate({ label: e.target.value })}
                    className="mt-1 text-black"
                />
            </div>

            <div>
                <Label htmlFor="field-placeholder" className="text-sm font-medium text-slate-700">
                    Placeholder Text
                </Label>
                <Input
                    id="field-placeholder"
                    value={selectedField.placeholder || ""}
                    onChange={(e) => handleFieldUpdate({ placeholder: e.target.value })}
                    className="mt-1 text-black"
                    placeholder="Enter placeholder text"
                />
            </div>

            <div>
                <Label htmlFor="field-description" className="text-sm font-medium text-slate-700">
                    Description
                </Label>
                <Textarea
                    id="field-description"
                    value={selectedField.description || ""}
                    onChange={(e) => handleFieldUpdate({ description: e.target.value })}
                    className="mt-1 text-black bg-white"
                    rows={2}
                    placeholder="Enter field description"
                />
            </div>

            {/* Field Width */}
            <div>
                <Label className="text-sm font-medium text-slate-700">Field Width</Label>
                <Select
                    value={selectedField.width}
                    onValueChange={(value) => handleFieldUpdate({ width: value as "full" | "half" | "third" | "quarter" })}

                >
                    <SelectTrigger className="mt-1 text-black">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-white bg-black">
                        <SelectItem value="full">Full Width</SelectItem>
                        <SelectItem value="half">Half Width</SelectItem>
                        <SelectItem value="third">Third Width</SelectItem>
                        <SelectItem value="quarter">Quarter Width</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Required Field */}
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="required-field"
                    checked={selectedField.required}
                    onCheckedChange={(checked) => handleFieldUpdate({
                        required: checked === true,
                        validation: {
                            ...selectedField.validation,
                            required: checked === true
                        }
                    })}
                />
                <Label htmlFor="required-field" className="text-sm text-slate-700">
                    Required Field
                </Label>
            </div>
        </div>
    );

    const renderValidationTab = () => (
        <div className="space-y-4  h-screen overflow-auto">
            <div>
                <Label className="text-sm font-medium text-slate-700">Validation Rules</Label>
                <div className="mt-2 space-y-3">
                    {/* Min Length */}
                    <div>
                        <Label htmlFor="min-length" className="text-xs text-slate-600">
                            Minimum Length
                        </Label>
                        <Input
                            id="min-length"
                            type="number"
                            value={selectedField.validation?.minLength || ""}
                            onChange={(e) => handleFieldUpdate({
                                validation: {
                                    ...selectedField.validation,
                                    minLength: e.target.value ? parseInt(e.target.value) : undefined
                                }
                            })}
                            className="mt-1 text-black"
                            placeholder="Enter minimum length"
                        />
                    </div>

                    {/* Max Length */}
                    <div>
                        <Label htmlFor="max-length" className="text-xs text-slate-600">
                            Maximum Length
                        </Label>
                        <Input
                            id="max-length"
                            type="number"
                            value={selectedField.validation?.maxLength || ""}
                            onChange={(e) => handleFieldUpdate({
                                validation: {
                                    ...selectedField.validation,
                                    maxLength: e.target.value ? parseInt(e.target.value) : undefined
                                }
                            })}
                            className="mt-1 text-black"
                            placeholder="Enter maximum length"
                        />
                    </div>

                    {/* Pattern */}
                    <div>
                        <Label htmlFor="pattern" className="text-xs text-slate-600">
                            Pattern (Regex)
                        </Label>
                        <Input
                            id="pattern"
                            value={selectedField.validation?.pattern || ""}
                            onChange={(e) => handleFieldUpdate({
                                validation: {
                                    ...selectedField.validation,
                                    pattern: e.target.value
                                }
                            })}
                            className="mt-1 text-black"
                            placeholder="Enter regex pattern"
                        />
                    </div>

                    {/* Error Message */}
                    <div>
                        <Label htmlFor="error-message" className="text-xs text-slate-600">
                            Custom Error Message
                        </Label>
                        <Input
                            id="error-message"
                            value={selectedField.validation?.errorMessage || ""}
                            onChange={(e) => handleFieldUpdate({
                                validation: {
                                    ...selectedField.validation,
                                    errorMessage: e.target.value
                                }
                            })}
                            className="mt-1 text-black"
                            placeholder="Enter custom error message"
                        />
                    </div>
                </div>
            </div>

            {/* Conditional Logic Section */}
            <div>
                <Label className="text-sm font-medium text-slate-700">Conditional Logic</Label>
                <div className="mt-2 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-600">
                                {selectedField.conditionalLogic?.enabled
                                    ? `${selectedField.conditionalLogic.ruleGroups.length} rule group(s) configured`
                                    : 'No conditional logic configured'
                                }
                            </span>
                            {selectedField.conditionalLogic?.enabled && (
                                <Badge variant="secondary" className="text-xs">
                                    {selectedField.conditionalLogic.logicOperator}
                                </Badge>
                            )}
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowConditionalLogic(true)}
                            className="h-8"
                        >
                            <Zap className="h-4 w-4 mr-2" />
                            Configure
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderOptionsTab = () => (
        <div className="space-y-4  h-screen overflow-auto">
            {/* Choice Fields */}
            {(selectedField.type === "select" || selectedField.type === "radio" || selectedField.type === "checkbox" || selectedField.type === "multiselect") && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-medium text-slate-700">Options</Label>
                        <Button
                            size="sm"
                            onClick={handleAddChoice}
                            className="h-8 px-2"
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Option
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {selectedField.options?.choices?.map((choice, index) => (
                            <div key={choice.id} className="flex items-center space-x-2 p-2 bg-white rounded border border-slate-200">
                                <GripVertical className="h-4 w-4 text-slate-400 cursor-move" />
                                <Input
                                    value={choice.label}
                                    onChange={(e) => handleUpdateChoice(choice.id, { label: e.target.value })}
                                    className="flex-1 text-black"
                                    placeholder="Option label"
                                />
                                <Input
                                    value={choice.value}
                                    onChange={(e) => handleUpdateChoice(choice.id, { value: e.target.value })}
                                    className="flex-1 text-black"
                                    placeholder="Option value"
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteChoice(choice.id)}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        )) || (
                                <div className="text-center py-4 text-slate-500">
                                    <p className="text-sm">No options added yet</p>
                                    <p className="text-xs">Click &ldquo;Add Option&rdquo; to get started</p>
                                </div>
                            )}
                    </div>
                </div>
            )}

            {/* File Upload Options */}
            {selectedField.type === "file" && (
                <div className="space-y-3">
                    <div>
                        <Label htmlFor="allowed-types" className="text-sm font-medium text-slate-700">
                            Allowed File Types
                        </Label>
                        <Input
                            id="allowed-types"
                            value={selectedField.options?.allowedFileTypes?.join(", ") || ""}
                            onChange={(e) => handleFieldUpdate({
                                options: {
                                    ...selectedField.options,
                                    allowedFileTypes: e.target.value.split(",").map(type => type.trim()).filter(Boolean)
                                }
                            })}
                            className="mt-1 text-black"
                            placeholder="jpg, png, pdf, doc"
                        />
                    </div>

                    <div>
                        <Label htmlFor="max-file-size" className="text-sm font-medium text-slate-700">
                            Max File Size (MB)
                        </Label>
                        <Input
                            id="max-file-size"
                            type="number"
                            value={selectedField.options?.maxFileSize ? selectedField.options.maxFileSize / (1024 * 1024) : ""}
                            onChange={(e) => handleFieldUpdate({
                                options: {
                                    ...selectedField.options,
                                    maxFileSize: e.target.value ? parseInt(e.target.value) * 1024 * 1024 : undefined
                                }
                            })}
                            className="mt-1 text-black"
                            placeholder="10"
                        />
                    </div>
                </div>
            )}

            {/* Number Field Options */}
            {selectedField.type === "number" && (
                <div className="space-y-3">
                    <div>
                        <Label htmlFor="min-value" className="text-sm font-medium text-slate-700">
                            Minimum Value
                        </Label>
                        <Input
                            id="min-value"
                            type="number"
                            value={selectedField.validation?.min || ""}
                            onChange={(e) => handleFieldUpdate({
                                validation: {
                                    ...selectedField.validation,
                                    min: e.target.value ? parseFloat(e.target.value) : undefined
                                }
                            })}
                            className="mt-1 text-black"
                            placeholder="0"
                        />
                    </div>

                    <div>
                        <Label htmlFor="max-value" className="text-sm font-medium text-slate-700">
                            Maximum Value
                        </Label>
                        <Input
                            id="max-value"
                            type="number"
                            value={selectedField.validation?.max || ""}
                            onChange={(e) => handleFieldUpdate({
                                validation: {
                                    ...selectedField.validation,
                                    max: e.target.value ? parseFloat(e.target.value) : undefined
                                }
                            })}
                            className="mt-1 text-black"
                            placeholder="100"
                        />
                    </div>
                </div>
            )}
        </div>
    );

    const renderStylingTab = () => (
        <div className="space-y-4">
            <div>
                <Label className="text-sm font-medium text-slate-700">Field Styling</Label>
                <div className="mt-2 space-y-3">
                    <div>
                        <Label htmlFor="background-color" className="text-xs text-slate-600">
                            Background Color
                        </Label>
                        <Input
                            id="background-color"
                            type="color"
                            value={selectedField.styling?.backgroundColor || "#ffffff"}
                            onChange={(e) => handleFieldUpdate({
                                styling: {
                                    ...selectedField.styling,
                                    backgroundColor: e.target.value
                                }
                            })}
                            className="mt-1 h-10 text-black"
                        />
                    </div>

                    <div>
                        <Label htmlFor="text-color" className="text-xs text-slate-600">
                            Text Color
                        </Label>
                        <Input
                            id="text-color"
                            type="color"
                            value={selectedField.styling?.textColor || "#000000"}
                            onChange={(e) => handleFieldUpdate({
                                styling: {
                                    ...selectedField.styling,
                                    textColor: e.target.value
                                }
                            })}
                            className="mt-1 h-10 text-black"
                        />
                    </div>

                    <div>
                        <Label htmlFor="border-radius" className="text-xs text-slate-600">
                            Border Radius (px)
                        </Label>
                        <Input
                            id="border-radius"
                            type="number"
                            value={selectedField.styling?.borderRadius || 4}
                            onChange={(e) => handleFieldUpdate({
                                styling: {
                                    ...selectedField.styling,
                                    borderRadius: parseInt(e.target.value)
                                }
                            })}
                            className="mt-1 text-black"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-80 bg-slate-50 border-l border-slate-200 flex flex-col h-screen">
            {/* Header - Fixed */}
            <div className="flex-shrink-0 p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Properties</h3>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => actions.setSelectedField(null)}
                        className="h-8 w-8 p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="mt-2 flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                        {formBuilderUtils.getFieldTypeLabel(selectedField.type)}
                    </Badge>
                    {selectedField.required && (
                        <Badge variant="destructive" className="text-xs">
                            Required
                        </Badge>
                    )}
                </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 flex flex-col overflow-y-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                    {/* Tabs List - Fixed */}
                    <div className="flex-shrink-0 p-4 pb-0">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="general" className="text-xs">

                                General
                            </TabsTrigger>
                            <TabsTrigger value="validation" className="text-xs">

                                Rules
                            </TabsTrigger>
                            <TabsTrigger value="options" className="text-xs">

                                Options
                            </TabsTrigger>
                            <TabsTrigger value="styling" className="text-xs">

                                Style
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Tab Content - Scrollable */}
                    <div className="flex-1 h-32">
                        <TabsContent value="general" className="p-4 h-full">
                            {renderGeneralTab()}
                        </TabsContent>

                        <TabsContent value="validation" className="p-4 h-full">
                            {renderValidationTab()}
                        </TabsContent>

                        <TabsContent value="options" className="p-4 h-full">
                            {renderOptionsTab()}
                        </TabsContent>

                        <TabsContent value="styling" className="p-4 h-full">
                            {renderStylingTab()}
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            {/* Conditional Logic Builder Modal */}
            {showConditionalLogic && (
                <ConditionalLogicBuilder
                    field={selectedField}
                    allFields={state.fields}
                    onUpdate={(fieldId, conditionalLogic) => {
                        actions.updateField(fieldId, { conditionalLogic });
                        setShowConditionalLogic(false);
                    }}
                    onClose={() => setShowConditionalLogic(false)}
                />
            )}
        </div>
    );
}
