import { notFound } from "next/navigation";
import { LeadDetailsPage } from "@/components/lead-details/LeadDetailsPage";
import { getAdminLeadDetails } from "@/lib/api/lead-details";

interface InstitutionAdminLeadDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
    searchParams: Promise<{
        tenant?: string;
    }>;
}

async function getInstitutionAdminLeadDetailsData(tenantSlug: string, leadId: string) {
    try {
        const data = await getAdminLeadDetails(tenantSlug, leadId);
        return data;
    } catch (error) {
        console.error("Failed to fetch institution admin lead details:", error);
        return null;
    }
}

export default async function InstitutionAdminLeadDetailsPage({
    params,
    searchParams
}: InstitutionAdminLeadDetailsPageProps) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    const leadId = resolvedParams.id;
    const tenantSlug = resolvedSearchParams.tenant || "demo-tenant";

    const leadDetailsData = await getInstitutionAdminLeadDetailsData(tenantSlug, leadId);

    if (!leadDetailsData) {
        notFound();
    }

    return (
        <LeadDetailsPage
            lead={leadDetailsData.lead}
            notes={leadDetailsData.notes}
            activities={leadDetailsData.activities}
            tenantSlug={tenantSlug}
            userRole="INSTITUTION_ADMIN"
            backUrl={`/institution-admin/leads?tenant=${tenantSlug}`}
        />
    );
}
