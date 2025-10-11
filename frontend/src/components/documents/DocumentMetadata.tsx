import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, FileText, Calendar, Hash } from "lucide-react";

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
        description?: string;
    };
}

interface DocumentMetadataProps {
    document: Document;
}

export function DocumentMetadata({ document }: DocumentMetadataProps) {
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case "IDENTITY":
                return <Badge variant="default" className="bg-blue-100 text-blue-800">Identity</Badge>;
            case "ACADEMIC":
                return <Badge variant="default" className="bg-green-100 text-green-800">Academic</Badge>;
            case "FINANCIAL":
                return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Financial</Badge>;
            default:
                return <Badge variant="secondary">General</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Document Information
                </CardTitle>
                <CardDescription>
                    Details about this document
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">File Name</span>
                        <span className="text-sm text-gray-900">{document.fileName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">File Size</span>
                        <span className="text-sm text-gray-900">{formatFileSize(document.fileSize)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">File Type</span>
                        <span className="text-sm text-gray-900">{document.fileType}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Document Type</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900">{document.documentType.name}</span>
                            {getCategoryBadge(document.documentType.category)}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Uploaded</span>
                        <span className="text-sm text-gray-900">
                            {new Date(document.uploadedAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Student Information
                    </h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{document.studentName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{document.studentEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">Application #{document.applicationId}</span>
                        </div>
                    </div>
                </div>

                {document.documentType.description && (
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                        <p className="text-sm text-gray-600">{document.documentType.description}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
