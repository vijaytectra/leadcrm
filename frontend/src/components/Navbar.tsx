"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, Settings, Bell } from "lucide-react";

export default function Navbar() {
    const router = useRouter();
    const { user, logout, isLoading } = useAuthStore();

    const handleLogout = async () => {
        
        try {
            await logout();
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            router.push("/login");
        }
    };

    const handleProfileClick = () => {
       
        router.push("/profile");
    };

    const handleSettingsClick = () => {
      
        router.push("/settings");
    };

    const getRoleDisplayName = (role: string) => {
        const roleMap: Record<string, string> = {
            SUPER_ADMIN: "Super Admin",
            INSTITUTION_ADMIN: "Institution Admin",
            TELECALLER: "Telecaller",
            DOCUMENT_VERIFIER: "Document Verifier",
            FINANCE_TEAM: "Finance Team",
            ADMISSION_TEAM: "Admission Team",
            ADMISSION_HEAD: "Admission Head",
            STUDENT: "Student",
            PARENT: "Parent",
        };
        return roleMap[role] || role;
    };

    const getInitials = (firstName?: string | null, lastName?: string | null, email?: string) => {
        if (firstName && lastName) {
            return `${firstName[0]}${lastName[0]}`.toUpperCase();
        }
        if (firstName) {
            return firstName[0].toUpperCase();
        }
        if (email) {
            return email[0].toUpperCase();
        }
        return "U";
    };

    if (!user) {
        return null;
    }

    return (
        <nav className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo/Brand */}
                <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        LEAD101
                    </h1>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {getRoleDisplayName(user.role)}
                    </span>
                </div>

                {/* Right side */}
                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <Button variant="ghost" size="sm" className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                    </Button>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative h-8 w-8 rounded-full p-0"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium">
                                        {getInitials(user.firstName, user.lastName, user.email)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none text-gray-900">
                                        {user.firstName && user.lastName
                                            ? `${user.firstName} ${user.lastName}`
                                            : user.email
                                        }
                                    </p>
                                    <p className="text-xs leading-none text-gray-500">
                                        {user.email}
                                    </p>
                                    <p className="text-xs leading-none text-gray-500">
                                        {getRoleDisplayName(user.role)}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={handleProfileClick}>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={handleSettingsClick}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onSelect={handleLogout}
                                disabled={isLoading}
                                variant="destructive"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>{isLoading ? "Signing out..." : "Sign out"}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
}