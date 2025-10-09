"use client";

import React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AddInstitutionModal } from "@/components/modals/AddInstitutionModal";
import { apiGetClient, apiPostClient } from "@/lib/utils";
import { toast } from "sonner";
import {
    Building2,
    Plus,
    Search,
    MoreHorizontal,
    Eye,
    Edit,
    Mail,
    Users,
    DollarSign,
    RefreshCw,
    Download,
    Upload,
    Trash2,
    ChevronLeft,
    ChevronRight,
    X,
    AlertCircle,
    CheckCircle,
    Clock,
    TrendingUp
} from "lucide-react";
import { getClientToken } from "@/stores/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

interface Institution {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    status: "active" | "pending" | "suspended";
    subscription: "STARTER" | "PRO" | "MAX";
    plan: string;
    revenue: number;
    users: number;
    joinedDate: string;
    lastActive: string;
}

interface PaginationState {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

interface FilterState {
    search: string;
    status: string;
    subscription: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
}

interface BulkOperationResponse {
    success: boolean;
    message: string;
    data?: {
        deletedCount?: number;
        updatedCount?: number;
        deletedInstitutions?: Array<{ id: string; name: string }>;
    };
}

// Skeleton Component for Loading States
const InstitutionTableSkeleton = () => (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <div className="flex space-x-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-32" />
            </div>
        </div>
        <div className="border border-slate-200 rounded-xl shadow-sm">
            <div className="p-4 border-b border-slate-200">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-8 w-32" />
                </div>
            </div>
            {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border-b border-slate-100 last:border-b-0">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-8 w-20" />
                        <div className="flex space-x-1">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// Empty State Component
const EmptyState = ({ onAddInstitution }: { onAddInstitution: () => void }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200">
            <Building2 className="h-10 w-10 text-slate-500" />
        </div>
        <h3 className="mt-6 text-lg font-semibold text-slate-900">No institutions found</h3>
        <p className="mt-2 text-sm text-slate-600 max-w-sm">
            Get started by adding your first educational institution to the platform.
        </p>
        <Button
            onClick={onAddInstitution}
            className="mt-8 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
            <Plus className="h-4 w-4 mr-2" />
            Add First Institution
        </Button>
    </div>
);

// Error State Component
const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-rose-100">
            <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h3 className="mt-6 text-lg font-semibold text-slate-900">Failed to load institutions</h3>
        <p className="mt-2 text-sm text-slate-600 max-w-sm">
            We couldn&apos;t load the institutions data. Please check your connection and try again.
        </p>
        <Button
            onClick={onRetry}
            variant="outline"
            className="mt-8 border-slate-300 hover:border-slate-400 hover:bg-slate-50"
        >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
        </Button>
    </div>
);

// Status Badge Component
const StatusBadge = ({ status }: { status: Institution["status"] }) => {
    const variants = {
        active: {
            className: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200",
            icon: CheckCircle
        },
        pending: {
            className: "bg-gradient-to-r from-amber-400 to-orange-400 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200",
            icon: Clock
        },
        suspended: {
            className: "bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200",
            icon: AlertCircle
        }
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
        <Badge className={`capitalize ${config.className}`}>
            <Icon className="h-3 w-3 mr-1" />
            {status}
        </Badge>
    );
};

// Plan Badge Component
const PlanBadge = ({ plan }: { plan: Institution["subscription"] }) => {
    const variants = {
        STARTER: {
            className: "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200 hover:shadow-md transition-all duration-200"
        },
        PRO: {
            className: "bg-gradient-to-r from-purple-500 to-violet-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
        },
        MAX: {
            className: "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
        }
    };

    const config = variants[plan] || variants.STARTER;

    return (
        <Badge className={config.className}>
            {plan}
        </Badge>
    );
};

export default function InstitutionsPage() {
    const [institutions, setInstitutions] = React.useState<Institution[]>([]);
    const [selectedInstitutions, setSelectedInstitutions] = React.useState<string[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [pagination, setPagination] = React.useState<PaginationState>({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0
    });

    const [filters, setFilters] = React.useState<FilterState>({
        search: "",
        status: "all",
        subscription: "all",
        sortBy: "name",
        sortOrder: "asc"
    });

    const [stats, setStats] = React.useState({
        total: 0,
        active: 0,
        pending: 0,
        suspended: 0,
        totalRevenue: 0
    });

    // Fetch institutions with pagination and filters
    const fetchInstitutions = React.useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);
            setError(null);

            const token = getClientToken();
            if (!token) {
                throw new Error("No authentication token found");
            }

            const queryParams = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.pageSize.toString(),
                search: filters.search,
                status: filters.status,
                subscriptionTier: filters.subscription,
            });

   
            const response = await apiGetClient<{
                success: boolean;
                data: {
                    institutions: Institution[];
                    pagination: PaginationState;
                    stats: typeof stats;
                };
            }>(`/super-admin/institutions?${queryParams}`, token);

