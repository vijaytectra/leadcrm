"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Mail,
    MessageSquare,
    Phone,
    Bell,
    Send,
    Users,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle
} from "lucide-react";
import { EmailTemplateManager } from "./EmailTemplateManager";
import { NotificationCenter } from "./NotificationCenter";
import { CommunicationStats } from "./CommunicationStats";
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

interface CommunicationDashboardProps {
    tenantSlug: string;
}

export function CommunicationDashboard({ tenantSlug }: CommunicationDashboardProps) {
    const [stats, setStats] = useState<CommunicationStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [tenantSlug]);

    const fetchStats = async () => {
        try {
            setLoading(true);

            const data = await apiGetClientNew(`/${tenantSlug}/communications/stats`, { token: getClientToken() || undefined });
            setStats(data as CommunicationStats);
        } catch (error) {
            console.error("Error fetching communication stats:", error);
        } finally {
            setLoading(false);
        }
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
                return <CheckCircle className="h-4 w-4" />;
            case "pending":
            case "processing":
                return <Clock className="h-4 w-4" />;
            case "failed":
                return <XCircle className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Communication Dashboard</h1>
                <p className="text-muted-foreground">
                    Manage emails, SMS, WhatsApp, and notifications for your institution
                </p>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Email Queue</CardTitle>
                            <Mail className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Pending</span>
                                    <span className="text-sm font-medium">{stats.email.pending}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Sent</span>
                                    <span className="text-sm font-medium text-green-600">{stats.email.sent}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Failed</span>
                                    <span className="text-sm font-medium text-red-600">{stats.email.failed}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">SMS Messages</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total</span>
                                    <span className="text-sm font-medium">{stats.sms.total}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Delivered</span>
                                    <span className="text-sm font-medium text-green-600">{stats.sms.delivered}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Failed</span>
                                    <span className="text-sm font-medium text-red-600">{stats.sms.failed}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">WhatsApp Messages</CardTitle>
                            <Phone className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total</span>
                                    <span className="text-sm font-medium">{stats.whatsapp.total}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Read</span>
                                    <span className="text-sm font-medium text-green-600">{stats.whatsapp.read}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Failed</span>
                                    <span className="text-sm font-medium text-red-600">{stats.whatsapp.failed}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                            <Bell className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total</span>
                                    <span className="text-sm font-medium">{stats.notifications.total}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Unread</span>
                                    <span className="text-sm font-medium text-yellow-600">{stats.notifications.unread}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Categories</span>
                                    <span className="text-sm font-medium">{Object.keys(stats.notifications.byCategory).length}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                        Send messages and manage communications
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                            <Mail className="h-6 w-6" />
                            <span>Send Email</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                            <MessageSquare className="h-6 w-6" />
                            <span>Send SMS</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                            <Phone className="h-6 w-6" />
                            <span>Send WhatsApp</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                            <Bell className="h-6 w-6" />
                            <span>Send Notification</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs defaultValue="templates" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="templates">Email Templates</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="stats">Statistics</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="space-y-4">
                    <EmailTemplateManager tenantSlug={tenantSlug} />
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <NotificationCenter tenantSlug={tenantSlug} />
                </TabsContent>

                <TabsContent value="stats" className="space-y-4">
                    <CommunicationStats tenantSlug={tenantSlug} />
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Communication Settings</CardTitle>
                            <CardDescription>
                                Configure communication preferences and integrations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">Email Service</h3>
                                        <p className="text-sm text-muted-foreground">SendGrid integration status</p>
                                    </div>
                                    <Badge variant="outline">Configured</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">SMS Service</h3>
                                        <p className="text-sm text-muted-foreground">Twilio integration status</p>
                                    </div>
                                    <Badge variant="outline">Configured</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">WhatsApp Business</h3>
                                        <p className="text-sm text-muted-foreground">WhatsApp Business API status</p>
                                    </div>
                                    <Badge variant="outline">Configured</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">Real-time Notifications</h3>
                                        <p className="text-sm text-muted-foreground">WebSocket connection status</p>
                                    </div>
                                    <Badge variant="outline">Active</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
