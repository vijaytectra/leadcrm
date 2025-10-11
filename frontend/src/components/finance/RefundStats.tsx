import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, AlertCircle, CheckCircle, XCircle, DollarSign, TrendingUp } from "lucide-react";

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

interface RefundStatsProps {
    stats: RefundStats;
}

export function RefundStats({ stats }: RefundStatsProps) {
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
                    <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalRefunds}</div>
                    <p className="text-xs text-muted-foreground">
                        All time refund requests
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.pendingRefunds}</div>
                    <p className="text-xs text-muted-foreground">
                        Awaiting approval
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalRefundAmount)}</div>
                    <p className="text-xs text-muted-foreground">
                        Total refund amount
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(stats.approvalRate)}</div>
                    <p className="text-xs text-muted-foreground">
                        {stats.approvedRefunds} approved
                    </p>
                </CardContent>
            </Card>

            {/* Status Breakdown */}
            <Card className="md:col-span-2 lg:col-span-4">
                <CardHeader>
                    <CardTitle>Refund Status Breakdown</CardTitle>
                    <CardDescription>
                        Distribution of refunds by status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            <div className="flex-1">
                                <div className="text-sm font-medium">Pending</div>
                                <div className="text-xs text-muted-foreground">
                                    {stats.pendingRefunds} requests
                                </div>
                            </div>
                            <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                                {stats.totalRefunds > 0 ? Math.round((stats.pendingRefunds / stats.totalRefunds) * 100) : 0}%
                            </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <div className="flex-1">
                                <div className="text-sm font-medium">Approved</div>
                                <div className="text-xs text-muted-foreground">
                                    {stats.approvedRefunds} requests
                                </div>
                            </div>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                                {stats.totalRefunds > 0 ? Math.round((stats.approvedRefunds / stats.totalRefunds) * 100) : 0}%
                            </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <div className="flex-1">
                                <div className="text-sm font-medium">Rejected</div>
                                <div className="text-xs text-muted-foreground">
                                    {stats.rejectedRefunds} requests
                                </div>
                            </div>
                            <Badge variant="destructive">
                                {stats.totalRefunds > 0 ? Math.round((stats.rejectedRefunds / stats.totalRefunds) * 100) : 0}%
                            </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                            <RefreshCw className="h-4 w-4 text-blue-500" />
                            <div className="flex-1">
                                <div className="text-sm font-medium">Processed</div>
                                <div className="text-xs text-muted-foreground">
                                    {stats.processedRefunds} requests
                                </div>
                            </div>
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                                {stats.totalRefunds > 0 ? Math.round((stats.processedRefunds / stats.totalRefunds) * 100) : 0}%
                            </Badge>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Average Refund</span>
                                <span className="font-medium text-blue-600">{formatCurrency(stats.averageRefundAmount)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Total Processed</span>
                                <span className="font-medium text-green-600">{formatCurrency(stats.totalRefundAmount)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
