import { Suspense } from "react";
import { apiGet } from "@/lib/utils";
import { RefundRequests } from "@/components/finance/RefundRequests";
import { RefundFilters } from "@/components/finance/RefundFilters";
import { RefundStats } from "@/components/finance/RefundStats";
import { getToken } from "@/lib/getToken";

interface RefundRequest {
    id: string;
    applicationId: string | null;
    paymentId: string | null;
    studentName: string;
    studentEmail: string;
    studentPhone: string | null;
    amount: number;
    reason: string;
    status: string;
    requestedBy: string | null;
    approvedBy: string | null;
    rejectedBy: string | null;
    rejectionReason: string | null;
    requestedAt: string;
    approvedAt: string | null;
    rejectedAt: string | null;
    processedAt: string | null;
    createdAt: string;
    updatedAt: string;
    application?: {
        studentName: string;
        studentEmail: string;
    };
    payment?: {
        amount: number;
        status: string;
    };
    approvals: Array<{
        id: string;
        approverId: string;
        status: string;
        comments: string | null;
        approvedAt: string | null;
        createdAt: string;
        approver: {
            firstName: string | null;
            lastName: string | null;
            email: string;
        };
    }>;
}

interface RefundStats {
    totalRefunds: number;
    pendingRefunds: number;
    approvedRefunds: number;
    rejectedRefunds: number;
    processedRefunds: number;
    totalRefundAmount: number;
    averageRefundAmount: number;
    approvalRate: number;
}

interface RefundsPageProps {
    searchParams: Promise<{
        tenant?: string;
        status?: string;
        page?: string;
        limit?: string;
    }>;
}

async function getRefundsData(tenantSlug: string, searchParams: {
    status?: string;
    page?: string;
    limit?: string;
}) {
    try {
        const token=await getToken();
        if(!token){
          throw new Error("No token found");
        }
        const queryParams = new URLSearchParams();
        if (searchParams.status) queryParams.set("status", searchParams.status);
        if (searchParams.page) queryParams.set("page", searchParams.page);
        if (searchParams.limit) queryParams.set("limit", searchParams.limit);

        const [refundsResponse, dashboardResponse] = await Promise.all([
            apiGet<{
                success: boolean;
                data: {
                    refunds: RefundRequest[];
                    pagination: {
                        page: number;
                        limit: number;
                        total: number;
                        pages: number;
                    };
                };
            }>(`/${tenantSlug}/finance/refunds?${queryParams.toString()}`, { token: token }),
            apiGet<{
                success: boolean;
                data: {
                    metrics: RefundStats;
                };
            }>(`/${tenantSlug}/finance/dashboard`, { token: token })
        ]);

        return {
            refunds: refundsResponse.data.refunds,
            pagination: refundsResponse.data.pagination,
            stats: dashboardResponse.data.metrics,
        };
    } catch (error) {
        console.error("Error fetching refunds data:", error);
        return null;
    }
}

function RefundsSkeleton() {
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
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default async function RefundsPage({
    searchParams
}: RefundsPageProps) {
    const resolvedSearchParams = await searchParams;
    const tenant = resolvedSearchParams.tenant || "demo-tenant";

    const refundsData = await getRefundsData(tenant, resolvedSearchParams);

    if (!refundsData) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center text-gray-500">
                    Failed to load refunds data
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Refund Management</h1>
                <p className="text-muted-foreground">
                    Process and manage refund requests
                </p>
            </div>

            <Suspense fallback={<RefundsSkeleton />}>
                <RefundStats stats={refundsData.stats} />
                <div className="grid gap-4 md:grid-cols-2">
                    <RefundFilters />
                    <RefundRequests
                        refunds={refundsData.refunds}
                        pagination={refundsData.pagination}
                    />
                </div>
            </Suspense>
        </div>
    );
}
