'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Eye,
    Users,
    MousePointer,
    Calendar,
    Download
} from 'lucide-react';

interface WidgetAnalyticsCardProps {
    widgetId: string;
    analytics: {
        totalViews: number;
        totalSubmissions: number;
        conversionRate: number;
        dailyStats: Array<{
            date: string;
            views: number;
            submissions: number;
        }>;
    };
    onDateRangeChange?: (startDate: Date, endDate: Date) => void;
    className?: string;
}

export function WidgetAnalyticsCard({
    widgetId,
    analytics,
    onDateRangeChange,
    className
}: WidgetAnalyticsCardProps) {
    const [dateRange, setDateRange] = useState('7d');

    const handleDateRangeChange = (range: string) => {
        setDateRange(range);
        const now = new Date();
        let startDate: Date;

        switch (range) {
            case '1d':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        onDateRangeChange?.(startDate, now);
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const getConversionRateColor = (rate: number) => {
        if (rate >= 10) return 'text-green-600';
        if (rate >= 5) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getConversionRateIcon = (rate: number) => {
        if (rate >= 10) return <TrendingUp className="h-4 w-4" />;
        if (rate >= 5) return <TrendingUp className="h-4 w-4" />;
        return <TrendingDown className="h-4 w-4" />;
    };

    // Calculate trends
    const viewsTrend = analytics.dailyStats.length > 1
        ? ((analytics.dailyStats[analytics.dailyStats.length - 1]?.views || 0) -
            (analytics.dailyStats[analytics.dailyStats.length - 2]?.views || 0)) /
        Math.max(analytics.dailyStats[analytics.dailyStats.length - 2]?.views || 1, 1) * 100
        : 0;

    const submissionsTrend = analytics.dailyStats.length > 1
        ? ((analytics.dailyStats[analytics.dailyStats.length - 1]?.submissions || 0) -
            (analytics.dailyStats[analytics.dailyStats.length - 2]?.submissions || 0)) /
        Math.max(analytics.dailyStats[analytics.dailyStats.length - 2]?.submissions || 1, 1) * 100
        : 0;

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5" />
                        <span>Widget Analytics</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                        <Select value={dateRange} onValueChange={handleDateRangeChange}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1d">Last 24h</SelectItem>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                                <SelectItem value="30d">Last 30 days</SelectItem>
                                <SelectItem value="90d">Last 90 days</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <Eye className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">Total Views</span>
                        </div>
                        <div className="mt-2">
                            <div className="text-2xl font-bold text-blue-900">
                                {formatNumber(analytics.totalViews)}
                            </div>
                            <div className="flex items-center space-x-1 mt-1">
                                {viewsTrend >= 0 ? (
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                )}
                                <span className={`text-sm ${viewsTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {Math.abs(viewsTrend).toFixed(1)}%
                                </span>
                                <span className="text-sm text-slate-600">vs previous period</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium text-green-900">Submissions</span>
                        </div>
                        <div className="mt-2">
                            <div className="text-2xl font-bold text-green-900">
                                {formatNumber(analytics.totalSubmissions)}
                            </div>
                            <div className="flex items-center space-x-1 mt-1">
                                {submissionsTrend >= 0 ? (
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                )}
                                <span className={`text-sm ${submissionsTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {Math.abs(submissionsTrend).toFixed(1)}%
                                </span>
                                <span className="text-sm text-slate-600">vs previous period</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <MousePointer className="h-5 w-5 text-purple-600" />
                            <span className="text-sm font-medium text-purple-900">Conversion Rate</span>
                        </div>
                        <div className="mt-2">
                            <div className="text-2xl font-bold text-purple-900">
                                {analytics.conversionRate.toFixed(1)}%
                            </div>
                            <div className="flex items-center space-x-1 mt-1">
                                {getConversionRateIcon(analytics.conversionRate)}
                                <span className={`text-sm ${getConversionRateColor(analytics.conversionRate)}`}>
                                    {analytics.conversionRate >= 10 ? 'Excellent' :
                                        analytics.conversionRate >= 5 ? 'Good' : 'Needs Improvement'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Daily Stats Chart */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Daily Performance</Label>
                        <Badge variant="outline" className="text-xs">
                            {analytics.dailyStats.length} days
                        </Badge>
                    </div>

                    <div className="h-64 bg-slate-50 rounded-lg p-4">
                        <div className="h-full flex items-end space-x-1">
                            {analytics.dailyStats.map((stat, index) => {
                                const maxViews = Math.max(...analytics.dailyStats.map(s => s.views));
                                const maxSubmissions = Math.max(...analytics.dailyStats.map(s => s.submissions));
                                const maxValue = Math.max(maxViews, maxSubmissions);

                                const viewsHeight = (stat.views / maxValue) * 100;
                                const submissionsHeight = (stat.submissions / maxValue) * 100;

                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center space-y-1">
                                        <div className="w-full flex flex-col items-center space-y-1 h-48">
                                            <div
                                                className="w-full bg-blue-200 rounded-t"
                                                style={{ height: `${viewsHeight}%` }}
                                                title={`Views: ${stat.views}`}
                                            />
                                            <div
                                                className="w-full bg-green-200 rounded-t"
                                                style={{ height: `${submissionsHeight}%` }}
                                                title={`Submissions: ${stat.submissions}`}
                                            />
                                        </div>
                                        <div className="text-xs text-slate-600 transform -rotate-45 origin-left">
                                            {new Date(stat.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center justify-center space-x-4 mt-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-blue-200 rounded"></div>
                                <span className="text-xs text-slate-600">Views</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-200 rounded"></div>
                                <span className="text-xs text-slate-600">Submissions</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Insights */}
                <div className="space-y-4">
                    <Label className="text-base font-medium">Performance Insights</Label>
                    <div className="space-y-3">
                        {analytics.conversionRate >= 10 && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-900">Excellent Performance</span>
                                </div>
                                <p className="text-sm text-green-700 mt-1">
                                    Your widget has a conversion rate of {analytics.conversionRate.toFixed(1)}%, which is above average.
                                </p>
                            </div>
                        )}

                        {analytics.conversionRate < 5 && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <TrendingDown className="h-4 w-4 text-yellow-600" />
                                    <span className="text-sm font-medium text-yellow-900">Room for Improvement</span>
                                </div>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Consider optimizing your form design or reducing the number of fields to improve conversion.
                                </p>
                            </div>
                        )}

                        {analytics.totalViews > 0 && analytics.totalSubmissions === 0 && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                    <span className="text-sm font-medium text-red-900">No Submissions</span>
                                </div>
                                <p className="text-sm text-red-700 mt-1">
                                    Your widget is getting views but no submissions. Check for technical issues or form validation problems.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
