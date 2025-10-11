import { Metadata } from 'next';
import ApplicationStatusTracker from '@/components/student-portal/ApplicationStatusTracker';

export const metadata: Metadata = {
    title: 'Application Status',
    description: 'Track your application status and progress',
};

export default function ApplicationStatusPage() {
    return <ApplicationStatusTracker />;
}
