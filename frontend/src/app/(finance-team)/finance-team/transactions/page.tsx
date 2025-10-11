import { Suspense } from "react";
import { apiGet } from "@/lib/utils";
import { TransactionHistory } from "@/components/finance/TransactionHistory";
import { TransactionFilters } from "@/components/finance/TransactionFilters";
import { TransactionStats } from "@/components/finance/TransactionStats";
import { getToken } from "@/lib/getToken";

interface Transaction {
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
    application?: {
        studentName: string;
        studentEmail: string;
    };
}

interface TransactionStats {
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
}

interface TransactionsPageProps {
    searchParams: Promise<{
        tenant?: string;
        status?: string;
        gateway?: string;
        startDate?: string;
        endDate?: string;
        page?: string;
        limit?: string;
    }>;
}

async function getTransactionsData(tenantSlug: string, searchParams: {
    status?: string;
    gateway?: string;
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
        if (searchParams.gateway) queryParams.set("gateway", searchParams.gateway);
        if (searchParams.startDate) queryParams.set("startDate", searchParams.startDate);
        if (searchParams.endDate) queryParams.set("endDate", searchParams.endDate);
        if (searchParams.page) queryParams.set("page", searchParams.page);
        if (searchParams.limit) queryParams.set("limit", searchParams.limit);

        const [transactionsResponse, metricsResponse] = await Promise.all([
            apiGet<{
                success: boolean;
                data: {
                    payments: Transaction[];
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
                    metrics: TransactionStats;
                };
            }>(`/${tenantSlug}/finance/metrics?period=30d`, { token: token })
        ]);

        return {
            transactions: transactionsResponse.data.payments,
            pagination: transactionsResponse.data.pagination,
            stats: metricsResponse.data.metrics,
        };
    } catch (error) {
        console.error("Error fetching transactions data:", error);
        return null;
    }
}

function TransactionsSkeleton() {
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

export default async function TransactionsPage({
    searchParams
}: TransactionsPageProps) {
    const resolvedSearchParams = await searchParams;
    const tenant = resolvedSearchParams.tenant || "demo-tenant";

    const transactionsData = await getTransactionsData(tenant, resolvedSearchParams);

    if (!transactionsData) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center text-gray-500">
                    Failed to load transactions data
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Transaction Management</h1>
                <p className="text-muted-foreground">
                    Comprehensive view of all financial transactions
                </p>
            </div>

            <Suspense fallback={<TransactionsSkeleton />}>
                <TransactionStats stats={transactionsData.stats} />
                <div className="grid gap-4 md:grid-cols-2">
                    <TransactionFilters />
                    <TransactionHistory
                        transactions={transactionsData.transactions}
                        pagination={transactionsData.pagination}
                    />
                </div>
            </Suspense>
        </div>
    );
}
