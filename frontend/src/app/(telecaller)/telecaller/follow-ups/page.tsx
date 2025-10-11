import { FollowUpReminders } from "@/components/telecaller/FollowUpReminders";
import { getFollowUpReminders } from "@/lib/api/telecaller";

interface TelecallerFollowUpsPageProps {
  searchParams: Promise<{
    tenant?: string;
    page?: string;
    limit?: string;
    status?: string;
    priority?: string;
    type?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

async function getTelecallerFollowUpsData(tenantSlug: string) {
  try {
    const res = await getFollowUpReminders(tenantSlug);
    return res;
  } catch (error) {
    console.error("Failed to fetch telecaller follow-ups data:", error);
    return null;
  }
}

export default async function TelecallerFollowUpsPage({ searchParams }: TelecallerFollowUpsPageProps) {
  const resolvedSearchParams = await searchParams;
  const tenant = resolvedSearchParams.tenant || "demo-tenant";

  const followUpsData = await getTelecallerFollowUpsData(tenant);

  if (!followUpsData) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-gray-500">
          Failed to load follow-ups data
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <FollowUpReminders
        tenantSlug={tenant}
      />
    </div>
  );
}
