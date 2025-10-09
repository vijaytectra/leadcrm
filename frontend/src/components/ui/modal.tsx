"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ModalProps {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    className?: string;
}

interface ModalHeaderProps {
    children: React.ReactNode;
    className?: string;
}

interface ModalContentProps {
    children: React.ReactNode;
    className?: string;
}

interface ModalFooterProps {
    children: React.ReactNode;
    className?: string;
}

export const Modal: React.FC<ModalProps> = ({
    children,
    isOpen,
    onClose,
    className
}) => {
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/10 bg-opacity-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={cn(
                    "relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto",
                    className
                )}
            >
                {children}
            </div>
        </div>
    );
};

export const ModalHeader: React.FC<ModalHeaderProps> = ({
    children,
    className
}) => {
    return (
        <div className={cn("flex items-center justify-between p-6 border-b", className)}>
            {children}
        </div>
    );
};

export const ModalContent: React.FC<ModalContentProps> = ({
    children,
    className
}) => {
    return (
        <div className={cn("p-6", className)}>
            {children}
        </div>
    );
};

export const ModalFooter: React.FC<ModalFooterProps> = ({
    children,
    className
}) => {
    return (
        <div className={cn("flex items-center justify-end space-x-3 p-6 border-t", className)}>
            {children}
        </div>
    );
};

interface ModalCloseButtonProps {
    onClose: () => void;
    className?: string;
}

export const ModalCloseButton: React.FC<ModalCloseButtonProps> = ({
    onClose,
    className
}) => {
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={cn("h-8 w-8 p-0", className)}
        >
            <X className="h-4 w-4" />
        </Button>
    );
};
