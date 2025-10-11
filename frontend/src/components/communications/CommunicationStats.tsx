"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Mail,
    MessageSquare,
    Phone,
    Bell,
    TrendingUp,
    TrendingDown,
    Activity,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle
} from "lucide-react";
import { apiGetClientNew } from "@/lib/utils";
import { getClientToken } from "@/lib/client-token";

interface CommunicationStats {
    email: {
        pending: number;
        processing: number;
        sent: number;
        failed: number;
    };
    sms: {
        total: number;
        sent: number;
        delivered: number;
        failed: number;
        pending: number;
    };
    whatsapp: {
        total: number;
        sent: number;
        delivered: number;
        read: number;
        failed: number;
    };
    notifications: {
        total: number;
        unread: number;
        byType: Record<string, number>;
        byCategory: Record<string, number>;
    };
}

interface CommunicationStatsProps {
    tenantSlug: string;
}

export function CommunicationStats({ tenantSlug }: CommunicationStatsProps) {
    const [stats, setStats] = useState<CommunicationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("7d");

    useEffect(() => {
        fetchStats();
    }, [tenantSlug, timeRange]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (timeRange !== "all") {
                const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - days);
                params.append("startDate", startDate.toISOString());
            }

           const data=await apiGetClientNew(`/${tenantSlug}/communications/stats?${params}`, { token: getClientToken() || undefined });
            setStats(data as CommunicationStats);
        } catch (error) {
            console.error("Error fetching communication stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const getSuccessRate = (sent: number, failed: number) => {
        const total = sent + failed;
        return total > 0 ? Math.round((sent / total) * 100) : 0;
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "sent":
            case "delivered":
            case "read":
                return "text-green-600";
            case "pending":
            case "processing":
                return "text-yellow-600";
            case "failed":
                return "text-red-600";
            default:
                return "text-gray-600";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "sent":
            case "delivered":
            case "read":
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case "pending":
            case "processing":
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case "failed":
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-600" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No data available</h3>
                <p className="text-muted-foreground">Communication statistics will appear here</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Communication Statistics</h2>
                    <p className="text-muted-foreground">
                        Track the performance of your communication channels
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant={timeRange === "7d" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimeRange("7d")}
                    >
                        7 Days
                    </Button>
                    <Button
                        variant={timeRange === "30d" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimeRange("30d")}
                    >
                        30 Days
                    </Button>
                    <Button
                        variant={timeRange === "90d" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimeRange("90d")}
                    >
                        90 Days
                    </Button>
                    <Button
                        variant={timeRange === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimeRange("all")}
                    >
                        All Time
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="sms">SMS</TabsTrigger>
                    <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Communications</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.email.sent + stats.sms.sent + stats.whatsapp.sent + stats.notifications.total}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Across all channels
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {getSuccessRate(
                                        stats.email.sent + stats.sms.delivered + stats.whatsapp.delivered,
                                        stats.email.failed + stats.sms.failed + stats.whatsapp.failed
                                    )}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Successful deliveries
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.email.pending + stats.email.processing + stats.sms.pending}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    In queue
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                                <Bell className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.notifications.total}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.notifications.unread} unread
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Channel Performance */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Mail className="h-5 w-5" />
                                    <span>Email</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Sent</span>
                                        <span className="text-sm font-medium">{stats.email.sent}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Failed</span>
                                        <span className="text-sm font-medium text-red-600">{stats.email.failed}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Pending</span>
                                        <span className="text-sm font-medium text-yellow-600">{stats.email.pending}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <MessageSquare className="h-5 w-5" />
                                    <span>SMS</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Delivered</span>
                                        <span className="text-sm font-medium text-green-600">{stats.sms.delivered}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Failed</span>
                                        <span className="text-sm font-medium text-red-600">{stats.sms.failed}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Pending</span>
                                        <span className="text-sm font-medium text-yellow-600">{stats.sms.pending}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Phone className="h-5 w-5" />
                                    <span>WhatsApp</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Read</span>
                                        <span className="text-sm font-medium text-green-600">{stats.whatsapp.read}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Delivered</span>
                                        <span className="text-sm font-medium">{stats.whatsapp.delivered}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Failed</span>
                                        <span className="text-sm font-medium text-red-600">{stats.whatsapp.failed}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="email" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Statistics</CardTitle>
                            <CardDescription>
                                Detailed email delivery statistics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{stats.email.sent}</div>
                                    <div className="text-sm text-muted-foreground">Sent</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{stats.email.pending}</div>
                                    <div className="text-sm text-muted-foreground">Pending</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{stats.email.processing}</div>
                                    <div className="text-sm text-muted-foreground">Processing</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{stats.email.failed}</div>
                                    <div className="text-sm text-muted-foreground">Failed</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sms" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>SMS Statistics</CardTitle>
                            <CardDescription>
                                SMS delivery and performance metrics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{stats.sms.total}</div>
                                    <div className="text-sm text-muted-foreground">Total</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{stats.sms.delivered}</div>
                                    <div className="text-sm text-muted-foreground">Delivered</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{stats.sms.pending}</div>
                                    <div className="text-sm text-muted-foreground">Pending</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{stats.sms.failed}</div>
                                    <div className="text-sm text-muted-foreground">Failed</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="whatsapp" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>WhatsApp Statistics</CardTitle>
                            <CardDescription>
                                WhatsApp message delivery and engagement
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{stats.whatsapp.total}</div>
                                    <div className="text-sm text-muted-foreground">Total</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{stats.whatsapp.read}</div>
                                    <div className="text-sm text-muted-foreground">Read</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{stats.whatsapp.delivered}</div>
                                    <div className="text-sm text-muted-foreground">Delivered</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{stats.whatsapp.failed}</div>
                                    <div className="text-sm text-muted-foreground">Failed</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
