"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Bell,
    Search,
    User,
    Settings,
    LogOut,
    ChevronDown,
    Menu,
    X
} from "lucide-react";

interface NavbarProps {
    className?: string;
    onMenuToggle?: () => void;
    isMobileMenuOpen?: boolean;
}

interface NotificationItem {
    id: string;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    type: "info" | "success" | "warning" | "error";
}

interface UserProfile {
    name: string;
    email: string;
    avatar?: string;
    role: string;
}

const mockNotifications: NotificationItem[] = [
    {
        id: "1",
        title: "New Institution Registered",
        message: "ABC College has completed registration",
        time: "2 minutes ago",
        isRead: false,
        type: "success"
    },
    {
        id: "2",
        title: "Payment Received",
        message: "Payment of ₹15,000 received from XYZ School",
        time: "1 hour ago",
        isRead: false,
        type: "info"
    },
    {
        id: "3",
        title: "System Alert",
        message: "High server load detected",
        time: "3 hours ago",
        isRead: true,
        type: "warning"
    },
    {
        id: "4",
        title: "Subscription Expiring",
        message: "DEF Institute subscription expires in 3 days",
        time: "1 day ago",
        isRead: true,
        type: "error"
    }
];

const mockUser: UserProfile = {
    name: "Super Admin",
    email: "admin@lead101.com",
    role: "Super Admin"
};

export const Navbar: React.FC<NavbarProps> = ({
    className,
    onMenuToggle,
    isMobileMenuOpen = false
}) => {
    const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const [notifications, setNotifications] = React.useState<NotificationItem[]>(mockNotifications);

    const notificationRef = React.useRef<HTMLDivElement>(null);
    const profileRef = React.useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, isRead: true }))
        );
    };

    // Close dropdowns when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <Card className={cn("w-full border-b-0 rounded-none sticky top-0 z-[100] bg-primary shadow-sm", className)}>
            <div className="flex items-center justify-between px-4 py-3">
                {/* Left side - Mobile menu and search */}
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onMenuToggle}
                        className="lg:hidden"
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>

                    <div className="hidden md:flex items-center space-x-2 bg-muted/50 rounded-lg px-3 py-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground w-64"
                        />
                    </div>
                </div>

                {/* Right side - Notifications and profile */}
                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className="relative"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </Button>

                        {/* Notifications dropdown */}
                        {isNotificationOpen && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white border rounded-lg shadow-lg z-[9999]">
                                <div className="p-4 border-b">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={markAllAsRead}
                                                className="text-xs"
                                            >
                                                Mark all as read
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={cn(
                                                "p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors",
                                                !notification.isRead && "bg-blue-50"
                                            )}
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                                                    notification.type === "success" && "bg-green-500",
                                                    notification.type === "info" && "bg-blue-500",
                                                    notification.type === "warning" && "bg-yellow-500",
                                                    notification.type === "error" && "bg-red-500"
                                                )} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {notification.time}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 border-t">
                                    <Button variant="ghost" className="w-full text-sm">
                                        View all notifications
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile dropdown */}
                    <div className="relative" ref={profileRef}>
                        <Button
                            variant="ghost"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center space-x-2"
                        >
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium">{mockUser.name}</p>
                                <p className="text-xs text-muted-foreground">{mockUser.role}</p>
                            </div>
                            <ChevronDown className="h-4 w-4" />
                        </Button>

                        {/* Profile dropdown menu */}
                        {isProfileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-white border rounded-lg shadow-lg z-[9999]">
                                <div className="p-4 border-b">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{mockUser.name}</p>
                                            <p className="text-xs text-muted-foreground">{mockUser.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="py-2">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <User className="h-4 w-4 mr-3" />
                                        Profile
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <Settings className="h-4 w-4 mr-3" />
                                        Account Settings
                                    </Button>
                                    <div className="border-t my-2" />
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <LogOut className="h-4 w-4 mr-3" />
                                        Logout
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};