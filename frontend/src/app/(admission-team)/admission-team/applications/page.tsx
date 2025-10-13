import { Metadata } from 'next';

import { getToken } from '@/lib/getToken';
import { getApplicationsForReview } from '@/lib/api/admissions';
import { ApplicationReviewList } from '@/components/admission-team/ApplicationReviewList';

export const metadata: Metadata = {
    title: 'Application Reviews',
    description: 'Review and manage student applications',
};

export default async function ApplicationReviewsPage(
    {
        searchParams
    }: {
        searchParams: Promise<{
            tenant?: string;
        }>;
    }
) {
    const resolvedSearchParams = await searchParams;
    const tenantSlug = resolvedSearchParams.tenant || 'demo-tenant';
    const token = await getToken();
    if (!token) {
        return <div>No token found</div>;
    }
    const { applications, pagination } = await getApplicationsForReview(tenantSlug, token);
    return <ApplicationReviewList applications={applications} pagination={pagination} />;
}
