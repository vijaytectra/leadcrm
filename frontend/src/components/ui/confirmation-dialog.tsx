"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, Save, Trash2 } from "lucide-react";

export interface ConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    type?: "delete" | "save" | "info" | "warning";
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    isLoading?: boolean;
    variant?: "default" | "destructive";
}

export function ConfirmationDialog({
    open,
    onOpenChange,
    title,
    description,
    type = "info",
    confirmText,
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    isLoading = false,
    variant = "default",
}: ConfirmationDialogProps) {
    const getIcon = () => {
        switch (type) {
            case "delete":
                return <Trash2 className="h-6 w-6 text-red-500" />;
            case "save":
                return <Save className="h-6 w-6 text-blue-500" />;
            case "warning":
                return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
            default:
                return <Info className="h-6 w-6 text-blue-500" />;
        }
    };

    const getConfirmText = () => {
        if (confirmText) return confirmText;
        switch (type) {
            case "delete":
                return "Delete";
            case "save":
                return "Save";
            default:
                return "Confirm";
        }
    };

    const handleConfirm = () => {
        onConfirm();
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        {getIcon()}
                        <DialogTitle className="text-lg font-semibold">
                            {title}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2 ">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="flex-1 sm:flex-none w-24"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === "destructive" ? "destructive" : "default"}
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="flex-1 sm:flex-none w-24"
                    >
                        {isLoading ? "Loading..." : getConfirmText()}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
// Specialized dialog components for common use cases
export function DeleteDialog({
    open,
    onOpenChange,
    title = "Delete Item",
    description = "Are you sure you want to delete this item? This action cannot be undone.",
    itemName,
    onConfirm,
    isLoading = false,
}: Omit<ConfirmationDialogProps, "type" | "variant"> & {
    itemName?: string;
}) {
    return (
        <ConfirmationDialog
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            description={itemName ? `${description} "${itemName}"` : description}
            type="delete"
            variant="destructive"
            confirmText="Delete"
            onConfirm={onConfirm}
            isLoading={isLoading}
        />
    );
}

export function SaveDialog({
    open,
    onOpenChange,
    title = "Save Changes",
    description = "Do you want to save your changes?",
    onConfirm,
    isLoading = false,
}: Omit<ConfirmationDialogProps, "type">) {
    return (
        <ConfirmationDialog
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            description={description}
            type="save"
            confirmText="Save"
            onConfirm={onConfirm}
            isLoading={isLoading}
        />
    );
}

export function InfoDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
}: Omit<ConfirmationDialogProps, "type">) {
    return (
        <ConfirmationDialog
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            description={description}
            type="info"
            confirmText="OK"
            onConfirm={onConfirm}
        />
    );
}

export function ErrorDialog({
    open,
    onOpenChange,
    title = "Error",
    description,
    onConfirm,
}: Omit<ConfirmationDialogProps, "type">) {
    return (
        <ConfirmationDialog
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            description={description}
            type="warning"
            confirmText="OK"
            onConfirm={onConfirm}
        />
    );
}
