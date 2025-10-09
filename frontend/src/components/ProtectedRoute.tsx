"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
    requireTenant?: boolean;
}

export function ProtectedRoute({
    children,
    allowedRoles,
    requireTenant = false,
}: ProtectedRouteProps) {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, currentTenantSlug } = useAuthStore();

    useEffect(() => {
        // Wait for auth check to complete
        if (!isLoading) {
            // If not authenticated, redirect to login
            if (!isAuthenticated || !user) {
                router.push("/login");
                return;
            }

            // Check if user has required role
            if (allowedRoles && !allowedRoles.includes(user.role)) {
                router.push("/unauthorized");
                return;
            }

            // Check if tenant is required but not present
            if (requireTenant && !currentTenantSlug) {
                router.push("/login");
                return;
            }
        }
    }, [isLoading, isAuthenticated, user, currentTenantSlug, router, allowedRoles, requireTenant]);

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Show loading while redirecting
    if (!isAuthenticated || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    // Check role authorization
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Unauthorized access...</p>
                </div>
            </div>
        );
    }

    // Check tenant requirement
    if (requireTenant && !currentTenantSlug) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading tenant information...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}