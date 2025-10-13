"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Bell,
    BellOff,
    Mail,
    MessageSquare,
    Phone,
    Settings,
    CheckCircle,
    Clock,
    AlertCircle,
    Info
} from "lucide-react";
import { toast } from "sonner";
import { apiDeleteClient, apiGetClientNew, apiPutClient } from "@/lib/utils";
import { getClientToken } from "@/lib/client-token";


interface Notification {
    id: string;
    title: string;
    message: string;
    type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "SYSTEM";
    category: string;
    read: boolean;
    createdAt: string;
    data?: Record<string, unknown>;
}

interface NotificationPreferences {
    emailEnabled: boolean;
    smsEnabled: boolean;
    whatsappEnabled: boolean;
    pushEnabled: boolean;
    frequency: "IMMEDIATE" | "DAILY" | "WEEKLY";
    categories: Record<string, boolean>;
}

interface NotificationCenterProps {
    tenantSlug: string;
}

export function NotificationCenter({ tenantSlug }: NotificationCenterProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

    useEffect(() => {
        fetchNotifications();
        fetchPreferences();
    }, [tenantSlug, showUnreadOnly]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                limit: "50",
                offset: "0",
                unreadOnly: showUnreadOnly.toString(),
            });
            const t = getClientToken();
         
            const data = await apiGetClientNew(`/${tenantSlug}/notifications?${params}`, { token: getClientToken() || undefined });
            setNotifications((data as { notifications: Notification[] }).notifications || []);
        } catch (error) {
            toast.error("Failed to fetch notifications");

        } finally {
            setLoading(false);
        }
    };

    const fetchPreferences = async () => {
        try {
           
            const data = await apiGetClientNew(`/${tenantSlug}/notifications/preferences`, { token: getClientToken() || undefined });
            setPreferences((data as { preferences: NotificationPreferences }).preferences);
        } catch (error) {
        }
    };

    const markAsRead = async (notificationIds: string[]) => {
        try {
            const data = await apiPutClient(`/${tenantSlug}/notifications/mark-read`, { notificationIds }, { token: getClientToken() || undefined });
            if (data) {
                toast.success("Notifications marked as read");
            }


            fetchNotifications();
            setSelectedNotifications([]);
        } catch (error) {
            toast.error("Failed to mark notifications as read");

        }
    };

    const markAllAsRead = async () => {
        try {
            const data = await apiPutClient(`/${tenantSlug}/notifications/mark-read`, { markAll: true }, { token: getClientToken() || undefined });
            if (data) {
                toast.success("All notifications marked as read");
            }

            toast.success("All notifications marked as read");



            fetchNotifications();
        } catch (error) {
            toast.error("Failed to mark all notifications as read");

        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            const data = await apiDeleteClient(`/${tenantSlug}/notifications/${notificationId}`, { token: getClientToken() || undefined });
            if (data) {
                toast.success("Notification deleted");
            }

            fetchNotifications();
        } catch (error) {
            toast.error("Failed to delete notification");

        }
    };

    const updatePreferences = async (newPreferences: NotificationPreferences) => {
        try {
            const data = await apiPutClient(`/${tenantSlug}/notifications/preferences`, newPreferences, { token: getClientToken() || undefined });
            if (data) {
                toast.success("Notification preferences updated");
            }




            setPreferences(newPreferences);
        } catch (error) {
            toast.error("Failed to update notification preferences");

        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "SUCCESS":
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case "WARNING":
                return <AlertCircle className="h-4 w-4 text-yellow-600" />;
            case "ERROR":
                return <AlertCircle className="h-4 w-4 text-red-600" />;
            case "SYSTEM":
                return <Settings className="h-4 w-4 text-blue-600" />;
            default:
                return <Info className="h-4 w-4 text-blue-600" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "SUCCESS":
                return "bg-green-100 text-green-800";
            case "WARNING":
                return "bg-yellow-100 text-yellow-800";
            case "ERROR":
                return "bg-red-100 text-red-800";
            case "SYSTEM":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const handleSelectNotification = (notificationId: string, checked: boolean) => {
        if (checked) {
            setSelectedNotifications([...selectedNotifications, notificationId]);
        } else {
            setSelectedNotifications(selectedNotifications.filter(id => id !== notificationId));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedNotifications(notifications.map(n => n.id));
        } else {
            setSelectedNotifications([]);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Notification Center</h2>
                    <p className="text-muted-foreground">
                        Manage your notifications and preferences
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                    >
                        {showUnreadOnly ? <BellOff className="h-4 w-4 mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
                        {showUnreadOnly ? "Show All" : "Unread Only"}
                    </Button>
                    {selectedNotifications.length > 0 && (
                        <Button
                            onClick={() => markAsRead(selectedNotifications)}
                            size="sm"
                        >
                            Mark as Read
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={markAllAsRead}
                        size="sm"
                    >
                        Mark All Read
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="notifications" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>

                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Notifications</CardTitle>
                            <CardDescription>
                                {notifications.length} notifications
                                {showUnreadOnly && ` (${notifications.filter(n => !n.read).length} unread)`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {notifications.length === 0 ? (
                                <div className="text-center py-8">
                                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium">No notifications</h3>
                                    <p className="text-muted-foreground">
                                        {showUnreadOnly ? "You have no unread notifications" : "You have no notifications yet"}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {notifications.length > 0 && (
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="select-all"
                                                checked={selectedNotifications.length === notifications.length}
                                                onCheckedChange={handleSelectAll}
                                            />
                                            <Label htmlFor="select-all">Select All</Label>
                                        </div>
                                    )}

                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 border rounded-lg ${notification.read ? "bg-gray-50" : "bg-white border-blue-200"
                                                }`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <Checkbox
                                                    checked={selectedNotifications.includes(notification.id)}
                                                    onCheckedChange={(checked) =>
                                                        handleSelectNotification(notification.id, checked as boolean)
                                                    }
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        {getTypeIcon(notification.type)}
                                                        <h3 className="text-sm font-medium">{notification.title}</h3>
                                                        <Badge className={getTypeColor(notification.type)}>
                                                            {notification.type}
                                                        </Badge>
                                                        <Badge variant="outline">{notification.category}</Badge>
                                                        {!notification.read && (
                                                            <Badge variant="default" className="bg-blue-600">
                                                                New
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(notification.createdAt).toLocaleString()}
                                                        </span>
                                                        <div className="flex items-center space-x-2">
                                                            {!notification.read && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => markAsRead([notification.id])}
                                                                >
                                                                    Mark as Read
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => deleteNotification(notification.id)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-4">
                    {preferences && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>
                                    Configure how you receive notifications
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="font-medium">Communication Channels</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="email-enabled"
                                                checked={preferences.emailEnabled}
                                                onCheckedChange={(checked) =>
                                                    updatePreferences({ ...preferences, emailEnabled: checked as boolean })
                                                }
                                            />
                                            <Label htmlFor="email-enabled" className="flex items-center space-x-2">
                                                <Mail className="h-4 w-4" />
                                                <span>Email notifications</span>
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="sms-enabled"
                                                checked={preferences.smsEnabled}
                                                onCheckedChange={(checked) =>
                                                    updatePreferences({ ...preferences, smsEnabled: checked as boolean })
                                                }
                                            />
                                            <Label htmlFor="sms-enabled" className="flex items-center space-x-2">
                                                <MessageSquare className="h-4 w-4" />
                                                <span>SMS notifications</span>
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="whatsapp-enabled"
                                                checked={preferences.whatsappEnabled}
                                                onCheckedChange={(checked) =>
                                                    updatePreferences({ ...preferences, whatsappEnabled: checked as boolean })
                                                }
                                            />
                                            <Label htmlFor="whatsapp-enabled" className="flex items-center space-x-2">
                                                <Phone className="h-4 w-4" />
                                                <span>WhatsApp notifications</span>
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="push-enabled"
                                                checked={preferences.pushEnabled}
                                                onCheckedChange={(checked) =>
                                                    updatePreferences({ ...preferences, pushEnabled: checked as boolean })
                                                }
                                            />
                                            <Label htmlFor="push-enabled" className="flex items-center space-x-2">
                                                <Bell className="h-4 w-4" />
                                                <span>Push notifications</span>
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-medium">Notification Frequency</h3>
                                    <Select
                                        value={preferences.frequency}
                                        onValueChange={(value) =>
                                            updatePreferences({ ...preferences, frequency: value as "IMMEDIATE" | "DAILY" | "WEEKLY" })
                                        }
                                    >
                                        <SelectTrigger className="w-48">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="IMMEDIATE">Immediate</SelectItem>
                                            <SelectItem value="DAILY">Daily Digest</SelectItem>
                                            <SelectItem value="WEEKLY">Weekly Digest</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-medium">Notification Categories</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.entries(preferences.categories).map(([category, enabled]) => (
                                            <div key={category} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`category-${category}`}
                                                    checked={enabled}
                                                    onCheckedChange={(checked) =>
                                                        updatePreferences({
                                                            ...preferences,
                                                            categories: {
                                                                ...preferences.categories,
                                                                [category]: checked as boolean,
                                                            },
                                                        })
                                                    }
                                                />
                                                <Label htmlFor={`category-${category}`} className="capitalize">
                                                    {category.toLowerCase().replace(/_/g, " ")}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
