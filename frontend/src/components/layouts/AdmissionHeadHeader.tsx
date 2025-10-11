"use client";

import { BaseHeader, NotificationItem } from "./BaseHeader";

interface AdmissionHeadHeaderProps {
    className?: string;
}

const notifications: NotificationItem[] = [
    {
        id: "1",
        title: "Offer letter ready",
        message: "Offer letter for John Smith is ready for approval",
        time: "5 minutes ago",
        unread: true,
        type: "offer",
    },
    {
        id: "2",
        title: "Bulk offers generated",
        message: "50 offer letters have been generated successfully",
        time: "1 hour ago",
        unread: true,
        type: "bulk",
    },
    {
        id: "3",
        title: "Report generated",
        message: "Monthly admission report is ready",
        time: "1 day ago",
        unread: false,
        type: "report",
    },
    {
        id: "4",
        title: "Template updated",
        message: "Offer letter template has been updated",
        time: "2 days ago",
        unread: false,
        type: "template",
    },
];

export function AdmissionHeadHeader({ className }: AdmissionHeadHeaderProps) {
    return (
        <BaseHeader
            className={className}
            searchPlaceholder="Search offers, templates, or reports..."
            notifications={notifications}
        />
    );
}
