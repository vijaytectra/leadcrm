import { Metadata } from 'next';
import AdmissionHeadDashboard from '@/components/admission-head/AdmissionHeadDashboard';

export const metadata: Metadata = {
    title: 'Admission Head Dashboard',
    description: 'Admission head dashboard with reports and offer letter management',
};

export default function AdmissionHeadDashboardPage() {
    return <AdmissionHeadDashboard />;
}
