"use client";

import { useNotifications } from "@/hooks/useNotifications";
import { BaseHeader } from "./BaseHeader";

interface TelecallerHeaderProps {
    className?: string;
}


export function TelecallerHeader({ className }: TelecallerHeaderProps) {
    const { notifications } = useNotifications();

    // Transform notifications to match NotificationItem interface
    const transformedNotifications = notifications.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        time: notification.createdAt.toLocaleString(),
        unread: !notification.read,
        type: notification.type,
    }));

    return (
        <BaseHeader
            className={className}
            searchPlaceholder="Search leads, calls, or notes..."
            notifications={transformedNotifications}
        />
    );
}
