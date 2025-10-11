import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DocumentQueueItem } from "./DocumentQueueItem";
import { Eye, Clock, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

interface DocumentQueueProps {
    documents: Document[];
    pagination: Pagination;
}

export function DocumentQueue({ documents, pagination }: DocumentQueueProps) {
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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm font-medium">
                        {pagination.total} documents found
                    </span>
                </div>
                <div className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.pages}
                </div>
            </div>

            {documents.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Clock className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No documents in queue
                        </h3>
                        <p className="text-gray-500 text-center">
                            All documents have been processed or no documents are pending verification.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {documents.map((document) => (
                        <Card key={document.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-start space-x-4">
                                    <Checkbox className="mt-1" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                                {document.fileName}
                                            </h3>
                                            {getStatusBadge(document.status)}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                            <div>
                                                <span className="font-medium">Student:</span> {document.studentName}
                                            </div>
                                            <div>
                                                <span className="font-medium">Type:</span> {document.documentType.name}
                                            </div>
                                            <div>
                                                <span className="font-medium">Size:</span> {formatFileSize(document.fileSize)}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-3">
                                            <div className="text-xs text-gray-500">
                                                Uploaded {formatDistanceToNow(new Date(document.uploadedAt), { addSuffix: true })}
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    Verify
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
