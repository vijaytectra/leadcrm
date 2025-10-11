import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock, RotateCcw, CreditCard, Target } from "lucide-react";

interface FinanceStats {
    totalRevenue: number;
    monthlyRevenue: number;
    pendingPayments: number;
    refundRequests: number;
    averageTransactionValue: number;
    conversionRate: number;
}

interface FinanceDashboardStatsProps {
    stats: FinanceStats;
}

export function FinanceDashboardStats({ stats }: FinanceDashboardStatsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatPercentage = (value: number) => {
        return `${(value * 100).toFixed(1)}%`;
    };

    const statCards = [
        {
            title: "Total Revenue",
            value: formatCurrency(stats.totalRevenue),
            description: "All-time revenue",
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Monthly Revenue",
            value: formatCurrency(stats.monthlyRevenue),
            description: "This month",
            icon: TrendingUp,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Pending Payments",
            value: stats.pendingPayments,
            description: "Awaiting processing",
            icon: Clock,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
        },
        {
            title: "Refund Requests",
            value: stats.refundRequests,
            description: "Require attention",
            icon: RotateCcw,
            color: "text-red-600",
            bgColor: "bg-red-50",
        },
        {
            title: "Avg Transaction",
            value: formatCurrency(stats.averageTransactionValue),
            description: "Per transaction",
            icon: CreditCard,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
        {
            title: "Conversion Rate",
            value: formatPercentage(stats.conversionRate),
            description: "Payment success rate",
            icon: Target,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {statCards.map((stat, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            {stat.title}
                        </CardTitle>
                        <div className={`p-2 rounded-full ${stat.bgColor}`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">
                            {stat.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
