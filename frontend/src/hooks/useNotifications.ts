"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/stores/auth";
import {
  Notification,
  NotificationStats,
  NotificationFilters,
  SSEEvent,
} from "@/types/notifications";
import {
  getNotifications,
  getNotificationStats,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  createSSEConnection,
} from "@/lib/api/notifications";
import { getClientToken } from "@/lib/client-token";

export function useNotifications() {
  const [isClient, setIsClient] = useState(false);
  const { currentTenantSlug } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<NotificationFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const sseRef = useRef<EventSource | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isClient || !currentTenantSlug) return;

    setLoading(true);
    setError(null);

    const token = getClientToken();

    try {
      const response = await getNotifications(
        currentTenantSlug,
        filters,
        token
      );
      setNotifications(response.notifications);
      setPagination(response.pagination);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch notifications"
      );
    } finally {
      setLoading(false);
    }
  }, [isClient, currentTenantSlug, filters]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!isClient || !currentTenantSlug) return;
    const token = getClientToken();
    if (!token) return;

    try {
      const statsData = await getNotificationStats(currentTenantSlug, token);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch notification stats:", err);
    }
  }, [isClient, currentTenantSlug]);

  // Start polling as fallback when SSE fails
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return; // Already polling

    
    setIsPolling(true);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        await fetchNotifications();
        await fetchStats();
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 30000); // Poll every 30 seconds
  }, [fetchNotifications, fetchStats]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      setIsPolling(false);
    
    }
  }, []);

  // Initialize SSE connection with circuit breaker pattern
  const initializeSSE = useCallback(() => {
    if (!isClient || !currentTenantSlug || sseRef.current) return;

    // Check if we've exceeded max reconnection attempts
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.warn(
        "SSE: Max reconnection attempts reached. Switching to polling mode."
      );
      setConnectionError(
        "Real-time connection failed. Using polling for updates."
      );
      startPolling();
      return;
    }

    const token = getClientToken();
    if (!token) {
      setConnectionError("No authentication token available");
      return;
    }

    try {
      const eventSource = createSSEConnection(currentTenantSlug, token);
      sseRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0; // Reset attempts on successful connection
       
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);

          if (data.type === "notification" && data.notification) {
            // Add new notification to the list
            setNotifications((prev) => [data.notification!, ...prev]);

            // Update stats
            setStats((prev) =>
              prev
                ? {
                    ...prev,
                    total: prev.total + 1,
                    unread: prev.unread + 1,
                    byType: {
                      ...prev.byType,
                      [data.notification!.type]:
                        (prev.byType[data.notification!.type] || 0) + 1,
                    },
                    byCategory: {
                      ...prev.byCategory,
                      [data.notification!.category]:
                        (prev.byCategory[data.notification!.category] || 0) + 1,
                    },
                  }
                : null
            );
          }
        } catch (err) {
          console.error("Failed to parse SSE event:", err);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        console.log("SSE connection state:", eventSource.readyState);
        setIsConnected(false);
        reconnectAttemptsRef.current += 1;

        // Clear any existing timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        // Determine error type and set appropriate error message
        if (eventSource.readyState === EventSource.CLOSED) {
          setConnectionError("Connection closed by server");
        } else if (eventSource.readyState === EventSource.CONNECTING) {
          setConnectionError("Connection timeout");
        } else {
          setConnectionError("Connection failed");
        }

        // Exponential backoff: 2^attempts * 1000ms (max 30 seconds)
        const backoffDelay = Math.min(
          Math.pow(2, reconnectAttemptsRef.current) * 1000,
          30000
        );

        console.log(
          `SSE: Attempting to reconnect in ${backoffDelay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
        );

        reconnectTimeoutRef.current = setTimeout(() => {
          if (sseRef.current) {
            sseRef.current.close();
            sseRef.current = null;
          }
          initializeSSE();
        }, backoffDelay);
      };
    } catch (err) {
      console.error("Failed to initialize SSE connection:", err);
      setConnectionError("Failed to initialize connection");
    }
  }, [isClient, currentTenantSlug, startPolling]);

  // Cleanup SSE connection
  const cleanupSSE = useCallback(() => {
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
      setIsConnected(false);
    }

    // Clear any pending reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Reset reconnection attempts
    reconnectAttemptsRef.current = 0;

    // Stop polling if it was running
    stopPolling();
  }, [stopPolling]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!currentTenantSlug) return;
      const token = getClientToken();
      if (!token) return;
      try {
        await markNotificationAsRead(currentTenantSlug, notificationId, token);

        // Update local state
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true, readAt: new Date() }
              : notification
          )
        );

        // Update stats
        setStats((prev) =>
          prev
            ? {
                ...prev,
                unread: Math.max(0, prev.unread - 1),
              }
            : null
        );
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    },
    [currentTenantSlug]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!currentTenantSlug) return;
    const token = getClientToken();
    if (!token) return;
    try {
      await markAllNotificationsAsRead(currentTenantSlug, token);

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
          readAt: new Date(),
        }))
      );

      // Update stats
      setStats((prev) => (prev ? { ...prev, unread: 0 } : null));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, [currentTenantSlug]);

  // Delete notification
  const deleteNotificationById = useCallback(
    async (notificationId: string) => {
      if (!currentTenantSlug) return;
      const token = getClientToken();
      if (!token) return;
      try {
        await deleteNotification(currentTenantSlug, notificationId, token);

        // Update local state
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        // Update stats
        setStats((prev) =>
          prev
            ? {
                ...prev,
                total: Math.max(0, prev.total - 1),
                unread: Math.max(0, prev.unread - 1),
              }
            : null
        );
      } catch (err) {
        console.error("Failed to delete notification:", err);
      }
    },
    [currentTenantSlug]
  );

  // Delete all notifications
  const deleteAll = useCallback(async () => {
    if (!currentTenantSlug) return;
    const token = getClientToken();
    if (!token) return;
    try {
      await deleteAllNotifications(currentTenantSlug, token);

      // Update local state
      setNotifications([]);
      setStats((prev) => (prev ? { ...prev, total: 0, unread: 0 } : null));
    } catch (err) {
      console.error("Failed to delete all notifications:", err);
    }
  }, [currentTenantSlug]);

  // Update filters
  const updateFilters = useCallback(
    (newFilters: Partial<NotificationFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    []
  );

  // Manual reconnection function
  const reconnectSSE = useCallback(() => {
    console.log("Manual SSE reconnection requested");
    stopPolling(); // Stop polling when trying to reconnect
    cleanupSSE();
    reconnectAttemptsRef.current = 0;
    setConnectionError(null);
    initializeSSE();
  }, [cleanupSSE, initializeSSE, stopPolling]);

  // Initialize (only on client side)
  useEffect(() => {
    if (!isClient) return;

    fetchNotifications();
    fetchStats();
    initializeSSE();

    return () => {
      cleanupSSE();
    };
  }, [isClient, fetchNotifications, fetchStats, initializeSSE, cleanupSSE]);

  return {
    notifications,
    stats,
    loading,
    error,
    filters,
    pagination,
    isConnected,
    connectionError,
    isPolling,
    fetchNotifications,
    fetchStats,
    markAsRead,
    markAllAsRead,
    deleteNotification: deleteNotificationById,
    deleteAll,
    updateFilters,
    setFilters,
    reconnectSSE,
  };
}
