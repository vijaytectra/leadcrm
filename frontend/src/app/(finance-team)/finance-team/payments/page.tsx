import { Suspense } from "react";
import { apiGet } from "@/lib/utils";
import { PaymentHistory } from "@/components/finance/PaymentHistory";
import { PaymentFilters } from "@/components/finance/PaymentFilters";
import { PaymentStats } from "@/components/finance/PaymentStats";
import { getToken } from "@/lib/getToken";

interface Payment {
    id: string;
    tenantName: string;
    amount: number;
    platformFee: number;
    institutionAmount: number;
    status: string;
    gateway: string;
    gatewayTransactionId: string | null;
    createdAt: string;
    updatedAt: string;
}

interface PaymentStats {
    totalPayments: number;
    totalAmount: number;
    successfulPayments: number;
    failedPayments: number;
    pendingPayments: number;
    refundedPayments: number;
    successRate: number;
    averageTransactionValue: number;
}

interface PaymentsPageProps {
    searchParams: Promise<{
        tenant?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
        page?: string;
        limit?: string;
    }>;
}

async function getPaymentsData(tenantSlug: string, searchParams: {
    status?: string;
    startDate?: string;
    endDate?: string;
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
        if (searchParams.startDate) queryParams.set("startDate", searchParams.startDate);
        if (searchParams.endDate) queryParams.set("endDate", searchParams.endDate);
        if (searchParams.page) queryParams.set("page", searchParams.page);
        if (searchParams.limit) queryParams.set("limit", searchParams.limit);

        const [paymentsResponse, metricsResponse] = await Promise.all([
            apiGet<{
                success: boolean;
                data: {
                    payments: Payment[];
                    pagination: {
                        page: number;
                        limit: number;
                        total: number;
                        pages: number;
                    };
                };
            }>(`/${tenantSlug}/finance/payments?${queryParams.toString()}`, { token: token }),
            apiGet<{
                success: boolean;
                data: {
                    metrics: PaymentStats;
                };
            }>(`/${tenantSlug}/finance/metrics?period=30d`, { token: token })
        ]);

        return {
            payments: paymentsResponse.data.payments,
            pagination: paymentsResponse.data.pagination,
            stats: metricsResponse.data.metrics,
        };
    } catch (error) {
        console.error("Error fetching payments data:", error);
        return null;
    }
}

function PaymentsSkeleton() {
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

export default async function PaymentsPage({
    searchParams
}: PaymentsPageProps) {
    const resolvedSearchParams = await searchParams;
    const tenant = resolvedSearchParams.tenant || "demo-tenant";

    const paymentsData = await getPaymentsData(tenant, resolvedSearchParams);

    if (!paymentsData) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center text-gray-500">
                    Failed to load payments data
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
                <p className="text-muted-foreground">
                    Track and manage all payment transactions
                </p>
            </div>

            <Suspense fallback={<PaymentsSkeleton />}>
                <PaymentStats stats={paymentsData.stats} />
                <div className="grid gap-4 md:grid-cols-2">
                    <PaymentFilters />
                    <PaymentHistory
                        payments={paymentsData.payments}
                        pagination={paymentsData.pagination}
                    />
                </div>
            </Suspense>
        </div>
    );
}
