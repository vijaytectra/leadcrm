import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle, XCircle, RefreshCw, AlertCircle, ExternalLink, User, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

interface TransactionHistoryProps {
    transactions: Transaction[];
    pagination: Pagination;
}

export function TransactionHistory({ transactions, pagination }: TransactionHistoryProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
        }).format(amount / 100); // Convert from paise to rupees
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "FAILED":
                return <XCircle className="h-4 w-4 text-red-500" />;
            case "CREATED":
                return <RefreshCw className="h-4 w-4 text-yellow-500" />;
            case "REFUNDED":
                return <AlertCircle className="h-4 w-4 text-orange-500" />;
            default:
                return <CreditCard className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
            case "FAILED":
                return <Badge variant="destructive">Failed</Badge>;
            case "CREATED":
                return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Created</Badge>;
            case "REFUNDED":
                return <Badge variant="outline" className="text-orange-600 border-orange-200">Refunded</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getGatewayBadge = (gateway: string) => {
        switch (gateway.toLowerCase()) {
            case "cashfree":
                return <Badge variant="outline" className="text-blue-600 border-blue-200">Cashfree</Badge>;
            case "razorpay":
                return <Badge variant="outline" className="text-purple-600 border-purple-200">Razorpay</Badge>;
            case "stripe":
                return <Badge variant="outline" className="text-indigo-600 border-indigo-200">Stripe</Badge>;
            case "payu":
                return <Badge variant="outline" className="text-green-600 border-green-200">PayU</Badge>;
            default:
                return <Badge variant="outline">{gateway}</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Transaction History
                </CardTitle>
                <CardDescription>
                    Complete transaction records
                </CardDescription>
            </CardHeader>
            <CardContent>
                {transactions.length === 0 ? (
                    <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No transactions found
                        </h3>
                        <p className="text-gray-500">
                            No transactions match your current filters.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {transactions.map((transaction) => (
                            <div key={transaction.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 mt-1">
                                        {getStatusIcon(transaction.status)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                                Transaction #{transaction.id.slice(-8)}
                                            </h3>
                                            {getStatusBadge(transaction.status)}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-4 w-4 text-gray-400" />
                                                <span>{formatCurrency(transaction.amount)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400">Platform Fee:</span>
                                                <span>{formatCurrency(transaction.platformFee)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400">Institution:</span>
                                                <span>{formatCurrency(transaction.institutionAmount)}</span>
                                            </div>
                                        </div>

                                        {/* Student Information */}
                                        {transaction.application && (
                                            <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-3 w-3 text-gray-400" />
                                                        <span className="font-medium">Student:</span>
                                                        <span>{transaction.application.studentName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-3 w-3 text-gray-400" />
                                                        <span className="font-medium">Email:</span>
                                                        <span className="truncate">{transaction.application.studentEmail}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                {getGatewayBadge(transaction.gateway)}
                                                {transaction.gatewayTransactionId && (
                                                    <span className="text-xs text-gray-500">
                                                        ID: {transaction.gatewayTransactionId.slice(-8)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-xs text-gray-500">
                                                Created {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                                                {transaction.updatedAt !== transaction.createdAt && (
                                                    <span className="ml-2">
                                                        • Updated {formatDistanceToNow(new Date(transaction.updatedAt), { addSuffix: true })}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button variant="outline" size="sm">
                                                    <ExternalLink className="h-4 w-4 mr-1" />
                                                    View Details
                                                </Button>
                                                {transaction.status === "COMPLETED" && (
                                                    <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                                                        <AlertCircle className="h-4 w-4 mr-1" />
                                                        Refund
                                                    </Button>
                                                )}
                                                {transaction.status === "FAILED" && (
                                                    <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                                        <RefreshCw className="h-4 w-4 mr-1" />
                                                        Retry
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {transactions.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>
                                Showing {transactions.length} of {pagination.total} transactions
                            </span>
                            <span>
                                Page {pagination.page} of {pagination.pages}
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
