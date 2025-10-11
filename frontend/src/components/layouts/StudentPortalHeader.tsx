"use client";

import { BaseHeader, NotificationItem } from "./BaseHeader";

interface StudentPortalHeaderProps {
    className?: string;
}

const notifications: NotificationItem[] = [
    {
        id: "1",
        title: "Application status updated",
        message: "Your application status has been updated to 'Under Review'",
        time: "5 minutes ago",
        unread: true,
        type: "status",
    },
    {
        id: "2",
        title: "Document required",
        message: "Please upload your academic transcripts",
        time: "1 hour ago",
        unread: true,
        type: "document",
    },
    {
        id: "3",
        title: "Payment received",
        message: "Your application fee payment has been processed",
        time: "1 day ago",
        unread: false,
        type: "payment",
    },
    {
        id: "4",
        title: "Offer letter available",
        message: "Your offer letter is now available for viewing",
        time: "2 days ago",
        unread: false,
        type: "offer",
    },
];

export function StudentPortalHeader({ className }: StudentPortalHeaderProps) {
    return (
        <BaseHeader
            className={className}
            searchPlaceholder="Search your applications, documents, or payments..."
            notifications={notifications}
        />
    );
}
