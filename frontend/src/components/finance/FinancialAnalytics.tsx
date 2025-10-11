import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, DollarSign, Calendar, RefreshCw, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AnalyticsData {
  metrics: {
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
  };
  recentTransactions: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    application?: {
      studentName: string;
      studentEmail: string;
    };
  }>;
  pendingRefunds: number;
  revenueByPeriod: Array<{
    period: string;
    revenue: number;
    transactions: number;
  }>;
  statusDistribution: {
    COMPLETED: number;
    FAILED: number;
    PENDING: number;
    REFUNDED: number;
  };
  topPerformingPeriods: Array<{
    period: string;
    revenue: number;
    growth: number;
  }>;
}

interface FinancialAnalyticsProps {
  analytics: AnalyticsData;
}

export function FinancialAnalytics({ analytics }: FinancialAnalyticsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount / 100); // Convert from paise to rupees
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <AlertCircle className="h-4 w-4 text-green-500" />;
      case "FAILED":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "PENDING":
        return <RefreshCw className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>;
      case "PENDING":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Financial Analytics
        </CardTitle>
        <CardDescription>
          Advanced financial insights and trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Revenue Trends */}
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Revenue Trends
            </h4>
            <div className="space-y-2">
              {(analytics.revenueByPeriod || []).map((period) => (
                <div key={period.period} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{period.period}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{formatCurrency(period.revenue)}</span>
                    <span className="text-xs text-gray-500">{period.transactions} transactions</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Periods */}
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Top Performing Periods
            </h4>
            <div className="space-y-2">
              {(analytics.topPerformingPeriods || []).map((period) => (
                <div key={period.period} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{period.period}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{formatCurrency(period.revenue)}</span>
                    <Badge variant="outline" className={period.growth > 0 ? "text-green-600 border-green-200" : "text-red-600 border-red-200"}>
                      {period.growth > 0 ? "+" : ""}{period.growth.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Recent Transactions
            </h4>
            <div className="space-y-3">
              {(analytics.recentTransactions || []).slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(transaction.status)}
                    <div>
                      <div className="text-sm font-medium">#{transaction.id.slice(-8)}</div>
                      {transaction.application && (
                        <div className="text-xs text-gray-500">
                          {transaction.application.studentName}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatCurrency(transaction.amount)}</span>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Status Distribution
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Completed</span>
                <span className="font-medium text-green-600">{analytics.statusDistribution?.COMPLETED || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Failed</span>
                <span className="font-medium text-red-600">{analytics.statusDistribution?.FAILED || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pending</span>
                <span className="font-medium text-yellow-600">{analytics.statusDistribution?.PENDING || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Refunded</span>
                <span className="font-medium text-orange-600">{analytics.statusDistribution?.REFUNDED || 0}</span>
              </div>
            </div>
          </div>

          {/* Pending Refunds Alert */}
          {(analytics.pendingRefunds || 0) > 0 && (
            <div className="border rounded-lg p-4 bg-orange-50 border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <h4 className="text-sm font-medium text-orange-800">Pending Refunds</h4>
              </div>
              <p className="text-sm text-orange-700">
                {analytics.pendingRefunds || 0} refund requests are pending approval.
              </p>
              <Button variant="outline" size="sm" className="mt-2 text-orange-600 border-orange-200 hover:bg-orange-100">
                Review Refunds
              </Button>
            </div>
          )}

          {/* Analytics Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-xs text-gray-500">
              Analytics updated {formatDistanceToNow(new Date(), { addSuffix: true })}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-1" />
                Export Data
              </Button>
              <Button variant="outline" size="sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
