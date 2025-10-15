import { LeadQueue } from "@/components/telecaller/LeadQueue";
import { getTelecallerLeads } from "@/lib/api/telecaller";

interface TelecallerLeadsPageProps {
    searchParams: Promise<{
        tenant?: string;
        page?: string;
        limit?: string;
        status?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: string;
    }>;
}

async function getTelecallerLeadsData(tenantSlug: string) {
    try {
        const res = await getTelecallerLeads(tenantSlug);
        return res;
    } catch (error) {
        console.error("Failed to fetch telecaller leads data:", error);
        return null;
    }
}



export default async function TelecallerLeadsPage({ searchParams }: TelecallerLeadsPageProps) {
    const resolvedSearchParams = await searchParams;
    const tenant = resolvedSearchParams.tenant || "demo-tenant";

    console.log("tenant", tenant);


    const leadsData = await getTelecallerLeadsData(tenant);

    if (!leadsData) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center text-gray-500">
                    Failed to load leads data
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">

            <LeadQueue
                tenantSlug={tenant}
            />

        </div>
    );
}
