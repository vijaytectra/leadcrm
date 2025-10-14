"use client";

import { BaseHeader } from "./BaseHeader";

interface InstitutionAdminHeaderProps {
  className?: string;
}

export function InstitutionAdminHeader({ className }: InstitutionAdminHeaderProps) {
  return (
    <BaseHeader
      className={className}
      title="Institution Admin Dashboard"
      subtitle="Manage your institution and team"
      searchPlaceholder="Search users, settings, or help..."
      showSearch={true}
      showNotifications={true}
      showUserMenu={true}
    />
  );
}
