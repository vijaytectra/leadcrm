import { Metadata } from 'next';
import StudentPortalDashboard from '@/components/student-portal/StudentPortalDashboard';

export const metadata: Metadata = {
    title: 'Student Portal Dashboard',
    description: 'Student portal dashboard with application status and information',
};

export default function StudentPortalDashboardPage() {
    return <StudentPortalDashboard />;
}