            if (response.success) {
                setInstitutions(response.data.institutions);
                setPagination(response.data.pagination);
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error("❌ Error fetching institutions:", error);
            setError(error instanceof Error ? error.message : "Failed to fetch institutions");
            toast.error("Failed to load institutions", {
                description: "Please try again later",
                action: {
                    label: "Retry",
                    onClick: () => fetchInstitutions(true)
                }
            });
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.pageSize, filters]);

    // Handle adding new institution
    const handleAddInstitution = async (data: {
        name: string;
        slug: string;
        email: string;
        phone: string;
        address: string;
        subscriptionTier: "STARTER" | "PRO" | "MAX";
        maxLeads: number;
        maxTeamMembers: number;
    }) => {
        try {
            const token = getClientToken();
            if (!token) throw new Error("No authentication token found");

            const response = await apiPostClient<{ success: boolean; data?: Institution }>("/super-admin/institutions", data, token);

            if (response.success) {
                toast.success("Institution created successfully", {
                    description: `${data.name} has been added to the platform`
                });
                setIsAddModalOpen(false);
                await fetchInstitutions();
            }
        } catch (error) {
            console.error("Error creating institution:", error);
            toast.error("Failed to create institution", {
                description: "Please check the details and try again"
            });
        }
    };

    // Handle bulk operations
    const handleBulkAction = async (action: "activate" | "suspend" | "delete") => {
        if (selectedInstitutions.length === 0) {
            toast.error("No institutions selected");
            return;
        }

        try {
            const token = getClientToken();
            if (!token) throw new Error("No authentication token found");

            const response = await apiPostClient<BulkOperationResponse>(`/super-admin/institutions/bulk-${action}`, {
                institutionIds: selectedInstitutions
            }, token);



            if (response.success) {
                toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} completed`, {
                    description: response.message || `${selectedInstitutions.length} institution(s) ${action}d successfully`
                });

                setSelectedInstitutions([]);
                await fetchInstitutions();
            }
        } catch (error) {
            console.error(`Bulk ${action} error:`, error);
            toast.error(`Failed to ${action} institutions`, {
                description: "Please try again later"
            });
        }
    };

    // Handle search with debouncing
    const debouncedSearch = React.useMemo(
        () => {
            const handler = (searchTerm: string) => {
                setFilters(prev => ({ ...prev, search: searchTerm }));
                setPagination(prev => ({ ...prev, page: 1 }));
            };

            let timeoutId: NodeJS.Timeout;
            return (searchTerm: string) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => handler(searchTerm), 300);
            };
        },
        []
    );

    // Initial load and filter changes
    React.useEffect(() => {
        fetchInstitutions();
    }, [fetchInstitutions]);

    // Handle select all checkbox
    const isAllSelected = institutions.length > 0 && selectedInstitutions.length === institutions.length;
    const isIndeterminate = selectedInstitutions.length > 0 && selectedInstitutions.length < institutions.length;

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedInstitutions([]);
        } else {
            setSelectedInstitutions(institutions.map(inst => inst.id));
        }
    };

    const handleSelectOne = (id: string) => {
        setSelectedInstitutions(prev =>
            prev.includes(id)
                ? prev.filter(instId => instId !== id)
                : [...prev, id]
        );
    };

    if (isLoading) {
        return (

            <div className="space-y-8 bg-gradient-to-br from-slate-50 via-white to-slate-100 min-h-screen p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <div className="flex space-x-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="border-0 shadow-lg">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16 mb-1" />
                                <Skeleton className="h-3 w-24" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <InstitutionTableSkeleton />
            </div>

        );
    }

    return (
        <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
        <div className="relative space-y-8 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent">
                        Institutions
                    </h1>
                    <p className="text-slate-600 mt-2">
                        Manage all educational institutions on the platform
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        className="hidden sm:flex border-slate-300 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden sm:flex border-slate-300 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                    </Button>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Add Institution</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 text-white hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-100">Total Institutions</CardTitle>
                        <Building2 className="h-5 w-5 text-blue-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{stats.total}</div>
                        <p className="text-xs text-blue-100 flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {stats.total > 0 ? '+3 from last month' : 'No institutions yet'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600 text-white hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-100">Active</CardTitle>
                        <Users className="h-5 w-5 text-emerald-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{stats.active}</div>
                        <p className="text-xs text-emerald-100 flex items-center mt-1">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {stats.total > 0 ? `${((stats.active / stats.total) * 100).toFixed(1)}% active rate` : '0% active rate'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 text-white hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-100">Pending</CardTitle>
                        <Clock className="h-5 w-5 text-amber-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{stats.pending}</div>
                        <p className="text-xs text-amber-100 flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            Awaiting approval
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 text-white hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-100">Total Revenue</CardTitle>
                        <DollarSign className="h-5 w-5 text-purple-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">₹{new Intl.NumberFormat('en-US').format(stats.totalRevenue)}</div>
                        <p className="text-xs text-purple-100 flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +15.2% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex-shrink-0 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl text-slate-800">All Institutions</CardTitle>
                                <CardDescription className="text-slate-600">
                                    Manage and monitor all educational institutions
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => fetchInstitutions(true)}
                                className="hover:bg-purple-100 hover:text-purple-700 transition-all duration-200"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="relative flex-1 min-w-0">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <Input
                                    type="text"
                                    placeholder="Search institutions, emails, or addresses..."
                                    className="pl-10 border-slate-300 focus:border-purple-400 focus:ring-purple-400/20 text-black"
                                    onChange={(e) => debouncedSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2">
                                <Select
                                    value={filters.status}
                                    onValueChange={(value) => {
                                        setFilters(prev => ({ ...prev, status: value }));
                                        setPagination(prev => ({ ...prev, page: 1 }));
                                    }}
                                >
                                    <SelectTrigger className="w-[140px] border-slate-300 focus:border-purple-400">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-slate-200">
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.subscription}
                                    onValueChange={(value) => {
                                        setFilters(prev => ({ ...prev, subscription: value }));
                                        setPagination(prev => ({ ...prev, page: 1 }));
                                    }}
                                >
                                    <SelectTrigger className="w-[120px] border-slate-300 focus:border-purple-400">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-slate-200">
                                        <SelectItem value="all">All Plans</SelectItem>
                                        <SelectItem value="STARTER">Starter</SelectItem>
                                        <SelectItem value="PRO">Pro</SelectItem>
                                        <SelectItem value="MAX">Max</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        {selectedInstitutions.length > 0 && (
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm font-medium text-blue-900">
                                        {selectedInstitutions.length} selected
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedInstitutions([])}
                                        className="hover:bg-blue-100 text-blue-700"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleBulkAction("activate")}
                                        className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Activate
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleBulkAction("suspend")}
                                        className="border-amber-300 text-amber-700 hover:bg-amber-50"
                                    >
                                        <Clock className="h-4 w-4 mr-1" />
                                        Suspend
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleBulkAction("delete")}
                                        className="border-red-300 text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden p-0">
                    {error ? (
                        <ErrorState onRetry={() => fetchInstitutions(true)} />
                    ) : institutions.length === 0 ? (
                        <EmptyState onAddInstitution={() => setIsAddModalOpen(true)} />
                    ) : (
                        <div className="overflow-auto">
                            <Table>
                                <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                                    <TableRow className="border-slate-200 hover:bg-slate-50">
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={isAllSelected}
                                                ref={(el) => {
                                                    if (el) (el as HTMLInputElement).indeterminate = isIndeterminate;
                                                }}
                                                onCheckedChange={handleSelectAll}
                                                className="border-slate-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                            />
                                        </TableHead>
                                        <TableHead className="text-slate-700 font-semibold">Institution</TableHead>
                                        <TableHead className="text-slate-700 font-semibold">Contact</TableHead>
                                        <TableHead className="text-slate-700 font-semibold">Status</TableHead>
                                        <TableHead className="text-slate-700 font-semibold">Plan</TableHead>
                                        <TableHead className="text-slate-700 font-semibold">Revenue</TableHead>
                                        <TableHead className="text-slate-700 font-semibold">Users</TableHead>
                                        <TableHead className="text-slate-700 font-semibold">Joined</TableHead>
                                        <TableHead className="w-32 text-slate-700 font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {institutions.map((institution) => (
                                        <TableRow
                                            key={institution.id}
                                            className="border-slate-100 hover:bg-gradient-to-r hover:from-slate-50 hover:to-purple-50 transition-all duration-200"
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedInstitutions.includes(institution.id)}
                                                    onCheckedChange={() => handleSelectOne(institution.id)}
                                                    className="border-slate-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center shadow-sm">
                                                        <Building2 className="h-5 w-5 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{institution.name}</p>
                                                        <p className="text-sm text-slate-600 truncate max-w-xs">
                                                            {institution.address}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{institution.email}</p>
                                                    <p className="text-sm text-slate-600">{institution.phone}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={institution.status} />
                                            </TableCell>
                                            <TableCell>
                                                <PlanBadge plan={institution.subscription} />
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        ₹{new Intl.NumberFormat('en-US').format(institution.revenue)}
                                                    </p>
                                                    <p className="text-sm text-slate-500">Total revenue</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2 text-slate-700">
                                                    <Users className="h-4 w-4 text-slate-500" />
                                                    <span className="font-medium">{institution.users}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {new Date(institution.joinedDate).toLocaleDateString('en-GB')}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        Last: {new Date(institution.lastActive).toLocaleDateString('en-GB')}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-emerald-100 hover:text-emerald-700 transition-all duration-200">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-purple-100 hover:text-purple-700 transition-all duration-200">
                                                        <Mail className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>

                {/* Pagination */}
                {!error && institutions.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm text-slate-600">
                                Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
                                {pagination.total} results
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="border-slate-300 hover:border-purple-400 hover:bg-purple-50 disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <div className="flex items-center space-x-1">
                                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={pagination.page === pageNum ? "default" : "outline"}
                                            size="sm"
                                            className={`w-8 h-8 p-0 ${pagination.page === pageNum
                                                ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md"
                                                : "border-slate-300 hover:border-purple-400 hover:bg-purple-50"
                                                }`}
                                            onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.totalPages}
                                className="border-slate-300 hover:border-purple-400 hover:bg-purple-50 disabled:opacity-50"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Add Institution Modal */}
            <AddInstitutionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddInstitution}
            />
        </div>
        </ProtectedRoute>



    );
}
