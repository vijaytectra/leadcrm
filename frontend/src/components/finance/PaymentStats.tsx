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

interface PaymentStatsProps {
    stats: PaymentStats;
}

export function PaymentStats({ stats }: PaymentStatsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
        }).format(amount / 100); // Convert from paise to rupees
    };

    const formatPercentage = (value: number) => {
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
                    <div className="text-2xl font-bold">{stats.totalPayments}</div>
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
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
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
                    <div className="text-2xl font-bold">{formatPercentage(stats.successRate)}</div>
                    <p className="text-xs text-muted-foreground">
                        {stats.successfulPayments} successful payments
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.averageTransactionValue)}</div>
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
                                    {stats.successfulPayments} payments
                                </div>
                            </div>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                                {stats.totalPayments > 0 ? Math.round((stats.successfulPayments / stats.totalPayments) * 100) : 0}%
                            </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <div className="flex-1">
                                <div className="text-sm font-medium">Failed</div>
                                <div className="text-xs text-muted-foreground">
                                    {stats.failedPayments} payments
                                </div>
                            </div>
                            <Badge variant="destructive">
                                {stats.totalPayments > 0 ? Math.round((stats.failedPayments / stats.totalPayments) * 100) : 0}%
                            </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                            <RefreshCw className="h-4 w-4 text-yellow-500" />
                            <div className="flex-1">
                                <div className="text-sm font-medium">Pending</div>
                                <div className="text-xs text-muted-foreground">
                                    {stats.pendingPayments} payments
                                </div>
                            </div>
                            <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                                {stats.totalPayments > 0 ? Math.round((stats.pendingPayments / stats.totalPayments) * 100) : 0}%
                            </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            <div className="flex-1">
                                <div className="text-sm font-medium">Refunded</div>
                                <div className="text-xs text-muted-foreground">
                                    {stats.refundedPayments} payments
                                </div>
                            </div>
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                                {stats.totalPayments > 0 ? Math.round((stats.refundedPayments / stats.totalPayments) * 100) : 0}%
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
