"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea"; // Unused for now
// import { Badge } from "@/components/ui/badge"; // Unused for now
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Plus,
    Edit,
    Trash2,
    GripVertical,
    // Eye, // Unused for now
    // EyeOff, // Unused for now
    CreditCard,
    Settings,
    ArrowRight,
} from "lucide-react";
import { useFormBuilder } from "./FormBuilderProvider";
import { toast } from "sonner";
import type { FormStep, FormField } from "@/types/form-builder";

interface StepFieldAssignmentProps {
    isOpen: boolean;
    onClose: () => void;
    step: FormStep | null;
}

interface ConditionalRule {
    id: string;
    fieldId: string;
    operator: "equals" | "not_equals" | "contains" | "not_contains";
    value: string;
    action: "show" | "hide";
    targetFieldId: string;
}

export function StepFieldAssignment({ isOpen, onClose, step }: StepFieldAssignmentProps) {
    const { state, actions } = useFormBuilder();
    const [stepFields, setStepFields] = useState<string[]>(step?.fields || []);
    const [isPayment, setIsPayment] = useState(step?.isPayment || false);
    const [paymentAmount, setPaymentAmount] = useState(step?.paymentAmount || 0);
    const [conditionalRules, setConditionalRules] = useState<ConditionalRule[]>([]);
    const [showConditionalDialog, setShowConditionalDialog] = useState(false);
    const [editingRule, setEditingRule] = useState<ConditionalRule | null>(null);

    useEffect(() => {
        if (step) {
       

            setStepFields(step.fields || []);
            setIsPayment(step.isPayment || false);
            setPaymentAmount(step.paymentAmount || 0);

            // Initialize conditional rules from step conditions
            if (step.conditions?.enabled && step.conditions.conditions?.length) {
               
                const rules: ConditionalRule[] = step.conditions.conditions.map((condition, index) => ({
                    id: `rule_${Date.now()}_${index}`,
                    fieldId: condition.fieldId,
                    operator: condition.operator as "equals" | "not_equals" | "contains" | "not_contains",
                    value: String(condition.value),
                    action: (step.conditions?.actions?.[index]?.type as "show" | "hide") || 'show',
                    targetFieldId: step.conditions?.actions?.[index]?.targetFieldId || ''
                }));
                setConditionalRules(rules);
            } else {

                setConditionalRules([]);
            }
        }
    }, [step]);

    const handleFieldToggle = (fieldId: string) => {
        setStepFields(prev =>
            prev.includes(fieldId)
                ? prev.filter(id => id !== fieldId)
                : [...prev, fieldId]
        );
    };

    const handleSaveStep = () => {
        if (!step) return;

     

        const updatedStep: FormStep = {
            ...step,
            fields: stepFields,
            isPayment,
            paymentAmount: isPayment ? paymentAmount : undefined,
            conditions: conditionalRules.length > 0 ? {
                enabled: true,
                conditions: conditionalRules.map(rule => ({
                    fieldId: rule.fieldId,
                    operator: rule.operator,
                    value: rule.value
                })),
                actions: conditionalRules.map(rule => ({
                    type: rule.action,
                    targetFieldId: rule.targetFieldId
                }))
            } : undefined
        };

        // Note: Conditional logic is stored at step level, not field level
        // This ensures it's scoped to the specific step only

        // Update the step using the global state action
        actions.updateStep(step.id, updatedStep);
        toast.success("Step updated successfully");
        onClose();
    };

    const handleAddConditionalRule = () => {
        setEditingRule(null);
        setShowConditionalDialog(true);
    };

    const handleEditConditionalRule = (rule: ConditionalRule) => {
        setEditingRule(rule);
        setShowConditionalDialog(true);
    };

    const handleSaveConditionalRule = (rule: ConditionalRule) => {
        if (editingRule) {
            setConditionalRules(prev =>
                prev.map(r => r.id === editingRule.id ? rule : r)
            );
        } else {
            setConditionalRules(prev => [...prev, rule]);
        }
        setShowConditionalDialog(false);
    };

    const handleDeleteConditionalRule = (ruleId: string) => {
        setConditionalRules(prev => prev.filter(r => r.id !== ruleId));
    };

    const getFieldById = (fieldId: string) => {
        return state.fields.find(f => f.id === fieldId);
    };

    const getAvailableFields = () => {
        // Get all fields that are not assigned to any step
        const allAssignedFields = state.steps.flatMap(step => step.fields);
        return state.fields.filter(field =>
            !allAssignedFields.includes(field.id) && !stepFields.includes(field.id)
        );
    };

    const getStepFields = () => {
        return stepFields.map(fieldId => getFieldById(fieldId)).filter(Boolean) as FormField[];
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-4xl bg-white overflow-y-auto h-screen">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-gray-900">
                            {step ? `Configure "${step.title}"` : "Configure Step"}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-600">
                            Assign fields to this step and configure payment settings.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Payment Configuration */}


                        {/* Field Assignment */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Available Fields */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-900">Available Fields</h4>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {getAvailableFields().length === 0 ? (
                                        <div className="text-center py-4 text-gray-500 text-sm">
                                            All fields are assigned
                                        </div>
                                    ) : (
                                        getAvailableFields().map((field) => (
                                            <div
                                                key={field.id}
                                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <GripVertical className="h-4 w-4 text-gray-400" />
                                                    <div>
                                                        <div className="font-medium text-gray-900">{field.label}</div>
                                                        <div className="text-xs text-gray-500">{field.type}</div>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleFieldToggle(field.id)}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Assigned Fields */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-900">Assigned Fields</h4>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {getStepFields().length === 0 ? (
                                        <div className="text-center py-4 text-gray-500 text-sm">
                                            No fields assigned to this step
                                        </div>
                                    ) : (
                                        getStepFields().map((field) => (
                                            <div
                                                key={field.id}
                                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-blue-50"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <GripVertical className="h-4 w-4 text-gray-400" />
                                                    <div>
                                                        <div className="font-medium text-gray-900">{field.label}</div>
                                                        <div className="text-xs text-gray-500">{field.type}</div>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleFieldToggle(field.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Remove
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Conditional Logic */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <Settings className="h-5 w-5 text-purple-600" />
                                    <h3 className="font-medium text-gray-900">Conditional Logic</h3>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleAddConditionalRule}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Rule
                                </Button>
                            </div>

                            {conditionalRules.length === 0 ? (
                                <div className="text-center py-4 text-gray-500 text-sm">
                                    No conditional rules defined
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {conditionalRules.map((rule) => (
                                        <div
                                            key={rule.id}
                                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <ArrowRight className="h-4 w-4 text-gray-400" />
                                                <div className="text-sm">
                                                    <span className="font-medium">
                                                        {getFieldById(rule.fieldId)?.label || "Unknown Field"}
                                                    </span>
                                                    <span className="mx-2 text-gray-500">
                                                        {rule.operator === "equals" ? "equals" :
                                                            rule.operator === "not_equals" ? "does not equal" :
                                                                rule.operator === "contains" ? "contains" : "does not contain"}
                                                    </span>
                                                    <span className="font-medium">&ldquo;{rule.value}&rdquo;</span>
                                                    <span className="mx-2 text-gray-500">then</span>
                                                    <span className="font-medium">
                                                        {rule.action === "show" ? "show" : "hide"}
                                                    </span>
                                                    <span className="mx-2 text-gray-500">
                                                        {getFieldById(rule.targetFieldId)?.label || "Unknown Field"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleEditConditionalRule(rule)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteConditionalRule(rule.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveStep} className="bg-blue-600 hover:bg-blue-700">
                            Save Step Configuration
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Conditional Rule Dialog */}
            <ConditionalRuleDialog
                isOpen={showConditionalDialog}
                onClose={() => setShowConditionalDialog(false)}
                onSave={handleSaveConditionalRule}
                rule={editingRule}
                fields={state.fields}
            />
        </>
    );
}

// Conditional Rule Dialog Component
interface ConditionalRuleDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rule: ConditionalRule) => void;
    rule: ConditionalRule | null;
    fields: FormField[];
}

function ConditionalRuleDialog({ isOpen, onClose, onSave, rule, fields }: ConditionalRuleDialogProps) {
    
    const [formData, setFormData] = useState<ConditionalRule>({
        id: rule?.id || `rule_${Date.now()}`,
        fieldId: rule?.fieldId || "",
        operator: rule?.operator || "equals",
        value: rule?.value || "",
        action: rule?.action || "show",
        targetFieldId: rule?.targetFieldId || "",
    });

    const handleSave = () => {
        if (!formData.fieldId || !formData.targetFieldId || !formData.value) {
            toast.error("Please fill in all fields");
            return;
        }
        onSave(formData);
    };

    const getFieldOptions = () => {
        // Show ALL fields from the form, not just specific types
        const filteredFields = fields.filter(field => field.label && field.label.trim() !== "");
     
        return filteredFields;
    };

    const getTargetFieldOptions = () => {
        const targetFields = fields.filter(field => field.id !== formData.fieldId);
       
        return targetFields;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                        {rule ? "Edit Conditional Rule" : "Add Conditional Rule"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600">
                        Create a rule that shows or hides fields based on user input.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="source-field" className="text-sm font-medium text-gray-700">
                            When this field
                        </Label>
                        <Select value={formData.fieldId} onValueChange={(value) => setFormData({ ...formData, fieldId: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                                {getFieldOptions().length > 0 ? (
                                    getFieldOptions().map((field) => (
                                        <SelectItem key={field.id} value={field.id}>
                                            {field.label} ({field.type})
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="" disabled>
                                        No fields available
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="operator" className="text-sm font-medium text-gray-700">
                            Operator
                        </Label>
                        <Select value={formData.operator} onValueChange={(value) => setFormData({ ...formData, operator: value as "equals" | "not_equals" | "contains" | "not_contains" })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="equals">equals</SelectItem>
                                <SelectItem value="not_equals">does not equal</SelectItem>
                                <SelectItem value="contains">contains</SelectItem>
                                <SelectItem value="not_contains">does not contain</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="value" className="text-sm font-medium text-gray-700">
                            Value
                        </Label>
                        <Input
                            id="value"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            placeholder="Enter value to match"
                        />
                    </div>

                    <div>
                        <Label htmlFor="action" className="text-sm font-medium text-gray-700">
                            Then
                        </Label>
                        <Select value={formData.action} onValueChange={(value) => setFormData({ ...formData, action: value as "show" | "hide" })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="show">Show</SelectItem>
                                <SelectItem value="hide">Hide</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="target-field" className="text-sm font-medium text-gray-700">
                            This field
                        </Label>
                        <Select value={formData.targetFieldId} onValueChange={(value) => setFormData({ ...formData, targetFieldId: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select target field" />
                            </SelectTrigger>
                            <SelectContent>
                                {getTargetFieldOptions().length > 0 ? (
                                    getTargetFieldOptions().map((field) => (
                                        <SelectItem key={field.id} value={field.id}>
                                            {field.label} ({field.type})
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="" disabled>
                                        No target fields available
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                        {rule ? "Update Rule" : "Add Rule"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
