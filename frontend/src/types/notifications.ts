export interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "SYSTEM";
  category: string;
  actionType?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  leadId?: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
}

export interface NotificationFilters {
  search?: string;
  category?: string;
  type?: string;
  priority?: string;
  read?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: NotificationPagination;
}

export interface SSEEvent {
  type: "connected" | "heartbeat" | "notification";
  notification?: Notification;
  message?: string;
  timestamp: string;
}

export interface AnnouncementRequest {
  title: string;
  message: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  targetRoles?: string[];
  targetUsers?: string[];
}
