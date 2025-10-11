"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface PaymentStatusData {
    completed: number;
    pending: number;
    failed: number;
}

interface PaymentStatusDistributionProps {
    data: PaymentStatusData;
}

export function PaymentStatusDistribution({ data }: PaymentStatusDistributionProps) {
    const chartData = [
        { name: 'Completed', value: data.completed, color: '#10b981' },
        { name: 'Pending', value: data.pending, color: '#f59e0b' },
        { name: 'Failed', value: data.failed, color: '#ef4444' },
    ];

    const total = data.completed + data.pending + data.failed;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Status Distribution</CardTitle>
                <CardDescription>
                    Breakdown of payment statuses
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => [`${value}%`, 'Percentage']}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    {chartData.map((item) => (
                        <div key={item.name} className="space-y-1">
                            <div
                                className="w-3 h-3 rounded-full mx-auto"
                                style={{ backgroundColor: item.color }}
                            />
                            <div className="text-sm font-medium">{item.name}</div>
                            <div className="text-lg font-bold">{item.value}%</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
