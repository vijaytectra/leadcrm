import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, XCircle, Clock, User, Mail, Hash, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Document {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    status: "VERIFIED" | "REJECTED";
    uploadedAt: string;
    verifiedAt?: string;
    rejectedAt?: string;
    studentName: string;
    studentEmail: string;
    applicationId: string;
    documentType: {
        name: string;
        category: string;
    };
    verifier: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    comments?: string;
    rejectionReason?: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

interface DocumentVerificationHistoryProps {
    documents: Document[];
    pagination: Pagination;
}

export function DocumentVerificationHistory({ documents, pagination }: DocumentVerificationHistoryProps) {
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "VERIFIED":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "REJECTED":
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "VERIFIED":
                return <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>;
            case "REJECTED":
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case "IDENTITY":
                return <Badge variant="outline" className="text-blue-600 border-blue-200">Identity</Badge>;
            case "ACADEMIC":
                return <Badge variant="outline" className="text-green-600 border-green-200">Academic</Badge>;
            case "FINANCIAL":
                return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Financial</Badge>;
            default:
                return <Badge variant="outline">General</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Verification History
                </CardTitle>
                <CardDescription>
                    All verified and rejected documents
                </CardDescription>
            </CardHeader>
            <CardContent>
                {documents.length === 0 ? (
                    <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No verification history
                        </h3>
                        <p className="text-gray-500">
                            No documents have been verified or rejected yet.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {documents.map((document) => (
                            <div key={document.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 mt-1">
                                        {getStatusIcon(document.status)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                                {document.fileName}
                                            </h3>
                                            {getStatusBadge(document.status)}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span>{document.studentName}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                                <span className="truncate">{document.studentEmail}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Hash className="h-4 w-4 text-gray-400" />
                                                <span>App #{document.applicationId}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                {getCategoryBadge(document.documentType.category)}
                                                <span className="text-xs text-gray-500">
                                                    {document.documentType.name}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {formatFileSize(document.fileSize)}
                                            </div>
                                        </div>

                                        {/* Verifier Information */}
                                        <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium">Verified by:</span>
                                                <span>{document.verifier.firstName} {document.verifier.lastName}</span>
                                            </div>
                                            <div className="text-gray-500">
                                                {document.status === "VERIFIED" && document.verifiedAt && (
                                                    <span>Verified {formatDistanceToNow(new Date(document.verifiedAt), { addSuffix: true })}</span>
                                                )}
                                                {document.status === "REJECTED" && document.rejectedAt && (
                                                    <span>Rejected {formatDistanceToNow(new Date(document.rejectedAt), { addSuffix: true })}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Comments or Rejection Reason */}
                                        {(document.comments || document.rejectionReason) && (
                                            <div className="mb-3 p-2 bg-blue-50 rounded text-xs">
                                                <div className="flex items-start gap-2">
                                                    <MessageSquare className="h-3 w-3 text-blue-500 mt-0.5" />
                                                    <div>
                                                        <span className="font-medium text-blue-800">
                                                            {document.status === "VERIFIED" ? "Comments:" : "Rejection Reason:"}
                                                        </span>
                                                        <p className="text-blue-700 mt-1">
                                                            {document.comments || document.rejectionReason}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="text-xs text-gray-500">
                                                Uploaded {formatDistanceToNow(new Date(document.uploadedAt), { addSuffix: true })}
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/document-verifier/verify/${document.id}?tenant=arunai-engineering-college`}>
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        View Details
                                                    </Link>
                                                </Button>
                                                {document.status === "REJECTED" && (
                                                    <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                                                        <Clock className="h-4 w-4 mr-1" />
                                                        Re-verify
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

                {documents.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>
                                Showing {documents.length} of {pagination.total} documents
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
