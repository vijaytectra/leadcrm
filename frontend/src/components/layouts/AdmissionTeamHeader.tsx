"use client";

import { BaseHeader, NotificationItem } from "./BaseHeader";

interface AdmissionTeamHeaderProps {
    className?: string;
}

const notifications: NotificationItem[] = [
    {
        id: "1",
        title: "New application for review",
        message: "John Smith's application is ready for review",
        time: "5 minutes ago",
        unread: true,
        type: "application",
    },
    {
        id: "2",
        title: "Interview scheduled",
        message: "Interview with Sarah Johnson at 2:00 PM",
        time: "1 hour ago",
        unread: true,
        type: "interview",
    },
    {
        id: "3",
        title: "Application approved",
        message: "Mike Wilson's application has been approved",
        time: "1 day ago",
        unread: false,
        type: "approval",
    },
    {
        id: "4",
        title: "System update",
        message: "New features available in the admission system",
        time: "2 days ago",
        unread: false,
        type: "system",
    },
];

export function AdmissionTeamHeader({ className }: AdmissionTeamHeaderProps) {
    return (
        <BaseHeader
            className={className}
            searchPlaceholder="Search applications, students, or reviews..."
            notifications={notifications}
        />
    );
}
