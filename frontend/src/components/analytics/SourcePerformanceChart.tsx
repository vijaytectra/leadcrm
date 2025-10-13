'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Users, Target } from 'lucide-react';

interface SourcePerformance {
    source: string;
    total: number;
    converted: number;
    conversionRate: number;
}

interface SourcePerformanceChartProps {
    data: SourcePerformance[];
}

const sourceConfig = {
    GOOGLE_ADS: { label: 'Google Ads', color: 'bg-blue-500', icon: '🔍' },
    META: { label: 'Meta (Facebook/Instagram)', color: 'bg-blue-600', icon: '📘' },
    LINKEDIN: { label: 'LinkedIn', color: 'bg-blue-700', icon: '💼' },
    WEBSITE: { label: 'Website', color: 'bg-green-500', icon: '🌐' },
    REFERRAL: { label: 'Referral', color: 'bg-purple-500', icon: '👥' },
    UNKNOWN: { label: 'Unknown', color: 'bg-gray-500', icon: '❓' },
};

export default function SourcePerformanceChart({ data }: SourcePerformanceChartProps) {
    const totalLeads = data.reduce((sum, source) => sum + source.total, 0);
    const totalConverted = data.reduce((sum, source) => sum + source.converted, 0);
    const overallConversionRate = totalLeads > 0 ? (totalConverted / totalLeads) * 100 : 0;

    const sortedData = [...data].sort((a, b) => b.total - a.total);
    const bestPerforming = sortedData.reduce((best, current) =>
        current.conversionRate > best.conversionRate ? current : best
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Source Performance
                </CardTitle>
                <CardDescription>
                    Compare lead sources by volume and conversion rate
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Overall Metrics */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{totalLeads}</div>
                            <div className="text-sm text-muted-foreground">Total Leads</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{totalConverted}</div>
                            <div className="text-sm text-muted-foreground">Converted</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{overallConversionRate.toFixed(1)}%</div>
                            <div className="text-sm text-muted-foreground">Avg Conversion</div>
                        </div>
                    </div>

                    {/* Best Performing Source */}
                    {bestPerforming && (
                        <div className="p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-green-900">Best Performing Source</span>
                            </div>
                            <div className="text-sm text-green-800">
                                <strong>{sourceConfig[bestPerforming.source as keyof typeof sourceConfig]?.label || bestPerforming.source}</strong>
                                {' '}with {bestPerforming.conversionRate.toFixed(1)}% conversion rate
                            </div>
                        </div>
                    )}

                    {/* Source Breakdown */}
                    <div className="space-y-4">
                        <h4 className="font-medium">Source Breakdown</h4>
                        <div className="space-y-3">
                            {sortedData.map((source) => {
                                const config = sourceConfig[source.source as keyof typeof sourceConfig];
                                const percentage = totalLeads > 0 ? (source.total / totalLeads) * 100 : 0;
                                const isAboveAverage = source.conversionRate > overallConversionRate;

                                return (
                                    <div key={source.source} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">{config?.icon || '📊'}</span>
                                                <div>
                                                    <div className="font-medium">
                                                        {config?.label || source.source}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {source.total} leads ({percentage.toFixed(1)}%)
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold">{source.conversionRate.toFixed(1)}%</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {source.converted} converted
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span>Volume</span>
                                                <span>{percentage.toFixed(1)}%</span>
                                            </div>
                                            <Progress value={percentage} className="h-2" />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {isAboveAverage ? (
                                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                                ) : (
                                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    {isAboveAverage ? 'Above' : 'Below'} average
                                                </span>
                                            </div>
                                            <Badge
                                                variant={isAboveAverage ? 'default' : 'secondary'}
                                                className="text-xs"
                                            >
                                                {source.conversionRate > overallConversionRate ? 'High' : 'Low'} Performance
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Performance Insights */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Performance Insights</h4>
                        <div className="text-sm text-blue-800 space-y-1">
                            {sortedData.length > 0 && (
                                <p>
                                    <strong>{sourceConfig[sortedData[0].source as keyof typeof sourceConfig]?.label || sortedData[0].source}</strong>
                                    {' '}generates the most leads ({sortedData[0].total}).
                                </p>
                            )}
                            {bestPerforming && bestPerforming.source !== sortedData[0]?.source && (
                                <p>
                                    <strong>{sourceConfig[bestPerforming.source as keyof typeof sourceConfig]?.label || bestPerforming.source}</strong>
                                    {' '}has the highest conversion rate ({bestPerforming.conversionRate.toFixed(1)}%).
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
