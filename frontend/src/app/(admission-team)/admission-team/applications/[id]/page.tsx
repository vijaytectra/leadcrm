import { Metadata } from 'next';
import ApplicationReviewDetail from '@/components/admission-team/ApplicationReviewDetail';

interface ApplicationDetailPageProps {
    params: {
        id: string;
    };
}

export const metadata: Metadata = {
    title: 'Application Review Detail',
    description: 'Detailed view of application for review',
};

export default function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
    return <ApplicationReviewDetail applicationId={params.id} />;
}
