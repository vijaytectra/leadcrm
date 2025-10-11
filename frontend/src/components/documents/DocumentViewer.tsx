"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, ZoomOut, RotateCw, Download, Eye, FileText } from "lucide-react";

interface Document {
    id: string;
    fileName: string;
    filePath: string;
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

interface DocumentViewerProps {
    document: Document;
}

export function DocumentViewer({ document }: DocumentViewerProps) {
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);

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

    const isImage = document.fileType.startsWith("image/");
    const isPdf = document.fileType === "application/pdf";

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = document.filePath;
        link.download = document.fileName;
        link.click();
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {document.fileName}
                    </CardTitle>
                    {getStatusBadge(document.status)}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Document Preview */}
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                    <div className="p-4 bg-white border-b">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                {formatFileSize(document.fileSize)} • {document.fileType}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium">{zoom}%</span>
                                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleRotate}>
                                    <RotateCw className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleDownload}>
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="p-4">
                        <div
                            className="mx-auto bg-white shadow-sm"
                            style={{
                                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                                transformOrigin: 'center top'
                            }}
                        >
                            {isImage ? (
                                <img
                                    src={document.filePath}
                                    alt={document.fileName}
                                    className="max-w-full h-auto"
                                />
                            ) : isPdf ? (
                                <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
                                    <div className="text-center">
                                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600">PDF Preview</p>
                                        <p className="text-sm text-gray-500">Click to view full document</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
                                    <div className="text-center">
                                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600">Document Preview</p>
                                        <p className="text-sm text-gray-500">Preview not available for this file type</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Document Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Full Size
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                        </Button>
                    </div>
                    <div className="text-sm text-gray-500">
                        Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
