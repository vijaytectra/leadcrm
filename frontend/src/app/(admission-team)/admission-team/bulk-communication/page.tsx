import { Metadata } from 'next';
import BulkCommunicationForm from '@/components/admission-team/BulkCommunicationForm';

export const metadata: Metadata = {
    title: 'Bulk Communication',
    description: 'Send bulk communications to students',
};

export default function BulkCommunicationPage() {
    return <BulkCommunicationForm />;
}
