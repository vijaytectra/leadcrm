"use client";

import { useAuthStore } from "@/stores/auth";
import { InstitutionAdminHeader } from "./InstitutionAdminHeader";
import { TelecallerHeader } from "./TelecallerHeader";

interface RoleBasedHeaderProps {
    className?: string;
}

export function RoleBasedHeader({ className }: RoleBasedHeaderProps) {
    const { user } = useAuthStore();

    // Determine which header to show based on user role
    if (!user) {
        return null;
    }

    // Check if user has telecaller role
    const isTelecaller = user.role === "TELECALLER" || user.role === "telecaller";

    // Check if user has institution admin role
    const isInstitutionAdmin = user.role === "INSTITUTION_ADMIN" || user.role === "institution_admin";

    if (isTelecaller) {
        return <TelecallerHeader className={className} />;
    }

    if (isInstitutionAdmin) {
        return <InstitutionAdminHeader className={className} />;
    }

    // Default fallback - you can add more role-based headers here
    return <InstitutionAdminHeader className={className} />;
}
