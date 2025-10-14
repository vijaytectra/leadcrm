import {
  Notification,
  NotificationStats,
  NotificationFilters,
  NotificationResponse,
  AnnouncementRequest,
} from "@/types/notifications";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export async function getNotifications(
  tenantSlug: string,
  filters: NotificationFilters = {},
  token: string | null
): Promise<NotificationResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.append("search", filters.search);
  if (filters.category) params.append("category", filters.category);
  if (filters.type) params.append("type", filters.type);
  if (filters.priority) params.append("priority", filters.priority);
  if (filters.read !== undefined)
    params.append("read", filters.read.toString());
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.sortBy) params.append("sortBy", filters.sortBy);
  if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

  const response = await fetch(
    `${API_BASE}/api/${tenantSlug}/notifications?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return response.json();
}

export async function getNotificationStats(
  tenantSlug: string,
  token: string | null
): Promise<NotificationStats> {
  const response = await fetch(
    `${API_BASE}/api/${tenantSlug}/notifications/stats`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch notification stats");
  }

  const data = await response.json();

  // The backend returns stats in a nested structure, extract the user-specific stats
  return {
    total: data.total || 0,
    unread: data.unread || 0,
    byType: data.global?.byType || {},
    byCategory: data.global?.byCategory || {},
  };
}

export async function markNotificationAsRead(
  tenantSlug: string,
  notificationId: string,
  token: string | null
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/${tenantSlug}/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to mark notification as read");
  }
}

export async function markAllNotificationsAsRead(
  tenantSlug: string,
  token: string | null
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/${tenantSlug}/notifications/mark-all-read`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to mark all notifications as read");
  }
}

export async function deleteNotification(
  tenantSlug: string,
  notificationId: string,
  token: string | null
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/${tenantSlug}/notifications/${notificationId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete notification");
  }
}

export async function deleteAllNotifications(
  tenantSlug: string,
  token: string | null
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/${tenantSlug}/notifications/delete-all`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete all notifications");
  }
}

export async function sendAnnouncement(
  tenantSlug: string,
  announcement: AnnouncementRequest,
  token: string | null
): Promise<{ success: boolean; notificationIds: string[]; message: string }> {
  const response = await fetch(
    `${API_BASE}/api/${tenantSlug}/notifications/announcement`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(announcement),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to send announcement");
  }

  return response.json();
}

export function createSSEConnection(
  tenantSlug: string,
  token: string | null
): EventSource {
  return new EventSource(
    `${API_BASE}/api/${tenantSlug}/notifications/stream?token=${token}`
  );
}
