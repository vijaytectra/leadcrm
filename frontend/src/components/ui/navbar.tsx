"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth";
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
    const { logout } = useAuthStore();
    const router = useRouter();

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

    const handleLogout = async () => {
        try {
            await logout();
            setIsProfileOpen(false);
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
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
        <Card className={cn(
            "w-full border-0 rounded-none sticky top-0 z-50 backdrop-blur-md bg-white/90 shadow-sm border-b border-gray-200/50",
            className
        )}>
            <div className="flex items-center justify-between px-6 py-4">
                {/* Left side - Mobile menu and search */}
                <div className="flex items-center space-x-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onMenuToggle}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-5 w-5 text-gray-700" />
                        ) : (
                            <Menu className="h-5 w-5 text-gray-700" />
                        )}
                    </Button>

                    <div className="hidden md:flex items-center space-x-3 bg-gray-50/80 rounded-xl px-4 py-2.5 border border-gray-200/50 focus-within:border-blue-300 focus-within:bg-white transition-all duration-200">
                        <Search className="h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="bg-transparent border-0 outline-none text-sm placeholder:text-gray-400 w-72 font-medium"
                        />
                    </div>
                </div>

                {/* Right side - Notifications and profile */}
                <div className="flex items-center space-x-3">
                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200"
                        >
                            <Bell className="h-5 w-5 text-gray-600" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-semibold shadow-lg animate-pulse">
                                    {unreadCount}
                                </span>
                            )}
                        </Button>

                        {/* Notifications dropdown */}
                        {isNotificationOpen && (
                            <div className="absolute right-0 top-full mt-2 w-96 bg-white/95 backdrop-blur-lg border border-gray-200/50 rounded-2xl shadow-xl z-[99999] overflow-hidden">
                                <div className="p-5 border-b border-gray-100/80 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={markAllAsRead}
                                                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg"
                                            >
                                                Mark all read
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={cn(
                                                "p-5 border-b border-gray-50 hover:bg-gray-50/70 cursor-pointer transition-all duration-200 group",
                                                !notification.isRead && "bg-gradient-to-r from-blue-50/30 to-indigo-50/30 border-l-4 border-l-blue-400"
                                            )}
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <div className="flex items-start space-x-4">
                                                <div className={cn(
                                                    "w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 shadow-sm",
                                                    notification.type === "success" && "bg-gradient-to-r from-green-400 to-green-500",
                                                    notification.type === "info" && "bg-gradient-to-r from-blue-400 to-blue-500",
                                                    notification.type === "warning" && "bg-gradient-to-r from-yellow-400 to-orange-500",
                                                    notification.type === "error" && "bg-gradient-to-r from-red-400 to-red-500"
                                                )} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-800">
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-2 font-medium">
                                                        {notification.time}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 bg-gray-50/50">
                                    <Button variant="ghost" className="w-full text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 py-2.5 rounded-lg">
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
                            className="flex items-center space-x-3 hover:bg-gray-100 px-3 py-2 rounded-xl transition-all duration-200"
                        >
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                                <User className="h-4 w-4 text-white" />
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-semibold text-gray-900">{mockUser.name}</p>
                                <p className="text-xs text-gray-500 font-medium">{mockUser.role}</p>
                            </div>
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </Button>

                        {/* Profile dropdown menu */}
                        {isProfileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-72 z-[99999] bg-white/95 backdrop-blur-lg border border-gray-200/50 rounded-2xl shadow-xl overflow-hidden">
                                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                            <User className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{mockUser.name}</p>
                                            <p className="text-xs text-gray-500 font-medium">{mockUser.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="py-2">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start px-4 py-3 hover:bg-gray-50 text-gray-700 font-medium"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <User className="h-4 w-4 mr-3 text-gray-500" />
                                        Profile Settings
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start px-4 py-3 hover:bg-gray-50 text-gray-700 font-medium"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <Settings className="h-4 w-4 mr-3 text-gray-500" />
                                        Account Settings
                                    </Button>
                                    <div className="border-t my-2 border-gray-100" />
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 font-medium"
                                        onClick={handleLogout}
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
