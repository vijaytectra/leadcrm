"use client";

import { createContext, useContext, useReducer, useCallback, useMemo, ReactNode } from "react";
import type {
    FormBuilderConfig,
    FormField,
    FormBuilderUIState,
    FormBuilderActions,
    DragDropState,
    DragDropActions,
    FormBuilderContextType
} from "@/types/form-builder";
import { formBuilderUtils } from "@/lib/api/forms";

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
    totalSteps: 1
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
            return {
                ...state,
                fields: [...state.fields, action.payload],
                isDirty: true
            };

        case "UPDATE_FIELD":
            return {
                ...state,
                fields: state.fields.map(field =>
                    field.id === action.payload.fieldId
                        ? { ...field, ...action.payload.updates }
                        : field
                ),
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
    onSave?: (form: FormBuilderConfig, fields: FormField[]) => void;
    onPreview?: () => void;
    onPublish?: (form: FormBuilderConfig) => void;
}

export function FormBuilderProvider({
    children,
    initialForm,
    initialFields = [],
    onSave,
    onPreview,
    onPublish
}: FormBuilderProviderProps) {
    const [state, dispatch] = useReducer(formBuilderReducer, {
        ...initialState,
        currentForm: initialForm || null,
        fields: initialFields
    });

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

    const reset = useCallback(() => {
        dispatch({ type: "RESET" });
    }, []);

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
        reset
    }), [setCurrentForm, setFields, addField, updateField, deleteField, reorderFields, setSelectedField, setDirty, setLoading, setError, setPreviewMode, setActiveStep, reset]);

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

    // Enhanced actions with business logic
    const enhancedActions = {
        ...actions,

        addFieldByType: useCallback((type: string) => {
            const newField: FormField = {
                id: formBuilderUtils.generateFieldId(),
                formId: state.currentForm?.id || "",
                type: type as any,
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
                advanced: {}
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
                order: state.fields.length
            };

            actions.addField(duplicatedField);
        }, [state.fields, actions]),

        saveForm: useCallback(() => {
            if (!state.currentForm || !onSave) return;
            onSave(state.currentForm, state.fields);
        }, [state.currentForm, state.fields, onSave]),

        previewForm: useCallback(() => {
            if (onPreview) {
                onPreview();
            } else {
                actions.setPreviewMode(true);
            }
        }, [onPreview, actions]),

        publishForm: useCallback(() => {
            if (!state.currentForm || !onPublish) return;
            onPublish(state.currentForm);
        }, [state.currentForm, onPublish])
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
