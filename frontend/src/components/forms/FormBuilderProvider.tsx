"use client";

import React, { createContext, useContext, useReducer, useCallback, useMemo, ReactNode } from "react";
import type {
    FormBuilderConfig,
    FormField,
    FormBuilderUIState,
    FormBuilderActions,
    DragDropState,
    DragDropActions,
    FormBuilderContextType,
    FieldType,
    FormStep
} from "@/types/form-builder";
import { formBuilderUtils, formsApi } from "@/lib/api/forms";
import { useAuthStore } from "@/stores/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


// Initial state
const initialState: FormBuilderUIState = {
    currentForm: null,
    fields: [],
    selectedField: null,
    isDirty: false,
    isLoading: false,
    error: null,
    previewMode: false,
    activeStep: 0,
    totalSteps: 1,
    isDraft: true,
    isPublished: false,
    steps: []
};

const initialDragDropState: DragDropState = {
    draggedField: null,
    draggedFieldType: null,
    dropTarget: null,
    isDragging: false
};

// Action types
type FormBuilderAction =
    | { type: "SET_CURRENT_FORM"; payload: FormBuilderConfig | null }
    | { type: "SET_FIELDS"; payload: FormField[] }
    | { type: "ADD_FIELD"; payload: FormField }
    | { type: "UPDATE_FIELD"; payload: { fieldId: string; updates: Partial<FormField> } }
    | { type: "DELETE_FIELD"; payload: string }
    | { type: "REORDER_FIELDS"; payload: string[] }
    | { type: "SET_SELECTED_FIELD"; payload: FormField | null }
    | { type: "SET_DIRTY"; payload: boolean }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_ERROR"; payload: string | null }
    | { type: "SET_PREVIEW_MODE"; payload: boolean }
    | { type: "SET_ACTIVE_STEP"; payload: number }
    | { type: "SET_DRAFT_MODE"; payload: boolean }
    | { type: "SET_PUBLISHED"; payload: boolean }
    | { type: "SET_STEPS"; payload: FormStep[] }
    | { type: "ADD_STEP"; payload: FormStep }
    | { type: "UPDATE_STEP"; payload: { stepId: string; updates: Partial<FormStep> } }
    | { type: "DELETE_STEP"; payload: string }
    | { type: "REORDER_STEPS"; payload: string[] }
    | { type: "RESET" };

type DragDropAction =
    | { type: "SET_DRAGGED_FIELD"; payload: FormField | null }
    | { type: "SET_DRAGGED_FIELD_TYPE"; payload: string | null }
    | { type: "SET_DROP_TARGET"; payload: string | null }
    | { type: "SET_IS_DRAGGING"; payload: boolean }
    | { type: "RESET" };

