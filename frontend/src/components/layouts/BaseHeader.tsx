"use client";

import { useState, useEffect } from "react";
import { Search, Bell, User, Settings, LogOut, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { NotificationToast } from "@/components/notifications/NotificationToast";
import { Notification } from "@/types/notifications";

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    time: string;
    unread: boolean;
    type: string;
}

export interface BaseHeaderProps {
    className?: string;
    title?: string;
    subtitle?: string;
    searchPlaceholder?: string;
    notifications?: NotificationItem[];
    showSearch?: boolean;
    showNotifications?: boolean;
    showUserMenu?: boolean;
    customActions?: React.ReactNode;
}

export function BaseHeader({
    className,
    searchPlaceholder = "Search...",
    showSearch = true,
    showNotifications = true,
    showUserMenu = true,
    customActions,
}: BaseHeaderProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);
    const [isClient, setIsClient] = useState(false);
    const { logout, user } = useAuthStore();
    const router = useRouter();

    // Use real-time notifications (always call the hook, but conditionally use the data)
    const { notifications: realTimeNotifications, stats, markAsRead } = useNotifications();

    // Ensure we're on the client side
    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // Show toast for new notifications (only on client side)
    useEffect(() => {
        if (isClient && realTimeNotifications.length > 0) {
            const latestNotification = realTimeNotifications[0];
            if (!latestNotification.read) {
                setToastNotifications(prev => [latestNotification, ...prev.slice(0, 2)]);

                // Auto-remove toast after 8 seconds
                setTimeout(() => {
                    setToastNotifications(prev => prev.filter(n => n.id !== latestNotification.id));
                }, 8000);
            }
        }
    }, [isClient, realTimeNotifications]);

    const handleToastClose = (id: string) => {
        setToastNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleToastMarkAsRead = async (id: string) => {
        try {
            await markAsRead(id);
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const handleToastNavigate = (notification: Notification) => {
        if (notification.data?.actionUrl && typeof notification.data.actionUrl === 'string') {
            router.push(notification.data.actionUrl);
        } else if (notification.leadId) {
            const basePath = user?.role === "TELECALLER" ? "/telecaller" : "/institution-admin";
            router.push(`${basePath}/leads?leadId=${notification.leadId}`);
        } else {
            const basePath = user?.role === "TELECALLER" ? "/telecaller" : "/institution-admin";
            router.push(`${basePath}/notifications`);
        }
    };

    const unreadCount = isClient ? (stats?.unread || 0) : 0;

    return (
        <header className={`bg-white border-b border-gray-200 shadow-sm ${className}`}>
            <div className="flex items-center justify-between px-6 py-4">
                {/* Left Section - Tenant Info and Search */}
                <div className="flex items-center space-x-6 flex-1 max-w-3xl">


                    {/* Enhanced Search */}
                    {showSearch && (
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder={searchPlaceholder}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 focus:ring-blue-200 transition-all duration-200"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Section - Actions */}
                <div className="flex items-center space-x-3">
                    {/* Custom Actions */}
                    {customActions}

                    {/* Enhanced Notifications */}
                    {showNotifications && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="relative hover:bg-gray-100 transition-colors duration-200"
                                >
                                    <Bell className="h-5 w-5 text-gray-600" />
                                    {unreadCount > 0 && (
                                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-medium text-white">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        </div>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-96 shadow-lg border-0">
                                <DropdownMenuLabel className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b">
                                    <span className="font-semibold text-gray-900">Notifications</span>
                                    {unreadCount > 0 && (
                                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                            {unreadCount} new
                                        </Badge>
                                    )}
                                </DropdownMenuLabel>
                                <div className="max-h-80 overflow-y-auto">
                                    {realTimeNotifications.slice(0, 5).map((notification) => (
                                        <DropdownMenuItem key={notification.id} className="p-0" onClick={() => handleToastNavigate(notification)}>
                                            <div className="w-full p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-start space-x-3">
                                                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-blue-500' : 'bg-gray-300'
                                                        }`} />
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                                                                }`}>
                                                                {notification.title}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {new Date(notification.createdAt).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 leading-relaxed">
                                                            {notification.message}
                                                        </p>
                                                        <div className="flex items-center space-x-2">
                                                            <Badge variant="outline" className="text-xs">
                                                                {notification.category}
                                                            </Badge>
                                                            {notification.priority !== "MEDIUM" && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {notification.priority}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                    {realTimeNotifications.length === 0 && (
                                        <div className="p-4 text-center text-gray-500">
                                            No notifications
                                        </div>
                                    )}
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="p-3 text-center">
                                    <Button
                                        variant="ghost"
                                        className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        onClick={() => {
                                            const basePath = user?.role === "TELECALLER" ? "/telecaller" : "/institution-admin";
                                            router.push(`${basePath}/notifications`);
                                        }}
                                    >
                                        View all notifications
                                    </Button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {/* Enhanced User Menu */}
                    {showUserMenu && user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="flex items-center space-x-3 hover:bg-gray-100 transition-colors duration-200 px-3 py-2 rounded-lg"
                                >
                                    <Avatar className="h-9 w-9 ring-2 ring-gray-200">
                                        <AvatarImage src={undefined} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                                            {user.firstName?.[0] || user.email[0].toUpperCase()}
                                            {user.lastName?.[0] || ""}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden md:block text-left">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {user.firstName && user.lastName
                                                ? `${user.firstName} ${user.lastName}`
                                                : user.email
                                            }
                                        </div>
                                        <div className="text-xs text-gray-500">{user.role}</div>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 shadow-lg border-0">
                                <DropdownMenuLabel className="bg-gray-50 px-4 py-3 border-b">
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={undefined} />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                                                {user.firstName?.[0] || user.email[0].toUpperCase()}
                                                {user.lastName?.[0] || ""}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">
                                                {user.firstName && user.lastName
                                                    ? `${user.firstName} ${user.lastName}`
                                                    : user.email
                                                }
                                            </div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                            <div className="text-xs text-gray-400">{user.role}</div>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <div className="py-2">
                                    <DropdownMenuItem className="px-4 py-2 hover:bg-gray-50 transition-colors">
                                        <User className="mr-3 h-4 w-4 text-gray-500" />
                                        <span className="font-medium">Profile Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="px-4 py-2 hover:bg-gray-50 transition-colors">
                                        <Settings className="mr-3 h-4 w-4 text-gray-500" />
                                        <span className="font-medium">Account Settings</span>
                                    </DropdownMenuItem>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-3 h-4 w-4" />
                                    <span className="font-medium">Sign out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Toast Notifications */}
            <div className="fixed bottom-4 right-4 z-50 space-y-2">
                {toastNotifications.map((notification) => (
                    <NotificationToast
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleToastMarkAsRead}
                        onNavigate={handleToastNavigate}
                        onClose={handleToastClose}
                        autoClose={true}
                        duration={8000}
                    />
                ))}
            </div>
        </header>
    );
}
