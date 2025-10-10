"use client";

import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  FileText,
  Bell,
  HelpCircle,
  UserPlus,
} from "lucide-react";
import { BaseSidebar, NavigationItem } from "./BaseSidebar";

interface InstitutionAdminSidebarProps {
  className?: string;
}

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/institution-admin/dashboard",
    icon: LayoutDashboard,
    description: "Overview and analytics",
  },
  {
    name: "Leads",
    href: "/institution-admin/leads",
    icon: UserPlus,
    description: "Lead management",
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

const secondaryNavigation: NavigationItem[] = [
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
  return (
    <BaseSidebar
      className={className}
      title="Institution Admin"
      subtitle="Management Portal"
      version="1.0.0"
      navigation={navigation}
      secondaryNavigation={secondaryNavigation}
    />
  );
}
