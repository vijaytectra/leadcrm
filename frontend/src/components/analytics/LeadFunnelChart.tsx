'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingDown, Users, UserCheck, UserX } from 'lucide-react';

interface FunnelStage {
    stage: string;
    count: number;
    percentage: number;
    dropOffRate: number;
}

interface LeadFunnelChartProps {
    data: FunnelStage[];
}

const stageConfig = {
    NEW: { label: 'New Leads', icon: Users, color: 'bg-blue-500' },
    CONTACTED: { label: 'Contacted', icon: UserCheck, color: 'bg-yellow-500' },
    QUALIFIED: { label: 'Qualified', icon: TrendingDown, color: 'bg-orange-500' },
    CONVERTED: { label: 'Converted', icon: UserCheck, color: 'bg-green-500' },
};

export default function LeadFunnelChart({ data }: LeadFunnelChartProps) {
    const totalLeads = data[0]?.count || 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Lead Funnel</CardTitle>
                <CardDescription>
                    Track leads through each stage of your sales process
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {data.map((stage, index) => {
                        const config = stageConfig[stage.stage as keyof typeof stageConfig];
                        const Icon = config?.icon || Users;
                        const isLastStage = index === data.length - 1;
                        const nextStage = data[index + 1];
                        const conversionRate = nextStage
                            ? ((nextStage.count / stage.count) * 100)
                            : 100;

                        return (
                            <div key={stage.stage} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${config?.color || 'bg-gray-500'}`}>
                                            <Icon className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{config?.label || stage.stage}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {stage.count} leads ({stage.percentage.toFixed(1)}%)
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">{stage.count}</div>
                                        {!isLastStage && (
                                            <div className="text-sm text-muted-foreground">
                                                {conversionRate.toFixed(1)}% continue
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Progress</span>
                                        <span>{stage.percentage.toFixed(1)}%</span>
                                    </div>
                                    <Progress value={stage.percentage} className="h-2" />
                                </div>

                                {!isLastStage && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {stage.dropOffRate.toFixed(1)}% drop-off rate
                                        </span>
                                        <Badge variant="outline" className="text-xs">
                                            {stage.count - (nextStage?.count || 0)} lost
                                        </Badge>
                                    </div>
                                )}

                                {index < data.length - 1 && (
                                    <div className="flex justify-center">
                                        <div className="w-px h-6 bg-border"></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {totalLeads > 0 && (
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {data[data.length - 1]?.count || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">Total Conversions</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {((data[data.length - 1]?.count || 0) / totalLeads * 100).toFixed(1)}%
                                </div>
                                <div className="text-sm text-muted-foreground">Overall Conversion Rate</div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
