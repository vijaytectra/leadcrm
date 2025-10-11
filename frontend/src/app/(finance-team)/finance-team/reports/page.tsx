import { Suspense } from "react";
import { apiGet } from "@/lib/utils";
import { FinancialReports } from "@/components/finance/FinancialReports";
import { ReportFilters } from "@/components/finance/ReportFilters";
import { ReportSummary } from "@/components/finance/ReportSummary";
import { getToken } from "@/lib/getToken";

interface FinancialReport {
  type: string;
  period: string;
  generatedAt: string;
  report: {
    summary?: {
      totalRevenue: number;
      totalPlatformFees: number;
      totalInstitutionAmount: number;
      totalRefunds: number;
      netRevenue: number;
    };
    payments?: Array<{
      id: string;
      amount: number;
      platformFee: number;
      institutionAmount: number;
      status: string;
      createdAt: string;
    }>;
    reconciliation?: {
      totalPayments: number;
      totalAmount: number;
      totalPlatformFees: number;
      totalInstitutionAmount: number;
      statusBreakdown: {
        CREATED: number;
        COMPLETED: number;
        FAILED: number;
        REFUNDED: number;
      };
    };
  };
}

interface ReportsPageProps {
  searchParams: Promise<{
    tenant?: string;
    type?: string;
    period?: string;
    format?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

async function getReportsData(tenantSlug: string, searchParams: {
  type?: string;
  period?: string;
  format?: string;
  startDate?: string;
  endDate?: string;
}) {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }
    const queryParams = new URLSearchParams();
    if (searchParams.type) queryParams.set("type", searchParams.type);
    if (searchParams.period) queryParams.set("period", searchParams.period);
    if (searchParams.format) queryParams.set("format", searchParams.format);
    if (searchParams.startDate) queryParams.set("startDate", searchParams.startDate);
    if (searchParams.endDate) queryParams.set("endDate", searchParams.endDate);

    const [summaryResponse, reportsResponse] = await Promise.all([
      apiGet<{
        success: boolean;
        data: {
          summary: {
            totalRevenue: number;
            totalPlatformFees: number;
            totalInstitutionAmount: number;
            totalRefunds: number;
            netRevenue: number;
          };
          payments: number;
          refunds: number;
          period: {
            startDate: string | null;
            endDate: string | null;
          };
        };
      }>(`/finance/${tenantSlug}/finance/reports/summary?${queryParams.toString()}`, { token: token }),
      apiGet<{
        success: boolean;
        data: FinancialReport;
      }>(`/finance/${tenantSlug}/reports?${queryParams.toString()}`, { token: token })
    ]);

    return {
      summary: summaryResponse.data,
      report: reportsResponse.data,
    };
  } catch (error) {
    console.error("Error fetching reports data:", error);
    return null;
  }
}

function ReportsSkeleton() {
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

export default async function ReportsPage({
  searchParams
}: ReportsPageProps) {
  const resolvedSearchParams = await searchParams;
  const tenant = resolvedSearchParams.tenant || "demo-tenant";

  const reportsData = await getReportsData(tenant, resolvedSearchParams);

  if (!reportsData) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-gray-500">
          Failed to load reports data
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
        <p className="text-muted-foreground">
          Generate and analyze financial reports
        </p>
      </div>

      <Suspense fallback={<ReportsSkeleton />}>
        <ReportSummary summary={reportsData.summary} />
        <div className="grid gap-4 md:grid-cols-2">
          <ReportFilters />
          <FinancialReports report={reportsData.report} />
        </div>
      </Suspense>
    </div>
  );
}
