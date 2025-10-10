import { Suspense } from "react";
import { CallLogs } from "@/components/telecaller/CallLogs";
import { Card, CardContent } from "@/components/ui/card";

interface TelecallerCallsPageProps {

    searchParams: Promise<{
        tenant?: string;
        page?: string;
        limit?: string;
        status?: string;
        outcome?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: string;
    }>;
}

async function getTelecallerCallLogsData(tenantSlug: string, searchParams: {
    page?: string;
    limit?: string;
    status?: string;
    outcome?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
}) {
    try {
        // This would be replaced with actual API call
        // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${tenantSlug}/telecaller/call-logs?${new URLSearchParams(searchParams)}`, {
        //   headers: {
        //     'Authorization': `Bearer ${token}`,
        //   },
        // });
        // return await response.json();

        // Mock data for now
        return {
            callLogs: [
                {
                    id: "1",
                    callType: "OUTBOUND",
                    status: "COMPLETED",
                    outcome: "INTERESTED",
                    duration: 300,
                    notes: "Student showed interest in Computer Science program",
                    recordingUrl: "https://example.com/recording1.mp3",
                    recordingId: "rec_123",
                    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    lead: {
                        id: "1",
                        name: "John Doe",
                        phone: "+1234567890",
                        status: "INTERESTED"
                    }
                },
                {
                    id: "2",
                    callType: "OUTBOUND",
                    status: "COMPLETED",
                    outcome: "QUALIFIED",
                    duration: 450,
                    notes: "Qualified for admission, scheduled follow-up call",
                    recordingUrl: "https://example.com/recording2.mp3",
                    recordingId: "rec_124",
                    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    lead: {
                        id: "2",
                        name: "Jane Smith",
                        phone: "+0987654321",
                        status: "QUALIFIED"
                    }
                },
                {
                    id: "3",
                    callType: "INBOUND",
                    status: "COMPLETED",
                    outcome: "CALLBACK_REQUESTED",
                    duration: 180,
                    notes: "Student requested callback for more information",
                    recordingUrl: null,
                    recordingId: null,
                    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    lead: {
                        id: "3",
                        name: "Mike Johnson",
                        phone: "+1122334455",
                        status: "CONTACTED"
                    }
                }
            ],
            pagination: {
                page: parseInt(searchParams.page || "1"),
                limit: parseInt(searchParams.limit || "20"),
                total: 3,
                pages: 1
            }
        };
    } catch (error) {
        console.error("Failed to fetch telecaller call logs data:", error);
        return null;
    }
}

function TelecallerCallsSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                    <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>

            {/* Filters Skeleton */}
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Call Logs List Skeleton */}
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default async function TelecallerCallsPage({ searchParams }: TelecallerCallsPageProps) {
    const resolvedSearchParams = await searchParams;
    const tenant = resolvedSearchParams.tenant || "demo-tenant";

    const callLogsData = await getTelecallerCallLogsData(tenant, resolvedSearchParams);

    if (!callLogsData) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center text-gray-500">
                    Failed to load call logs data
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <Suspense fallback={<TelecallerCallsSkeleton />}>
                <CallLogs
                    tenantSlug={tenant}
                />
            </Suspense>
        </div>
    );
}
