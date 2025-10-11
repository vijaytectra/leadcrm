import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, CheckCircle, XCircle, User, Mail, Phone, DollarSign, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RefundRequest {
    id: string;
    applicationId: string | null;
    paymentId: string | null;
    studentName: string;
    studentEmail: string;
    studentPhone: string | null;
    amount: number;
    reason: string;
    status: string;
    requestedBy: string | null;
    approvedBy: string | null;
    rejectedBy: string | null;
    rejectionReason: string | null;
    requestedAt: string;
    approvedAt: string | null;
    rejectedAt: string | null;
    processedAt: string | null;
    createdAt: string;
    updatedAt: string;
    application?: {
        studentName: string;
        studentEmail: string;
    };
    payment?: {
        amount: number;
        status: string;
    };
    approvals: Array<{
        id: string;
        approverId: string;
        status: string;
        comments: string | null;
        approvedAt: string | null;
        createdAt: string;
        approver: {
            firstName: string | null;
            lastName: string | null;
            email: string;
        };
    }>;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

interface RefundRequestsProps {
    refunds: RefundRequest[];
    pagination: Pagination;
}

export function RefundRequests({ refunds, pagination }: RefundRequestsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
        }).format(amount / 100); // Convert from paise to rupees
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "APPROVED":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "REJECTED":
                return <XCircle className="h-4 w-4 text-red-500" />;
            case "PENDING":
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            case "PROCESSED":
                return <RefreshCw className="h-4 w-4 text-blue-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "APPROVED":
                return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
            case "REJECTED":
                return <Badge variant="destructive">Rejected</Badge>;
            case "PENDING":
                return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Pending</Badge>;
            case "PROCESSED":
                return <Badge variant="outline" className="text-blue-600 border-blue-200">Processed</Badge>;
            case "CANCELLED":
                return <Badge variant="outline" className="text-gray-600 border-gray-200">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Refund Requests
                </CardTitle>
                <CardDescription>
                    Manage refund requests and approvals
                </CardDescription>
            </CardHeader>
            <CardContent>
                {refunds.length === 0 ? (
                    <div className="text-center py-8">
                        <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No refund requests found
                        </h3>
                        <p className="text-gray-500">
                            No refund requests match your current filters.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {refunds.map((refund) => (
                            <div key={refund.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 mt-1">
                                        {getStatusIcon(refund.status)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                                Refund #{refund.id.slice(-8)}
                                            </h3>
                                            {getStatusBadge(refund.status)}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span>{refund.studentName}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                                <span className="truncate">{refund.studentEmail}</span>
                                            </div>
                                            {refund.studentPhone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                    <span>{refund.studentPhone}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium">{formatCurrency(refund.amount)}</span>
                                                {refund.applicationId && (
                                                    <span className="text-xs text-gray-500">
                                                        App #{refund.applicationId.slice(-8)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {formatDistanceToNow(new Date(refund.requestedAt), { addSuffix: true })}
                                            </div>
                                        </div>

                                        {/* Reason */}
                                        <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
                                            <div className="flex items-start gap-2">
                                                <MessageSquare className="h-3 w-3 text-gray-500 mt-0.5" />
                                                <div>
                                                    <span className="font-medium text-gray-800">Reason:</span>
                                                    <p className="text-gray-700 mt-1">{refund.reason}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Approval History */}
                                        {refund.approvals.length > 0 && (
                                            <div className="mb-3 p-2 bg-blue-50 rounded text-xs">
                                                <div className="font-medium text-blue-800 mb-1">Approval History:</div>
                                                {refund.approvals.map((approval) => (
                                                    <div key={approval.id} className="flex items-center justify-between">
                                                        <span className="text-blue-700">
                                                            {approval.approver.firstName} {approval.approver.lastName}
                                                        </span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {approval.status}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Rejection Reason */}
                                        {refund.rejectionReason && (
                                            <div className="mb-3 p-2 bg-red-50 rounded text-xs">
                                                <div className="flex items-start gap-2">
                                                    <XCircle className="h-3 w-3 text-red-500 mt-0.5" />
                                                    <div>
                                                        <span className="font-medium text-red-800">Rejection Reason:</span>
                                                        <p className="text-red-700 mt-1">{refund.rejectionReason}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="text-xs text-gray-500">
                                                Requested {formatDistanceToNow(new Date(refund.requestedAt), { addSuffix: true })}
                                                {refund.approvedAt && (
                                                    <span className="ml-2">
                                                        • Approved {formatDistanceToNow(new Date(refund.approvedAt), { addSuffix: true })}
                                                    </span>
                                                )}
                                                {refund.rejectedAt && (
                                                    <span className="ml-2">
                                                        • Rejected {formatDistanceToNow(new Date(refund.rejectedAt), { addSuffix: true })}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button variant="outline" size="sm">
                                                    View Details
                                                </Button>
                                                {refund.status === "PENDING" && (
                                                    <>
                                                        <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Approve
                                                        </Button>
                                                        <Button variant="destructive" size="sm">
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {refunds.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>
                                Showing {refunds.length} of {pagination.total} refund requests
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
