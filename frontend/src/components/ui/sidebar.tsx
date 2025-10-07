"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Building2,
    Users,
    CreditCard,
    BarChart3,
    Settings,
    FileText,
    ChevronLeft,
    ChevronRight,
    Home,
    DollarSign,
    TrendingUp,
    Bell,
    User
} from "lucide-react";
import Link from "next/link";

interface SidebarProps {
    className?: string;
    isCollapsed?: boolean;
    onToggle?: () => void;
}

interface SidebarItemProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    href: string;
    isActive?: boolean;
    isCollapsed?: boolean;
    onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
    icon: Icon,
    label,
    href,
    isActive = false,
    isCollapsed = false,
    onClick
}) => {
    return (
        <Button
            variant={isActive ? "default" : "ghost"}
            className={cn(
                "w-full justify-start h-10 px-3",
                isCollapsed && "px-2",
                isActive && "bg-primary text-primary-foreground"
            )}
            onClick={onClick}
        >
            <Link href={href} className="w-full">
                <div className="flex items-center space-x-2">
                    <Icon className={cn("h-4 w-4", isCollapsed ? "mr-0" : "mr-3")} />
                    {!isCollapsed && <span className="text-sm">{label}</span>}
                </div>


            </Link>

        </Button>

    );
};

export const Sidebar: React.FC<SidebarProps> = ({
    className,
    isCollapsed = false,
    onToggle
}) => {
    const [activeItem, setActiveItem] = React.useState("dashboard");

    const sidebarItems = [
        {
            icon: Home,
            label: "Dashboard",
            href: "/super-admin/dashboard",
            key: "dashboard"
        },
        {
            icon: Building2,
            label: "Institutions",
            href: "/super-admin/institutions",
            key: "institutions"
        },
        {
            icon: Users,
            label: "Users",
            href: "/super-admin/users",
            key: "users"
        },
        {
            icon: CreditCard,
            label: "Subscriptions",
            href: "/super-admin/subscriptions",
            key: "subscriptions"
        },
        {
            icon: DollarSign,
            label: "Finance",
            href: "/super-admin/finance",
            key: "finance"
        },
        {
            icon: BarChart3,
            label: "Analytics",
            href: "/super-admin/analytics",
            key: "analytics"
        },
        {
            icon: FileText,
            label: "Reports",
            href: "/super-admin/reports",
            key: "reports"
        },
        {
            icon: Settings,
            label: "Settings",
            href: "/super-admin/settings",
            key: "settings"
        }
    ];

    return (
        <Card className={cn(
            "h-full w-full border-r-0 rounded-none",
            isCollapsed ? "w-16" : "w-64",
            className
        )}>
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    {!isCollapsed && (
                        <div className="flex items-center space-x-2">
                            <Building2 className="h-6 w-6 text-primary" />
                            <span className="text-lg font-semibold">Super Admin</span>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggle}
                        className="h-8 w-8 p-0"
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {sidebarItems.map((item) => (
                        <SidebarItem
                            key={item.key}
                            icon={item.icon}
                            label={item.label}
                            href={item.href}
                            isActive={activeItem === item.key}
                            isCollapsed={isCollapsed}
                            onClick={() => setActiveItem(item.key)}
                        />
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t">
                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">Super Admin</p>
                                <p className="text-xs text-muted-foreground truncate">admin@lead101.com</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};
