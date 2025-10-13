import { Metadata } from 'next';
import { BulkCommunicationForm } from '@/components/admission-team/BulkCommunicationForm';
import { getToken } from '@/lib/getToken';
import { getApplicationsForReview } from '@/lib/api/admissions';

export const metadata: Metadata = {
    title: 'Bulk Communication',
    description: 'Send bulk communications to students',
};

export default async function BulkCommunicationPage(
    {
        params,
        searchParams
    }: {
        params: Promise<{
            id: string;
        }>;
        searchParams: Promise<{
            tenant: string;
        }>;
    }
) {

    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const tenantSlug = resolvedSearchParams.tenant || 'demo-tenant';
    const token = await getToken();
    if (!token) {
        return <div>No token found</div>;
    }

    const { applications } = await getApplicationsForReview(tenantSlug, token);

    return (
        <BulkCommunicationForm
            applications={applications}
        />
    );
}
