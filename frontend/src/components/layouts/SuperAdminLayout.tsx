"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/ui/sidebar";
import { Navbar } from "@/components/ui/navbar";

interface SuperAdminLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({
    children,
    className
}) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Mobile sidebar overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed left-0 top-0 h-full z-50 transition-transform duration-300",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
                    "lg:translate-x-0 lg:relative lg:z-auto"
                )}
            >
                <Sidebar
                    isCollapsed={isSidebarCollapsed}
                    onToggle={toggleSidebar}
                />
            </div>

            {/* Main content area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Navbar */}
                <div className="flex-shrink-0">
                    <Navbar
                        onMenuToggle={toggleMobileMenu}
                        isMobileMenuOpen={isMobileMenuOpen}
                    />
                </div>

                {/* Page content */}
                <main className={cn("flex-1 overflow-auto p-6", className)}>
                    {children}
                </main>
            </div>
        </div>
    );
};