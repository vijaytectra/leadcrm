"use client";

import { useState } from "react";
import { Bell, Check, Trash2, MoreHorizontal, ExternalLink } from "lucide-react";
import { Notification } from "@/types/notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NotificationListProps {
    notifications: Notification[];
    loading?: boolean;
    selectedIds?: string[];
    onSelect?: (id: string, selected: boolean) => void;
    onSelectAll?: (selected: boolean) => void;
    onMarkAsRead?: (id: string) => void;
    onDelete?: (id: string) => void;
    onNavigate?: (notification: Notification) => void;
    showSelection?: boolean;
}

export function NotificationList({
    notifications,
    loading = false,
    selectedIds = [],
    onSelect,
    onSelectAll,
    onMarkAsRead,
    onDelete,
    onNavigate,
    showSelection = false
}: NotificationListProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const getTypeStyles = (type: string) => {
        switch (type) {
            case "SUCCESS":
                return "text-green-600";
            case "WARNING":
                return "text-yellow-600";
            case "ERROR":
                return "text-red-600";
            case "SYSTEM":
                return "text-blue-600";
            default:
                return "text-gray-600";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
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

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                                <div className="h-5 w-5 bg-gray-200 rounded" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                    <p className="text-gray-500">You&apos;re all caught up! No new notifications.</p>
                </CardContent>
            </Card>
        );
    }
    console.log(notifications);
    return (
        <div className="space-y-3">
            {showSelection && onSelectAll && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                checked={selectedIds.length === notifications.length}
                                onCheckedChange={onSelectAll}
                            />
                            <span className="text-sm text-gray-600">
                                Select all ({selectedIds.length}/{notifications.length})
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {notifications.map((notification) => (
                <Card
                    key={notification.id}
                    className={cn(
                        "transition-all duration-200 hover:shadow-md",
                        !notification.read && "border-l-4 border-l-blue-500 bg-blue-50/30",
                        selectedIds.includes(notification.id) && "ring-2 ring-blue-200"
                    )}
                    onMouseEnter={() => setHoveredId(notification.id)}
                    onMouseLeave={() => setHoveredId(null)}
                >
                    <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                            {/* Selection checkbox */}
                            {showSelection && onSelect && (
                                <div className="flex-shrink-0 pt-1">
                                    <Checkbox
                                        checked={selectedIds.includes(notification.id)}
                                        onCheckedChange={(checked) => onSelect(notification.id, !!checked)}
                                    />
                                </div>
                            )}

                            {/* Notification icon */}
                            <div className="flex-shrink-0">
                                <div className="relative">
                                    <Bell className={cn("h-5 w-5", getTypeStyles(notification.type))} />
                                    {!notification.read && (
                                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full" />
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <h4 className={cn(
                                                "text-sm font-semibold text-gray-900 truncate",
                                                !notification.read && "font-bold"
                                            )}>
                                                {notification.title}
                                            </h4>
                                            {notification.priority !== "MEDIUM" && (
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full flex-shrink-0",
                                                    getPriorityColor(notification.priority)
                                                )} />
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                            {notification.message}
                                        </p>

                                        <div className="flex items-center space-x-2 mb-2">
                                            <Badge variant="outline" className="text-xs">
                                                {notification.category}
                                            </Badge>
                                            {notification.actionType && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {notification.actionType}
                                                </Badge>
                                            )}
                                            <span className="text-xs text-gray-500">
                                                {formatTime(notification.createdAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-1 ml-2">
                                        {hoveredId === notification.id && (
                                            <>
                                                {!notification.read && onMarkAsRead && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 px-2 text-xs"
                                                        onClick={() => onMarkAsRead(notification.id)}
                                                    >
                                                        <Check className="h-3 w-3 mr-1" />
                                                        Mark as read
                                                    </Button>
                                                )}
                                                {onNavigate && notification.data?.actionUrl && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 px-2 text-xs"
                                                        onClick={() => onNavigate(notification)}
                                                    >
                                                        <ExternalLink className="h-3 w-3 mr-1" />
                                                        View
                                                    </Button>
                                                )}
                                            </>
                                        )}

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {!notification.read && onMarkAsRead && (
                                                    <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>
                                                        <Check className="h-4 w-4 mr-2" />
                                                        Mark as read
                                                    </DropdownMenuItem>
                                                )}
                                                {onNavigate && (
                                                    <DropdownMenuItem onClick={() => onNavigate(notification)}>
                                                        <ExternalLink className="h-4 w-4 mr-2" />
                                                        View details
                                                    </DropdownMenuItem>
                                                )}
                                                {onDelete && (
                                                    <DropdownMenuItem
                                                        onClick={() => onDelete(notification.id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
