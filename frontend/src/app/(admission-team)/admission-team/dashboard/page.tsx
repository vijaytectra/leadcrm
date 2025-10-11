import { Metadata } from 'next';
import AdmissionTeamDashboard from '@/components/admission-team/AdmissionTeamDashboard';

export const metadata: Metadata = {
    title: 'Admission Team Dashboard',
    description: 'Admission team dashboard with application reviews and statistics',
};

export default function AdmissionTeamDashboardPage() {
    return <AdmissionTeamDashboard />;
}
