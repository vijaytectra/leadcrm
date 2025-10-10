import { Suspense } from "react";
import { PerformanceMetrics } from "@/components/telecaller/PerformanceMetrics";
import { Card, CardContent } from "@/components/ui/card";

interface TelecallerPerformancePageProps {
  searchParams: Promise<{
    tenant?: string;
    period?: string;
  }>;
}

async function getTelecallerPerformanceData(tenantSlug: string, period: string = "7d") {
  try {
    // This would be replaced with actual API call
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${tenantSlug}/telecaller/performance?period=${period}`, {
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //   },
    // });
    // return await response.json();

    // Mock data for now
    return {
      period,
      metrics: {
        totalCalls: 45,
        answeredCalls: 32,
        convertedCalls: 8,
        totalDuration: 14400, // 4 hours in seconds
        avgCallDuration: 450, // 7.5 minutes
        conversionRate: 25.0,
        responseRate: 71.1
      },
      performanceData: [
        {
          date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          callsMade: 8,
          callsAnswered: 6,
          callsConverted: 2,
          conversionRate: 33.3,
          responseRate: 75.0
        },
        {
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          callsMade: 10,
          callsAnswered: 7,
          callsConverted: 3,
          conversionRate: 42.9,
          responseRate: 70.0
        },
        {
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          callsMade: 6,
          callsAnswered: 4,
          callsConverted: 1,
          conversionRate: 25.0,
          responseRate: 66.7
        },
        {
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          callsMade: 12,
          callsAnswered: 9,
          callsConverted: 2,
          conversionRate: 22.2,
          responseRate: 75.0
        },
        {
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          callsMade: 9,
          callsAnswered: 6,
          callsConverted: 0,
          conversionRate: 0.0,
          responseRate: 66.7
        }
      ],
      callLogs: [
        {
          status: "COMPLETED",
          outcome: "INTERESTED",
          duration: 300,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          status: "COMPLETED",
          outcome: "QUALIFIED",
          duration: 450,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          status: "NO_ANSWER",
          duration: 0,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
  } catch (error) {
    console.error("Failed to fetch telecaller performance data:", error);
    return null;
  }
}

function TelecallerPerformanceSkeleton() {
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

      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default async function TelecallerPerformancePage({ searchParams }: TelecallerPerformancePageProps) {
  const resolvedSearchParams = await searchParams;
  const tenant = resolvedSearchParams.tenant || "demo-tenant";
  const period = resolvedSearchParams.period || "7d";

  const performanceData = await getTelecallerPerformanceData(tenant, period);

  if (!performanceData) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-gray-500">
          Failed to load performance data
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Suspense fallback={<TelecallerPerformanceSkeleton />}>
        <PerformanceMetrics
          tenantSlug={tenant}
        />
      </Suspense>
    </div>
  );
}
