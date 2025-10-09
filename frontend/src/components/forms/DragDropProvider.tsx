"use client";

import { createContext, useContext, ReactNode } from "react";
import { useFormBuilder } from "./FormBuilderProvider";

interface DragDropContextType {
    isDragging: boolean;
    draggedField: any;
    draggedFieldType: string | null;
    dropTarget: string | null;
    onDragStart: (field: any, type?: string) => void;
    onDragEnd: () => void;
    onDragOver: (target: string) => void;
    onDragLeave: () => void;
    onDrop: (target: string) => void;
}

const DragDropContext = createContext<DragDropContextType | null>(null);

interface DragDropProviderProps {
    children: ReactNode;
}

export function DragDropProvider({ children }: DragDropProviderProps) {
    const { dragDrop, dragDropActions } = useFormBuilder();

    const onDragStart = (field: any, type?: string) => {
        dragDropActions.setDraggedField(field);
        if (type) {
            dragDropActions.setDraggedFieldType(type);
        }
        dragDropActions.setIsDragging(true);
    };

    const onDragEnd = () => {
        dragDropActions.reset();
    };

    const onDragOver = (target: string) => {
        dragDropActions.setDropTarget(target);
    };

    const onDragLeave = () => {
        dragDropActions.setDropTarget(null);
    };

    const onDrop = (target: string) => {
        // Handle drop logic here
        dragDropActions.setDropTarget(null);
    };

    const contextValue: DragDropContextType = {
        isDragging: dragDrop.isDragging,
        draggedField: dragDrop.draggedField,
        draggedFieldType: dragDrop.draggedFieldType,
        dropTarget: dragDrop.dropTarget,
        onDragStart,
        onDragEnd,
        onDragOver,
        onDragLeave,
        onDrop
    };

    return (
        <DragDropContext.Provider value={contextValue}>
            {children}
        </DragDropContext.Provider>
    );
}

export function useDragDrop(): DragDropContextType {
    const context = useContext(DragDropContext);
    if (!context) {
        throw new Error("useDragDrop must be used within a DragDropProvider");
    }
    return context;
}
