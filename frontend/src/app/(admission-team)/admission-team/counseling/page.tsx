import { Metadata } from 'next';
import CounselingScheduler from '@/components/admission-team/CounselingScheduler';

export const metadata: Metadata = {
    title: 'Counseling Schedule',
    description: 'Manage counseling appointments and schedules',
};

export default function CounselingPage() {
    return <CounselingScheduler />;
}
