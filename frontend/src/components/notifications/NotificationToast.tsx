"use client";

import { useState, useEffect } from "react";
import { X, Bell, ExternalLink, Check } from "lucide-react";
import { Notification } from "@/types/notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NotificationToastProps {
    notification: Notification;
    onMarkAsRead?: (id: string) => void;
    onNavigate?: (notification: Notification) => void;
    onClose?: (id: string) => void;
    autoClose?: boolean;
    duration?: number;
}

export function NotificationToast({
    notification,
    onMarkAsRead,
    onNavigate,
    onClose,
    autoClose = true,
    duration = 5000
}: NotificationToastProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (autoClose && !isHovered) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => onClose?.(notification.id), 300);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [autoClose, duration, isHovered, notification.id, onClose]);

    const handleClick = () => {
        if (!notification.read) {
            onMarkAsRead?.(notification.id);
        }
        onNavigate?.(notification);
    };

    const handleMarkAsRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        onMarkAsRead?.(notification.id);
    };

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClose?.(notification.id);
    };

    const getTypeStyles = () => {
        switch (notification.type) {
            case "SUCCESS":
                return "border-green-200 bg-green-50";
            case "WARNING":
                return "border-yellow-200 bg-yellow-50";
            case "ERROR":
                return "border-red-200 bg-red-50";
            case "SYSTEM":
                return "border-blue-200 bg-blue-50";
            default:
                return "border-gray-200 bg-white";
        }
    };

    const getPriorityColor = () => {
        switch (notification.priority) {
            case "URGENT":
                return "bg-red-500";
            case "HIGH":
                return "bg-orange-500";
            case "MEDIUM":
                return "bg-blue-500";
            case "LOW":
                return "bg-gray-500";
            default:
                return "bg-gray-500";
        }
    };

    if (!isVisible) return null;

    return (
        <Card
            className={cn(
                "fixed bottom-4 right-4 w-96 shadow-lg border-2 transition-all duration-300 transform",
                isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
                getTypeStyles(),
                !notification.read && "ring-2 ring-blue-200"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                        <div className="relative">
                            <Bell className="h-5 w-5 text-gray-600" />
                            {!notification.read && (
                                <div className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full" />
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className={cn(
                                "text-sm font-semibold text-gray-900 truncate",
                                !notification.read && "font-bold"
                            )}>
                                {notification.title}
                            </h4>
                            <div className="flex items-center space-x-1">
                                {notification.priority !== "MEDIUM" && (
                                    <div className={cn("h-2 w-2 rounded-full", getPriorityColor())} />
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-gray-200"
                                    onClick={handleClose}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                    {notification.category}
                                </Badge>
                                {notification.actionType && (
                                    <Badge variant="secondary" className="text-xs">
                                        {notification.actionType}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center space-x-1">
                                {!notification.read && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={handleMarkAsRead}
                                    >
                                        <Check className="h-3 w-3 mr-1" />
                                        Mark as read
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={handleClick}
                                >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    View
                                </Button>
                            </div>
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
