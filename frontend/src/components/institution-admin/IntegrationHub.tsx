import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { apiGet } from '@/lib/utils';
import { getToken } from '@/lib/getToken';

interface Integration {
    id: string;
    platform: 'GOOGLE_ADS' | 'META' | 'LINKEDIN' | 'WHATSAPP';
    name: string;
    isActive: boolean;
    webhookUrl: string;
    lastSyncAt: string | null;
    lastSyncStatus: string | null;
    createdAt: string;
    _count: {
        leadSourceTrackings: number;
    };
}

interface IntegrationLimits {
    [key: string]: {
        current: number;
        limit: number;
    };
}

interface IntegrationHubData {
    integrations: Integration[];
    limits: IntegrationLimits;
    tier: 'STARTER' | 'PRO' | 'MAX';
}

async function IntegrationHub({ tenantSlug }: { tenantSlug: string }) {
    const token = await getToken();
    const data = await apiGet<IntegrationHubData>(`/${tenantSlug}/integrations`, { token: token });

    const platformConfig = {
        GOOGLE_ADS: {
            name: 'Google Ads',
            description: 'Import leads from Google Ads campaigns',
            color: 'bg-blue-500',
            icon: '🔍',
        },
        META: {
            name: 'Meta (Facebook/Instagram)',
            description: 'Import leads from Facebook and Instagram ads',
            color: 'bg-blue-600',
            icon: '📘',
        },
        LINKEDIN: {
            name: 'LinkedIn Marketing',
            description: 'Import leads from LinkedIn campaigns',
            color: 'bg-blue-700',
            icon: '💼',
        },
        WHATSAPP: {
            name: 'WhatsApp Business',
            description: 'Send messages through WhatsApp Business API',
            color: 'bg-green-500',
            icon: '💬',
        },
    };

    const getStatusBadge = (integration: Integration) => {
        if (!integration.isActive) {
            return <Badge variant="secondary">Inactive</Badge>;
        }

        if (integration.lastSyncStatus === 'success') {
            return <Badge variant="default" className="bg-green-500">Active</Badge>;
        }

        if (integration.lastSyncStatus?.includes('error')) {
            return <Badge variant="destructive">Error</Badge>;
        }

        return <Badge variant="outline">Unknown</Badge>;
    };

    const getStatusIcon = (integration: Integration) => {
        if (!integration.isActive) {
            return <XCircle className="h-4 w-4 text-gray-400" />;
        }

        if (integration.lastSyncStatus === 'success') {
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        }

        if (integration.lastSyncStatus?.includes('error')) {
            return <XCircle className="h-4 w-4 text-red-500" />;
        }

        return <Clock className="h-4 w-4 text-yellow-500" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Integration Hub</h1>
                    <p className="text-muted-foreground">
                        Connect your advertising platforms and communication channels
                    </p>
                </div>
                <Button asChild>
                    <Link href="/institution-admin/integrations/setup">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Integration
                    </Link>
                </Button>
            </div>

            {/* Subscription Tier Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Plan: {data.tier}</CardTitle>
                    <CardDescription>
                        Integration limits based on your subscription tier
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(data.limits || {}).map(([platform, limit]) => (
                            <div key={platform} className="text-center">
                                <div className="text-2xl font-bold">
                                    {limit.current}/{limit.limit === -1 ? '∞' : limit.limit}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {platformConfig[platform as keyof typeof platformConfig]?.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Active Integrations */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Active Integrations</h2>
                {(!data.integrations || data.integrations.length === 0) ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="text-6xl mb-4">🔗</div>
                            <h3 className="text-xl font-semibold mb-2">No integrations yet</h3>
                            <p className="text-muted-foreground text-center mb-6">
                                Connect your advertising platforms to automatically import leads
                            </p>
                            <Button asChild>
                                <Link href="/institution-admin/integrations/setup">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Integration
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {(data.integrations || []).map((integration) => {
                            const config = platformConfig[integration.platform];
                            return (
                                <Card key={integration.id}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-2xl">{config.icon}</span>
                                            <div>
                                                <CardTitle className="text-lg">{integration.name}</CardTitle>
                                                <CardDescription>{config.name}</CardDescription>
                                            </div>
                                        </div>
                                        {getStatusIcon(integration)}
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Status</span>
                                                {getStatusBadge(integration)}
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Leads Imported</span>
                                                <span className="font-medium">{integration._count.leadSourceTrackings}</span>
                                            </div>

                                            {integration.lastSyncAt && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Last Sync</span>
                                                    <span className="text-sm">
                                                        {new Date(integration.lastSyncAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex space-x-2 pt-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/institution-admin/integrations/${integration.id}`}>
                                                        <Settings className="h-4 w-4 mr-1" />
                                                        Configure
                                                    </Link>
                                                </Button>
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={integration.webhookUrl} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="h-4 w-4 mr-1" />
                                                        Webhook
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function IntegrationHubPage({ tenantSlug }: { tenantSlug: string }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <IntegrationHub tenantSlug={tenantSlug} />
        </Suspense>
    );
}
