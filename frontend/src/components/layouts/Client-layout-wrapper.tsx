"use client";


import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { ProtectedRoute } from "../ProtectedRoute";
import { InstitutionAdminSidebar } from "./InstitutionAdminSidebar";
import { InstitutionAdminHeader } from "./InstitutionAdminHeader";

export default function InstitutionAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentTenantSlug, setCurrentTenant, user } = useAuthStore();

  useEffect(() => {
    // Get tenant from URL
    const tenantFromUrl = searchParams.get("tenant");

    // If we have a tenant slug in the store but not in URL, add it to URL
    if (currentTenantSlug && !tenantFromUrl) {
      const currentPath = window.location.pathname;
      router.replace(`${currentPath}?tenant=${currentTenantSlug}`);
    }
    // If we have tenant in URL but not in store, update store
    else if (tenantFromUrl && !currentTenantSlug) {
      setCurrentTenant(tenantFromUrl);
    }
    // If tenant in URL doesn't match store, sync them
    else if (tenantFromUrl && currentTenantSlug && tenantFromUrl !== currentTenantSlug) {
      // Prefer the URL tenant
      setCurrentTenant(tenantFromUrl);
    }
  }, [searchParams, currentTenantSlug, router, setCurrentTenant]);

  return (
    <ProtectedRoute 
      allowedRoles={["INSTITUTION_ADMIN"]} 
      requireTenant={true}
    >
      <div className="flex h-screen overflow-hidden">
        <InstitutionAdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <InstitutionAdminHeader />
          <main className="flex-1 overflow-y-auto bg-background p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}