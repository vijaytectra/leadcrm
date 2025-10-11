import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentVerificationStats } from "@/components/documents/DocumentVerificationStats";
import { DocumentQueueSummary } from "@/components/documents/DocumentQueueSummary";
import { RecentVerifications } from "@/components/documents/RecentVerifications";

interface DocumentVerifierDashboardPageProps {
    searchParams: Promise<{
        tenant?: string;
    }>;
}

async function getDocumentVerifierDashboardData(tenantSlug: string) {
    try {
        // This would be replaced with actual API calls
        // For now, returning mock data structure
        return {
            stats: {
                totalDocuments: 156,
                pendingVerification: 23,
                verifiedToday: 12,
                rejectedToday: 3,
            },
            queueSummary: {
                urgentDocuments: 5,
                normalDocuments: 18,
                averageProcessingTime: "2.5 hours",
            },
            recentVerifications: [
                {
                    id: "1",
                    fileName: "passport.pdf",
                    studentName: "John Doe",
                    status: "VERIFIED" as const,
                    verifiedAt: new Date().toISOString(),
                    verifierName: "Jane Smith",
                },
                {
                    id: "2",
                    fileName: "transcript.pdf",
                    studentName: "Alice Johnson",
                    status: "REJECTED" as const,
                    verifiedAt: new Date().toISOString(),
                    verifierName: "Jane Smith",
                    rejectionReason: "Document quality too low",
                },
            ],
        };
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return null;
    }
}

function DocumentVerifierDashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <CardTitle>
                                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Array.from({ length: 3 }).map((_, j) => (
                                    <div key={j} className="h-4 bg-gray-200 rounded animate-pulse" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default async function DocumentVerifierDashboardPage({
    searchParams
}: DocumentVerifierDashboardPageProps) {
    const resolvedSearchParams = await searchParams;
    const tenant = resolvedSearchParams.tenant || "demo-tenant";

    const dashboardData = await getDocumentVerifierDashboardData(tenant);

    if (!dashboardData) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center text-gray-500">
                    Failed to load dashboard data
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Document Verification Dashboard</h1>
                <p className="text-muted-foreground">
                    Monitor and manage document verification workflow
                </p>
            </div>

            <Suspense fallback={<DocumentVerifierDashboardSkeleton />}>
                <DocumentVerificationStats stats={dashboardData.stats} />
                <div className="grid gap-4 md:grid-cols-2">
                    <DocumentQueueSummary queueSummary={dashboardData.queueSummary} />
                    <RecentVerifications recentVerifications={dashboardData.recentVerifications} />
                </div>
            </Suspense>
        </div>
    );
}
