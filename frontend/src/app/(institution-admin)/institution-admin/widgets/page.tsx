"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Plus,
    Search,
    Filter,
    BarChart3,
    Eye,
    Settings,
    TrendingUp,
    Users
} from 'lucide-react';
import { ApiException, apiGetClientNew } from '@/lib/utils';
import { WidgetCard } from '@/components/forms/WidgetCard';
import { WidgetCreationModal } from '@/components/forms/WidgetCreationModal';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'sonner';
import { getClientToken } from '@/lib/client-token';
import { useRouter } from 'next/navigation';
import { widgetAPI } from '@/lib/api/forms';
import { DeleteDialog } from '@/components/ui/confirmation-dialog';
import { useCallback } from 'react';

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
    createdAt: Date;
    updatedAt: Date;
    analytics?: WidgetAnalytics;
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
    searchParams: Promise<{
        page?: string;
        limit?: string;
        search?: string;
        status?: string;
        form?: string;
        tenant?: string;
    }>;
}

export default function WidgetsPage({ searchParams }: WidgetsPageProps) {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [form, setForm] = useState('all');
    const [tenant, setTenant] = useState('');
    const [widgets, setWidgets] = useState<Array<Widget & { analytics?: WidgetAnalytics }>>([]);
    const [forms, setForms] = useState<Array<{ id: string; title: string }>>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [widgetModalOpen, setWidgetModalOpen] = useState(false);
    const [widgetCreationModalOpen, setWidgetCreationModalOpen] = useState(false);
    const [selectedFormForWidget, setSelectedFormForWidget] = useState<{ id: string; title: string } | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [widgetToDelete, setWidgetToDelete] = useState<{ id: string; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { currentTenantSlug } = useAuthStore();
    const router = useRouter();

    const loadWidgets = useCallback(async () => {
        try {
            setLoading(true);
            const resolvedSearchParams = await searchParams;

            setPage(parseInt(resolvedSearchParams.page || '1'));
            setLimit(parseInt(resolvedSearchParams.limit || '12'));
            setSearch(resolvedSearchParams.search || '');
            setStatus(resolvedSearchParams.status || 'all');
            setForm(resolvedSearchParams.form || 'all');

            // Use tenant from search params first, then fallback to currentTenantSlug
            const tenantSlug = resolvedSearchParams.tenant || currentTenantSlug || '';
            setTenant(tenantSlug);

            if (!tenantSlug) {
                console.error('No tenant slug available');
                // Try to redirect to a page with tenant parameter
                if (currentTenantSlug) {
                    router.push(`/institution-admin/widgets?tenant=${currentTenantSlug}`);
                    return;
                }
                // If no tenant available, redirect to dashboard
                router.push('/institution-admin/dashboard');
                return;
            }

            const token = getClientToken();
            if (!token) {
                return;
            }
            // Fetch all widgets
            const widgetsResponse = await apiGetClientNew<{
                success: boolean;
                data: {
                    widgets: Widget[];
                    total: number;
                    page: number;
                    limit: number;
                    forms: Array<{ id: string; title: string }>;
                }
            }>(`/${tenantSlug}/widgets?page=${page}&limit=${limit}&search=${search}&status=${status}&form=${form}`, { token: token });

            setWidgets(widgetsResponse.data.widgets);
            setTotal(widgetsResponse.data.total);
            setForms(widgetsResponse.data.forms);

            // Fetch analytics for widgets
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
                        if (error instanceof ApiException) {
                            console.error(`Failed to fetch analytics for widget ${widget.id}:`, error.message);
                        } else {
                            toast.error('Failed to fetch analytics for widget');
                        }
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

            // Calculate overall conversion rate for display
            const overallConversionRate = overallAnalytics.totalViews > 0
                ? (overallAnalytics.totalSubmissions / overallAnalytics.totalViews) * 100
                : 0;

            // Store conversion rate for later use

            setWidgets(widgetsWithAnalytics);
        } catch (error) {
            console.error('Error loading widgets:', error);
        } finally {
            setLoading(false);
        }
    }, [searchParams, currentTenantSlug, router, form, limit, page, search, status]);

    useEffect(() => {
        loadWidgets();
    }, [loadWidgets]);

    const handleCreateWidget = () => {
        if (forms.length === 0) {
            toast.error("No forms available. Please create a form first.");
            return;
        }
        setWidgetModalOpen(true);
    };

    const handleWidgetCreated = () => {
       
        setWidgetModalOpen(false);
        setWidgetCreationModalOpen(false);
        setSelectedFormForWidget(null);
        // Refresh the page data smoothly
        loadWidgets();
    };

    const handleDeleteWidget = (widgetId: string, widgetName: string) => {
        setWidgetToDelete({ id: widgetId, name: widgetName });
        setDeleteDialogOpen(true);
    };

    const confirmDeleteWidget = async () => {
        if (!widgetToDelete) return;

        setIsDeleting(true);
        try {
            const response = await widgetAPI.deleteWidget(tenant, widgetToDelete.id);

            if (response.success) {
                toast.success('Widget deleted successfully');
                setDeleteDialogOpen(false);
                setWidgetToDelete(null);
                // Refresh the page data smoothly
                loadWidgets();
            } else {
                toast.error(response.message || 'Failed to delete widget');
            }
        } catch (error) {
            console.error('Error deleting widget:', error);
            if (error instanceof ApiException) {
                toast.error(error.message);
            } else {
                toast.error('Failed to delete widget');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    // This function is used by the widget creation modal

    const handleFormSelect = (formId: string) => {
        const selectedForm = forms.find(f => f.id === formId);
        if (selectedForm) {
            setSelectedFormForWidget(selectedForm);
        }
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

    // Calculate overall analytics
    const overallAnalytics = widgets.reduce(
        (acc, widget) => ({
            totalViews: acc.totalViews + (widget.analytics?.totalViews || 0),
            totalSubmissions: acc.totalSubmissions + (widget.analytics?.totalSubmissions || 0),
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
                    <Button onClick={handleCreateWidget}>
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
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={form} onValueChange={setForm}>
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
                    {widgets.map((widget) => (
                        <WidgetCard
                            key={widget.id}
                            widget={widget}
                            analytics={widget.analytics}
                            onEdit={() => {
                                // Handle edit - this would open an edit modal or navigate to edit page
                            }}
                            onDelete={(widgetId) => handleDeleteWidget(widgetId, widget.name)}
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
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No Widgets Found</h3>
                        <p className="text-slate-600 mb-6">
                            {search || status !== 'all' || form !== 'all'
                                ? 'No widgets match your current filters. Try adjusting your search criteria.'
                                : 'Create your first widget to start embedding forms on external websites.'
                            }
                        </p>
                        <Button onClick={handleCreateWidget}>
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

            {/* Widget Creation Modal */}
            {widgetModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Select Form for Widget</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Select onValueChange={handleFormSelect}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a form" />
                                </SelectTrigger>
                                <SelectContent>
                                    {forms.map((form) => (
                                        <SelectItem key={form.id} value={form.id}>
                                            {form.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setWidgetModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (selectedFormForWidget) {
                                            setWidgetModalOpen(false);
                                            setWidgetCreationModalOpen(true);
                                        }
                                    }}
                                    disabled={!selectedFormForWidget}
                                >
                                    Continue
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Widget Creation Modal */}
            {widgetCreationModalOpen && selectedFormForWidget && (
                <WidgetCreationModal
                    formId={selectedFormForWidget.id}
                    formTitle={selectedFormForWidget.title}
                    tenantSlug={tenant}
                    isOpen={widgetCreationModalOpen}
                    onClose={() => {
                        setWidgetCreationModalOpen(false);
                        setSelectedFormForWidget(null);
                    }}
                    onWidgetCreated={handleWidgetCreated}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Widget"
                description="Are you sure you want to delete this widget? This action cannot be undone."
                itemName={widgetToDelete?.name}
                onConfirm={confirmDeleteWidget}
                isLoading={isDeleting}
            />
        </div>
    );
}