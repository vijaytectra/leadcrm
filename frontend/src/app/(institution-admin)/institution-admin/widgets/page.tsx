
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Plus,
    Search,
    Filter,
    BarChart3,
    Eye,
    Settings,
    ExternalLink,
    Calendar,
    TrendingUp,
    Users,
    MousePointer
} from 'lucide-react';
import Link from 'next/link';
import { apiGet } from '@/lib/utils';
import { WidgetCard } from '@/components/forms/WidgetCard';
import { WidgetAnalyticsCard } from '@/components/forms/WidgetAnalyticsCard';
import { getToken } from '@/lib/getToken';
import { notFound } from 'next/navigation';

interface Widget {
    id: string;
    name: string;
    type: string;
    formId: string;
    formTitle: string;
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

interface WidgetsPageProps {
    searchParams: {
        page?: string;
        limit?: string;
        search?: string;
        status?: string;
        form?: string;
        tenant?: string;
    };
}

export default async function WidgetsPage({ searchParams }: WidgetsPageProps) {
    const page = parseInt(searchParams.page || '1');
    const limit = parseInt(searchParams.limit || '12');
    const search = searchParams.search || '';
    const status = searchParams.status || 'all';
    const form = searchParams.form || 'all';
    const tenant = searchParams.tenant || '';

    if (!tenant) {
        return (
            <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Settings className="h-12 w-12 text-red-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Tenant Required</h3>
                <p className="text-slate-600 mb-6">
                    Please provide a tenant parameter in the URL.
                </p>
            </div>
        );
    }

    try {
        const token = await getToken()
        // Fetch all widgets
        const widgetsResponse = await apiGet<{
            success: boolean;
            data: {
                widgets: Widget[];
                total: number;
                page: number;
                limit: number;
                forms: Array<{ id: string; title: string }>;
            }
        }>(`/${tenant}/widgets?page=${page}&limit=${limit}&search=${search}&status=${status}&form=${form}`, { token: token || undefined });

        const { widgets, total, forms } = widgetsResponse.data;

        // Fetch analytics for widgets (in a real app, you might want to batch this)
        const widgetsWithAnalytics = await Promise.all(
            widgets.map(async (widget) => {
                try {
                    const token = await getToken()
                    if (!token) {
                        return notFound();
                    }
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

        // Calculate overall analytics
        const overallAnalytics = widgetsWithAnalytics.reduce(
            (acc, widget) => ({
                totalViews: acc.totalViews + widget.analytics.totalViews,
                totalSubmissions: acc.totalSubmissions + widget.analytics.totalSubmissions,
                totalWidgets: acc.totalWidgets + 1,
                activeWidgets: acc.activeWidgets + (widget.isActive ? 1 : 0)
            }),
            { totalViews: 0, totalSubmissions: 0, totalWidgets: 0, activeWidgets: 0 }
        );

        const overallConversionRate = overallAnalytics.totalViews > 0
            ? (overallAnalytics.totalSubmissions / overallAnalytics.totalViews) * 100
            : 0;

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Widget Dashboard</h1>
                        <p className="text-slate-600">
                            Manage all your embeddable form widgets
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Widget
                        </Button>
                    </div>
                </div>

                {/* Analytics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium text-slate-600">Total Widgets</span>
                            </div>
                            <div className="mt-2">
                                <div className="text-2xl font-bold text-slate-900">
                                    {overallAnalytics.totalWidgets}
                                </div>
                                <div className="text-sm text-slate-600">
                                    {overallAnalytics.activeWidgets} active
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <Eye className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-slate-600">Total Views</span>
                            </div>
                            <div className="mt-2">
                                <div className="text-2xl font-bold text-slate-900">
                                    {overallAnalytics.totalViews.toLocaleString()}
                                </div>
                                <div className="text-sm text-slate-600">
                                    All time
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <Users className="h-5 w-5 text-purple-600" />
                                <span className="text-sm font-medium text-slate-600">Submissions</span>
                            </div>
                            <div className="mt-2">
                                <div className="text-2xl font-bold text-slate-900">
                                    {overallAnalytics.totalSubmissions.toLocaleString()}
                                </div>
                                <div className="text-sm text-slate-600">
                                    All time
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5 text-orange-600" />
                                <span className="text-sm font-medium text-slate-600">Conversion Rate</span>
                            </div>
                            <div className="mt-2">
                                <div className="text-2xl font-bold text-slate-900">
                                    {overallConversionRate.toFixed(1)}%
                                </div>
                                <div className="text-sm text-slate-600">
                                    Average
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search widgets..."
                                        className="pl-10"
                                        defaultValue={search}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Select defaultValue={status}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select defaultValue={form}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Form" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Forms</SelectItem>
                                        {forms.map((form) => (
                                            <SelectItem key={form.id} value={form.id}>
                                                {form.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button variant="outline">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
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
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No Widgets Found</h3>
                            <p className="text-slate-600 mb-6">
                                {search || status !== 'all' || form !== 'all'
                                    ? 'No widgets match your current filters. Try adjusting your search criteria.'
                                    : 'Create your first widget to start embedding forms on external websites.'
                                }
                            </p>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Your First Widget
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {total > limit && (
                    <div className="flex items-center justify-center space-x-2">
                        <Button variant="outline" disabled={page === 1}>
                            Previous
                        </Button>
                        <span className="text-sm text-slate-600">
                            Page {page} of {Math.ceil(total / limit)}
                        </span>
                        <Button variant="outline" disabled={page >= Math.ceil(total / limit)}>
                            Next
                        </Button>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error('Error loading widgets:', error);
        return (
            <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Settings className="h-12 w-12 text-red-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Error Loading Widgets</h3>
                <p className="text-slate-600 mb-6">
                    There was an error loading your widgets. Please try again.
                </p>
                <Button onClick={() => window.location.reload()}>
                    Try Again
                </Button>
            </div>
        );
    }
}
