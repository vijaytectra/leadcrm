"use client";

import { memo, useCallback, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    TrendingUp,
    TrendingDown,
    Phone,
    Clock,
    Target,
    BarChart3,
    Activity,
    CheckCircle,
    XCircle,
    AlertCircle
} from "lucide-react";

interface PerformanceData {
    period: string;
    metrics: {
        totalCalls: number;
        answeredCalls: number;
        convertedCalls: number;
        totalDuration: number;
        avgCallDuration: number;
        conversionRate: number;
        responseRate: number;
    };
    performanceData: Array<{
        date: string;
        callsMade: number;
        callsAnswered: number;
        callsConverted: number;
        conversionRate: number;
        responseRate: number;
    }>;
    callLogs: Array<{
        status: string;
        outcome?: string;
        duration?: number;
        createdAt: string;
    }>;
}

interface PerformanceMetricsProps {
    tenantSlug: string;
}

export const PerformanceMetrics = memo(function PerformanceMetrics({
    tenantSlug
}: PerformanceMetricsProps) {
    const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<string>("7d");

    const fetchPerformanceData = useCallback(async () => {
        try {
            setLoading(true);
            // This would be replaced with actual API call
            // const response = await getPerformanceMetrics(tenantSlug, { period });
            // For now, using mock data
            setPerformanceData(null);
        } catch (error) {
            console.error("Failed to fetch performance data:", error);
        } finally {
            setLoading(false);
        }
    }, [tenantSlug, period]);

    useEffect(() => {
        fetchPerformanceData();
    }, [fetchPerformanceData]);

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        } else {
            return `${remainingSeconds}s`;
        }
    };

    const getTrendIcon = (current: number, previous: number) => {
        if (current > previous) {
            return <TrendingUp className="h-4 w-4 text-green-500" />;
        } else if (current < previous) {
            return <TrendingDown className="h-4 w-4 text-red-500" />;
        } else {
            return <Activity className="h-4 w-4 text-gray-500" />;
        }
    };

    const getTrendColor = (current: number, previous: number) => {
        if (current > previous) {
            return "text-green-600";
        } else if (current < previous) {
            return "text-red-600";
        } else {
            return "text-gray-600";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading performance metrics...</p>
                </div>
            </div>
        );
    }

    if (!performanceData) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No performance data available</h3>
                    <p className="text-muted-foreground">
                        Start making calls to see your performance metrics here.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Period Selector */}
            <Card>
                <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>Track your calling performance and improvements</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">Period:</span>
                        <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1d">Last 24 Hours</SelectItem>
                                <SelectItem value="7d">Last 7 Days</SelectItem>
                                <SelectItem value="30d">Last 30 Days</SelectItem>
                                <SelectItem value="90d">Last 90 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                        <Phone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{performanceData.metrics.totalCalls}</div>
                        <p className="text-xs text-muted-foreground">
                            Calls made in selected period
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{performanceData.metrics.responseRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            {performanceData.metrics.answeredCalls} of {performanceData.metrics.totalCalls} calls answered
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{performanceData.metrics.conversionRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            {performanceData.metrics.convertedCalls} leads converted
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Call Duration</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatDuration(performanceData.metrics.avgCallDuration)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Average time per call
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Call Volume Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Call Volume Trend</CardTitle>
                        <CardDescription>Daily call activity over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {performanceData.performanceData.map((day, index) => (
                                <div key={day.date} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                        <span className="text-sm font-medium">
                                            {new Date(day.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-sm font-medium">{day.callsMade} calls</div>
                                            <div className="text-xs text-muted-foreground">
                                                {day.callsAnswered} answered ({day.responseRate.toFixed(1)}%)
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-green-600">
                                                {day.callsConverted} converted
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {day.conversionRate.toFixed(1)}% rate
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Summary</CardTitle>
                        <CardDescription>Key performance indicators</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Total Call Time</span>
                                <span className="text-sm font-bold">
                                    {formatDuration(performanceData.metrics.totalDuration)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Answered Calls</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold">{performanceData.metrics.answeredCalls}</span>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Converted Leads</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold">{performanceData.metrics.convertedCalls}</span>
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">No Answer Calls</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold">
                                        {performanceData.metrics.totalCalls - performanceData.metrics.answeredCalls}
                                    </span>
                                    <XCircle className="h-4 w-4 text-red-500" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Call Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Call Activity</CardTitle>
                    <CardDescription>Your latest call outcomes and performance</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {performanceData.callLogs.slice(0, 10).map((call, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    {call.status === "COMPLETED" ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : call.status === "NO_ANSWER" ? (
                                        <XCircle className="h-4 w-4 text-red-500" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                                    )}
                                    <div>
                                        <div className="font-medium">{call.status}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {call.outcome && `Outcome: ${call.outcome}`}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium">
                                        {call.duration ? formatDuration(call.duration) : "N/A"}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(call.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});
