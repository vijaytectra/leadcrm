"use client";

import {
    LayoutDashboard,
    FileText,
    MessageSquare,
    Users,
    Calendar,
    Bell,
    HelpCircle,
} from "lucide-react";
import { BaseSidebar, NavigationItem } from "../layouts/BaseSidebar";

interface AdmissionTeamSidebarProps {
    className?: string;
}

const navigation: NavigationItem[] = [
    {
        name: "Dashboard",
        href: "/admission-team/dashboard",
        icon: LayoutDashboard,
        description: "Overview and metrics",
    },
    {
        name: "Applications",
        href: "/admission-team/applications",
        icon: FileText,
        description: "Review applications",
    },
    {
        name: "Communication",
        href: "/admission-team/communication",
        icon: MessageSquare,
        description: "Communication logs",
    },
    {
        name: "Bulk Communication",
        href: "/admission-team/bulk-communication",
        icon: Users,
        description: "Send bulk messages",
    },
    {
        name: "Counseling",
        href: "/admission-team/counseling",
        icon: Calendar,
        description: "Schedule counseling",
    },
];

const secondaryNavigation: NavigationItem[] = [
    {
        name: "Notifications",
        href: "/admission-team/notifications",
        icon: Bell,
        badge: "3",
    },
    {
        name: "Help & Support",
        href: "/admission-team/help",
        icon: HelpCircle,
    },
];

export function AdmissionTeamSidebar({ className }: AdmissionTeamSidebarProps) {
    return (
        <BaseSidebar
            className={className}
            title="Admission Team"
            subtitle="Application Management"
            version="1.0.0"
            navigation={navigation}
            secondaryNavigation={secondaryNavigation}
        />
    );
}
