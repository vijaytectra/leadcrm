"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Plus,
    Edit,
    Trash2,
    GripVertical,
    Eye,
    EyeOff,
    ChevronLeft,
    ChevronRight,
    Settings,
    CreditCard,
} from "lucide-react";
import { useFormBuilder } from "./FormBuilderProvider";
import { StepFieldAssignment } from "./StepFieldAssignment";
import { toast } from "sonner";
import type { FormStep } from "@/types/form-builder";

interface FormStepManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

interface StepFormData {
    title: string;
    description: string;
    isActive: boolean;
}

export function FormStepManager({ isOpen, onClose }: FormStepManagerProps) {
    const { state, actions } = useFormBuilder();
    const [isEditing, setIsEditing] = useState(false);
    const [editingStep, setEditingStep] = useState<FormStep | null>(null);
    const [stepForm, setStepForm] = useState<StepFormData>({
        title: "",
        description: "",
        isActive: true,
    });
    const [showStepDialog, setShowStepDialog] = useState(false);
    const [showFieldAssignment, setShowFieldAssignment] = useState(false);
    const [selectedStep, setSelectedStep] = useState<FormStep | null>(null);

    // Use the global state instead of local state
    const steps = state.steps || [];

    // Debug logging
    

    const handleAddStep = () => {
        setStepForm({
            title: "",
            description: "",
            isActive: true,
        });
        setIsEditing(false);
        setEditingStep(null);
        setShowStepDialog(true);
    };

    // Auto-create a default step if none exist
    useEffect(() => {
        if (steps.length === 0 && state.fields.length > 0) {
           
            const defaultStep: FormStep = {
                id: `step_${Date.now()}`,
                formId: state.currentForm?.id || "",
                title: "Step 1",
                description: "Basic information",
                order: 0,
                isActive: true,
                isPayment: false,
                paymentAmount: undefined,
                fields: [], // Will be assigned later
                conditions: undefined,
                settings: {
                    showProgress: true,
                    allowBack: true,
                    allowSkip: false,
                    autoSave: false,
                    validationMode: "onSubmit"
                },
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            actions.addStep(defaultStep);
        }
    }, [steps.length, state.fields.length, state.currentForm?.id, actions]);

    const handleEditStep = (step: FormStep) => {
        setStepForm({
            title: step.title,
            description: step.description || "",
            isActive: step.isActive,
        });
        setIsEditing(true);
        setEditingStep(step);
        setShowStepDialog(true);
    };

    const handleSaveStep = () => {
        if (!stepForm.title.trim()) {
            toast.error("Step title is required");
            return;
        }

        const newStep: FormStep = {
            id: editingStep?.id || `step_${Date.now()}`,
            formId: state.currentForm?.id || "",
            title: stepForm.title,
            description: stepForm.description,
            order: editingStep?.order || steps.length,
            isActive: stepForm.isActive,
            isPayment: false,
            paymentAmount: undefined,
            fields: editingStep?.fields || [],
            conditions: isEditing ? editingStep?.conditions : undefined,
            settings: editingStep?.settings || {
                showProgress: true,
                allowBack: true,
                allowSkip: false,
                autoSave: false,
                validationMode: "onSubmit"
            },
            createdAt: editingStep?.createdAt || new Date(),
            updatedAt: new Date(),
        };

        if (isEditing && editingStep) {
            // Update existing step
            actions.updateStep(editingStep.id, newStep);
        } else {
            // Add new step
            actions.addStep(newStep);
        }

        setShowStepDialog(false);
        setStepForm({ title: "", description: "", isActive: true });
        setIsEditing(false);
        setEditingStep(null);
    };

    const handleDeleteStep = (stepId: string) => {
        actions.deleteStep(stepId);
        toast.success("Step deleted");
    };

    const handleToggleStep = (stepId: string) => {
        const step = steps.find(s => s.id === stepId);
        if (step) {
            actions.updateStep(stepId, { ...step, isActive: !step.isActive });
        }
    };

    const handleReorderSteps = (fromIndex: number, toIndex: number) => {
        const newSteps = [...steps];
        const [movedStep] = newSteps.splice(fromIndex, 1);

        // Prevent moving payment steps to non-last positions
        if (movedStep.isPayment && toIndex < newSteps.length) {
            toast.error("Payment step must always be the last step");
            return;
        }

        // Prevent moving non-payment steps after payment steps
        if (!movedStep.isPayment && toIndex >= newSteps.length) {
            const paymentSteps = newSteps.filter(step => step.isPayment);
            if (paymentSteps.length > 0) {
                toast.error("Cannot move step after payment step");
                return;
            }
        }

        newSteps.splice(toIndex, 0, movedStep);

        // Update order
        const reorderedSteps = newSteps.map((step, index) => ({
            ...step,
            order: index,
        }));

        actions.setSteps(reorderedSteps);
    };

    const handleSaveAll = () => {
        // Steps are already saved to global state
        toast.success("Steps saved successfully");
        onClose();
    };

    const handleConfigureFields = (step: FormStep) => {
      
        setSelectedStep(step);
        setShowFieldAssignment(true);
    };

    const getStepStatus = (step: FormStep) => {
        if (!step.isActive) return "Inactive";
        if (!step.fields || step.fields.length === 0) return "Empty";
        return "Active";
    };

    const getStepStatusColor = (step: FormStep) => {
        if (!step.isActive) return "bg-gray-100 text-gray-600";
        if (!step.fields || step.fields.length === 0) return "bg-yellow-100 text-yellow-600";
        return "bg-green-100 text-green-600";
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-4xl bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-gray-900">
                            Manage Form Steps
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-600">
                            Create and organize your form into multiple steps for better user experience.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Steps List */}
                        <div className="space-y-2">
                            {steps.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="text-sm">No steps created yet</div>
                                    <div className="text-xs">Add your first step to get started</div>
                                </div>
                            ) : (
                                steps
                                    .sort((a, b) => a.order - b.order)
                                    .map((step, index) => (
                                        <div
                                            key={step.id}
                                            className={`flex items-center justify-between p-3 border rounded-lg ${step.isPayment
                                                ? 'border-blue-200 bg-blue-50'
                                                : 'border-gray-200 bg-white'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                {step.isPayment ? (
                                                    <CreditCard className="h-4 w-4 text-blue-600" />
                                                ) : (
                                                    <GripVertical className="h-4 w-4 text-gray-400" />
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2">
                                                        <h4 className={`font-medium ${step.isPayment ? 'text-blue-900' : 'text-gray-900'
                                                            }`}>
                                                            {step.title}
                                                        </h4>
                                                        <Badge
                                                            variant="outline"
                                                            className={step.isPayment
                                                                ? "bg-blue-100 text-blue-600 border-blue-200"
                                                                : getStepStatusColor(step)
                                                            }
                                                        >
                                                            {step.isPayment ? "Payment" : getStepStatus(step)}
                                                        </Badge>
                                                    </div>
                                                    {step.description && (
                                                        <p className={`text-sm mt-1 ${step.isPayment ? 'text-blue-700' : 'text-gray-600'
                                                            }`}>
                                                            {step.description}
                                                        </p>
                                                    )}
                                                    <div className={`text-xs mt-1 ${step.isPayment ? 'text-blue-600' : 'text-gray-500'
                                                        }`}>
                                                        Step {index + 1} • {step.fields?.length || 0} fields
                                                        {step.isPayment && " • Always Last"}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleConfigureFields(step)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Configure Fields"
                                                >
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleStep(step.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    {step.isActive ? (
                                                        <Eye className="h-4 w-4" />
                                                    ) : (
                                                        <EyeOff className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditStep(step)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {!step.isPayment && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteStep(step.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {step.isPayment && (
                                                    <div className="text-xs text-blue-600 font-medium">
                                                        Locked
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>

                        {/* Add Step Button */}
                        <div className="flex space-x-2">
                            <Button
                                onClick={handleAddStep}
                                variant="outline"
                                className="flex-1 border-dashed border-gray-300 hover:border-gray-400"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Step
                            </Button>
                            <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                                className="px-3"
                                title="Refresh"
                            >
                                🔄
                            </Button>
                        </div>

                        {/* Payment Step Info */}
                        {steps.some(step => step.isPayment) && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <CreditCard className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">
                                        Payment Step
                                    </span>
                                </div>
                                <p className="text-xs text-blue-700 mt-1">
                                    Payment steps are automatically positioned as the last step and cannot be moved.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex justify-between">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveAll} className="bg-blue-600 hover:bg-blue-700">
                            Save Steps
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Step Form Dialog */}
            <Dialog open={showStepDialog} onOpenChange={setShowStepDialog}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-gray-900">
                            {isEditing ? "Edit Step" : "Add New Step"}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-600">
                            Configure the step details and settings.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="step-title" className="text-sm font-medium text-gray-700">
                                Step Title *
                            </Label>
                            <Input
                                id="step-title"
                                value={stepForm.title}
                                onChange={(e) =>
                                    setStepForm({ ...stepForm, title: e.target.value })
                                }
                                placeholder="Enter step title"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="step-description" className="text-sm font-medium text-gray-700">
                                Description
                            </Label>
                            <Textarea
                                id="step-description"
                                value={stepForm.description}
                                onChange={(e) =>
                                    setStepForm({ ...stepForm, description: e.target.value })
                                }
                                placeholder="Enter step description (optional)"
                                className="mt-1"
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowStepDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSaveStep} className="bg-blue-600 hover:bg-blue-700">
                            {isEditing ? "Update Step" : "Add Step"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Step Field Assignment Dialog */}
            <StepFieldAssignment
                isOpen={showFieldAssignment}
                onClose={() => setShowFieldAssignment(false)}
                step={selectedStep}
            />
        </>
    );
}
