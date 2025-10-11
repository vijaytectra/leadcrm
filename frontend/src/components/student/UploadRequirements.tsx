import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, FileText } from "lucide-react";

interface RequiredDocument {
    id: string;
    name: string;
    description: string;
    category: string;
    isRequired: boolean;
    maxFileSize: number;
    allowedFormats: string[];
}

interface UploadRequirementsProps {
    requiredDocuments: RequiredDocument[];
}

export function UploadRequirements({ requiredDocuments }: UploadRequirementsProps) {
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
                return <Badge variant="outline" className="text-blue-600 border-blue-200">Identity</Badge>;
            case "ACADEMIC":
                return <Badge variant="outline" className="text-green-600 border-green-200">Academic</Badge>;
            case "FINANCIAL":
                return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Financial</Badge>;
            default:
                return <Badge variant="outline">General</Badge>;
        }
    };

    const getFormatDisplay = (formats: string[]) => {
        const formatMap: { [key: string]: string } = {
            'application/pdf': 'PDF',
            'image/jpeg': 'JPG',
            'image/png': 'PNG',
            'application/msword': 'DOC',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
        };

        return formats.map(format => formatMap[format] || format.split('/')[1].toUpperCase()).join(', ');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Document Requirements
                </CardTitle>
                <CardDescription>
                    Required documents for your application
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {requiredDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                            <div className="flex-shrink-0 mt-1">
                                {doc.isRequired ? (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                ) : (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-sm font-medium text-gray-900">
                                        {doc.name}
                                        {doc.isRequired && (
                                            <span className="text-red-500 ml-1">*</span>
                                        )}
                                    </h4>
                                    {getCategoryBadge(doc.category)}
                                </div>
                                <p className="text-xs text-gray-600 mb-2">
                                    {doc.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span>Max size: {formatFileSize(doc.maxFileSize)}</span>
                                    <span>Formats: {getFormatDisplay(doc.allowedFormats)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Upload Guidelines:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Ensure documents are clear and readable</li>
                                <li>Use supported file formats only</li>
                                <li>Keep file sizes under the specified limits</li>
                                <li>Documents marked with * are required</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
