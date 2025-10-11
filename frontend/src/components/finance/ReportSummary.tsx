import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Percent, AlertCircle, CheckCircle } from "lucide-react";

interface ReportSummary {
  summary: {
    totalRevenue: number;
    totalPlatformFees: number;
    totalInstitutionAmount: number;
    totalRefunds: number;
    netRevenue: number;
  };
  payments: number;
  refunds: number;
  period: {
    startDate: string | null;
    endDate: string | null;
  };
}

interface ReportSummaryProps {
  summary: ReportSummary;
}

export function ReportSummary({ summary }: ReportSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount / 100); // Convert from paise to rupees
  };

  const formatPercentage = (value: number, total: number) => {
    return total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "0%";
  };

  const platformFeePercentage = summary.summary.totalRevenue > 0 
    ? (summary.summary.totalPlatformFees / summary.summary.totalRevenue) * 100 
    : 0;

  const refundPercentage = summary.summary.totalRevenue > 0 
    ? (summary.summary.totalRefunds / summary.summary.totalRevenue) * 100 
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.summary.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            Gross revenue collected
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.summary.totalPlatformFees)}</div>
          <p className="text-xs text-muted-foreground">
            {formatPercentage(summary.summary.totalPlatformFees, summary.summary.totalRevenue)} of revenue
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Institution Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.summary.totalInstitutionAmount)}</div>
          <p className="text-xs text-muted-foreground">
            After platform fees
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.summary.netRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            After refunds
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
                  {formatCurrency(summary.summary.totalRevenue)}
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
                  {formatCurrency(summary.summary.totalPlatformFees)}
                </div>
              </div>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                {platformFeePercentage.toFixed(1)}%
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-purple-500" />
              <div className="flex-1">
                <div className="text-sm font-medium">Institution Revenue</div>
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(summary.summary.totalInstitutionAmount)}
                </div>
              </div>
              <Badge variant="outline" className="text-purple-600 border-purple-200">
                {(100 - platformFeePercentage).toFixed(1)}%
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <div className="flex-1">
                <div className="text-sm font-medium">Refunds</div>
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(summary.summary.totalRefunds)}
                </div>
              </div>
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                {refundPercentage.toFixed(1)}%
              </Badge>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Payments</span>
                <span className="font-medium text-blue-600">{summary.payments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Refunds</span>
                <span className="font-medium text-orange-600">{summary.refunds}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
