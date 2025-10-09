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
            variant="ghost"
            className={cn(
                "w-full justify-start h-12 px-4 mb-1 group relative overflow-hidden transition-all duration-300",
                isCollapsed && "px-3 justify-center",
                isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                    : "hover:bg-gray-100/80 hover:shadow-sm text-gray-700"
            )}
            onClick={onClick}
        >
            <Link href={href} className="w-full">
                <div className="flex items-center space-x-3">
                    <div className={cn(
                        "flex items-center justify-center transition-all duration-300",
                        isActive && "drop-shadow-sm"
                    )}>
                        <Icon className={cn(
                            "h-5 w-5 transition-all duration-300",
                            isCollapsed ? "mr-0" : "mr-0",
                            isActive ? "text-white" : "text-gray-600 group-hover:text-gray-800"
                        )} />
                    </div>
                    {!isCollapsed && (
                        <span className={cn(
                            "text-sm font-medium transition-all duration-300 truncate",
                            isActive ? "text-white" : "text-gray-700 group-hover:text-gray-900"
                        )}>
                            {label}
                        </span>
                    )}
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
            "h-full border-0 rounded-none bg-gradient-to-b from-white via-gray-50/50 to-gray-100/30 shadow-2xl shadow-gray-900/10 backdrop-blur-sm transition-all duration-300",
            isCollapsed ? "w-20" : "w-72",
            className
        )}>
            <div className="flex flex-col h-screen overflow-auto">
                {/* Header */}
                <div className={cn(
                    "flex items-center justify-between p-6 border-b border-gray-200/60 bg-gradient-to-r from-blue-50/50 to-indigo-50/30",
                    isCollapsed && "px-4"
                )}>
                    {!isCollapsed && (
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Super Admin
                                </span>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">Control Panel</p>
                            </div>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggle}
                        className="h-9 w-9 p-0 hover:bg-gray-200/60 rounded-xl transition-all duration-300 group"
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-gray-800 transition-colors" />
                        ) : (
                            <ChevronLeft className="h-4 w-4 text-gray-600 group-hover:text-gray-800 transition-colors" />
                        )}
                    </Button>
                </div>

                {/* Navigation */}
                <nav className={cn(
                    "flex-1 p-4 space-y-1",
                    isCollapsed && "px-3"
                )}>
                    {!isCollapsed && (
                        <div className="mb-6">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
                                Main Menu
                            </p>
                        </div>
                    )}

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
                <div className={cn(
                    "p-5 border-t border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-gray-100/40",
                    isCollapsed && "px-3"
                )}>
                    <div className={cn(
                        "flex items-center space-x-3 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300",
                        isCollapsed && "justify-center p-3"
                    )}>
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
                            <User className="h-4 w-4 text-white" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">Super Admin</p>
                                <p className="text-xs text-gray-500 truncate font-medium">admin@lead101.com</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};
