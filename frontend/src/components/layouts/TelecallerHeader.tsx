"use client";

import { BaseHeader, NotificationItem } from "./BaseHeader";

interface TelecallerHeaderProps {
    className?: string;
}

const notifications: NotificationItem[] = [
    {
        id: "1",
        title: "New lead assigned",
        message: "John Smith has been assigned to you",
        time: "5 minutes ago",
        unread: true,
        type: "lead",
    },
    {
        id: "2",
        title: "Follow-up reminder",
        message: "Call Sarah Johnson at 2:00 PM",
        time: "1 hour ago",
        unread: true,
        type: "reminder",
    },
    {
        id: "3",
        title: "Performance update",
        message: "Your weekly performance report is ready",
        time: "1 day ago",
        unread: false,
        type: "performance",
    },
    {
        id: "4",
        title: "System maintenance",
        message: "Scheduled maintenance tonight at 2 AM",
        time: "2 days ago",
        unread: false,
        type: "system",
    },
];

export function TelecallerHeader({ className }: TelecallerHeaderProps) {
    return (
        <BaseHeader
            className={className}
            searchPlaceholder="Search leads, calls, or notes..."
            notifications={notifications}
        />
    );
}
