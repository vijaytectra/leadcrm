import { Suspense } from "react";
import { getLeadsData } from "./actions";
import { LeadsPageClient } from "@/components/leads/LeadsPageClient";
import { LeadsTableSkeleton } from "@/components/leads/LeadsTableSkeleton";
import { useAuthStore } from "@/stores/auth";

interface LeadsPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  // Get tenant from auth store (this would need to be passed from a parent component or context)
  // For now, we'll use a placeholder - you'll need to implement proper tenant resolution
  const tenantSlug = "default-tenant"; // This should come from your auth system

  try {
    const initialData = await getLeadsData(tenantSlug, searchParams);
    
    return (
      <Suspense fallback={<LeadsTableSkeleton />}>
        <LeadsPageClient initialData={initialData} tenantSlug={tenantSlug} />
      </Suspense>
    );
  } catch (error) {
    console.error("Error loading leads page:", error);
    return (
      <div className="relative bg-gradient-to-br from-slate-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Leads</h1>
            <p className="text-gray-600">There was an error loading the leads data. Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }
}