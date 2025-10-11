import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, TrendingUp, CheckCircle, XCircle, RefreshCw, AlertCircle, DollarSign, Percent } from "lucide-react";

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

interface TransactionStatsProps {
    stats: TransactionStats;
}

export function TransactionStats({ stats }: TransactionStatsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
        }).format(amount / 100); // Convert from paise to rupees
    };

    const formatPercentage = (value: number) => {
        return `${value.toFixed(1)}%`;
    };

    const platformFeePercentage = stats.totalAmount > 0
        ? (stats.totalPlatformFees / stats.totalAmount) * 100
        : 0;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalTransactions}</div>
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
                        {stats.successfulTransactions} successful
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.averageTransactionValue)}</div>
                    <p className="text-xs text-muted-foreground">
                        Per successful transaction
                    </p>
                </CardContent>
            </Card>

            {/* Financial Breakdown */}
            <Card className="md:col-span-2 lg:col-span-4">
                <CardHeader>
                    <CardTitle>Financial Breakdown</CardTitle>
                    <CardDescription>
                        Revenue distribution and fee analysis
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <div className="flex-1">
                                <div className="text-sm font-medium">Total Revenue</div>
                                <div className="text-xs text-muted-foreground">
                                    {formatCurrency(stats.totalAmount)}
                                </div>
                            </div>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                                100%
                            </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Percent className="h-4 w-4 text-blue-500" />
                            <div className="flex-1">
                                <div className="text-sm font-medium">Platform Fees</div>
                                <div className="text-xs text-muted-foreground">
                                    {formatCurrency(stats.totalPlatformFees)}
                                </div>
                            </div>
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                                {formatPercentage(platformFeePercentage)}
                            </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-purple-500" />
                            <div className="flex-1">
                                <div className="text-sm font-medium">Institution Revenue</div>
                                <div className="text-xs text-muted-foreground">
                                    {formatCurrency(stats.totalInstitutionAmount)}
                                </div>
                            </div>
                            <Badge variant="outline" className="text-purple-600 border-purple-200">
                                {formatPercentage(100 - platformFeePercentage)}
                            </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            <div className="flex-1">
                                <div className="text-sm font-medium">Refunded</div>
                                <div className="text-xs text-muted-foreground">
                                    {stats.refundedTransactions} transactions
                                </div>
                            </div>
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                                {stats.totalTransactions > 0 ? Math.round((stats.refundedTransactions / stats.totalTransactions) * 100) : 0}%
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Status Breakdown */}
            <Card className="md:col-span-2 lg:col-span-4">
                <CardHeader>
                    <CardTitle>Transaction Status Breakdown</CardTitle>
                    <CardDescription>
                        Distribution of transactions by status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <div className="flex-1">
                                <div className="text-sm font-medium">Successful</div>
                                <div className="text-xs text-muted-foreground">
                                    {stats.successfulTransactions} transactions
                                </div>
                            </div>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                                {stats.totalTransactions > 0 ? Math.round((stats.successfulTransactions / stats.totalTransactions) * 100) : 0}%
                            </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <div className="flex-1">
                                <div className="text-sm font-medium">Failed</div>
                                <div className="text-xs text-muted-foreground">
                                    {stats.failedTransactions} transactions
                                </div>
                            </div>
                            <Badge variant="destructive">
                                {stats.totalTransactions > 0 ? Math.round((stats.failedTransactions / stats.totalTransactions) * 100) : 0}%
                            </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                            <RefreshCw className="h-4 w-4 text-yellow-500" />
                            <div className="flex-1">
                                <div className="text-sm font-medium">Pending</div>
                                <div className="text-xs text-muted-foreground">
                                    {stats.pendingTransactions} transactions
                                </div>
                            </div>
                            <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                                {stats.totalTransactions > 0 ? Math.round((stats.pendingTransactions / stats.totalTransactions) * 100) : 0}%
                            </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            <div className="flex-1">
                                <div className="text-sm font-medium">Refunded</div>
                                <div className="text-xs text-muted-foreground">
                                    {stats.refundedTransactions} transactions
                                </div>
                            </div>
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                                {stats.totalTransactions > 0 ? Math.round((stats.refundedTransactions / stats.totalTransactions) * 100) : 0}%
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
