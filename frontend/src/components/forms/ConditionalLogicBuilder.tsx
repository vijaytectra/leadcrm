'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Plus,
    Trash2,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle,
    X,
    Settings
} from 'lucide-react';
import { ConditionalLogic, RuleGroup, Condition, Action, FormField } from '@/types/form-builder';

interface ConditionalLogicBuilderProps {
    field: FormField;
    allFields: FormField[];
    onUpdate: (fieldId: string, conditionalLogic: ConditionalLogic) => void;
    onClose: () => void;
    className?: string;
}

const OPERATOR_OPTIONS = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Not Contains' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' },
];

const ACTION_OPTIONS = [
    { value: 'show', label: 'Show', icon: Eye },
    { value: 'hide', label: 'Hide', icon: EyeOff },
    { value: 'require', label: 'Require', icon: AlertCircle },
    { value: 'make_optional', label: 'Make Optional', icon: CheckCircle },
    { value: 'enable', label: 'Enable', icon: Settings },
    { value: 'disable', label: 'Disable', icon: X },
];

export function ConditionalLogicBuilder({
    field,
    allFields,
    onUpdate,
    onClose,
    className
}: ConditionalLogicBuilderProps) {
    const [conditionalLogic, setConditionalLogic] = useState<ConditionalLogic>(
        field.conditionalLogic || {
            enabled: false,
            logicOperator: 'AND',
            ruleGroups: [],
            actions: []
        }
    );

    const handleSave = () => {
        onUpdate(field.id, conditionalLogic);
        onClose();
    };

    const addRuleGroup = () => {
        const newRuleGroup: RuleGroup = {
            id: `rule-group-${Date.now()}`,
            conditions: [],
            operator: 'AND'
        };

        setConditionalLogic(prev => ({
            ...prev,
            ruleGroups: [...prev.ruleGroups, newRuleGroup]
        }));
    };

    const removeRuleGroup = (ruleGroupId: string) => {
        setConditionalLogic(prev => ({
            ...prev,
            ruleGroups: prev.ruleGroups.filter(rg => rg.id !== ruleGroupId)
        }));
    };

    const updateRuleGroupOperator = (ruleGroupId: string, operator: 'AND' | 'OR') => {
        setConditionalLogic(prev => ({
            ...prev,
            ruleGroups: prev.ruleGroups.map(rg =>
                rg.id === ruleGroupId ? { ...rg, operator } : rg
            )
        }));
    };

    const addCondition = (ruleGroupId: string) => {
        const newCondition: Condition = {
            id: `condition-${Date.now()}`,
            fieldId: '',
            operator: 'equals',
            value: ''
        };

        setConditionalLogic(prev => ({
            ...prev,
            ruleGroups: prev.ruleGroups.map(rg =>
                rg.id === ruleGroupId
                    ? { ...rg, conditions: [...rg.conditions, newCondition] }
                    : rg
            )
        }));
    };

    const updateCondition = (ruleGroupId: string, conditionId: string, updates: Partial<Condition>) => {
        setConditionalLogic(prev => ({
            ...prev,
            ruleGroups: prev.ruleGroups.map(rg =>
                rg.id === ruleGroupId
                    ? {
                        ...rg,
                        conditions: rg.conditions.map(c =>
                            c.id === conditionId ? { ...c, ...updates } : c
                        )
                    }
                    : rg
            )
        }));
    };

    const removeCondition = (ruleGroupId: string, conditionId: string) => {
        setConditionalLogic(prev => ({
            ...prev,
            ruleGroups: prev.ruleGroups.map(rg =>
                rg.id === ruleGroupId
                    ? { ...rg, conditions: rg.conditions.filter(c => c.id !== conditionId) }
                    : rg
            )
        }));
    };

    const addAction = () => {
        const newAction: Action = {
            id: `action-${Date.now()}`,
            type: 'show',
            targetFieldId: ''
        };

        setConditionalLogic(prev => ({
            ...prev,
            actions: [...prev.actions, newAction]
        }));
    };

    const updateAction = (actionId: string, updates: Partial<Action>) => {
        setConditionalLogic(prev => ({
            ...prev,
            actions: prev.actions.map(a =>
                a.id === actionId ? { ...a, ...updates } : a
            )
        }));
    };

    const removeAction = (actionId: string) => {
        setConditionalLogic(prev => ({
            ...prev,
            actions: prev.actions.filter(a => a.id !== actionId)
        }));
    };

    const getFieldOptions = () => {
        return allFields
            .filter(f => f.id !== field.id)
            .map(f => ({ value: f.id, label: f.label, type: f.type }));
    };

    const getValueInput = (condition: Condition) => {
        const targetField = allFields.find(f => f.id === condition.fieldId);
        if (!targetField) return null;

        switch (targetField.type) {
            case 'select':
            case 'radio':
                return (
                    <Select
                        value={condition.value as string}
                        onValueChange={(value) => updateCondition(
                            conditionalLogic.ruleGroups.find(rg => rg.conditions.includes(condition))?.id || '',
                            condition.id,
                            { value }
                        )}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select value" />
                        </SelectTrigger>
                        <SelectContent>
                            {targetField.options?.choices?.map(choice => (
                                <SelectItem key={choice.id} value={choice.value}>
                                    {choice.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            case 'checkbox':
                return (
                    <Select
                        value={condition.value as string}
                        onValueChange={(value) => updateCondition(
                            conditionalLogic.ruleGroups.find(rg => rg.conditions.includes(condition))?.id || '',
                            condition.id,
                            { value }
                        )}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select value" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="true">Checked</SelectItem>
                            <SelectItem value="false">Unchecked</SelectItem>
                        </SelectContent>
                    </Select>
                );
            case 'number':
                return (
                    <Input
                        type="number"
                        value={condition.value as number}
                        onChange={(e) => updateCondition(
                            conditionalLogic.ruleGroups.find(rg => rg.conditions.includes(condition))?.id || '',
                            condition.id,
                            { value: parseFloat(e.target.value) || 0 }
                        )}
                        placeholder="Enter number"
                    />
                );
            default:
                return (
                    <Input
                        type="text"
                        value={condition.value as string}
                        onChange={(e) => updateCondition(
                            conditionalLogic.ruleGroups.find(rg => rg.conditions.includes(condition))?.id || '',
                            condition.id,
                            { value: e.target.value }
                        )}
                        placeholder="Enter value"
                    />
                );
        }
    };

    return (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${className}`}>
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Conditional Logic Builder</CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Enable/Disable Toggle */}
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={conditionalLogic.enabled}
                            onCheckedChange={(enabled) =>
                                setConditionalLogic(prev => ({ ...prev, enabled }))
                            }
                        />
                        <Label>Enable conditional logic for this field</Label>
                    </div>

                    {conditionalLogic.enabled && (
                        <>
                            {/* Logic Operator */}
                            <div className="space-y-2">
                                <Label>Logic Operator</Label>
                                <Select
                                    value={conditionalLogic.logicOperator}
                                    onValueChange={(logicOperator: 'AND' | 'OR') =>
                                        setConditionalLogic(prev => ({ ...prev, logicOperator }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AND">All rule groups must be true (AND)</SelectItem>
                                        <SelectItem value="OR">Any rule group can be true (OR)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Rule Groups */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-medium">Rule Groups</Label>
                                    <Button onClick={addRuleGroup} size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Rule Group
                                    </Button>
                                </div>

                                {conditionalLogic.ruleGroups.map((ruleGroup, groupIndex) => (
                                    <Card key={ruleGroup.id} className="p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-2">
                                                <Badge variant="outline">Group {groupIndex + 1}</Badge>
                                                <Select
                                                    value={ruleGroup.operator}
                                                    onValueChange={(operator: 'AND' | 'OR') =>
                                                        updateRuleGroupOperator(ruleGroup.id, operator)
                                                    }
                                                >
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="AND">AND</SelectItem>
                                                        <SelectItem value="OR">OR</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeRuleGroup(ruleGroup.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Conditions */}
                                        <div className="space-y-3">
                                            {ruleGroup.conditions.map((condition, conditionIndex) => (
                                                <div key={condition.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                                                    <div className="flex-1 grid grid-cols-4 gap-2">
                                                        <Select
                                                            value={condition.fieldId}
                                                            onValueChange={(fieldId) => updateCondition(
                                                                ruleGroup.id,
                                                                condition.id,
                                                                { fieldId }
                                                            )}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select field" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {getFieldOptions().map(option => (
                                                                    <SelectItem key={option.value} value={option.value}>
                                                                        {option.label} ({option.type})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>

                                                        <Select
                                                            value={condition.operator}
                                                            onValueChange={(operator) => updateCondition(
                                                                ruleGroup.id,
                                                                condition.id,
                                                                { operator: operator as any }
                                                            )}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {OPERATOR_OPTIONS.map(option => (
                                                                    <SelectItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>

                                                        <div className="col-span-2">
                                                            {getValueInput(condition)}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeCondition(ruleGroup.id, condition.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addCondition(ruleGroup.id)}
                                                className="w-full"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Condition
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            <Separator />

                            {/* Actions */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-medium">Actions</Label>
                                    <Button onClick={addAction} size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Action
                                    </Button>
                                </div>

                                {conditionalLogic.actions.map((action) => {
                                    const ActionIcon = ACTION_OPTIONS.find(opt => opt.value === action.type)?.icon || Settings;

                                    return (
                                        <div key={action.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                                            <ActionIcon className="h-4 w-4" />
                                            <div className="flex-1 grid grid-cols-2 gap-2">
                                                <Select
                                                    value={action.type}
                                                    onValueChange={(type) => updateAction(
                                                        action.id,
                                                        { type: type as any }
                                                    )}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {ACTION_OPTIONS.map(option => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <Select
                                                    value={action.targetFieldId}
                                                    onValueChange={(targetFieldId) => updateAction(
                                                        action.id,
                                                        { targetFieldId }
                                                    )}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select target field" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {getFieldOptions().map(option => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeAction(action.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            Save Logic
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
