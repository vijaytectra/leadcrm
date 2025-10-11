"use client";

import {
    LayoutDashboard,
    FileText,
    Upload,
    CreditCard,
    MessageSquare,
    Award,
    Bell,
    HelpCircle,
} from "lucide-react";
import { BaseSidebar, NavigationItem } from "../layouts/BaseSidebar";

interface StudentPortalSidebarProps {
    className?: string;
}

const navigation: NavigationItem[] = [
    {
        name: "Dashboard",
        href: "/student-portal/dashboard",
        icon: LayoutDashboard,
        description: "Overview and status",
    },
    {
        name: "Application Status",
        href: "/student-portal/application-status",
        icon: FileText,
        description: "Track progress",
    },
    {
        name: "Documents",
        href: "/student-portal/documents",
        icon: Upload,
        description: "Upload documents",
    },
    {
        name: "Payments",
        href: "/student-portal/payments",
        icon: CreditCard,
        description: "Payment history",
    },
    {
        name: "Communication",
        href: "/student-portal/communication",
        icon: MessageSquare,
        description: "Messages & updates",
    },
    {
        name: "Offer Letter",
        href: "/student-portal/offer-letter",
        icon: Award,
        description: "View offer letter",
    },
];

const secondaryNavigation: NavigationItem[] = [
    {
        name: "Notifications",
        href: "/student-portal/notifications",
        icon: Bell,
        badge: "4",
    },
    {
        name: "Help & Support",
        href: "/student-portal/help",
        icon: HelpCircle,
    },
];

export function StudentPortalSidebar({ className }: StudentPortalSidebarProps) {
    return (
        <BaseSidebar
            className={className}
            title="Student Portal"
            subtitle="Application Management"
            version="1.0.0"
            navigation={navigation}
            secondaryNavigation={secondaryNavigation}
        />
    );
}
