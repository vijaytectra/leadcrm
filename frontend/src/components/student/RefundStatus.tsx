import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RefundRequest {
    id: string;
    amount: number;
    reason: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "PROCESSED";
    requestedAt: string;
    payment: {
        id: string;
        amount: number;
        currency: string;
        status: string;
    };
}

interface RefundStatusProps {
    refundRequests: RefundRequest[];
}

export function RefundStatus({ refundRequests }: RefundStatusProps) {
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "APPROVED":
            case "PROCESSED":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "REJECTED":
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "APPROVED":
                return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
            case "PROCESSED":
                return <Badge variant="default" className="bg-blue-100 text-blue-800">Processed</Badge>;
            case "REJECTED":
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="secondary">Pending</Badge>;
        }
    };

    const getStatusDescription = (status: string) => {
        switch (status) {
            case "PENDING":
                return "Your refund request is being reviewed by our finance team.";
            case "APPROVED":
                return "Your refund has been approved and will be processed within 5-7 business days.";
            case "PROCESSED":
                return "Your refund has been processed and should appear in your account shortly.";
            case "REJECTED":
                return "Your refund request has been rejected. Please contact support for more information.";
            default:
                return "Status unknown.";
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Refund Status
                </CardTitle>
                <CardDescription>
                    Track your refund requests
                </CardDescription>
            </CardHeader>
            <CardContent>
                {refundRequests.length === 0 ? (
                    <div className="text-center py-8">
                        <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No refund requests
                        </h3>
                        <p className="text-gray-500">
                            Your refund requests will appear here once submitted.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {refundRequests.map((request) => (
                            <div key={request.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <DollarSign className="h-6 w-6 text-gray-400" />
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-medium text-gray-900">
                                                Refund Request #{request.id}
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                {request.reason}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(request.status)}
                                        {getStatusBadge(request.status)}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-lg font-semibold text-gray-900">
                                        {formatCurrency(request.amount, request.payment.currency)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Requested {formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })}
                                    </div>
                                </div>

                                <div className="text-sm text-gray-600 mb-3">
                                    {getStatusDescription(request.status)}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                        View Details
                                    </Button>
                                    {request.status === "REJECTED" && (
                                        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                                            Appeal
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
