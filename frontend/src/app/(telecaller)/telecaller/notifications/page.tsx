"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Trash2 } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationFilters, Notification } from "@/types/notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NotificationList } from "@/components/notifications/NotificationList";

import { DeleteDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import { NotificationFiltersComponent } from "@/components/notifications/NotificationFilters";

export default function TelecallerNotificationsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const {
        notifications,
        stats,
        loading,
        error,
        filters,
        pagination,
        isConnected,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAll,
        updateFilters
    } = useNotifications();

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<"selected" | "all" | null>(null);

    const handleSelect = useCallback((id: string, selected: boolean) => {
        setSelectedIds(prev =>
            selected
                ? [...prev, id]
                : prev.filter(selectedId => selectedId !== id)
        );
    }, []);

    const handleSelectAll = useCallback((selected: boolean) => {
        if (selected) {
            setSelectedIds(notifications.map(n => n.id));
        } else {
            setSelectedIds([]);
        }
    }, [notifications]);

    const handleMarkAsRead = useCallback(async (id: string) => {
        try {
            await markAsRead(id);
            toast({
                title: "Success",
                description: "Notification marked as read",
            });
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to mark notification as read",
                variant: "destructive",
            });
        }
    }, [markAsRead, toast]);

    const handleMarkAllAsRead = useCallback(async () => {
        try {
            await markAllAsRead();
            setSelectedIds([]);
            toast({
                title: "Success",
                description: "All notifications marked as read",
            });
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to mark all notifications as read",
                variant: "destructive",
            });
        }
    }, [markAllAsRead, toast]);

    const handleDelete = useCallback(async (id: string) => {
        try {
            await deleteNotification(id);
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
            toast({
                title: "Success",
                description: "Notification deleted",
            });
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to delete notification",
                variant: "destructive",
            });
        }
    }, [deleteNotification, toast]);

    const handleDeleteSelected = useCallback(async () => {
        try {
            for (const id of selectedIds) {
                await deleteNotification(id);
            }
            setSelectedIds([]);
            toast({
                title: "Success",
                description: `${selectedIds.length} notifications deleted`,
            });
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to delete selected notifications",
                variant: "destructive",
            });
        }
    }, [selectedIds, deleteNotification, toast]);

    const handleDeleteAll = useCallback(async () => {
        try {
            await deleteAll();
            setSelectedIds([]);
            toast({
                title: "Success",
                description: "All notifications deleted",
            });
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to delete all notifications",
                variant: "destructive",
            });
        }
    }, [deleteAll, toast]);

    const handleNavigate = useCallback((notification: Notification) => {
        if (notification.data?.actionUrl) {
            router.push(`${notification.data.actionUrl}`);
        } 
    }, [router]);

    const handleFiltersChange = useCallback((newFilters: NotificationFilters) => {
        updateFilters(newFilters);
    }, [updateFilters]);

    const handleResetFilters = useCallback(() => {
        updateFilters({
            page: 1,
            limit: 10,
            sortBy: "createdAt",
            sortOrder: "desc"
        });
    }, [updateFilters]);

    const handlePageChange = useCallback((page: number) => {
        updateFilters({ ...filters, page });
    }, [filters, updateFilters]);

    if (error) {
        return (
            <div className="container mx-auto py-6">
                <Card>
                    <CardContent className="p-8 text-center">
                        <div className="text-red-500 mb-4">
                            <Bell className="h-12 w-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Notifications</h3>
                        <p className="text-gray-500 mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()}>
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-600">
                        Your notifications and lead assignments
                        {isConnected && (
                            <Badge variant="outline" className="ml-2 text-green-600 border-green-200">
                                Live
                            </Badge>
                        )}
                    </p>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <Bell className="h-8 w-8 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Unread</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
                                </div>
                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-bold text-sm">{stats.unread}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Lead Assignments</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {stats.byCategory.LEAD || 0}
                                    </p>
                                </div>
                                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-green-600 font-bold text-sm">
                                        {stats.byCategory.LEAD || 0}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <NotificationFiltersComponent
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        onReset={handleResetFilters}
                        loading={loading}
                    />
                </CardContent>
            </Card>

            {/* Actions */}
            {notifications.length > 0 && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">
                                    {selectedIds.length > 0 && `${selectedIds.length} selected`}
                                </span>
                                {selectedIds.length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedIds([])}
                                    >
                                        Clear Selection
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleMarkAllAsRead}
                                    disabled={loading}
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    Mark All as Read
                                </Button>
                                {selectedIds.length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setDeleteTarget("selected");
                                            setShowDeleteDialog(true);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Selected
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setDeleteTarget("all");
                                        setShowDeleteDialog(true);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete All
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Notifications List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Notifications ({pagination.total})</span>
                        <div className="flex items-center space-x-2">
                            {isConnected && (
                                <Badge variant="outline" className="text-green-600 border-green-200">
                                    Live Updates
                                </Badge>
                            )}
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <NotificationList
                        notifications={notifications}
                        loading={loading}
                        selectedIds={selectedIds}
                        onSelect={handleSelect}
                        onSelectAll={handleSelectAll}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                        onNavigate={handleNavigate}
                        showSelection={true}
                    />
                </CardContent>
            </Card>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                                {pagination.total} notifications
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-gray-600">
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Delete Confirmation Dialog */}
            <DeleteDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={() => {
                    if (deleteTarget === "selected") {
                        handleDeleteSelected();
                    } else if (deleteTarget === "all") {
                        handleDeleteAll();
                    }
                    setShowDeleteDialog(false);
                    setDeleteTarget(null);
                }}
                title={`Delete ${deleteTarget === "selected" ? "Selected" : "All"} Notifications`}
                description={
                    deleteTarget === "selected"
                        ? `Are you sure you want to delete ${selectedIds.length} selected notifications? This action cannot be undone.`
                        : "Are you sure you want to delete all notifications? This action cannot be undone."
                }
            />
        </div>
    );
}
