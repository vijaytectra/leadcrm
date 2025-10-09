import { Metadata } from "next";
import { InstitutionDashboard } from "@/components/institution-admin/InstitutionDashboard";
import { getInstitutionStats } from "@/lib/api/institution";

export const metadata: Metadata = {
  title: "Institution Dashboard",
  description: "Overview of your institution's performance and metrics",
};

interface InstitutionAdminPageProps {
  searchParams: Promise<{
    tenant?: string;
  }>;
}

export default async function InstitutionAdminPage({
  searchParams,
}: InstitutionAdminPageProps) {
  const resolvedSearchParams = await searchParams;
  const tenantSlug = resolvedSearchParams.tenant;

  if (!tenantSlug) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-heading-text mb-2">
            Tenant Required
          </h2>
          <p className="text-subtext">
            Please select a tenant to view the dashboard.
          </p>
        </div>
      </div>
    );
  }

  try {
    const stats = await getInstitutionStats(tenantSlug);
    return <InstitutionDashboard stats={stats} tenantSlug={tenantSlug} />;
  } catch (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-heading-text mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-subtext">
            Unable to load institution data. Please try again.
          </p>
        </div>
      </div>
    );
  }
}
