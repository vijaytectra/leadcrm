import { Metadata } from 'next';
import ApplicationReviewList from '@/components/admission-team/ApplicationReviewList';

export const metadata: Metadata = {
    title: 'Application Reviews',
    description: 'Review and manage student applications',
};

export default function ApplicationReviewsPage() {
    return <ApplicationReviewList />;
}
