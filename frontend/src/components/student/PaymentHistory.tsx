import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Building, CheckCircle, Clock, XCircle, Receipt } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Payment {
    id: string;
    amount: number;
    currency: string;
    status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
    paymentMethod: string;
    transactionId: string;
    createdAt: string;
    application: {
        id: string;
        studentName: string;
        studentEmail: string;
    };
}

interface PaymentHistoryProps {
    payments: Payment[];
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "PENDING":
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case "FAILED":
                return <XCircle className="h-4 w-4 text-red-500" />;
            case "REFUNDED":
                return <Receipt className="h-4 w-4 text-blue-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
            case "PENDING":
                return <Badge variant="secondary">Pending</Badge>;
            case "FAILED":
                return <Badge variant="destructive">Failed</Badge>;
            case "REFUNDED":
                return <Badge variant="outline" className="text-blue-600 border-blue-200">Refunded</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPaymentMethodIcon = (method: string) => {
        switch (method.toLowerCase()) {
            case "credit card":
                return <CreditCard className="h-4 w-4" />;
            case "bank transfer":
                return <Building className="h-4 w-4" />;
            default:
                return <Receipt className="h-4 w-4" />;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Payment History
                </CardTitle>
                <CardDescription>
                    Your recent payment transactions
                </CardDescription>
            </CardHeader>
            <CardContent>
                {payments.length === 0 ? (
                    <div className="text-center py-8">
                        <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No payments found
                        </h3>
                        <p className="text-gray-500">
                            Your payment history will appear here once you make a payment.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {payments.map((payment) => (
                            <div key={payment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        {getPaymentMethodIcon(payment.paymentMethod)}
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-medium text-gray-900">
                                                Payment #{payment.transactionId}
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                {payment.paymentMethod}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(payment.status)}
                                        {getStatusBadge(payment.status)}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-lg font-semibold text-gray-900">
                                        {formatCurrency(payment.amount, payment.currency)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                        <Receipt className="h-4 w-4 mr-1" />
                                        View Receipt
                                    </Button>
                                    {payment.status === "COMPLETED" && (
                                        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                                            Request Refund
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
