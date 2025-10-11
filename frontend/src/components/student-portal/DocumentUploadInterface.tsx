'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface Document {
    id: string;
    name: string;
    type: string;
    size: number;
    status: 'uploaded' | 'pending' | 'rejected';
    uploadedAt: Date;
}

export default function DocumentUploadInterface() {
    const [documents, setDocuments] = useState<Document[]>([
        {
            id: '1',
            name: 'Academic Transcript.pdf',
            type: 'application/pdf',
            size: 1024000,
            status: 'uploaded',
            uploadedAt: new Date('2024-01-15'),
        },
        {
            id: '2',
            name: 'Identity Proof.jpg',
            type: 'image/jpeg',
            size: 512000,
            status: 'pending',
            uploadedAt: new Date('2024-01-16'),
        },
    ]);

    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFiles = (files: FileList) => {
        Array.from(files).forEach((file) => {
            const newDocument: Document = {
                id: Date.now().toString(),
                name: file.name,
                type: file.type,
                size: file.size,
                status: 'pending',
                uploadedAt: new Date(),
            };
            setDocuments(prev => [...prev, newDocument]);
        });
    };

    const getStatusIcon = (status: Document['status']) => {
        switch (status) {
            case 'uploaded':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'pending':
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            case 'rejected':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
        }
    };

    const getStatusColor = (status: Document['status']) => {
        switch (status) {
            case 'uploaded':
                return 'text-green-600 bg-green-50';
            case 'pending':
                return 'text-yellow-600 bg-yellow-50';
            case 'rejected':
                return 'text-red-600 bg-red-50';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
                <p className="text-gray-600 mt-1">Upload and manage your application documents</p>
            </div>

            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                    <p className="text-lg font-medium text-gray-900">
                        Drop files here or click to upload
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        PDF, DOC, DOCX, JPG, PNG up to 10MB
                    </p>
                </div>
                <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                />
            </div>

            {/* Document List */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Uploaded Documents</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {documents.map((doc) => (
                        <div key={doc.id} className="px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <FileText className="h-8 w-8 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {formatFileSize(doc.size)} • {doc.type}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}
                                >
                                    {getStatusIcon(doc.status)}
                                    <span className="ml-1 capitalize">{doc.status}</span>
                                </span>
                                <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
