"use client";

import {
    LayoutDashboard,
    Phone,
    PhoneCall,
    Calendar,
    BarChart3,
    Users,
    Clock,
    Bell,
    HelpCircle,
    FileText,
    Target,
} from "lucide-react";
import { BaseSidebar, NavigationItem } from "./BaseSidebar";

interface TelecallerSidebarProps {
    className?: string;
}

const navigation: NavigationItem[] = [
    {
        name: "Dashboard",
        href: "/telecaller/dashboard",
        icon: LayoutDashboard,
        description: "Overview and metrics",
    },
    {
        name: "Lead Queue",
        href: "/telecaller/leads",
        icon: Users,
        description: "Assigned leads",
    },
    {
        name: "Call Logs",
        href: "/telecaller/calls",
        icon: PhoneCall,
        description: "Call history",
    },
    {
        name: "Follow-ups",
        href: "/telecaller/follow-ups",
        icon: Calendar,
        description: "Scheduled reminders",
    },
    {
        name: "Performance",
        href: "/telecaller/performance",
        icon: BarChart3,
        description: "Analytics & metrics",
    },
    {
        name: "Quick Call",
        href: "/telecaller/quick-call",
        icon: Phone,
        description: "Start calling",
    },
];

const secondaryNavigation: NavigationItem[] = [
    {
        name: "Notifications",
        href: "/telecaller/notifications",
        icon: Bell,
        
    },
    {
        name: "Help & Support",
        href: "/telecaller/help",
        icon: HelpCircle,
    },
];

export function TelecallerSidebar({ className }: TelecallerSidebarProps) {
    return (
        <BaseSidebar
            className={className}
            title="Telecaller"
            subtitle="Call Management"
            version="1.0.0"
            navigation={navigation}
            secondaryNavigation={secondaryNavigation}
        />
    );
}