// Reducers
function formBuilderReducer(state: FormBuilderUIState, action: FormBuilderAction): FormBuilderUIState {
    switch (action.type) {
        case "SET_CURRENT_FORM":
            return { ...state, currentForm: action.payload, isDirty: true };

        case "SET_FIELDS":
            return { ...state, fields: action.payload, isDirty: true };

        case "ADD_FIELD":
            const newFields = [...state.fields, action.payload];

            // If it's a payment field, handle step creation and placement
            if (action.payload.type === "payment") {
                let updatedSteps = [...state.steps];

                // If no steps exist, create two steps: "Step 1" and "Payment"
                if (state.steps.length === 0) {
                    const step1 = {
                        id: `step_${Date.now()}_1`,
                        formId: state.currentForm?.id || "",
                        title: "Step 1",
                        description: "Basic Information",
                        order: 0,
                        isActive: true,
                        isPayment: false,
                        paymentAmount: undefined,
                        fields: state.fields.map(f => f.id), // All existing fields go to step 1
                        conditions: undefined,
                        settings: {
                            showProgress: true,
                            allowBack: true,
                            allowSkip: false,
                            autoSave: false,
                            validationMode: "onSubmit" as const
                        },
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };

                    const paymentStep = {
                        id: `step_${Date.now()}_2`,
                        formId: state.currentForm?.id || "",
                        title: "Payment",
                        description: "Complete your payment",
                        order: 1, // This should be the last step
                        isActive: true,
                        isPayment: true,
                        paymentAmount: undefined,
                        fields: [action.payload.id], // Payment field goes to payment step
                        conditions: undefined,
                        settings: {
                            showProgress: true,
                            allowBack: true,
                            allowSkip: false,
                            autoSave: false,
                            validationMode: "onSubmit" as const
                        },
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };

                    updatedSteps = [step1, paymentStep];
                } else {
                    // If steps exist, create a separate payment step at the end
                    const paymentStep = {
                        id: `payment_step_${Date.now()}`,
                        formId: state.currentForm?.id || "",
                        title: "Payment",
                        description: "Complete your payment",
                        order: state.steps.length, // This should be the last step
                        isActive: true,
                        isPayment: true,
                        paymentAmount: undefined,
                        fields: [action.payload.id], // Payment field goes to payment step
                        conditions: undefined,
                        settings: {
                            showProgress: true,
                            allowBack: true,
                            allowSkip: false,
                            autoSave: false,
                            validationMode: "onSubmit" as const
                        },
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };

                    // Remove payment fields from existing steps
                    const cleanedSteps = state.steps.map(step => ({
                        ...step,
                        fields: (step.fields as string[] || []).filter(fieldId =>
                            !state.fields.some(f => f.type === "payment" && f.id === fieldId)
                        ),
                        isPayment: false
                    }));

                    updatedSteps = [...cleanedSteps, paymentStep];
                }

                return {
                    ...state,
                    fields: newFields,
                    steps: updatedSteps,
                    totalSteps: updatedSteps.length,
                    isDirty: true
                };
            }

            return {
                ...state,
                fields: newFields,
                isDirty: true
            };

        case "UPDATE_FIELD":
            const updatedFields = state.fields.map(field =>
                field.id === action.payload.fieldId
                    ? { ...field, ...action.payload.updates }
                    : field
            );

            // If field type is changed to payment, handle step creation and placement
            if (action.payload.updates.type === "payment") {
                let updatedSteps = [...state.steps];

                // If no steps exist, create two steps: "Step 1" and "Payment"
                if (state.steps.length === 0) {
                    const step1 = {
                        id: `step_${Date.now()}_1`,
                        formId: state.currentForm?.id || "",
                        title: "Step 1",
                        description: "Basic Information",
                        order: 0,
                        isActive: true,
                        isPayment: false,
                        paymentAmount: undefined,
                        fields: state.fields.filter(f => f.id !== action.payload.fieldId).map(f => f.id), // All other fields go to step 1
                        conditions: undefined,
                        settings: {
                            showProgress: true,
                            allowBack: true,
                            allowSkip: false,
                            autoSave: false,
                            validationMode: "onSubmit" as const
                        },
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };

                    const paymentStep = {
                        id: `step_${Date.now()}_2`,
                        formId: state.currentForm?.id || "",
                        title: "Payment",
                        description: "Complete your payment",
                        order: 1,
                        isActive: true,
                        isPayment: true,
                        paymentAmount: undefined,
                        fields: [action.payload.fieldId], // Payment field goes to payment step
                        conditions: undefined,
                        settings: {
                            showProgress: true,
                            allowBack: true,
                            allowSkip: false,
                            autoSave: false,
                            validationMode: "onSubmit" as const
                        },
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };

                    updatedSteps = [step1, paymentStep];
                } else {
                    // If steps exist, create a separate payment step at the end
                    const paymentStep = {
                        id: `payment_step_${Date.now()}`,
                        formId: state.currentForm?.id || "",
                        title: "Payment",
                        description: "Complete your payment",
                        order: state.steps.length, // This should be the last step
                        isActive: true,
                        isPayment: true,
                        paymentAmount: undefined,
                        fields: [action.payload.fieldId], // Payment field goes to payment step
                        conditions: undefined,
                        settings: {
                            showProgress: true,
                            allowBack: true,
                            allowSkip: false,
                            autoSave: false,
                            validationMode: "onSubmit" as const
                        },
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };

                    // Remove payment fields from existing steps
                    const cleanedSteps = state.steps.map(step => ({
                        ...step,
                        fields: (step.fields as string[] || []).filter(fieldId =>
                            fieldId !== action.payload.fieldId
                        ),
                        isPayment: false
                    }));

                    updatedSteps = [...cleanedSteps, paymentStep];
                }

                return {
                    ...state,
                    fields: updatedFields,
                    steps: updatedSteps,
                    totalSteps: updatedSteps.length,
                    selectedField: state.selectedField?.id === action.payload.fieldId
                        ? { ...state.selectedField, ...action.payload.updates }
                        : state.selectedField,
                    isDirty: true
                };
            }

            return {
                ...state,
                fields: updatedFields,
                selectedField: state.selectedField?.id === action.payload.fieldId
                    ? { ...state.selectedField, ...action.payload.updates }
                    : state.selectedField,
                isDirty: true
            };

        case "DELETE_FIELD":
            return {
                ...state,
                fields: state.fields.filter(field => field.id !== action.payload),
                selectedField: state.selectedField?.id === action.payload ? null : state.selectedField,
                isDirty: true
            };

        case "REORDER_FIELDS":
            const reorderedFields = action.payload.map(fieldId =>
                state.fields.find(field => field.id === fieldId)
            ).filter(Boolean) as FormField[];

            return {
                ...state,
                fields: reorderedFields,
                isDirty: true
            };

        case "SET_SELECTED_FIELD":
            return { ...state, selectedField: action.payload };

        case "SET_DIRTY":
            return { ...state, isDirty: action.payload };

        case "SET_LOADING":
            return { ...state, isLoading: action.payload };

        case "SET_ERROR":
            return { ...state, error: action.payload };

        case "SET_PREVIEW_MODE":
            return { ...state, previewMode: action.payload };

        case "SET_ACTIVE_STEP":
            return { ...state, activeStep: action.payload };

        case "SET_DRAFT_MODE":
            return { ...state, isDraft: action.payload, isPublished: !action.payload };

        case "SET_PUBLISHED":
            return { ...state, isPublished: action.payload, isDraft: !action.payload };

        case "SET_STEPS":
            return { ...state, steps: action.payload, isDirty: true };

        case "ADD_STEP":
            const newStep = action.payload;
            let addStepUpdatedSteps = [...state.steps, newStep];

            // Ensure payment steps are always last
            addStepUpdatedSteps = addStepUpdatedSteps.sort((a, b) => {
                // If one is payment and other is not, payment goes last
                if (a.isPayment && !b.isPayment) return 1;
                if (!a.isPayment && b.isPayment) return -1;
                // Otherwise sort by order
                return a.order - b.order;
            });

            // Update order values to reflect the new positions
            addStepUpdatedSteps = addStepUpdatedSteps.map((step, index) => ({
                ...step,
                order: index
            }));

            return {
                ...state,
                steps: addStepUpdatedSteps,
                totalSteps: addStepUpdatedSteps.length,
                isDirty: true
            };

        case "UPDATE_STEP":
            const updateStepUpdatedSteps = state.steps.map(step =>
                step.id === action.payload.stepId
                    ? { ...step, ...action.payload.updates }
                    : step
            );

            return {
                ...state,
                steps: updateStepUpdatedSteps,
                isDirty: true
            };

        case "DELETE_STEP":
            const deleteStepRemainingSteps = state.steps.filter(step => step.id !== action.payload);

            return {
                ...state,
                steps: deleteStepRemainingSteps,
                totalSteps: deleteStepRemainingSteps.length,
                isDirty: true
            };

        case "REORDER_STEPS":
            let reorderReorderedSteps = action.payload.map(stepId =>
                state.steps.find(step => step.id === stepId)
            ).filter(Boolean) as FormStep[];

            // Ensure payment steps are always last after reordering
            reorderReorderedSteps = reorderReorderedSteps.sort((a, b) => {
                // If one is payment and other is not, payment goes last
                if (a.isPayment && !b.isPayment) return 1;
                if (!a.isPayment && b.isPayment) return -1;
                // Otherwise maintain the provided order
                return 0;
            });

            // Update order values to reflect the new positions
            reorderReorderedSteps = reorderReorderedSteps.map((step, index) => ({
                ...step,
                order: index
            }));

            return {
                ...state,
                steps: reorderReorderedSteps,
                totalSteps: reorderReorderedSteps.length,
                isDirty: true
            };

        case "RESET":
            return initialState;

        default:
            return state;
    }
}

