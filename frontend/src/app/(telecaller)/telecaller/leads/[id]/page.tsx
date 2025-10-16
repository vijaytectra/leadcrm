import { notFound } from "next/navigation";
import { LeadDetailsPage } from "@/components/lead-details/LeadDetailsPage";
import { getTelecallerLeadDetails } from "@/lib/api/lead-details";

interface TelecallerLeadDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
    searchParams: Promise<{
        tenant?: string;
    }>;
}

async function getTelecallerLeadDetailsData(tenantSlug: string, leadId: string) {
    try {
        const data = await getTelecallerLeadDetails(tenantSlug, leadId);
        return data;
    } catch (error) {
        console.error("Failed to fetch telecaller lead details:", error);
        return null;
    }
}

export default async function TelecallerLeadDetailsPage({
    params,
    searchParams
}: TelecallerLeadDetailsPageProps) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    const leadId = resolvedParams.id;
    const tenantSlug = resolvedSearchParams.tenant || "demo-tenant";


    const leadDetailsData = await getTelecallerLeadDetailsData(tenantSlug, leadId);

    if (!leadDetailsData) {

        notFound();
    }

    return (
        <LeadDetailsPage
            lead={leadDetailsData.lead}
            notes={leadDetailsData.notes}
            activities={leadDetailsData.activities}
            tenantSlug={tenantSlug}
            userRole="TELECALLER"
            backUrl={`/telecaller/leads?tenant=${tenantSlug}`}
        />
    );
}