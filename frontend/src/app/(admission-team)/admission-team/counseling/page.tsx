import { Metadata } from 'next';

import { getToken } from '@/lib/getToken';
import { getCounselingAppointments } from '@/lib/api/admissions';
import { CounselingScheduler } from '@/components/admission-team/CounselingScheduler';

export const metadata: Metadata = {
    title: 'Counseling Schedule',
    description: 'Manage counseling appointments and schedules',
};

export default async function CounselingPage(
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
    const appointments = await getCounselingAppointments(tenantSlug, token);
    return <CounselingScheduler appointments={appointments} />;
}
