"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  FileText,
  Bell,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth";

interface InstitutionAdminSidebarProps {
  className?: string;

}

const navigation = [
  {
    name: "Dashboard",
    href: "/institution-admin/dashboard",
    icon: LayoutDashboard,
    description: "Overview and analytics",
  },
  {
    name: "User Management",
    href: "/institution-admin/users",
    icon: Users,
    description: "Manage team members",
  },
  {
    name: "Settings",
    href: "/institution-admin/settings",
    icon: Settings,
    description: "Institution configuration",
  },
  {
    name: "Analytics",
    href: "/institution-admin/analytics",
    icon: BarChart3,
    description: "Performance insights",
  },
  {
    name: "Forms",
    href: "/institution-admin/forms",
    icon: FileText,
    description: "Form builder",
  },
];

const secondaryNavigation = [
  {
    name: "Notifications",
    href: "/institution-admin/notifications",
    icon: Bell,
    badge: "3",
  },
  {
    name: "Help & Support",
    href: "/institution-admin/help",
    icon: HelpCircle,
  },
];

export function InstitutionAdminSidebar({ className }: InstitutionAdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { currentTenantSlug } = useAuthStore();

  // Helper function to build URLs with tenant slug
  const buildUrl = (basePath: string) => {
    if (!currentTenantSlug) return basePath;
    return `${basePath}?tenant=${currentTenantSlug}`;
  };

  console.log("Tenant slug:", currentTenantSlug);
  return (
    <div
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-sm">
                IA
              </span>
            </div>
            <div>
              <h2 className="text-sidebar-foreground font-semibold text-sm">
                Institution Admin
              </h2>
              <p className="text-sidebar-accent-foreground text-xs">
                Management Portal
              </p>
              {currentTenantSlug && (
                <p className="text-primary text-xs font-medium mt-1">
                  {currentTenantSlug}
                </p>
              )}
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-accent-foreground hover:text-sidebar-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={buildUrl(item.href)}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-75 truncate">
                      {item.description}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="pt-4 border-t border-sidebar-border">
          <div className="space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={buildUrl(item.href)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-accent-foreground">
            <div className="font-medium text-sidebar-foreground mb-1">
              Institution Admin
            </div>
            <div>Version 1.0.0</div>
          </div>
        </div>
      )}
    </div>
  );
}