function dragDropReducer(state: DragDropState, action: DragDropAction): DragDropState {
    switch (action.type) {
        case "SET_DRAGGED_FIELD":
            return { ...state, draggedField: action.payload };

        case "SET_DRAGGED_FIELD_TYPE":
            return { ...state, draggedFieldType: action.payload };

        case "SET_DROP_TARGET":
            return { ...state, dropTarget: action.payload };

        case "SET_IS_DRAGGING":
            return { ...state, isDragging: action.payload };

        case "RESET":
            return initialDragDropState;

        default:
            return state;
    }
}

// Context
const FormBuilderContext = createContext<FormBuilderContextType | null>(null);

// Provider component
interface FormBuilderProviderProps {
    children: ReactNode;
    initialForm?: FormBuilderConfig;
    initialFields?: FormField[];
    initialSteps?: FormStep[];
}

export function FormBuilderProvider({
    children,
    initialForm,
    initialFields = [],
    initialSteps = []
}: FormBuilderProviderProps) {
    const [state, dispatch] = useReducer(formBuilderReducer, {
        ...initialState,
        currentForm: initialForm || null,
        fields: initialFields,
        steps: initialSteps
    });

    const router = useRouter();

    // Update state when initialForm, initialFields, or initialSteps change
    React.useEffect(() => {
        if (initialForm && initialForm.id !== state.currentForm?.id) {
            dispatch({ type: "SET_CURRENT_FORM", payload: initialForm });
        }
        if (initialFields && initialFields.length > 0 && state.fields.length === 0) {
            dispatch({ type: "SET_FIELDS", payload: initialFields });
        }
        if (initialSteps && initialSteps.length > 0 && state.steps.length === 0) {
            dispatch({ type: "SET_STEPS", payload: initialSteps });
        }

        // If we have fields but no steps, create steps based on field types
        if (initialFields && initialFields.length > 0 && (!initialSteps || initialSteps.length === 0)) {
            const paymentFields = initialFields.filter(field => field.type === "payment");
            const nonPaymentFields = initialFields.filter(field => field.type !== "payment");

            if (paymentFields.length > 0) {
                // Create two steps: regular fields and payment
                const step1: FormStep = {
                    id: `step_${Date.now()}_1`,
                    formId: initialForm?.id || "",
                    title: "Step 1",
                    description: "Basic information",
                    order: 0,
                    isActive: true,
                    isPayment: false,
                    fields: nonPaymentFields.map(field => field.id),
                    settings: {
                        showProgress: true,
                        allowBack: true,
                        allowSkip: false,
                        autoSave: false,
                        validationMode: "onSubmit"
                    },
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                const paymentStep: FormStep = {
                    id: `step_${Date.now()}_2`,
                    formId: initialForm?.id || "",
                    title: "Payment",
                    description: "Complete your payment",
                    order: 1,
                    isActive: true,
                    isPayment: true,
                    fields: paymentFields.map(field => field.id),
                    settings: {
                        showProgress: true,
                        allowBack: true,
                        allowSkip: false,
                        autoSave: false,
                        validationMode: "onSubmit"
                    },
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                dispatch({ type: "SET_STEPS", payload: [step1, paymentStep] });
            } else {
                // Create a single step for non-payment fields
                const defaultStep: FormStep = {
                    id: `step_${Date.now()}`,
                    formId: initialForm?.id || "",
                    title: "Step 1",
                    description: "Basic information",
                    order: 0,
                    isActive: true,
                    isPayment: false,
                    fields: initialFields.map(field => field.id),
                    settings: {
                        showProgress: true,
                        allowBack: true,
                        allowSkip: false,
                        autoSave: false,
                        validationMode: "onSubmit"
                    },
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                dispatch({ type: "SET_STEPS", payload: [defaultStep] });
            }
        }

        // If we have steps but they have no fields assigned, assign all fields to the first step
        if (initialFields && initialFields.length > 0 && initialSteps && initialSteps.length > 0) {
            const stepsWithFields = initialSteps.map((step, index) => {
                if (index === 0 && (!step.fields || step.fields.length === 0)) {
                    // Assign all fields to the first step if it has no fields
                    return {
                        ...step,
                        fields: initialFields.map(field => field.id)
                    };
                }
                return step;
            });

            // Only update if we made changes
            if (JSON.stringify(stepsWithFields) !== JSON.stringify(initialSteps)) {
                dispatch({ type: "SET_STEPS", payload: stepsWithFields });
            }
        }
    }, [initialForm, initialFields, initialSteps, state.fields.length, state.steps.length, state.currentForm?.id]);

    const [dragDropState, dragDropDispatch] = useReducer(dragDropReducer, initialDragDropState);

    // Actions
    const setCurrentForm = useCallback((form: FormBuilderConfig | null) => {
        dispatch({ type: "SET_CURRENT_FORM", payload: form });
    }, []);

    const setFields = useCallback((fields: FormField[]) => {
        dispatch({ type: "SET_FIELDS", payload: fields });
    }, []);

    const addField = useCallback((field: FormField) => {
        dispatch({ type: "ADD_FIELD", payload: field });
    }, []);

    const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
        dispatch({ type: "UPDATE_FIELD", payload: { fieldId, updates } });
    }, []);

    const deleteField = useCallback((fieldId: string) => {
        dispatch({ type: "DELETE_FIELD", payload: fieldId });
    }, []);

    const reorderFields = useCallback((fieldIds: string[]) => {
        dispatch({ type: "REORDER_FIELDS", payload: fieldIds });
    }, []);

    const setSelectedField = useCallback((field: FormField | null) => {
        dispatch({ type: "SET_SELECTED_FIELD", payload: field });
    }, []);

    const setDirty = useCallback((isDirty: boolean) => {
        dispatch({ type: "SET_DIRTY", payload: isDirty });
    }, []);

    const setLoading = useCallback((isLoading: boolean) => {
        dispatch({ type: "SET_LOADING", payload: isLoading });
    }, []);

    const setError = useCallback((error: string | null) => {
        dispatch({ type: "SET_ERROR", payload: error });
    }, []);

    const setPreviewMode = useCallback((previewMode: boolean) => {
        dispatch({ type: "SET_PREVIEW_MODE", payload: previewMode });
    }, []);

    const setActiveStep = useCallback((step: number) => {
        dispatch({ type: "SET_ACTIVE_STEP", payload: step });
    }, []);

    const setDraftMode = useCallback((isDraft: boolean) => {
        dispatch({ type: "SET_DRAFT_MODE", payload: isDraft });
    }, []);

    const setPublished = useCallback((isPublished: boolean) => {
        dispatch({ type: "SET_PUBLISHED", payload: isPublished });
    }, []);

    const reset = useCallback(() => {
        dispatch({ type: "RESET" });
    }, []);

    // Step management actions
    const setSteps = useCallback((steps: FormStep[]) => {
        dispatch({ type: "SET_STEPS", payload: steps });
    }, []);

    const addStep = useCallback((step: FormStep) => {
        dispatch({ type: "ADD_STEP", payload: step });
    }, []);

    const updateStep = useCallback((stepId: string, updates: Partial<FormStep>) => {
        dispatch({ type: "UPDATE_STEP", payload: { stepId, updates } });
    }, []);

    const deleteStep = useCallback((stepId: string) => {
        dispatch({ type: "DELETE_STEP", payload: stepId });
    }, []);

    const reorderSteps = useCallback((stepIds: string[]) => {
        dispatch({ type: "REORDER_STEPS", payload: stepIds });
    }, []);

    // Get tenant slug from auth store
    const { currentTenantSlug } = useAuthStore();

    // Enhanced actions
    const addFieldByType = useCallback((type: string) => {
        const newField: FormField = {
            id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            formId: state.currentForm?.id || "",
            type: type as FieldType,
            label: `New ${type} Field`,
            placeholder: "",
            description: "",
            required: false,
            order: state.fields.length,
            width: "full",
            validation: { required: false },
            conditionalLogic: { enabled: false, conditions: [], actions: [] },
            options: {},
            styling: {},
            advanced: {},
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        addField(newField);
    }, [addField, state.fields.length, state.currentForm?.id]);

    const duplicateField = useCallback((fieldId: string) => {
        const fieldToDuplicate = state.fields.find(f => f.id === fieldId);
        if (fieldToDuplicate) {
            const duplicatedField: FormField = {
                ...fieldToDuplicate,
                id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                label: `${fieldToDuplicate.label} (Copy)`,
                order: state.fields.length,
            };
            addField(duplicatedField);
        }
    }, [addField, state.fields]);

    const saveForm = useCallback(async () => {
       
        if (!state.currentForm || !currentTenantSlug) {
           
            return;
        }

        setLoading(true);
        try {
            if (state.currentForm.id) {
                // Update existing form
                await formsApi.updateForm(
                    currentTenantSlug,
                    state.currentForm.id,
                    {
                        title: state.currentForm.title,
                        description: state.currentForm.description,
                        isActive: state.currentForm.isActive,
                        isPublished: state.currentForm.isPublished,
                        requiresPayment: state.currentForm.requiresPayment,
                        paymentAmount: state.currentForm.paymentAmount,
                        allowMultipleSubmissions: state.currentForm.allowMultipleSubmissions,
                        maxSubmissions: state.currentForm.maxSubmissions,
                        submissionDeadline: state.currentForm.submissionDeadline,
                        settings: {
                            ...state.currentForm.settings,
                            steps: state.steps,
                        },
                    }
                );

                // Update fields with conditional logic
                for (const field of state.fields) {
                    if (field.id) {
                        await formsApi.updateField(
                            currentTenantSlug,
                            state.currentForm.id,
                            field.id,
                            {
                                type: field.type,
                                label: field.label,
                                placeholder: field.placeholder,
                                description: field.description,
                                required: field.required,
                                order: field.order,
                                width: field.width,
                                validation: field.validation,
                                conditionalLogic: field.conditionalLogic,
                                options: field.options,
                                styling: field.styling,
                                advanced: field.advanced
                            }
                        );
                    }
                }
            } else {
                // Create new form
            

                const response = await formsApi.createForm(
                    currentTenantSlug,
                    {
                        title: state.currentForm.title,
                        description: state.currentForm.description,
                        isActive: state.currentForm.isActive,
                        isPublished: state.currentForm.isPublished,
                        requiresPayment: state.currentForm.requiresPayment,
                        paymentAmount: state.currentForm.paymentAmount,
                        allowMultipleSubmissions: state.currentForm.allowMultipleSubmissions,
                        maxSubmissions: state.currentForm.maxSubmissions,
                        submissionDeadline: state.currentForm.submissionDeadline,
                        settings: {
                            ...state.currentForm.settings,
                            steps: state.steps,
                        },
                    }
                );
                setCurrentForm({ ...state.currentForm, id: response.data.id });

                // Create fields with conditional logic
                
                for (const field of state.fields) {
                  
                    await formsApi.createField(currentTenantSlug, response.data.id, {
                        type: field.type,
                        label: field.label,
                        placeholder: field.placeholder,
                        description: field.description,
                        required: field.required,
                        order: field.order,
                        width: field.width,
                        validation: field.validation,
                        conditionalLogic: field.conditionalLogic,
                        options: field.options,
                        styling: field.styling,
                        advanced: field.advanced
                    });
                }
            }
          
            setDirty(false);
        } catch (error) {
            setError("Failed to save form");
            throw error; // Re-throw to let the caller handle it
        } finally {
            setLoading(false);
        }
    }, [state.currentForm, state.steps, state.fields, currentTenantSlug, setLoading, setDirty, setError, setCurrentForm]);

    const publishForm = useCallback(async () => {
        if (!state.currentForm || !currentTenantSlug) return;

        setLoading(true);
        try {
            await formsApi.updateForm(
                currentTenantSlug,
                state.currentForm.id!,
                {
                    isActive: true,
                    isPublished: true,
                }
            );
            setPublished(true);
            setDraftMode(false);
            setDirty(false);
        } catch (error) {
            setError("Failed to publish form");
        } finally {
            setLoading(false);
        }
    }, [state.currentForm, currentTenantSlug, setLoading, setPublished, setDraftMode, setDirty, setError]);

    const loadForm = useCallback(async (formId: string) => {
        if (!currentTenantSlug) return;

        setLoading(true);
        try {
            const [formResponse, fieldsResponse] = await Promise.all([
                formsApi.getForm(currentTenantSlug, formId),
                formsApi.getFormFields(currentTenantSlug, formId),
            ]);

            if (formResponse.data) {
                const formData = formResponse.data as FormBuilderConfig;
                setCurrentForm(formData);
                setDraftMode(!formData.isActive);
                setPublished(formData.isActive);

                // Load steps from form settings
                if (formData.settings && formData.settings.steps) {
                    setSteps(formData.settings.steps);
                }
            }
            if (fieldsResponse.data) {
                setFields(fieldsResponse.data.fields);
            }
            setDirty(false);
        } catch (error) {
            setError("Failed to load form");
        } finally {
            setLoading(false);
        }
    }, [currentTenantSlug, setLoading, setCurrentForm, setDraftMode, setPublished, setSteps, setFields, setDirty, setError]);

    const deleteForm = useCallback(async (formId: string) => {
        if (!currentTenantSlug) return;

        setLoading(true);
        try {
            await formsApi.deleteForm(currentTenantSlug, formId);
            reset();
        } catch (error) {
            setError("Failed to delete form");
        } finally {
            setLoading(false);
        }
    }, [currentTenantSlug, setLoading, reset, setError]);

    const previewForm = useCallback(() => {
        setPreviewMode(true);
    }, [setPreviewMode]);

    const actions: FormBuilderActions = useMemo(() => ({
        setCurrentForm,
        setFields,
        addField,
        updateField,
        deleteField,
        reorderFields,
        setSelectedField,
        setDirty,
        setLoading,
        setError,
        setPreviewMode,
        setActiveStep,
        setDraftMode,
        setPublished,
        setSteps,
        addStep,
        updateStep,
        deleteStep,
        reorderSteps,
        reset,
        addFieldByType,
        duplicateField,
        saveForm,
        publishForm,
        loadForm,
        deleteForm,
        previewForm
    }), [setCurrentForm, setFields, addField, updateField, deleteField, reorderFields, setSelectedField, setDirty, setLoading, setError, setPreviewMode, setActiveStep, setDraftMode, setPublished, setSteps, addStep, updateStep, deleteStep, reorderSteps, reset, addFieldByType, duplicateField, saveForm, publishForm, loadForm, deleteForm, previewForm]);

    // Drag and drop actions
    const dragDropActions: DragDropActions = {
        setDraggedField: useCallback((field: FormField | null) => {
            dragDropDispatch({ type: "SET_DRAGGED_FIELD", payload: field });
        }, []),

        setDraggedFieldType: useCallback((type: string | null) => {
            dragDropDispatch({ type: "SET_DRAGGED_FIELD_TYPE", payload: type });
        }, []),

        setDropTarget: useCallback((target: string | null) => {
            dragDropDispatch({ type: "SET_DROP_TARGET", payload: target });
        }, []),

        setIsDragging: useCallback((isDragging: boolean) => {
            dragDropDispatch({ type: "SET_IS_DRAGGING", payload: isDragging });
        }, []),

        reset: useCallback(() => {
            dragDropDispatch({ type: "RESET" });
        }, [])
    };

    // Enhanced actions with business logic and API integration
    const enhancedActions = {
        ...actions,

        addFieldByType: useCallback((type: string) => {
            const newField: FormField = {
                id: formBuilderUtils.generateFieldId(),
                formId: state.currentForm?.id || "",
                type: type as FieldType,
                label: formBuilderUtils.getFieldTypeLabel(type),
                placeholder: "",
                description: "",
                required: false,
                order: state.fields.length,
                width: "full",
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
                conditionalLogic: {
                    enabled: false,
                    conditions: [],
                    actions: []
                },
                options: {},
                styling: {},
                advanced: {},
                createdAt: new Date(),
                updatedAt: new Date()
            };

            actions.addField(newField);
        }, [state.currentForm?.id, state.fields.length, actions]),

        duplicateField: useCallback((fieldId: string) => {
            const field = state.fields.find(f => f.id === fieldId);
            if (!field) return;

            const duplicatedField: FormField = {
                ...field,
                id: formBuilderUtils.generateFieldId(),
                label: `${field.label} (Copy)`,
                order: state.fields.length,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            actions.addField(duplicatedField);
        }, [state.fields, actions]),

        saveForm: useCallback(async () => {
            if (!state.currentForm || !currentTenantSlug) {
                toast.error("Missing form or tenant information");
                return;
            }

            try {
                actions.setLoading(true);
                actions.setError(null);

                // Save form as draft (isActive: false, isPublished: false)
                const formData = {
                    ...state.currentForm,
                    isActive: false,
                    isPublished: false,
                    settings: {
                        ...state.currentForm.settings,
                        steps: state.steps
                    }
                };

                let savedForm;
                if (state.currentForm.id) {
                    savedForm = await formsApi.updateForm(currentTenantSlug, state.currentForm.id, formData);
                } else {
                    savedForm = await formsApi.createForm(currentTenantSlug, formData);
                }

                // Save fields
                if (savedForm.data) {
                    for (const field of state.fields) {
                        if (field.id.startsWith('field_')) {
                            await formsApi.createField(currentTenantSlug, savedForm.data.id, field);
                        } else {
                            await formsApi.updateField(currentTenantSlug, savedForm.data.id, field.id, field);
                        }
                    }
                }

                if (savedForm.data) {
                    actions.setCurrentForm(savedForm.data as FormBuilderConfig);
                }
                actions.setDirty(false);
                actions.setDraftMode(true);
                actions.setPublished(false);
                toast.success("Form saved as draft");
            } catch (error) {
                actions.setError("Failed to save form");
                toast.error("Failed to save form");
            } finally {
                actions.setLoading(false);
            }
        }, [state.currentForm, state.fields, state.steps, currentTenantSlug, actions]),

        publishForm: useCallback(async () => {
            if (!state.currentForm || !currentTenantSlug) {
                toast.error("Missing form or tenant information");
                return;
            }

            try {
                actions.setLoading(true);
                actions.setError(null);

                // Publish form (isActive: true, isPublished: true)
                const formData = {
                    ...state.currentForm,
                    isActive: true,
                    isPublished: true,
                    settings: {
                        ...state.currentForm.settings,
                        steps: state.steps
                    }
                };

                let publishedForm;
                if (!state.currentForm.id) {
                    publishedForm = await formsApi.createForm(currentTenantSlug, formData);
                    if (publishedForm.data) {
                        for (const field of state.fields) {
                            await formsApi.createField(currentTenantSlug, publishedForm.data.id, field);
                        }
                    }
                } else {
                    publishedForm = await formsApi.updateForm(currentTenantSlug, state.currentForm.id, formData);
                }

                if (publishedForm.data) {
                    actions.setCurrentForm(publishedForm.data as FormBuilderConfig);
                }
                actions.setDirty(false);
                actions.setPublished(true);
                actions.setDraftMode(false);
                toast.success("Form published successfully");

                // Redirect to forms list after successful publish
                router.push('/institution-admin/forms');
            } catch (error) {
                actions.setError("Failed to publish form");
                toast.error("Failed to publish form");
            } finally {
                actions.setLoading(false);
            }
        }, [state.currentForm, state.fields, state.steps, currentTenantSlug, actions, router]),

        loadForm: useCallback(async (formId: string) => {
            if (!currentTenantSlug) {
                toast.error("Missing tenant information");
                return;
            }

            try {
                actions.setLoading(true);
                actions.setError(null);

                const [formResponse, fieldsResponse] = await Promise.all([
                    formsApi.getForm(currentTenantSlug, formId),
                    formsApi.getFormFields(currentTenantSlug, formId)
                ]);

                if (formResponse.data) {
                    const formData = formResponse.data as FormBuilderConfig;
                    actions.setCurrentForm(formData);
                    actions.setDraftMode(!formData.isActive);
                    actions.setPublished(formData.isActive);

                    // Load steps from form settings
                    if (formData.settings && formData.settings.steps) {
                        actions.setSteps(formData.settings.steps);
                    }
                }
                if (fieldsResponse.data) {
                    actions.setFields(fieldsResponse.data.fields);
                }
                actions.setDirty(false);
            } catch (error) {
                actions.setError("Failed to load form");
                toast.error("Failed to load form");
            } finally {
                actions.setLoading(false);
            }
        }, [currentTenantSlug, actions]),

        deleteForm: useCallback(async (formId: string) => {
            if (!currentTenantSlug) {
                toast.error("Missing tenant information");
                return;
            }

            try {
                actions.setLoading(true);
                actions.setError(null);

                await formsApi.deleteForm(currentTenantSlug, formId);
                actions.reset();
                toast.success("Form deleted successfully");

                // Redirect to forms list after successful deletion
                router.push('/institution-admin/forms');
            } catch (error) {
                actions.setError("Failed to delete form");
                toast.error("Failed to delete form");
            } finally {
                actions.setLoading(false);
            }
        }, [currentTenantSlug, actions, router]),

        previewForm: useCallback(() => {
            actions.setPreviewMode(true);
        }, [actions])
    };

    const contextValue: FormBuilderContextType = {
        state,
        actions: enhancedActions,
        dragDrop: dragDropState,
        dragDropActions
    };

    return (
        <FormBuilderContext.Provider value={contextValue}>
            {children}
        </FormBuilderContext.Provider>
    );
}

// Hook to use the context
export function useFormBuilder(): FormBuilderContextType {
    const context = useContext(FormBuilderContext);
    if (!context) {
        throw new Error("useFormBuilder must be used within a FormBuilderProvider");
    }
    return context;
}