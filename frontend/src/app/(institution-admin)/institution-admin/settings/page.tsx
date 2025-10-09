import { Metadata } from "next";
import { InstitutionSettings } from "@/components/institution-admin/InstitutionSettings";
import { getInstitutionSettings } from "@/lib/api/institution";

export const metadata: Metadata = {
  title: "Institution Settings",
  description: "Configure your institution's settings and preferences",
};

interface InstitutionSettingsPageProps {
  searchParams: {
    tenant?: string;
  };
}

export default async function InstitutionSettingsPage({
  searchParams,
}: InstitutionSettingsPageProps) {
  const tenantSlug = searchParams.tenant;
  
  if (!tenantSlug) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-heading-text mb-2">
            Tenant Required
          </h2>
          <p className="text-subtext">
            Please select a tenant to view settings.
          </p>
        </div>
      </div>
    );
  }

  try {
    const settings = await getInstitutionSettings(tenantSlug);
    return <InstitutionSettings settings={settings} tenantSlug={tenantSlug} />;
  } catch (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-heading-text mb-2">
            Error Loading Settings
          </h2>
          <p className="text-subtext">
            Unable to load institution settings. Please try again.
          </p>
        </div>
      </div>
    );
  }
}
