import React from 'react';
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
import { apiGet } from '@/lib/utils';
import { WidgetCard } from '@/components/forms/WidgetCard';
import { WidgetAnalyticsCard } from '@/components/forms/WidgetAnalyticsCard';
import { getToken } from '@/lib/getToken';

interface FormWidgetsPageProps {
    params: {
        formId: string;
    };
    searchParams: {
        tenant: string;
    };
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
    createdAt: string;
    updatedAt: string;
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

export default async function FormWidgetsPage({ params, searchParams }: FormWidgetsPageProps) {
    const { formId } = await params;
    const { tenant } = await searchParams;


    try {
        // Fetch form details
        const token = await getToken();



        const formResponse = await apiGet<{ success: boolean; data: Form }>(`/${tenant}/forms/${formId}`, { token: token });
        const form = formResponse.data;


        // Fetch widgets for this form
        const widgetsResponse = await apiGet<{ success: boolean; data: { widgets: Widget[]; total: number } }>(
            `/${tenant}/forms/${formId}/widgets`,
            { token: token }
        );
        const widgets = widgetsResponse.data.widgets;


        // Fetch analytics for each widget (in a real app, you might want to batch this)
        const widgetsWithAnalytics = await Promise.all(
            widgets.map(async (widget) => {
                try {
                    const analyticsResponse = await apiGet<{ success: boolean; data: WidgetAnalytics }>(
                        `/${tenant}/widgets/${widget.id}/analytics?startDate=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}&endDate=${new Date().toISOString()}`,
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
                        <Button>
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
                                onEdit={(widgetId) => {
                                    // Handle edit - this would open an edit modal or navigate to edit page
                               
                                }}
                                onDelete={(widgetId) => {
                                    // Handle delete - this would show a confirmation dialog
                                 
                                }}
                                onToggleActive={(widgetId, isActive) => {
                                    // Handle toggle active - this would call the API
                                 
                                }}
                                onViewAnalytics={(widgetId) => {
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
                            <Button>
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
                                    onDateRangeChange={(startDate, endDate) => {
                                        // Handle date range change - this would refetch analytics
                              
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error('Error loading form widgets:', error);
        notFound();
    }
}
