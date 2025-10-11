import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RecentVerification {
    id: string;
    fileName: string;
    studentName: string;
    status: "VERIFIED" | "REJECTED" | "PENDING";
    verifiedAt: string;
    verifierName: string;
    rejectionReason?: string;
}

interface RecentVerificationsProps {
    recentVerifications: RecentVerification[];
}

export function RecentVerifications({ recentVerifications }: RecentVerificationsProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case "VERIFIED":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "REJECTED":
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "VERIFIED":
                return <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>;
            case "REJECTED":
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="secondary">Pending</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent Verifications
                </CardTitle>
                <CardDescription>
                    Latest document verification activities
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recentVerifications.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            No recent verifications
                        </div>
                    ) : (
                        recentVerifications.map((verification) => (
                            <div key={verification.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                                <div className="flex-shrink-0 mt-1">
                                    {getStatusIcon(verification.status)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {verification.fileName}
                                        </p>
                                        {getStatusBadge(verification.status)}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Student: {verification.studentName}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Verified by {verification.verifierName} • {" "}
                                        {formatDistanceToNow(new Date(verification.verifiedAt), { addSuffix: true })}
                                    </p>
                                    {verification.rejectionReason && (
                                        <p className="text-xs text-red-600 mt-1">
                                            Reason: {verification.rejectionReason}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
