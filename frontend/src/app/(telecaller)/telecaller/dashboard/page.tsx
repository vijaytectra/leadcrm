import { Suspense } from "react";
import { TelecallerDashboard } from "@/components/telecaller/TelecallerDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { NotificationCenter } from "@/components/communications/NotificationCenter";
import { getTelecallerDashboard } from "@/lib/api/telecaller";


interface TelecallerDashboardPageProps {
    searchParams: Promise<{
        tenant?: string;
    }>;
}

async function getTelecallerDashboardData(tenantSlug: string) {
    try {
        const response = await getTelecallerDashboard(tenantSlug);
        if (!response.success) {
            throw new Error(response.error || "Failed to fetch dashboard data");
        }
        return response.data;
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



export default async function TelecallerDashboardPage({ searchParams }: TelecallerDashboardPageProps) {
    const resolvedSearchParams = await searchParams;
    const tenant = resolvedSearchParams.tenant || "demo-tenant";

    const dashboardData = await getTelecallerDashboardData(tenant);

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

            <TelecallerDashboard
                tenantSlug={tenant}
                initialData={dashboardData}
            />
            <NotificationCenter tenantSlug={tenant} />

        </div>
    );
}
