import { Metadata } from 'next';
import CommunicationHistoryView from '@/components/student-portal/CommunicationHistoryView';

export const metadata: Metadata = {
    title: 'Communication History',
    description: 'View your communication history with the institution',
};

export default function CommunicationPage() {
    return <CommunicationHistoryView />;
}
