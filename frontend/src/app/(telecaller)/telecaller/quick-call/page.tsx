import { Suspense } from "react";
import { QuickCallInterface } from "@/components/telecaller/QuickCallInterface";
import { Card, CardContent } from "@/components/ui/card";

interface TelecallerQuickCallPageProps {
  searchParams: Promise<{
    tenant?: string;
    leadId?: string;
  }>;
}

async function getQuickCallData(tenantSlug: string, leadId?: string) {
  try {
    // This would be replaced with actual API call
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${tenantSlug}/telecaller/quick-call?${leadId ? `leadId=${leadId}` : ''}`, {
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //   },
    // });
    // return await response.json();

    // Mock data for now
    return {
      availableLeads: [
        {
          id: "1",
          name: "John Doe",
          phone: "+1234567890",
          status: "NEW",
          lastContact: null,
          priority: "HIGH",
          notes: "Interested in Computer Science program"
        },
        {
          id: "2",
          name: "Jane Smith",
          phone: "+0987654321",
          status: "CONTACTED",
          lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          priority: "MEDIUM",
          notes: "Qualified for admission"
        },
        {
          id: "3",
          name: "Mike Johnson",
          phone: "+1122334455",
          status: "NEW",
          lastContact: null,
          priority: "LOW",
          notes: "Referred by existing student"
        }
      ],
      selectedLead: leadId ? {
        id: leadId,
        name: "John Doe",
        phone: "+1234567890",
        status: "NEW",
        lastContact: null,
        priority: "HIGH",
        notes: "Interested in Computer Science program"
      } : null,
      recentCalls: [
        {
          id: "1",
          leadName: "Sarah Wilson",
          phone: "+5566778899",
          duration: 300,
          outcome: "INTERESTED",
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "2",
          leadName: "David Brown",
          phone: "+9988776655",
          duration: 180,
          outcome: "NO_ANSWER",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
  } catch (error) {
    console.error("Failed to fetch quick call data:", error);
    return null;
  }
}

function QuickCallSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Main Interface Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Selection Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call Interface Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </CardContent>
        </Card>

        {/* Recent Calls Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default async function TelecallerQuickCallPage({ searchParams }: TelecallerQuickCallPageProps) {
  const resolvedSearchParams = await searchParams;
  const tenant = resolvedSearchParams.tenant || "demo-tenant";
  const leadId = resolvedSearchParams.leadId;

  const quickCallData = await getQuickCallData(tenant, leadId);

  if (!quickCallData) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-gray-500">
          Failed to load quick call data
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Suspense fallback={<QuickCallSkeleton />}>
        <QuickCallInterface
          tenantSlug={tenant}
          initialData={quickCallData}
          selectedLeadId={leadId}
        />
      </Suspense>
    </div>
  );
}
