"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    Clock,
    Upload,
    Star,
    Sliders,
    MapPin,
    Link,
    Lock,
    PenTool,
    Calculator,
    CreditCard,
    Hash,
    Phone,
    Mail,
    Type,
    FileText
} from "lucide-react";
import type { FormField, FieldComponentProps } from "@/types/form-builder";
import { formBuilderUtils } from "@/lib/api/forms";

export function FormFieldRenderer({
    field,
    isSelected = false,
    isPreview = false,
    onUpdate,
    className = ""
}: FieldComponentProps) {
    const handleLabelChange = (value: string) => {
        if (onUpdate) {
            onUpdate(field.id, { label: value });
        }
    };

    const handlePlaceholderChange = (value: string) => {
        if (onUpdate) {
            onUpdate(field.id, { placeholder: value });
        }
    };

    const handleRequiredChange = (required: boolean) => {
        if (onUpdate) {
            onUpdate(field.id, {
                required,
                validation: {
                    ...field.validation,
                    required
                }
            });
        }
    };

    const handleDescriptionChange = (value: string) => {
        if (onUpdate) {
            onUpdate(field.id, { description: value });
        }
    };

    const renderFieldIcon = () => {
        const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
            text: Type,
            textarea: FileText,
            email: Mail,
            phone: Phone,
            number: Hash,
            date: Calendar,
            time: Clock,
            datetime: Calendar,
            select: Sliders,
            multiselect: Sliders,
            radio: Sliders,
            checkbox: Sliders,
            file: Upload,
            signature: PenTool,
            rating: Star,
            slider: Sliders,
            address: MapPin,
            url: Link,
            password: Lock,
            calculation: Calculator,
            payment: CreditCard
        };

        const IconComponent = iconMap[field.type] || Type;
        return <IconComponent className="h-4 w-4 text-slate-500" />;
    };

    const renderFieldInput = () => {
        const commonProps = {
            placeholder: field.placeholder || `Enter ${field.label.toLowerCase()}`,
            disabled: !isPreview && isSelected,
            className: "w-full"
        };

        switch (field.type) {
            case "text":
                return (
                    <Input
                        {...commonProps}
                        value={isPreview ? "" : field.label}
                        onChange={(e) => isPreview ? undefined : handleLabelChange(e.target.value)}
                    />
                );

            case "textarea":
                return (
                    <Textarea
                        {...commonProps}
                        rows={3}
                        value={isPreview ? "" : field.label}
                        onChange={(e) => isPreview ? undefined : handleLabelChange(e.target.value)}
                    />
                );

            case "email":
                return (
                    <Input
                        {...commonProps}
                        type="email"
                        value={isPreview ? "" : field.label}
                        onChange={(e) => isPreview ? undefined : handleLabelChange(e.target.value)}
                    />
                );

            case "phone":
                return (
                    <Input
                        {...commonProps}
                        type="tel"
                        value={isPreview ? "" : field.label}
                        onChange={(e) => isPreview ? undefined : handleLabelChange(e.target.value)}
                    />
                );

            case "number":
                return (
                    <Input
                        {...commonProps}
                        type="number"
                        value={isPreview ? "" : field.label}
                        onChange={(e) => isPreview ? undefined : handleLabelChange(e.target.value)}
                    />
                );

            case "date":
                return (
                    <Input
                        {...commonProps}
                        type="date"
                        value={isPreview ? "" : field.label}
                        onChange={(e) => isPreview ? undefined : handleLabelChange(e.target.value)}
                    />
                );

            case "time":
                return (
                    <Input
                        {...commonProps}
                        type="time"
                        value={isPreview ? "" : field.label}
                        onChange={(e) => isPreview ? undefined : handleLabelChange(e.target.value)}
                    />
                );

            case "datetime":
                return (
                    <Input
                        {...commonProps}
                        type="datetime-local"
                        value={isPreview ? "" : field.label}
                        onChange={(e) => isPreview ? undefined : handleLabelChange(e.target.value)}
                    />
                );

            case "select":
                return (
                    <Select disabled={!isPreview && isSelected}>
                        <SelectTrigger {...commonProps}>
                            <SelectValue placeholder={field.placeholder || "Select an option"} />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options?.choices?.map((choice) => (
                                <SelectItem key={choice.id} value={choice.value}>
                                    {choice.label}
                                </SelectItem>
                            )) || (
                                    <div>
                                        <SelectItem value="option1">Option 1</SelectItem>
                                        <SelectItem value="option2">Option 2</SelectItem>
                                    </div>

                                )}
                        </SelectContent>
                    </Select>
                );

            case "multiselect":
                return (
                    <div className="space-y-2">
                        {field.options?.choices?.map((choice) => (
                            <div key={choice.id} className="flex items-center space-x-2">
                                <Checkbox id={choice.id} />
                                <Label htmlFor={choice.id}>{choice.label}</Label>
                            </div>
                        )) || (
                                <>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="option1" />
                                        <Label htmlFor="option1">Option 1</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="option2" />
                                        <Label htmlFor="option2">Option 2</Label>
                                    </div>
                                </>
                            )}
                    </div>
                );

            case "radio":
                return (
                    <RadioGroup>
                        {field.options?.choices?.map((choice) => (
                            <div key={choice.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={choice.value} id={choice.id} />
                                <Label htmlFor={choice.id}>{choice.label}</Label>
                            </div>
                        )) || (
                                <>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="option1" id="radio1" />
                                        <Label htmlFor="radio1">Option 1</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="option2" id="radio2" />
                                        <Label htmlFor="radio2">Option 2</Label>
                                    </div>
                                </>
                            )}
                    </RadioGroup>
                );

            case "checkbox":
                return (
                    <div className="flex items-center space-x-2">
                        <Checkbox id={field.id} />
                        <Label htmlFor={field.id}>{field.label}</Label>
                    </div>
                );

            case "file":
                return (
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                        <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-500 mt-1">
                            {field.options?.allowedTypes?.join(", ") || "Any file type"}
                        </p>
                    </div>
                );

            case "signature":
                return (
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                        <PenTool className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">Click to sign</p>
                    </div>
                );

            case "rating":
                return (
                    <div className="flex items-center space-x-1">
                        {Array.from({ length: field.options?.maxRating || 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className="h-6 w-6 text-slate-300 hover:text-yellow-400 cursor-pointer"
                            />
                        ))}
                    </div>
                );

            case "slider":
                return (
                    <div className="space-y-2">
                        <input
                            type="range"
                            min={field.options?.min || 0}
                            max={field.options?.max || 100}
                            step={field.options?.sliderStep || 1}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>{field.options?.min || 0}</span>
                            <span>{field.options?.max || 100}</span>
                        </div>
                    </div>
                );

            case "address":
                return (
                    <div className="space-y-2">
                        <Input placeholder="Street Address" />
                        <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="City" />
                            <Input placeholder="State" />
                        </div>
                        <Input placeholder="ZIP Code" />
                    </div>
                );

            case "url":
                return (
                    <Input
                        {...commonProps}
                        type="url"
                        value={isPreview ? "" : field.label}
                        onChange={(e) => isPreview ? undefined : handleLabelChange(e.target.value)}
                    />
                );

            case "password":
                return (
                    <Input
                        {...commonProps}
                        type="password"
                        value={isPreview ? "" : field.label}
                        onChange={(e) => isPreview ? undefined : handleLabelChange(e.target.value)}
                    />
                );

            case "calculation":
                return (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center space-x-2">
                            <Calculator className="h-4 w-4 text-slate-500" />
                            <span className="text-sm text-slate-600">Calculated Field</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            {field.options?.formula || "No formula defined"}
                        </p>
                    </div>
                );

            case "payment":
                return (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4 text-slate-500" />
                            <span className="text-sm text-slate-600">Payment Field</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Amount: {field.options?.amount || 0} {field.options?.currency || "USD"}
                        </p>
                    </div>
                );

            case "heading":
                return (
                    <h3 className="text-lg font-semibold text-slate-900">
                        {field.label || "Heading"}
                    </h3>
                );

            case "paragraph":
                return (
                    <p className="text-slate-600">
                        {field.label || "This is a paragraph of text."}
                    </p>
                );

            case "divider":
                return <hr className="border-slate-200" />;

            default:
                return (
                    <Input
                        {...commonProps}
                        value={isPreview ? "" : field.label}
                        onChange={(e) => isPreview ? undefined : handleLabelChange(e.target.value)}
                    />
                );
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Field Label */}
            <div className="flex items-center space-x-2">
                <Label htmlFor={field.id} className="text-sm font-medium text-slate-900">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {!isPreview && isSelected && (
                    <div className="flex items-center space-x-1">
                        <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleRequiredChange(e.target.checked)}
                            className="rounded"
                        />
                        <span className="text-xs text-slate-500">Required</span>
                    </div>
                )}
            </div>

            {/* Field Description */}
            {field.description && (
                <p className="text-xs text-slate-500">{field.description}</p>
            )}

            {/* Field Input */}
            {renderFieldInput()}

            {/* Field Validation Messages */}
            {field.validation?.errorMessage && (
                <p className="text-xs text-red-500">{field.validation.errorMessage}</p>
            )}
        </div>
    );
}
