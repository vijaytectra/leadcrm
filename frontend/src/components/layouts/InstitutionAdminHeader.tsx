"use client";

import { useState } from "react";
import { Search, Bell, User, Settings, LogOut, ChevronDown, Building2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
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

interface InstitutionAdminHeaderProps {
  className?: string;
}

export function InstitutionAdminHeader({ className }: InstitutionAdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { logout, currentTenantSlug } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Mock user data - in real app, this would come from auth context
  const user = {
    name: "John Doe",
    email: "john.doe@institution.com",
    role: "Institution Admin",
    avatar: null,
  };

  const notifications = [
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

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className={`bg-white border-b border-gray-200 shadow-sm ${className}`}>
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section - Tenant Info and Search */}
        <div className="flex items-center space-x-6 flex-1 max-w-3xl">
          {/* Tenant Badge */}
          {currentTenantSlug && (
            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg shadow-sm">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-semibold">{currentTenantSlug}</span>
            </div>
          )}
          
          {/* Enhanced Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users, settings, or help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 focus:ring-blue-200 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-3">
          {/* Enhanced Notifications */}
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
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="p-0">
                    <div className="w-full p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                          notification.unread ? 'bg-blue-500' : 'bg-gray-300'
                        }`} />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm ${
                              notification.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                            }`}>
                              {notification.title}
                            </span>
                            <span className="text-xs text-gray-500">
                              {notification.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-3 text-center">
                <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  View all notifications
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Enhanced User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-3 hover:bg-gray-100 transition-colors duration-200 px-3 py-2 rounded-lg"
              >
                <Avatar className="h-9 w-9 ring-2 ring-gray-200">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 shadow-lg border-0">
              <DropdownMenuLabel className="bg-gray-50 px-4 py-3 border-b">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{user.name}</div>
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
        </div>
      </div>
    </header>
  );
}
