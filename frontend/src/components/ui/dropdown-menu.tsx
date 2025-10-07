"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
    children: React.ReactNode;
    className?: string;
}

interface DropdownMenuTriggerProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

interface DropdownMenuContentProps {
    children: React.ReactNode;
    className?: string;
    align?: "start" | "center" | "end";
}

interface DropdownMenuItemProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
}

interface DropdownMenuSeparatorProps {
    className?: string;
}

interface DropdownMenuLabelProps {
    children: React.ReactNode;
    className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
    children,
    className
}) => {
    return (
        <div className={cn("relative", className)}>
            {children}
        </div>
    );
};

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
    children,
    className,
    onClick
}) => {
    return (
        <button
            className={cn("outline-none", className)}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
    children,
    className,
    align = "end"
}) => {
    const alignmentClasses = {
        start: "left-0",
        center: "left-1/2 transform -translate-x-1/2",
        end: "right-0"
    };

    return (
        <div
            className={cn(
                "absolute top-full mt-1 w-56 bg-white border rounded-md shadow-lg z-50",
                alignmentClasses[align],
                className
            )}
        >
            {children}
        </div>
    );
};

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
    children,
    className,
    onClick,
    disabled = false
}) => {
    return (
        <button
            className={cn(
                "w-full text-left px-4 py-2 text-sm hover:bg-muted/50 focus:bg-muted/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = ({
    className
}) => {
    return (
        <div className={cn("border-t my-1", className)} />
    );
};

export const DropdownMenuLabel: React.FC<DropdownMenuLabelProps> = ({
    children,
    className
}) => {
    return (
        <div className={cn("px-4 py-2 text-sm font-semibold text-gray-900", className)}>
            {children}
        </div>
    );
};
