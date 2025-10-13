import { Metadata } from 'next';
import { AdmissionTeamDashboard } from '@/components/admission-team/AdmissionTeamDashboard';
import { getAdmissionTeamDashboard } from '@/lib/api/admissions';
import { getToken } from '@/lib/getToken';


export const metadata: Metadata = {
    title: 'Admission Team Dashboard',
    description: 'Admission team dashboard with application reviews and statistics',
};

export default async function AdmissionTeamDashboardPage({
    searchParams
}: {
    searchParams: Promise<{
        tenant?: string;
    }>;
}) {
    const resolvedSearchParams = await searchParams;
    const tenantSlug = resolvedSearchParams.tenant || 'demo-tenant';
    const token = await getToken();
    if (!token) {
        return <div>No token found</div>;
    }
    const { stats, recentReviews } = await getAdmissionTeamDashboard(tenantSlug, token);

    return <AdmissionTeamDashboard stats={stats} recentReviews={recentReviews} />;
}
