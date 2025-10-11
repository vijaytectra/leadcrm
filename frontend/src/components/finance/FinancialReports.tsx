import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FinancialReport {
  type: string;
  period: string;
  generatedAt: string;
  report: {
    summary?: {
      totalRevenue: number;
      totalPlatformFees: number;
      totalInstitutionAmount: number;
      totalRefunds: number;
      netRevenue: number;
    };
    payments?: Array<{
      id: string;
      amount: number;
      platformFee: number;
      institutionAmount: number;
      status: string;
      createdAt: string;
    }>;
    reconciliation?: {
      totalPayments: number;
      totalAmount: number;
      totalPlatformFees: number;
      totalInstitutionAmount: number;
      statusBreakdown: {
        CREATED: number;
        COMPLETED: number;
        FAILED: number;
        REFUNDED: number;
      };
    };
  };
}

interface FinancialReportsProps {
  report: FinancialReport;
}

export function FinancialReports({ report }: FinancialReportsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount / 100); // Convert from paise to rupees
  };

  const getReportTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "summary":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Summary</Badge>;
      case "detailed":
        return <Badge variant="outline" className="text-green-600 border-green-200">Detailed</Badge>;
      case "reconciliation":
        return <Badge variant="outline" className="text-purple-600 border-purple-200">Reconciliation</Badge>;
      case "revenue":
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Revenue</Badge>;
      case "refunds":
        return <Badge variant="outline" className="text-red-600 border-red-200">Refunds</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getPeriodBadge = (period: string) => {
    switch (period.toLowerCase()) {
      case "7d":
        return <Badge variant="outline" className="text-blue-600 border-blue-200">7 Days</Badge>;
      case "30d":
        return <Badge variant="outline" className="text-green-600 border-green-200">30 Days</Badge>;
      case "90d":
        return <Badge variant="outline" className="text-purple-600 border-purple-200">90 Days</Badge>;
      default:
        return <Badge variant="outline">{period}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Financial Reports
        </CardTitle>
        <CardDescription>
          Generated financial reports and analytics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Report Header */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-gray-900">
                  {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
                </h3>
                {getReportTypeBadge(report.type)}
                {getPeriodBadge(report.period)}
              </div>
              <div className="text-xs text-gray-500">
                Generated {formatDistanceToNow(new Date(report.generatedAt), { addSuffix: true })}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Period: {report.period} • Generated: {new Date(report.generatedAt).toLocaleDateString()}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Report */}
          {report.report.summary && (
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Financial Summary
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(report.report.summary.totalRevenue)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Platform Fees</span>
                  <span className="font-medium text-blue-600">
                    {formatCurrency(report.report.summary.totalPlatformFees)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Institution Revenue</span>
                  <span className="font-medium text-purple-600">
                    {formatCurrency(report.report.summary.totalInstitutionAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Refunds</span>
                  <span className="font-medium text-orange-600">
                    {formatCurrency(report.report.summary.totalRefunds)}
                  </span>
                </div>
                <div className="flex items-center justify-between col-span-2 pt-2 border-t">
                  <span className="text-gray-600 font-medium">Net Revenue</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(report.report.summary.netRevenue)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Reconciliation Report */}
          {report.report.reconciliation && (
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Reconciliation Summary
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Payments</span>
                  <span className="font-medium text-blue-600">
                    {report.report.reconciliation.totalPayments}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(report.report.reconciliation.totalAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium text-green-600">
                    {report.report.reconciliation.statusBreakdown.COMPLETED}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Failed</span>
                  <span className="font-medium text-red-600">
                    {report.report.reconciliation.statusBreakdown.FAILED}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Details */}
          {report.report.payments && report.report.payments.length > 0 && (
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Payment Details ({report.report.payments.length} transactions)
              </h4>
              <div className="space-y-2">
                {report.report.payments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">#{payment.id.slice(-8)}</span>
                    <span className="font-medium">{formatCurrency(payment.amount)}</span>
                    <Badge variant="outline" className="text-xs">
                      {payment.status}
                    </Badge>
                  </div>
                ))}
                {report.report.payments.length > 5 && (
                  <div className="text-xs text-gray-500 text-center">
                    ... and {report.report.payments.length - 5} more transactions
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Report Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-xs text-gray-500">
              Report generated on {new Date(report.generatedAt).toLocaleString()}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View Full Report
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export Excel
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
