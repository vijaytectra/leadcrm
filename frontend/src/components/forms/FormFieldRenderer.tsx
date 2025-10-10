"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider, SliderTrack, SliderRange, SliderThumb } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
    Upload,
    Star,
    PenTool,
    Calculator,
    CreditCard,
    Calendar as CalendarIcon
} from "lucide-react";
import { format } from "date-fns";
import type { FieldComponentProps, PaymentItem } from "@/types/form-builder";

export function FormFieldRenderer({
    field,
    isSelected = false,
    isPreview = false,
    onUpdate,
    value,
    onChange,
    className = ""
}: FieldComponentProps & {
    value?: unknown;
    onChange?: (value: unknown) => void;
}) {
    const handleLabelChange = (value: string) => {
        if (onUpdate) {
            onUpdate(field.id, { label: value });
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

    const renderFieldInput = () => {
        const commonProps = {
            placeholder: field.placeholder || `Enter ${field.label.toLowerCase()}`,
            disabled: isPreview ? false : isSelected,
            className: "w-full text-black"
        };

        // For preview mode, use actual values and handle changes
        if (isPreview) {
            const previewProps = {
                ...commonProps,
                value: value !== undefined ? String(value) : "",
                onChange: onChange ? (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
                    onChange(e.target.value);
                } : undefined
            };

            switch (field.type) {
                case "text":
                case "email":
                case "phone":
                case "number":
                case "url":
                case "password":
                    return (
                        <Input
                            {...previewProps}
                            type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "phone" ? "tel" : field.type === "url" ? "url" : field.type === "password" ? "password" : "text"}
                        />
                    );

                case "textarea":
                    return (
                        <Textarea
                            {...previewProps}
                            rows={3}
                            onChange={onChange ? (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value) : undefined}
                        />
                    );

                case "date":
                    return (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={`w-full justify-start text-left font-normal ${!value && "text-muted-foreground"
                                        }`}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {value ? format(new Date(value as string), "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={value ? new Date(value as string) : undefined}
                                    onSelect={(selectedDate: Date | undefined) => {
                                        onChange?.(selectedDate?.toISOString().split('T')[0] || '');
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    );

                case "time":
                    return (
                        <Input
                            {...previewProps}
                            type="time"
                        />
                    );

                case "datetime":
                    return (
                        <Input
                            {...previewProps}
                            type="datetime-local"
                        />
                    );

                case "select":
                    return (
                        <Select
                            value={String(value || "")}
                            onValueChange={onChange}
                            disabled={!isPreview && isSelected}
                        >
                            <SelectTrigger {...commonProps}>
                                <SelectValue placeholder={field.placeholder || "Select an option"} />
                            </SelectTrigger>
                            <SelectContent>
                                {field.options?.choices?.map((choice) => {
                                    if (!choice.value || choice.value.trim() === '') {
                                        return null;
                                    }
                                    return (
                                        <SelectItem key={choice.id} value={choice.value}>
                                            {choice.label}
                                        </SelectItem>
                                    );
                                }) || (
                                        <div>
                                            <SelectItem value="option1">Option 1</SelectItem>
                                            <SelectItem value="option2">Option 2</SelectItem>
                                        </div>
                                    )}
                            </SelectContent>
                        </Select>
                    );

                case "radio":
                    return (
                        <RadioGroup
                            value={String(value || "")}
                            onValueChange={onChange}
                        >
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
                        <div className="space-y-2">
                            {field.options?.choices?.map((choice) => (
                                <div key={choice.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={choice.id}
                                        checked={Array.isArray(value) && (value as string[]).includes(choice.value)}
                                        onCheckedChange={(checked) => {
                                            if (onChange) {
                                                const currentValues = Array.isArray(value) ? value as string[] : [];
                                                if (checked) {
                                                    onChange([...currentValues, choice.value]);
                                                } else {
                                                    onChange(currentValues.filter(v => v !== choice.value));
                                                }
                                            }
                                        }}
                                    />
                                    <Label htmlFor={choice.id}>{choice.label}</Label>
                                </div>
                            )) || (
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="checkbox1" />
                                        <Label htmlFor="checkbox1">Option 1</Label>
                                    </div>
                                )}
                        </div>
                    );

                case "multiselect":
                    return (
                        <div className="space-y-2">
                            {field.options?.choices?.map((choice) => (
                                <div key={choice.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={choice.id}
                                        checked={Array.isArray(value) && (value as string[]).includes(choice.value)}
                                        onCheckedChange={(checked) => {
                                            if (onChange) {
                                                const currentValues = Array.isArray(value) ? value as string[] : [];
                                                if (checked) {
                                                    onChange([...currentValues, choice.value]);
                                                } else {
                                                    onChange(currentValues.filter(v => v !== choice.value));
                                                }
                                            }
                                        }}
                                    />
                                    <Label htmlFor={choice.id}>{choice.label}</Label>
                                </div>
                            )) || (
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="multiselect1" />
                                        <Label htmlFor="multiselect1">Option 1</Label>
                                    </div>
                                )}
                        </div>
                    );

                case "slider":
                    return (
                        <div className="space-y-2">
                            <Slider
                                value={[Number(value) || 0]}
                                onValueChange={(values: number[]) => onChange?.(values[0])}
                                min={field.options?.min || 0}
                                max={field.options?.max || 100}
                                step={field.options?.step || 1}
                                className="w-full"
                            >
                                <SliderTrack>
                                    <SliderRange />
                                </SliderTrack>
                                <SliderThumb />
                            </Slider>
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{field.options?.min || 0}</span>
                                <span className="font-medium">{String(value || 0)}</span>
                                <span>{field.options?.max || 100}</span>
                            </div>
                        </div>
                    );

                case "file":
                    return (
                        <div>
                            <input
                                type="file"
                                className="hidden"
                                accept={field.options?.allowedFileTypes?.join(",")}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file && onChange) {
                                        onChange(file);
                                    }
                                }}
                                id={`file-${field.id}`}
                            />
                            <label htmlFor={`file-${field.id}`} className="cursor-pointer">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-500">
                                        {field.options?.allowedFileTypes?.join(", ") || "Any file type"}
                                    </p>
                                </div>
                            </label>
                        </div>
                    );

                case "rating":
                    const rating = Number(value) || 0;
                    const maxRating = (field.options as Record<string, unknown>)?.maxRating as number || 5;
                    return (
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: maxRating }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-6 w-6 cursor-pointer transition-colors ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                        }`}
                                    onClick={() => onChange?.(i + 1)}
                                />
                            ))}
                            <span className="ml-2 text-sm text-gray-600">{rating}/{maxRating}</span>
                        </div>
                    );

                case "signature":
                    return (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <PenTool className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Click to sign</p>
                            <p className="text-xs text-gray-500 mt-1">Digital signature pad</p>
                        </div>
                    );

                case "payment":
                    const paymentItems = (field.options as Record<string, unknown>)?.paymentItems as PaymentItem[] || [];
                    const currency = (field.options as Record<string, unknown>)?.currency as string || "USD";
                    const totalAmount = paymentItems.reduce((sum, item) => sum + item.amount, 0);

                    return (
                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50">
                            <div className="flex items-center justify-center mb-4">
                                <CreditCard className="h-8 w-8 text-blue-500 mr-2" />
                                <p className="text-lg font-semibold text-blue-700">Payment Required</p>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-blue-200 space-y-3">
                                {paymentItems.length > 0 ? (
                                    <>
                                        <div className="space-y-2">
                                            {paymentItems.map((item) => (
                                                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.name}</p>
                                                        {item.description && (
                                                            <p className="text-sm text-gray-500">{item.description}</p>
                                                        )}
                                                    </div>
                                                    <span className="font-semibold text-gray-900">
                                                        {currency} {item.amount}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-between items-center py-3 border-t-2 border-blue-200">
                                            <span className="text-lg font-bold text-blue-700">Total Amount:</span>
                                            <span className="text-xl font-bold text-blue-600">
                                                {currency} {totalAmount}
                                            </span>
                                        </div>

                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                            Pay {currency} {totalAmount}
                                        </Button>
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-gray-500">No payment items configured</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );

                default:
                    return (
                        <Input
                            {...previewProps}
                            type="text"
                        />
                    );
            }
        }

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
                            {field.options?.choices?.map((choice) => {
                                // Skip empty values to prevent SelectItem error
                                if (!choice.value || choice.value.trim() === '') {
                                    return null;
                                }

                                return (
                                    <SelectItem key={choice.id} value={choice.value}>
                                        {choice.label}
                                    </SelectItem>
                                );
                            }) || (
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
                                        <Checkbox id="multiselect1" />
                                        <Label htmlFor="multiselect1">Option 1</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="multiselect2" />
                                        <Label htmlFor="multiselect2">Option 2</Label>
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
                            {field.options?.allowedFileTypes?.join(", ") || "Any file type"}
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
                        {Array.from({ length: (field.options as Record<string, unknown>)?.maxRating as number || 5 }).map((_, i) => (
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
                        <Slider
                            defaultValue={[50]}
                            min={field.options?.min || 0}
                            max={field.options?.max || 100}
                            step={field.options?.step || 1}
                            className="w-full"
                        >
                            <SliderTrack>
                                <SliderRange />
                            </SliderTrack>
                            <SliderThumb />
                        </Slider>
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
                            {(field.options as Record<string, unknown>)?.formula as string || "No formula defined"}
                        </p>
                    </div>
                );

            case "payment":
                const currentPaymentItems = (field.options as Record<string, unknown>)?.paymentItems as PaymentItem[] || [];
                const currentCurrency = (field.options as Record<string, unknown>)?.currency as string || "USD";

                return (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center space-x-2 mb-3">
                            <CreditCard className="h-4 w-4 text-slate-500" />
                            <span className="text-sm text-slate-600">Payment Field</span>
                        </div>

                        <div className="space-y-3">
                            {/* Currency Selection */}
                            <div className="flex items-center space-x-2">
                                <Label className="text-xs text-slate-600">Currency:</Label>
                                <Select
                                    value={currentCurrency}
                                    onValueChange={(value) => {
                                        if (onUpdate) {
                                            onUpdate(field.id, {
                                                options: {
                                                    ...field.options,
                                                    currency: value
                                                }
                                            });
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-20 h-8 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="GBP">GBP</SelectItem>
                                        <SelectItem value="INR">INR</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Payment Items */}
                            <div className="space-y-2">
                                <Label className="text-xs text-slate-600">Payment Items:</Label>
                                {currentPaymentItems.map((item, index) => (
                                    <div key={item.id} className="flex items-center space-x-2 p-2 bg-white rounded border">
                                        <Input
                                            placeholder="Item name"
                                            value={item.name}
                                            onChange={(e) => {
                                                const updatedItems = [...currentPaymentItems];
                                                updatedItems[index] = { ...item, name: e.target.value };
                                                if (onUpdate) {
                                                    onUpdate(field.id, {
                                                        options: {
                                                            ...field.options,
                                                            paymentItems: updatedItems
                                                        }
                                                    });
                                                }
                                            }}
                                            className="flex-1 h-8 text-sm"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Amount"
                                            value={item.amount}
                                            onChange={(e) => {
                                                const updatedItems = [...currentPaymentItems];
                                                updatedItems[index] = { ...item, amount: Number(e.target.value) || 0 };
                                                if (onUpdate) {
                                                    onUpdate(field.id, {
                                                        options: {
                                                            ...field.options,
                                                            paymentItems: updatedItems
                                                        }
                                                    });
                                                }
                                            }}
                                            className="w-20 h-8 text-sm"
                                        />
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                const updatedItems = currentPaymentItems.filter((_, i) => i !== index);
                                                if (onUpdate) {
                                                    onUpdate(field.id, {
                                                        options: {
                                                            ...field.options,
                                                            paymentItems: updatedItems
                                                        }
                                                    });
                                                }
                                            }}
                                            className="h-8 w-8 p-0"
                                        >
                                            ×
                                        </Button>
                                    </div>
                                ))}

                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        const newItem: PaymentItem = {
                                            id: `item_${Date.now()}`,
                                            name: "",
                                            amount: 0,
                                            required: true
                                        };
                                        const updatedItems = [...currentPaymentItems, newItem];
                                        if (onUpdate) {
                                            onUpdate(field.id, {
                                                options: {
                                                    ...field.options,
                                                    paymentItems: updatedItems
                                                }
                                            });
                                        }
                                    }}
                                    className="w-full h-8 text-sm"
                                >
                                    + Add Payment Item
                                </Button>
                            </div>

                            {/* Total Display */}
                            {currentPaymentItems.length > 0 && (
                                <div className="flex justify-between items-center py-2 border-t border-slate-200">
                                    <span className="text-sm font-medium text-slate-700">Total:</span>
                                    <span className="text-sm font-bold text-slate-900">
                                        {currentCurrency} {currentPaymentItems.reduce((sum, item) => sum + item.amount, 0)}
                                    </span>
                                </div>
                            )}
                        </div>
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
