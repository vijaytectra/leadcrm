"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    ArrowLeft,
    BarChart3,
    Settings
} from 'lucide-react';
import Link from 'next/link';
import { ApiException, apiGetClientNew } from '@/lib/utils';
import { WidgetCard } from '@/components/forms/WidgetCard';
import { WidgetAnalyticsCard } from '@/components/forms/WidgetAnalyticsCard';
import { WidgetCreationModal } from '@/components/forms/WidgetCreationModal';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'sonner';
import { getClientToken } from '@/lib/client-token';

interface FormWidgetsPageProps {

    searchParams: Promise<{
        tenant: string;
        formId: string;
    }>;
}

interface Widget {
    id: string;
    name: string;
    type: string;
    settings: {
        theme: string;
        primaryColor: string;
        borderRadius: number;
        width: string;
        height: string;
    };
    embedCode: string;
    previewUrl: string;
    publicUrl: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface Form {
    id: string;
    title: string;
    description?: string;
    isPublished: boolean;
}

interface WidgetAnalytics {
    totalViews: number;
    totalSubmissions: number;
    conversionRate: number;
    dailyStats: Array<{
        date: string;
        views: number;
        submissions: number;
    }>;
}

export default function FormWidgetsPage({ searchParams }: FormWidgetsPageProps) {
    const [tenant, setTenant] = useState<string>('');
    const [form, setForm] = useState<Form | null>(null);
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [widgetsWithAnalytics, setWidgetsWithAnalytics] = useState<Array<Widget & { analytics: WidgetAnalytics }>>([]);
    const [loading, setLoading] = useState(true);
    const [widgetModalOpen, setWidgetModalOpen] = useState(false);
    const { currentTenantSlug } = useAuthStore();

    const initializeData = useCallback(async () => {
        try {

            const resolvedSearchParams = await searchParams;
            const formIdFromParams = resolvedSearchParams.formId;
            const tenantSlug = currentTenantSlug || '';

            setTenant(tenantSlug);

            if (!currentTenantSlug || !formIdFromParams) {
                notFound();
                return;
            }
            // Fetch form details
            const token = getClientToken();
            if (!token) {
                notFound();
                return;
            }

            const formResponse = await apiGetClientNew<{ success: boolean; data: Form }>(`/${tenantSlug}/forms/${formIdFromParams}`, { token: token });
            setForm(formResponse.data);

            // Fetch widgets for this form
            const widgetsResponse = await apiGetClientNew<{ success: boolean; data: { widgets: Widget[]; total: number } }>(
                `/${tenantSlug}/forms/${formIdFromParams}/widgets`,
                { token: token }
            );
            setWidgets(widgetsResponse.data.widgets);

            // Fetch analytics for each widget
            const widgetsWithAnalytics = await Promise.all(
                widgetsResponse.data.widgets.map(async (widget) => {
                    try {
                        const analyticsResponse = await apiGetClientNew<{ success: boolean; data: WidgetAnalytics }>(
                            `/${tenantSlug}/widgets/${widget.id}/analytics?startDate=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}&endDate=${new Date().toISOString()}`,
                            { token: token }
                        );
                        return {
                            ...widget,
                            createdAt: new Date(widget.createdAt),
                            updatedAt: new Date(widget.updatedAt),
                            analytics: analyticsResponse.data
                        };
                    } catch (error) {
                        console.error(`Failed to fetch analytics for widget ${widget.id}:`, error);
                        return {
                            ...widget,
                            createdAt: new Date(widget.createdAt),
                            updatedAt: new Date(widget.updatedAt),
                            analytics: {
                                totalViews: 0,
                                totalSubmissions: 0,
                                conversionRate: 0,
                                dailyStats: []
                            }
                        };
                    }
                })
            );
            setWidgetsWithAnalytics(widgetsWithAnalytics);
        } catch (error) {
            console.error('Error loading form widgets:', error);
            if (error instanceof ApiException) {
                console.error('Error loading form widgets:', error.message);
                toast.error(error.error.error);
            } else {
                console.error('Error loading form widgets:', error);
                toast.error('Failed to load form widgets');
            }
            notFound();
        } finally {
            setLoading(false);
        }
    }, [searchParams, currentTenantSlug]);

    useEffect(() => {
        initializeData();
    }, [initializeData]);

    const handleCreateWidget = () => {
        setWidgetModalOpen(true);
    };

    const handleWidgetCreated = () => {
        toast.success("Widget created successfully");
        setWidgetModalOpen(false);
        // Refresh the page data smoothly
        initializeData();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-slate-600">Loading widgets...</p>
                </div>
            </div>
        );
    }

    if (!form) {
        return notFound();
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href={`/institution-admin/forms?tenant=${tenant}`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Form
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Widgets</h1>
                        <p className="text-slate-600">
                            Manage embeddable widgets for &quot;{form.title}&quot;
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant={form.isPublished ? "default" : "secondary"}>
                        {form.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                    <Button onClick={handleCreateWidget}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Widget
                    </Button>
                </div>
            </div>

            {/* Form Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Settings className="h-5 w-5" />
                        <span>Form Information</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <div className="text-sm text-slate-600">Form Title</div>
                            <div className="font-medium">{form.title}</div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-600">Status</div>
                            <Badge variant={form.isPublished ? "default" : "secondary"}>
                                {form.isPublished ? 'Published' : 'Draft'}
                            </Badge>
                        </div>
                        <div>
                            <div className="text-sm text-slate-600">Widgets</div>
                            <div className="font-medium">{widgets.length} widget(s)</div>
                        </div>
                    </div>
                    {form.description && (
                        <div className="mt-4">
                            <div className="text-sm text-slate-600">Description</div>
                            <div className="text-slate-900">{form.description}</div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Widgets Grid */}
            {widgets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {widgetsWithAnalytics.map((widget) => (
                        <WidgetCard
                            key={widget.id}
                            widget={widget}
                            analytics={widget.analytics}
                            onEdit={() => {
                                // Handle edit - this would open an edit modal or navigate to edit page
                            }}
                            onDelete={() => {
                                // Handle delete - this would show a confirmation dialog
                            }}
                            onToggleActive={() => {
                                // Handle toggle active - this would call the API
                            }}
                            onViewAnalytics={() => {
                                // Handle view analytics - this would open analytics modal or navigate to analytics page
                            }}
                        />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="text-center py-12">
                        <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <BarChart3 className="h-12 w-12 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No Widgets Yet</h3>
                        <p className="text-slate-600 mb-6">
                            Create your first widget to start embedding this form on external websites.
                        </p>
                        <Button onClick={handleCreateWidget}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Widget
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Analytics Overview */}
            {widgets.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">Analytics Overview</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {widgetsWithAnalytics.slice(0, 2).map((widget) => (
                            <WidgetAnalyticsCard
                                key={widget.id}
                                widgetId={widget.id}
                                analytics={widget.analytics}
                                onDateRangeChange={() => {
                                    // Handle date range change - this would refetch analytics
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Widget Creation Modal */}
            {form && (
                <WidgetCreationModal
                    formId={form.id}
                    formTitle={form.title}
                    tenantSlug={tenant}
                    isOpen={widgetModalOpen}
                    onClose={() => setWidgetModalOpen(false)}
                    onWidgetCreated={handleWidgetCreated}
                />
            )}
        </div>
    );
}