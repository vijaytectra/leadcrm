import { Metadata } from 'next';
import DocumentUploadInterface from '@/components/student-portal/DocumentUploadInterface';

export const metadata: Metadata = {
    title: 'Document Management',
    description: 'Upload and manage your application documents',
};

export default function DocumentsPage() {
    return <DocumentUploadInterface />;
}
