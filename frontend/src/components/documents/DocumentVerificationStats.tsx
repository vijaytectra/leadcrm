import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react";

interface DocumentStats {
    totalDocuments: number;
    pendingVerification: number;
    verifiedToday: number;
    rejectedToday: number;
}

interface DocumentVerificationStatsProps {
    stats: DocumentStats;
}

export function DocumentVerificationStats({ stats }: DocumentVerificationStatsProps) {
    const statCards = [
        {
            title: "Total Documents",
            value: stats.totalDocuments,
            description: "All documents in system",
            icon: FileText,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Pending Verification",
            value: stats.pendingVerification,
            description: "Awaiting review",
            icon: Clock,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
        },
        {
            title: "Verified Today",
            value: stats.verifiedToday,
            description: "Successfully verified",
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Rejected Today",
            value: stats.rejectedToday,
            description: "Require resubmission",
            icon: XCircle,
            color: "text-red-600",
            bgColor: "bg-red-50",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
