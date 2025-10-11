"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";

interface UploadedFile {
    file: File;
    id: string;
    progress: number;
    status: "uploading" | "success" | "error";
    error?: string;
}

export function StudentDocumentUpload() {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
            file,
            id: Math.random().toString(36).substr(2, 9),
            progress: 0,
            status: "uploading" as const,
        }));

        setUploadedFiles(prev => [...prev, ...newFiles]);

        // Simulate upload progress
        newFiles.forEach(uploadedFile => {
            simulateUpload(uploadedFile.id);
        });
    }, []);

    const simulateUpload = (fileId: string) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
                progress = 100;
                setUploadedFiles(prev =>
                    prev.map(f =>
                        f.id === fileId
                            ? { ...f, progress: 100, status: "success" }
                            : f
                    )
                );
                clearInterval(interval);
            } else {
                setUploadedFiles(prev =>
                    prev.map(f =>
                        f.id === fileId
                            ? { ...f, progress }
                            : f
                    )
                );
            }
        }, 200);
    };

    const removeFile = (fileId: string) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: true,
    });

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "success":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "error":
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Upload className="h-4 w-4 text-blue-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "success":
                return <Badge variant="default" className="bg-green-100 text-green-800">Uploaded</Badge>;
            case "error":
                return <Badge variant="destructive">Failed</Badge>;
            default:
                return <Badge variant="secondary">Uploading</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Documents
                </CardTitle>
                <CardDescription>
                    Drag and drop files here, or click to select files
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Dropzone */}
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                        }`}
                >
                    <input {...getInputProps()} />
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    {isDragActive ? (
                        <p className="text-blue-600 font-medium">Drop the files here...</p>
                    ) : (
                        <div>
                            <p className="text-gray-600 mb-2">
                                Drag and drop files here, or click to select files
                            </p>
                            <p className="text-sm text-gray-500">
                                Supports PDF, DOC, DOCX, JPG, PNG (max 10MB each)
                            </p>
                        </div>
                    )}
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Uploaded Files</h4>
                        {uploadedFiles.map((uploadedFile) => (
                            <div key={uploadedFile.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                                <FileText className="h-8 w-8 text-gray-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {uploadedFile.file.name}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(uploadedFile.status)}
                                            {getStatusBadge(uploadedFile.status)}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{formatFileSize(uploadedFile.file.size)}</span>
                                        {uploadedFile.status === "uploading" && (
                                            <span>{Math.round(uploadedFile.progress)}%</span>
                                        )}
                                    </div>
                                    {uploadedFile.status === "uploading" && (
                                        <Progress
                                            value={uploadedFile.progress}
                                            className="mt-2 h-1"
                                        />
                                    )}
                                    {uploadedFile.error && (
                                        <p className="text-xs text-red-600 mt-1">
                                            {uploadedFile.error}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(uploadedFile.id)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload Button */}
                {uploadedFiles.length > 0 && (
                    <div className="flex justify-end">
                        <Button
                            disabled={isUploading || uploadedFiles.some(f => f.status === "uploading")}
                            className="w-full"
                        >
                            {isUploading ? "Uploading..." : "Upload All Files"}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
