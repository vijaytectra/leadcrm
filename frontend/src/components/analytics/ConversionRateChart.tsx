'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Users } from 'lucide-react';

interface ConversionData {
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number;
    trends: {
        daily: Array<{ date: string; rate: number }>;
        weekly: Array<{ week: string; rate: number }>;
    };
}

interface ConversionRateChartProps {
    data: ConversionData;
}

export default function ConversionRateChart({ data }: ConversionRateChartProps) {
    const { totalLeads, convertedLeads, conversionRate, trends } = data;

    const getTrendIcon = (currentRate: number, previousRate: number) => {
        if (currentRate > previousRate) {
            return <TrendingUp className="h-4 w-4 text-green-500" />;
        } else if (currentRate < previousRate) {
            return <TrendingDown className="h-4 w-4 text-red-500" />;
        }
        return <Target className="h-4 w-4 text-gray-500" />;
    };

    const getTrendColor = (currentRate: number, previousRate: number) => {
        if (currentRate > previousRate) {
            return 'text-green-600';
        } else if (currentRate < previousRate) {
            return 'text-red-600';
        }
        return 'text-gray-600';
    };

    const weeklyTrend = trends.weekly.length > 1
        ? trends.weekly[trends.weekly.length - 1].rate - trends.weekly[trends.weekly.length - 2].rate
        : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Conversion Rate
                </CardTitle>
                <CardDescription>
                    Track how effectively you're converting leads
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Main Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <div className="text-3xl font-bold text-blue-600">{conversionRate.toFixed(1)}%</div>
                            <div className="text-sm text-muted-foreground">Conversion Rate</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <div className="text-3xl font-bold text-green-600">{convertedLeads}</div>
                            <div className="text-sm text-muted-foreground">Converted Leads</div>
                        </div>
                    </div>

                    {/* Trend Analysis */}
                    <div className="space-y-4">
                        <h4 className="font-medium">Weekly Trend</h4>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {getTrendIcon(conversionRate, conversionRate - weeklyTrend)}
                                <span className="text-sm">Week over week</span>
                            </div>
                            <div className={`text-sm font-medium ${getTrendColor(conversionRate, conversionRate - weeklyTrend)}`}>
                                {weeklyTrend > 0 ? '+' : ''}{weeklyTrend.toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    {/* Weekly Chart */}
                    {trends.weekly.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="font-medium">Weekly Performance</h4>
                            <div className="space-y-2">
                                {trends.weekly.slice(-4).map((week, index) => {
                                    const isLatest = index === trends.weekly.slice(-4).length - 1;
                                    const previousWeek = index > 0 ? trends.weekly.slice(-4)[index - 1] : null;
                                    const weekTrend = previousWeek ? week.rate - previousWeek.rate : 0;

                                    return (
                                        <div key={week.week} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="text-sm font-medium">{week.week}</div>
                                                {isLatest && <Badge variant="default">Latest</Badge>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold">{week.rate.toFixed(1)}%</span>
                                                {previousWeek && (
                                                    <div className={`flex items-center gap-1 text-xs ${getTrendColor(week.rate, previousWeek.rate)}`}>
                                                        {getTrendIcon(week.rate, previousWeek.rate)}
                                                        {weekTrend > 0 ? '+' : ''}{weekTrend.toFixed(1)}%
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Performance Indicators */}
                    <div className="space-y-3">
                        <h4 className="font-medium">Performance Indicators</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                <Users className="h-4 w-4 text-blue-500" />
                                <div>
                                    <div className="text-sm font-medium">{totalLeads}</div>
                                    <div className="text-xs text-muted-foreground">Total Leads</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                <Target className="h-4 w-4 text-green-500" />
                                <div>
                                    <div className="text-sm font-medium">{convertedLeads}</div>
                                    <div className="text-xs text-muted-foreground">Converted</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Conversion Insights */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Conversion Insights</h4>
                        <div className="text-sm text-blue-800">
                            {conversionRate >= 20 ? (
                                <p>🎉 Excellent conversion rate! You're performing above industry average.</p>
                            ) : conversionRate >= 10 ? (
                                <p>👍 Good conversion rate. Consider optimizing your follow-up process.</p>
                            ) : (
                                <p>📈 Your conversion rate has room for improvement. Focus on lead qualification and follow-up.</p>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
