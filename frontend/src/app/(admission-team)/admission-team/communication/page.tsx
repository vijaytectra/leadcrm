import { Metadata } from 'next';
import { CommunicationLogViewer } from '@/components/admission-team/CommunicationLogViewer';
import { getToken } from '@/lib/getToken';
import { getApplicationCommunications } from '@/lib/api/admissions';

export const metadata: Metadata = {
    title: 'Communication Logs',
    description: 'View and manage communication logs',
};

export default async function CommunicationLogsPage({
    params,
    searchParams
}: {
    searchParams: Promise<{
        tenant?: string;
    }>;
    params: Promise<{
        id: string;
    }>;
}) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const tenantSlug = resolvedSearchParams.tenant || 'demo-tenant';
    const token = await getToken();
    if (!token) {
        return <div>No token found</div>;
    }
    const communications = await getApplicationCommunications(tenantSlug, resolvedParams.id, token);

    // Group communications by type
    const groupedCommunications = communications.reduce((acc, comm) => {
        if (!acc[comm.type]) {
            acc[comm.type] = [];
        }
        acc[comm.type].push(comm);
        return acc;
    }, {} as Record<string, typeof communications>);

    return (
        <CommunicationLogViewer
            communications={communications}
            groupedCommunications={groupedCommunications}
            totalCount={communications.length}
        />
    );
}
