"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Download, AlertCircle, CheckCircle, X } from "lucide-react";

interface LeadImportModalProps {
    onImport: (file: File) => void;
    onClose: () => void;
}

export function LeadImportModal({ onImport, onClose }: LeadImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [importing, setImporting] = useState(false);

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (isValidFile(droppedFile)) {
                setFile(droppedFile);
            }
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (isValidFile(selectedFile)) {
                setFile(selectedFile);
            }
        }
    };

    const isValidFile = (file: File) => {
        const validTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        return validTypes.includes(file.type);
    };

    const handleImport = async () => {
        if (!file) return;

        setImporting(true);
        try {
            await onImport(file);
        } catch (error) {
            console.error("Import error:", error);
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = () => {
        const csvContent = "name,email,phone,source,score\nJohn Doe,john@example.com,+1234567890,Google Ads,75\nJane Smith,jane@example.com,+1234567891,Facebook,85";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'leads_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto"
            onClick={onClose}
        >
            <Card
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Import Leads</CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 w-8 p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Instructions */}
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Import leads from CSV or Excel files. Make sure your file has columns for name, email, phone, source, and score.
                        </AlertDescription>
                    </Alert>

                    {/* Template Download */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="font-medium">Download Template</p>
                                <p className="text-sm text-gray-600">Get a sample CSV file with the correct format</p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={downloadTemplate}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </Button>
                    </div>

                    {/* File Upload */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                            ? "border-blue-500 bg-blue-50"
                            : file
                                ? "border-green-500 bg-green-50"
                                : "border-gray-300"
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        {file ? (
                            <div className="space-y-2">
                                <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                                <p className="font-medium text-green-800">{file.name}</p>
                                <p className="text-sm text-green-600">
                                    {(file.size / 1024).toFixed(1)} KB
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFile(null)}
                                >
                                    Remove File
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                                <div>
                                    <p className="text-lg font-medium">Drop your file here</p>
                                    <p className="text-gray-600">or click to browse</p>
                                </div>
                                <input
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <Button asChild>
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        Choose File
                                    </label>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* File Requirements */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">File Requirements:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Supported formats: CSV, Excel (.xlsx, .xls)</li>
                            <li>• Maximum file size: 10MB</li>
                            <li>• Required columns: name (at least one of email or phone)</li>
                            <li>• Optional columns: source, score</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={!file || importing}
                        >
                            {importing ? "Importing..." : "Import Leads"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
