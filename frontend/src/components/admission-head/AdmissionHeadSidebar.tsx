"use client";

import {
    LayoutDashboard,
    FileText,
    Users,
    BarChart3,
    Bell,
    HelpCircle,
} from "lucide-react";
import { BaseSidebar, NavigationItem } from "../layouts/BaseSidebar";

interface AdmissionHeadSidebarProps {
    className?: string;
}

const navigation: NavigationItem[] = [
    {
        name: "Dashboard",
        href: "/admission-head/dashboard",
        icon: LayoutDashboard,
        description: "Overview and metrics",
    },
    {
        name: "Offer Templates",
        href: "/admission-head/offer-templates",
        icon: FileText,
        description: "Manage templates",
    },
    {
        name: "Bulk Offers",
        href: "/admission-head/bulk-offers",
        icon: Users,
        description: "Generate offers",
    },
    {
        name: "Reports",
        href: "/admission-head/reports",
        icon: BarChart3,
        description: "Analytics & reports",
    },
];

const secondaryNavigation: NavigationItem[] = [
    {
        name: "Notifications",
        href: "/admission-head/notifications",
        icon: Bell,
        badge: "2",
    },
    {
        name: "Help & Support",
        href: "/admission-head/help",
        icon: HelpCircle,
    },
];

export function AdmissionHeadSidebar({ className }: AdmissionHeadSidebarProps) {
    return (
        <BaseSidebar
            className={className}
            title="Admission Head"
            subtitle="Offer Management"
            version="1.0.0"
            navigation={navigation}
            secondaryNavigation={secondaryNavigation}
        />
    );
}
