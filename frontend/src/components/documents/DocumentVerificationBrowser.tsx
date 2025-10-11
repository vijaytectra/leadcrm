import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Eye, CheckCircle, Clock, User, Mail, Hash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Document {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    status: string;
    uploadedAt: string;
    studentName: string;
    studentEmail: string;
    applicationId: string;
    documentType: {
        name: string;
        category: string;
    };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

interface DocumentVerificationBrowserProps {
    documents: Document[];
    pagination: Pagination;
}

export function DocumentVerificationBrowser({ documents, pagination }: DocumentVerificationBrowserProps) {
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "UPLOADED":
                return <Badge variant="secondary">Pending</Badge>;
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
                    Documents to Verify
                </CardTitle>
                <CardDescription>
                    Select documents to review and verify
                </CardDescription>
            </CardHeader>
            <CardContent>
                {documents.length === 0 ? (
                    <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No documents to verify
                        </h3>
                        <p className="text-gray-500">
                            All documents have been processed or no documents are pending verification.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {documents.map((document) => (
                            <div key={document.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start space-x-4">
                                    <Checkbox className="mt-1" />
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

                                        <div className="flex items-center justify-between">
                                            <div className="text-xs text-gray-500">
                                                Uploaded {formatDistanceToNow(new Date(document.uploadedAt), { addSuffix: true })}
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/document-verifier/verify/${document.id}?tenant=arunai-engineering-college`}>
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Link>
                                                </Button>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/document-verifier/verify/${document.id}?tenant=arunai-engineering-college`}>
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Verify
                                                    </Link>
                                                </Button>
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
