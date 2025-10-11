import { Metadata } from 'next';
import CommunicationLogViewer from '@/components/admission-team/CommunicationLogViewer';

export const metadata: Metadata = {
    title: 'Communication Logs',
    description: 'View and manage communication logs',
};

export default function CommunicationLogsPage() {
    return <CommunicationLogViewer />;
}
