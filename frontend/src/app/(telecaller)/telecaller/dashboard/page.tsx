import { Suspense } from "react";
import { TelecallerDashboard } from "@/components/telecaller/TelecallerDashboard";
import { Card, CardContent } from "@/components/ui/card";


interface TelecallerDashboardPageProps {
    searchParams: Promise<{
        tenant?: string;
    }>;
}

async function getTelecallerDashboardData() {
    try {
        // This would be replaced with actual API call
        // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${tenantSlug}/telecaller/dashboard`, {
        //   headers: {
        //     'Authorization': `Bearer ${token}`,
        //   },
        // });
        // return await response.json();

        // Mock data for now
        return {
            leadsByStatus: {
                NEW: 5,
                CONTACTED: 8,
                QUALIFIED: 3,
                INTERESTED: 2,
                LOST: 1
            },
            todayStats: {
                callsMade: 12,
                callsAnswered: 8,
                callsConverted: 3,
                totalDuration: 3600 // 1 hour in seconds
            },
            recentCalls: [
                {
                    id: "1",
                    status: "COMPLETED",
                    outcome: "INTERESTED",
                    duration: 300,
                    lead: {
                        id: "1",
                        name: "John Doe",
                        phone: "+1234567890"
                    }
                },
                {
                    id: "2",
                    status: "NO_ANSWER",
                    duration: 0,
                    lead: {
                        id: "2",
                        name: "Jane Smith",
                        phone: "+0987654321"
                    }
                }
            ],
            pendingFollowUps: [
                {
                    id: "1",
                    type: "CALL",
                    priority: "HIGH",
                    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
                    notes: "Follow up on application status",
                    lead: {
                        id: "1",
                        name: "John Doe",
                        phone: "+1234567890",
                        status: "INTERESTED"
                    }
                }
            ],
            performanceData: [
                {
                    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                    callsMade: 8,
                    callsAnswered: 6,
                    callsConverted: 2,
                    conversionRate: 33.3,
                    responseRate: 75.0
                },
                {
                    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    callsMade: 10,
                    callsAnswered: 7,
                    callsConverted: 3,
                    conversionRate: 42.9,
                    responseRate: 70.0
                }
            ]
        };
    } catch (error) {
        console.error("Failed to fetch telecaller dashboard data:", error);
        return null;
    }
}

function TelecallerDashboardSkeleton() {
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

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, j) => (
                                    <div key={j} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default async function TelecallerDashboardPage({ searchParams }: TelecallerDashboardPageProps) {
    const resolvedSearchParams = await searchParams;
    const tenant = resolvedSearchParams.tenant || "demo-tenant";

    const dashboardData = await getTelecallerDashboardData();

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
            <Suspense fallback={<TelecallerDashboardSkeleton />}>
                <TelecallerDashboard
                    tenantSlug={tenant}
                    initialData={dashboardData}
                />
            </Suspense>
        </div>
    );
}
