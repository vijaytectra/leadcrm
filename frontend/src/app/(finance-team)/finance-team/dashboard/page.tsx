import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FinanceDashboardStats } from "@/components/finance/FinanceDashboardStats";
import { RevenueChart } from "@/components/finance/RevenueChart";
import { RecentTransactions } from "@/components/finance/RecentTransactions";
import { PaymentStatusDistribution } from "@/components/finance/PaymentStatusDistribution";

interface FinanceDashboardPageProps {
    searchParams: Promise<{
        tenant?: string;
    }>;
}

async function getFinanceDashboardData(tenantSlug: string) {
    try {
        // This would be replaced with actual API calls
        // For now, returning mock data structure
        return {
            stats: {
                totalRevenue: 125000,
                monthlyRevenue: 25000,
                pendingPayments: 15,
                refundRequests: 3,
                averageTransactionValue: 1250,
                conversionRate: 0.75,
            },
            recentTransactions: [
                {
                    id: "1",
                    studentName: "John Doe",
                    amount: 2500,
                    status: "COMPLETED" as const,
                    paymentMethod: "Credit Card",
                    transactionDate: new Date().toISOString(),
                },
                {
                    id: "2",
                    studentName: "Alice Johnson",
                    amount: 1500,
                    status: "PENDING" as const,
                    paymentMethod: "Bank Transfer",
                    transactionDate: new Date().toISOString(),
                },
            ],
            revenueData: [
                { month: "Jan", revenue: 20000 },
                { month: "Feb", revenue: 25000 },
                { month: "Mar", revenue: 30000 },
                { month: "Apr", revenue: 28000 },
                { month: "May", revenue: 32000 },
                { month: "Jun", revenue: 25000 },
            ],
            paymentStatusDistribution: {
                completed: 85,
                pending: 10,
                failed: 5,
            },
        };
    } catch (error) {
        console.error("Error fetching finance dashboard data:", error);
        return null;
    }
}

function FinanceDashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <CardTitle>
                                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 bg-gray-200 rounded animate-pulse" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default async function FinanceDashboardPage({
    searchParams
}: FinanceDashboardPageProps) {
    const resolvedSearchParams = await searchParams;
    const tenant = resolvedSearchParams.tenant || "demo-tenant";

    const dashboardData = await getFinanceDashboardData(tenant);

    if (!dashboardData) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center text-gray-500">
                    Failed to load finance dashboard data
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Finance Dashboard</h1>
                <p className="text-muted-foreground">
                    Monitor payments, refunds, and financial performance
                </p>
            </div>

            <Suspense fallback={<FinanceDashboardSkeleton />}>
                <FinanceDashboardStats stats={dashboardData.stats} />
                <div className="grid gap-4 md:grid-cols-2">
                    <RevenueChart data={dashboardData.revenueData} />
                    <PaymentStatusDistribution data={dashboardData.paymentStatusDistribution} />
                </div>
                <RecentTransactions transactions={dashboardData.recentTransactions} />
            </Suspense>
        </div>
    );
}
