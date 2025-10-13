import { Metadata } from 'next';
import { ApplicationReviewDetail } from '@/components/admission-team/ApplicationReviewDetail';
import { getToken } from '@/lib/getToken';
import { getApplicationDetails } from '@/lib/api/admissions';

interface ApplicationDetailPageProps {
    params: {
        id: string;
    };
    searchParams: Promise<{
        tenant?: string;
    }>;
}

export const metadata: Metadata = {
    title: 'Application Review Detail',
    description: 'Detailed view of application for review',
};

export default async function ApplicationDetailPage({ params, searchParams }: ApplicationDetailPageProps) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const tenantSlug = resolvedSearchParams.tenant || 'demo-tenant';
    const token = await getToken();
    if (!token) {
        return <div>No token found</div>;
    }
    const application = await getApplicationDetails(tenantSlug, resolvedParams.id, token);

    const handleReviewSubmit = async (data: {
        interviewNotes?: string;
        academicScore?: number;
        recommendations?: string;
        decision?: 'APPROVED' | 'REJECTED' | 'WAITLISTED';
        decisionReason?: string;
    }) => {
        // TODO: Implement review submission
        console.log('Review data:', data);
    };

    return (
        <ApplicationReviewDetail
            application={application}
            onReviewSubmit={handleReviewSubmit}
        />
    );
}
