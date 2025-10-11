import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, CheckCircle, XCircle, RefreshCw, AlertCircle, Percent, BarChart3 } from "lucide-react";

interface AnalyticsMetrics {
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

interface AnalyticsOverviewProps {
  metrics: AnalyticsMetrics;
}

export function AnalyticsOverview({ metrics }: AnalyticsOverviewProps) {
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

  const platformFeePercentage = metrics.totalAmount > 0
    ? (metrics.totalPlatformFees / metrics.totalAmount) * 100
    : 0;

  const refundPercentage = metrics.totalAmount > 0
    ? (metrics.refundedTransactions / metrics.totalTransactions) * 100
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.totalAmount)}</div>
          <p className="text-xs text-muted-foreground">
            All time revenue
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercentage(metrics.successRate)}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.successfulTransactions} successful
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.averageTransactionValue)}</div>
          <p className="text-xs text-muted-foreground">
            Per successful transaction
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.totalPlatformFees)}</div>
          <p className="text-xs text-muted-foreground">
            {formatPercentage(platformFeePercentage)} of revenue
          </p>
        </CardContent>
      </Card>

      {/* Transaction Status Breakdown */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Transaction Status Breakdown
          </CardTitle>
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
                  {metrics.successfulTransactions} transactions
                </div>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {metrics.totalTransactions > 0 ? Math.round((metrics.successfulTransactions / metrics.totalTransactions) * 100) : 0}%
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div className="flex-1">
                <div className="text-sm font-medium">Failed</div>
                <div className="text-xs text-muted-foreground">
                  {metrics.failedTransactions} transactions
                </div>
              </div>
              <Badge variant="destructive">
                {metrics.totalTransactions > 0 ? Math.round((metrics.failedTransactions / metrics.totalTransactions) * 100) : 0}%
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 text-yellow-500" />
              <div className="flex-1">
                <div className="text-sm font-medium">Pending</div>
                <div className="text-xs text-muted-foreground">
                  {metrics.pendingTransactions} transactions
                </div>
              </div>
              <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                {metrics.totalTransactions > 0 ? Math.round((metrics.pendingTransactions / metrics.totalTransactions) * 100) : 0}%
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <div className="flex-1">
                <div className="text-sm font-medium">Refunded</div>
                <div className="text-xs text-muted-foreground">
                  {metrics.refundedTransactions} transactions
                </div>
              </div>
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                {formatPercentage(refundPercentage)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Performance */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Financial Performance</CardTitle>
          <CardDescription>
            Key financial metrics and performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Transactions</span>
              <span className="font-medium text-blue-600">{metrics.totalTransactions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Institution Revenue</span>
              <span className="font-medium text-green-600">{formatCurrency(metrics.totalInstitutionAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Platform Fee Rate</span>
              <span className="font-medium text-purple-600">{formatPercentage(platformFeePercentage)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Refund Rate</span>
              <span className="font-medium text-orange-600">{formatPercentage(refundPercentage)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
