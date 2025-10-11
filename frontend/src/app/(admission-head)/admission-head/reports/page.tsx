import { Metadata } from 'next';
import AdmissionBoardReports from '@/components/admission-head/AdmissionBoardReports';

export const metadata: Metadata = {
    title: 'Admission Reports',
    description: 'View admission board reports and analytics',
};

export default function AdmissionReportsPage() {
    return <AdmissionBoardReports />;
}
