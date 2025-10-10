"use client";

import { useAuthStore } from "@/stores/auth";
import { InstitutionAdminSidebar } from "./InstitutionAdminSidebar";
import { TelecallerSidebar } from "./TelecallerSidebar";

interface RoleBasedSidebarProps {
    className?: string;
}

export function RoleBasedSidebar({ className }: RoleBasedSidebarProps) {
    const { user } = useAuthStore();

    // Determine which sidebar to show based on user role
    if (!user) {
        return null;
    }

    // Check if user has telecaller role
    const isTelecaller = user.role === "TELECALLER" || user.role === "telecaller";

    // Check if user has institution admin role
    const isInstitutionAdmin = user.role === "INSTITUTION_ADMIN" || user.role === "institution_admin";

    if (isTelecaller) {
        return <TelecallerSidebar className={className} />;
    }

    if (isInstitutionAdmin) {
        return <InstitutionAdminSidebar className={className} />;
    }

    // Default fallback - you can add more role-based sidebars here
    return <InstitutionAdminSidebar className={className} />;
}
