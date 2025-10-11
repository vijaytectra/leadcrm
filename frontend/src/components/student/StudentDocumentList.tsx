import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, CheckCircle, Clock, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Document {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    status: "UPLOADED" | "VERIFIED" | "REJECTED";
    uploadedAt: string;
    verifiedAt?: string;
    documentType: {
        name: string;
        category: string;
    };
}

interface StudentDocumentListProps {
    documents: Document[];
}

export function StudentDocumentList({ documents }: StudentDocumentListProps) {
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
                return <Clock className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "VERIFIED":
                return <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>;
            case "REJECTED":
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="secondary">Pending</Badge>;
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
                    My Documents
                </CardTitle>
                <CardDescription>
                    View and manage your uploaded documents
                </CardDescription>
            </CardHeader>
            <CardContent>
                {documents.length === 0 ? (
                    <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No documents uploaded
                        </h3>
                        <p className="text-gray-500">
                            Upload your documents to get started with your application.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {documents.map((document) => (
                            <div key={document.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <FileText className="h-8 w-8 text-gray-400 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-medium text-gray-900 truncate">
                                                {document.fileName}
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                {document.documentType.name} • {formatFileSize(document.fileSize)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(document.status)}
                                        {getStatusBadge(document.status)}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {getCategoryBadge(document.documentType.category)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Uploaded {formatDistanceToNow(new Date(document.uploadedAt), { addSuffix: true })}
                                    </div>
                                </div>

                                {document.status === "VERIFIED" && document.verifiedAt && (
                                    <div className="text-xs text-green-600 mb-3">
                                        ✓ Verified {formatDistanceToNow(new Date(document.verifiedAt), { addSuffix: true })}
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4 mr-1" />
                                        Download
                                    </Button>
                                    {document.status === "REJECTED" && (
                                        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                                            Re-upload
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
