"use client";

import { memo, useCallback, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Phone,
    PhoneCall,
    Clock,
    Users,
    TrendingUp,
    Calendar,
    AlertCircle,
    CheckCircle,
    XCircle,
    Activity
} from "lucide-react";
import { LeadQueue } from "./LeadQueue";
import { CallLogs } from "./CallLogs";
import { FollowUpReminders } from "./FollowUpReminders";
import { PerformanceMetrics } from "./PerformanceMetrics";
import { LeadStatusUpdate } from "./LeadStatusUpdate";
import { CallLogForm } from "./CallLogForm";
import { FollowUpForm } from "./FollowUpForm";

interface TelecallerDashboardProps {
    tenantSlug: string;
    initialData?: {
        leadsByStatus: Record<string, number>;
        todayStats: {
            callsMade: number;
            callsAnswered: number;
            callsConverted: number;
            totalDuration: number;
        };
        recentCalls: Array<{
            id: string;
            status: string;
            outcome?: string;
            duration?: number;
            lead: {
                id: string;
                name: string;
                phone?: string;
            };
        }>;
        pendingFollowUps: Array<{
            id: string;
            type: string;
            priority: string;
            scheduledAt: string;
            notes?: string;
            lead: {
                id: string;
                name: string;
                phone?: string;
                status: string;
            };
        }>;
        performanceData: Array<{
            date: string;
            callsMade: number;
            callsAnswered: number;
            callsConverted: number;
            conversionRate: number;
            responseRate: number;
        }>;
    };
}

export const TelecallerDashboard = memo(function TelecallerDashboard({
    tenantSlug,
    initialData
}: TelecallerDashboardProps) {
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedLead, setSelectedLead] = useState<string | null>(null);
    const [showCallLogForm, setShowCallLogForm] = useState(false);
    const [showFollowUpForm, setShowFollowUpForm] = useState(false);
    const [showStatusUpdate, setShowStatusUpdate] = useState(false);

    const handleLeadSelect = useCallback((leadId: string) => {
        setSelectedLead(leadId);
    }, []);

    const handleCallLog = useCallback((leadId: string) => {
        setSelectedLead(leadId);
        setShowCallLogForm(true);
    }, []);

    const handleFollowUp = useCallback((leadId: string) => {
        setSelectedLead(leadId);
        setShowFollowUpForm(true);
    }, []);

    const handleStatusUpdate = useCallback((leadId: string) => {
        setSelectedLead(leadId);
        setShowStatusUpdate(true);
    }, []);

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

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

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "URGENT": return "bg-red-100 text-red-800";
            case "HIGH": return "bg-orange-100 text-orange-800";
            case "MEDIUM": return "bg-yellow-100 text-yellow-800";
            case "LOW": return "bg-green-100 text-green-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    if (!initialData) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Telecaller Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage your leads, track calls, and monitor performance
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setShowCallLogForm(true)}
                        className="flex items-center gap-2"
                    >
                        <Phone className="h-4 w-4" />
                        Log Call
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowFollowUpForm(true)}
                        className="flex items-center gap-2"
                    >
                        <Calendar className="h-4 w-4" />
                        Schedule Follow-up
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Object.values(initialData.leadsByStatus).reduce((sum, count) => sum + count, 0)}
                        </div>
                        <div className="flex gap-2 mt-2">
                            {Object.entries(initialData.leadsByStatus).map(([status, count]) => (
                                <Badge key={status} className={getStatusColor(status)}>
                                    {status}: {count}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today&apos;s Calls</CardTitle>
                        <PhoneCall className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{initialData.todayStats.callsMade}</div>
                        <p className="text-xs text-muted-foreground">
                            {initialData.todayStats.callsAnswered} answered, {initialData.todayStats.callsConverted} converted
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Call Duration</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatDuration(initialData.todayStats.totalDuration)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total time on calls today
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Follow-ups</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{initialData.pendingFollowUps.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Scheduled reminders
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="leads">Lead Queue</TabsTrigger>
                    <TabsTrigger value="calls">Call Logs</TabsTrigger>
                    <TabsTrigger value="followups">Follow-ups</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Calls */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Calls</CardTitle>
                                <CardDescription>Your latest call activities</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {initialData.recentCalls.map((call) => (
                                        <div key={call.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    {call.status === "COMPLETED" ? (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    ) : call.status === "NO_ANSWER" ? (
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                    ) : (
                                                        <Phone className="h-4 w-4 text-blue-500" />
                                                    )}
                                                    <span className="font-medium">{call.lead.name}</span>
                                                </div>
                                                <Badge variant="outline">{call.outcome || call.status}</Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {call.duration ? formatDuration(call.duration) : "N/A"}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pending Follow-ups */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pending Follow-ups</CardTitle>
                                <CardDescription>Upcoming scheduled activities</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {initialData.pendingFollowUps.map((followUp) => (
                                        <div key={followUp.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="font-medium">{followUp.lead.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(followUp.scheduledAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                <Badge className={getPriorityColor(followUp.priority)}>
                                                    {followUp.priority}
                                                </Badge>
                                            </div>
                                            <Badge variant="outline">{followUp.type}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="leads">
                    <LeadQueue
                        tenantSlug={tenantSlug}
                        onLeadSelect={handleLeadSelect}
                        onCallLog={handleCallLog}
                        onFollowUp={handleFollowUp}
                        onStatusUpdate={handleStatusUpdate}
                    />
                </TabsContent>

                <TabsContent value="calls">
                    <CallLogs tenantSlug={tenantSlug} />
                </TabsContent>

                <TabsContent value="followups">
                    <FollowUpReminders
                        tenantSlug={tenantSlug}
                        onFollowUp={handleFollowUp}
                    />
                </TabsContent>

                <TabsContent value="performance">
                    <PerformanceMetrics tenantSlug={tenantSlug} />
                </TabsContent>
            </Tabs>

            {/* Modals */}
            {showCallLogForm && (
                <CallLogForm
                    tenantSlug={tenantSlug}
                    leadId={selectedLead || undefined}
                    onSave={() => {
                        setShowCallLogForm(false);
                        setSelectedLead(null);
                    }}
                    onCancel={() => {
                        setShowCallLogForm(false);
                        setSelectedLead(null);
                    }}
                />
            )}

            {showFollowUpForm && (
                <FollowUpForm
                    tenantSlug={tenantSlug}
                    leadId={selectedLead || undefined}
                    onSave={() => {
                        setShowFollowUpForm(false);
                        setSelectedLead(null);
                    }}
                    onCancel={() => {
                        setShowFollowUpForm(false);
                        setSelectedLead(null);
                    }}
                />
            )}

            {showStatusUpdate && selectedLead && (
                <LeadStatusUpdate
                    tenantSlug={tenantSlug}
                    leadId={selectedLead}
                    leadName=""
                    currentStatus="NEW"
                    onCancel={() => {
                        setShowStatusUpdate(false);
                        setSelectedLead(null);
                    }}
                />
            )}
        </div>
    );
});
