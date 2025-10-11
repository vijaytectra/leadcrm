import { Suspense } from "react";
import { apiGet } from "@/lib/utils";
import { FinancialAnalytics } from "@/components/finance/FinancialAnalytics";
import { AnalyticsFilters } from "@/components/finance/AnalyticsFilters";
import { AnalyticsOverview } from "@/components/finance/AnalyticsOverview";
import { getToken } from "@/lib/getToken";

interface AnalyticsData {
  metrics: {
    totalTransactions: number;
    totalAmount: number;
    successfulTransactions: number;
    failedTransactions: number;
    pendingTransactions: number;
    refundedTransactions: number;
    successRate: number;
    averageTransactionValue: number;
    totalPlatformFees: number;
    totalInstitutionAmount: number;
  };
  recentTransactions: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    application?: {
      studentName: string;
      studentEmail: string;
    };
  }>;
  pendingRefunds: number;
  revenueByPeriod: Array<{
    period: string;
    revenue: number;
    transactions: number;
  }>;
  statusDistribution: {
    COMPLETED: number;
    FAILED: number;
    PENDING: number;
    REFUNDED: number;
  };
  topPerformingPeriods: Array<{
    period: string;
    revenue: number;
    growth: number;
  }>;
}

interface AnalyticsPageProps {
  searchParams: Promise<{
    tenant?: string;
    period?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

async function getAnalyticsData(tenantSlug: string, searchParams: {
  period?: string;
  startDate?: string;
  endDate?: string;
}) {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }
    const queryParams = new URLSearchParams();
    if (searchParams.period) queryParams.set("period", searchParams.period);
    if (searchParams.startDate) queryParams.set("startDate", searchParams.startDate);
    if (searchParams.endDate) queryParams.set("endDate", searchParams.endDate);

    const [dashboardResponse, metricsResponse] = await Promise.all([
      apiGet<{
        success: boolean;
        data: AnalyticsData;
      }>(`/finance/${tenantSlug}/finance/dashboard?${queryParams.toString()}`, { token: token }),
      apiGet<{
        success: boolean;
        data: {
          period: string;
          dateRange: {
            start: string;
            end: string;
          };
          metrics: {
            totalTransactions: number;
            totalAmount: number;
            totalPlatformFees: number;
            totalInstitutionAmount: number;
            successfulTransactions: number;
            successfulAmount: number;
            failedTransactions: number;
            refundedAmount: number;
            refundedTransactions: number;
          };
          conversion: {
            successRate: number;
            averageTransactionValue: number;
          };
        };
      }>(`/finance/${tenantSlug}/metrics?${queryParams.toString()}`, { token: token })
    ]);

    // Transform backend metrics to expected format
    const backendData = metricsResponse.data;
    const transformedMetrics: AnalyticsData["metrics"] = {
      totalTransactions: backendData.metrics?.totalTransactions || 0,
      totalAmount: backendData.metrics?.totalAmount || 0,
      successfulTransactions: backendData.metrics?.successfulTransactions || 0,
      failedTransactions: backendData.metrics?.failedTransactions || 0,
      pendingTransactions: 0, // Not provided by backend
      refundedTransactions: backendData.metrics?.refundedTransactions || 0,
      successRate: backendData.conversion?.successRate || 0,
      averageTransactionValue: backendData.conversion?.averageTransactionValue || 0,
      totalPlatformFees: backendData.metrics?.totalPlatformFees || 0,
      totalInstitutionAmount: backendData.metrics?.totalInstitutionAmount || 0,
    };

    return {
      analytics: dashboardResponse.data,
      metrics: transformedMetrics,
    };
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return null;
  }
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function AnalyticsPage({
  searchParams
}: AnalyticsPageProps) {
  const resolvedSearchParams = await searchParams;
  const tenant = resolvedSearchParams.tenant || "demo-tenant";

  const analyticsData = await getAnalyticsData(tenant, resolvedSearchParams);

  if (!analyticsData) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-gray-500">
          Failed to load analytics data
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Analytics</h1>
        <p className="text-muted-foreground">
          Advanced financial analytics and insights
        </p>
      </div>

      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsOverview metrics={analyticsData.metrics} />
        <div className="grid gap-4 md:grid-cols-2">
          <AnalyticsFilters />
          <FinancialAnalytics analytics={analyticsData.analytics} />
        </div>
      </Suspense>
    </div>
  );
}
