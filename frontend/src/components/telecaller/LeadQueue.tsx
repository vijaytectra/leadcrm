"use client";

import { memo, useCallback, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Phone,
    Calendar,
    Edit,
    Search,
    Filter,
    Clock,
    User,
    Mail,
    PhoneCall
} from "lucide-react";
import { getLeads } from "@/lib/api/leads";

interface Lead {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    source?: string;
    status: string;
    score: number;
    createdAt: string;
    updatedAt: string;
    notes: Array<{
        id: string;
        note: string;
        createdAt: string;
        user: {
            firstName?: string;
            lastName?: string;
        };
    }>;
    callLogs: Array<{
        id: string;
        callType: string;
        status: string;
        outcome?: string;
        duration?: number;
        createdAt: string;
    }>;
    followUpReminders: Array<{
        id: string;
        type: string;
        priority: string;
        scheduledAt: string;
    }>;
}

interface LeadQueueProps {
    tenantSlug: string;
    onLeadSelect: (leadId: string) => void;
    onCallLog: (leadId: string) => void;
    onFollowUp: (leadId: string) => void;
    onStatusUpdate: (leadId: string) => void;
}

export const LeadQueue = memo(function LeadQueue({
    tenantSlug,
    onLeadSelect,
    onCallLog,
    onFollowUp,
    onStatusUpdate
}: LeadQueueProps) {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("updatedAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchLeads = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getLeads(tenantSlug, {
                page,
                limit: 20,
                status: statusFilter === "all" ? undefined : statusFilter,
                search: searchTerm || undefined,
                sortBy,
                sortOrder,
            });

            if (response.success) {
                setLeads(response.data.leads);
                setTotalPages(response.data.pagination.pages);
            }
        } catch (error) {
            console.error("Failed to fetch leads:", error);
        } finally {
            setLoading(false);
        }
    }, [tenantSlug, page, statusFilter, searchTerm, sortBy, sortOrder]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
        setPage(1);
    }, []);

    const handleStatusFilter = useCallback((value: string) => {
        setStatusFilter(value);
        setPage(1);
    }, []);

    const handleSort = useCallback((field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("desc");
        }
    }, [sortBy, sortOrder]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "NEW": return "bg-blue-100 text-blue-800";
            case "CONTACTED": return "bg-yellow-100 text-yellow-800";
            case "QUALIFIED": return "bg-green-100 text-green-800";
            case "INTERESTED": return "bg-purple-100 text-purple-800";
            case "LOST": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        if (score >= 40) return "text-orange-600";
        return "text-red-600";
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getLastCallStatus = (callLogs: Lead["callLogs"]) => {
        if (callLogs.length === 0) return null;
        const lastCall = callLogs[0];
        return {
            status: lastCall.status,
            outcome: lastCall.outcome,
            date: lastCall.createdAt,
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading leads...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters and Search */}
            <Card>
                <CardHeader>
                    <CardTitle>Lead Queue</CardTitle>
                    <CardDescription>Manage your assigned leads</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search leads by name, email, or phone..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={handleStatusFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="NEW">New</SelectItem>
                                <SelectItem value="CONTACTED">Contacted</SelectItem>
                                <SelectItem value="QUALIFIED">Qualified</SelectItem>
                                <SelectItem value="INTERESTED">Interested</SelectItem>
                                <SelectItem value="LOST">Lost</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="updatedAt">Last Updated</SelectItem>
                                <SelectItem value="createdAt">Created Date</SelectItem>
                                <SelectItem value="score">Lead Score</SelectItem>
                                <SelectItem value="name">Name</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Leads List */}
            <div className="space-y-3">
                {leads.map((lead) => {
                    const lastCall = getLastCallStatus(lead.callLogs);
                    const pendingFollowUps = lead.followUpReminders.length;

                    return (
                        <Card key={lead.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-lg">{lead.name}</h3>
                                            <Badge className={getStatusColor(lead.status)}>
                                                {lead.status}
                                            </Badge>
                                            <Badge variant="outline" className={getScoreColor(lead.score)}>
                                                Score: {lead.score}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="h-4 w-4" />
                                                <span>{lead.phone || "No phone"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="h-4 w-4" />
                                                <span>{lead.email || "No email"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <User className="h-4 w-4" />
                                                <span>{lead.source || "Unknown source"}</span>
                                            </div>
                                        </div>

                                        {lastCall && (
                                            <div className="flex items-center gap-2 text-sm mb-2">
                                                <PhoneCall className="h-4 w-4 text-blue-500" />
                                                <span>Last call: {formatDate(lastCall.date)}</span>
                                                <Badge variant="outline" size="sm">
                                                    {lastCall.outcome || lastCall.status}
                                                </Badge>
                                            </div>
                                        )}

                                        {pendingFollowUps > 0 && (
                                            <div className="flex items-center gap-2 text-sm text-orange-600 mb-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>{pendingFollowUps} pending follow-up{pendingFollowUps > 1 ? 's' : ''}</span>
                                            </div>
                                        )}

                                        {lead.notes.length > 0 && (
                                            <div className="text-sm text-muted-foreground">
                                                <p className="font-medium">Latest note:</p>
                                                <p className="truncate">{lead.notes[0].note}</p>
                                                <p className="text-xs">
                                                    by {lead.notes[0].user.firstName} {lead.notes[0].user.lastName} on {formatDate(lead.notes[0].createdAt)}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2 ml-4">
                                        <Button
                                            size="sm"
                                            onClick={() => onCallLog(lead.id)}
                                            className="flex items-center gap-2"
                                        >
                                            <Phone className="h-4 w-4" />
                                            Log Call
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onFollowUp(lead.id)}
                                            className="flex items-center gap-2"
                                        >
                                            <Calendar className="h-4 w-4" />
                                            Follow-up
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onStatusUpdate(lead.id)}
                                            className="flex items-center gap-2"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Update Status
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}

            {leads.length === 0 && !loading && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No leads found</h3>
                        <p className="text-muted-foreground">
                            {searchTerm || statusFilter !== "all"
                                ? "Try adjusting your search or filter criteria."
                                : "You don't have any assigned leads yet."
                            }
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
});
