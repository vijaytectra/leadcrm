"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
    id: string;
    title: string;
    description?: string;
    variant?: "default" | "destructive";
    onDismiss: (id: string) => void;
}

export function Toast({ id, title, description, variant = "default", onDismiss }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onDismiss(id), 300);
        }, 5000);

        return () => clearTimeout(timer);
    }, [id, onDismiss]);

    return (
        <div
            className={cn(
                "fixed top-4 right-4 z-50 max-w-sm w-full bg-white border rounded-lg shadow-lg p-4 transition-all duration-300",
                isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
                variant === "destructive" ? "border-red-200 bg-red-50" : "border-gray-200"
            )}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h4 className={cn(
                        "font-medium text-sm",
                        variant === "destructive" ? "text-red-800" : "text-gray-900"
                    )}>
                        {title}
                    </h4>
                    {description && (
                        <p className={cn(
                            "text-sm mt-1",
                            variant === "destructive" ? "text-red-600" : "text-gray-600"
                        )}>
                            {description}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(() => onDismiss(id), 300);
                    }}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

interface ToastContainerProps {
    toasts: Array<{
        id: string;
        title: string;
        description?: string;
        variant?: "default" | "destructive";
    }>;
    onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    {...toast}
                    onDismiss={onDismiss}
                />
            ))}
        </div>
    );
}
