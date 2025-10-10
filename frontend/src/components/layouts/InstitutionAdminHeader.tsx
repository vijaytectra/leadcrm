"use client";

import { BaseHeader, NotificationItem } from "./BaseHeader";

interface InstitutionAdminHeaderProps {
  className?: string;
}

const notifications: NotificationItem[] = [
  {
    id: "1",
    title: "New user registered",
    message: "Sarah Johnson has joined your team",
    time: "2 minutes ago",
    unread: true,
    type: "user",
  },
  {
    id: "2",
    title: "System update",
    message: "New features available in your dashboard",
    time: "1 hour ago",
    unread: true,
    type: "system",
  },
  {
    id: "3",
    title: "Monthly report ready",
    message: "Your institution's performance report is ready",
    time: "2 days ago",
    unread: false,
    type: "report",
  },
];

export function InstitutionAdminHeader({ className }: InstitutionAdminHeaderProps) {
  return (
    <BaseHeader
      className={className}
      searchPlaceholder="Search users, settings, or help..."
      notifications={notifications}
    />
  );
}
