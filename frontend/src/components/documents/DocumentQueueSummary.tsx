import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface QueueSummary {
    urgentDocuments: number;
    normalDocuments: number;
    averageProcessingTime: string;
}

interface DocumentQueueSummaryProps {
    queueSummary: QueueSummary;
}

export function DocumentQueueSummary({ queueSummary }: DocumentQueueSummaryProps) {
    const totalDocuments = queueSummary.urgentDocuments + queueSummary.normalDocuments;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Document Queue Summary
                </CardTitle>
                <CardDescription>
                    Current verification queue status
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Pending</span>
                    <Badge variant="outline" className="text-lg font-semibold">
                        {totalDocuments}
                    </Badge>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="text-sm">Urgent Documents</span>
                        </div>
                        <Badge variant="destructive">
                            {queueSummary.urgentDocuments}
                        </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Normal Documents</span>
                        </div>
                        <Badge variant="secondary">
                            {queueSummary.normalDocuments}
                        </Badge>
                    </div>
                </div>

                <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Avg. Processing Time</span>
                        <span className="text-sm text-muted-foreground">
                            {queueSummary.averageProcessingTime}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
