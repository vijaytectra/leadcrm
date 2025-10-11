import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, TrendingUp, AlertCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react";

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

interface BackendMetricsResponse {
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
}

interface PaymentStatsProps {
    stats: PaymentStats | BackendMetricsResponse;
}

export function PaymentStats({ stats }: PaymentStatsProps) {
    // Transform backend response to expected format
    const transformStats = (data: PaymentStats | BackendMetricsResponse | null | undefined): PaymentStats => {
        // Check if it's already in the expected format
        if (data && 'totalPayments' in data) {
            return data;
        }

        // Handle case where data might be undefined or null
        if (!data) {
            return {
                totalPayments: 0,
                totalAmount: 0,
                successfulPayments: 0,
                failedPayments: 0,
                pendingPayments: 0,
                refundedPayments: 0,
                successRate: 0,
                averageTransactionValue: 0,
            };
        }

        // Transform backend response - handle both possible structures
        const backendData = data as BackendMetricsResponse;

        // Check if the data has the expected backend structure
        if (backendData.metrics && backendData.conversion) {
            return {
                totalPayments: backendData.metrics.totalTransactions || 0,
                totalAmount: backendData.metrics.totalAmount || 0,
                successfulPayments: backendData.metrics.successfulTransactions || 0,
                failedPayments: backendData.metrics.failedTransactions || 0,
                pendingPayments: 0, // Not provided by backend, would need separate query
                refundedPayments: backendData.metrics.refundedTransactions || 0,
                successRate: backendData.conversion.successRate || 0,
                averageTransactionValue: backendData.conversion.averageTransactionValue || 0,
            };
        }

        // Fallback: return empty stats if structure is unexpected
        return {
            totalPayments: 0,
            totalAmount: 0,
            successfulPayments: 0,
            failedPayments: 0,
            pendingPayments: 0,
            refundedPayments: 0,
            successRate: 0,
            averageTransactionValue: 0,
        };
    };

    const transformedStats = transformStats(stats);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
        }).format(amount / 100); // Convert from paise to rupees
    };

    const formatPercentage = (value: number | undefined) => {
        if (value === undefined || value === null || isNaN(value)) {
            return "0.0%";
        }
        return `${value.toFixed(1)}%`;
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{transformedStats.totalPayments}</div>
                    <p className="text-xs text-muted-foreground">
                        All time transactions
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(transformedStats.totalAmount)}</div>
                    <p className="text-xs text-muted-foreground">
                        Gross revenue collected
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(transformedStats.successRate)}</div>
                    <p className="text-xs text-muted-foreground">
                        {transformedStats.successfulPayments} successful payments
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(transformedStats.averageTransactionValue)}</div>
                    <p className="text-xs text-muted-foreground">
                        Per successful transaction
                    </p>
                </CardContent>
            </Card>

            {/* Status Breakdown */}
            <Card className="md:col-span-2 lg:col-span-4">
                <CardHeader>
                    <CardTitle>Payment Status Breakdown</CardTitle>
                    <CardDescription>
                        Distribution of payments by status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <div className="flex-1">
                                <div className="text-sm font-medium">Successful</div>
                                <div className="text-xs text-muted-foreground">
                                    {transformedStats.successfulPayments} payments
                                </div>
                            </div>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                                {transformedStats.totalPayments > 0 ? Math.round((transformedStats.successfulPayments / transformedStats.totalPayments) * 100) : 0}%
                            </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <div className="flex-1">
                                <div className="text-sm font-medium">Failed</div>
                                <div className="text-xs text-muted-foreground">
                                    {transformedStats.failedPayments} payments
                                </div>
                            </div>
                            <Badge variant="destructive">
                                {transformedStats.totalPayments > 0 ? Math.round((transformedStats.failedPayments / transformedStats.totalPayments) * 100) : 0}%
                            </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                            <RefreshCw className="h-4 w-4 text-yellow-500" />
                            <div className="flex-1">
                                <div className="text-sm font-medium">Pending</div>
                                <div className="text-xs text-muted-foreground">
                                    {transformedStats.pendingPayments} payments
                                </div>
                            </div>
                            <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                                {transformedStats.totalPayments > 0 ? Math.round((transformedStats.pendingPayments / transformedStats.totalPayments) * 100) : 0}%
                            </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            <div className="flex-1">
                                <div className="text-sm font-medium">Refunded</div>
                                <div className="text-xs text-muted-foreground">
                                    {transformedStats.refundedPayments} payments
                                </div>
                            </div>
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                                {transformedStats.totalPayments > 0 ? Math.round((transformedStats.refundedPayments / transformedStats.totalPayments) * 100) : 0}%
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
