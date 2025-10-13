import IntegrationHub from '@/components/institution-admin/IntegrationHub';

export default async function IntegrationsPage({
    searchParams,
}: {
    searchParams: Promise<{
        tenant?: string;
    }>;
}) {
    const { tenant } = await searchParams;
    if (!tenant) {
        return <div>Tenant not found</div>;
    }
    return <IntegrationHub tenantSlug={tenant} />;
}
