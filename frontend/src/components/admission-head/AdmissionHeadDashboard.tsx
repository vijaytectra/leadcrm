import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Users,
    FileText,
    CheckCircle,
    TrendingUp,
    Clock,
    Target,
    Award,
    BarChart3
} from "lucide-react";
import { AdmissionHeadStats } from "@/lib/api/admissions";

interface AdmissionHeadDashboardProps {
    stats: AdmissionHeadStats;
    teamPerformance: Array<{
        reviewerId: string;
        _count: { id: number };
        _avg: { academicScore: number | null };
    }>;
}

export function AdmissionHeadDashboard({ stats, teamPerformance }: AdmissionHeadDashboardProps) {
    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalApplications}</div>
                        <p className="text-xs text-muted-foreground">
                            All applications received
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting your decision
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.approvedApplications}</div>
                        <p className="text-xs text-muted-foreground">
                            Applications approved
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.conversionRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            Application to approval
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Offer Letter Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Offer Letters Generated</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.offerLettersGenerated}</div>
                        <p className="text-xs text-muted-foreground">
                            Total generated
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Offer Letters Sent</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.offerLettersSent}</div>
                        <p className="text-xs text-muted-foreground">
                            Successfully sent
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.offerAcceptanceRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            Offers accepted
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Team Performance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Team Performance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {teamPerformance.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            No team performance data available
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {teamPerformance.map((member) => (
                                <div key={member.reviewerId} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-1">
                                        <div className="font-medium">Team Member {member.reviewerId.slice(-4)}</div>
                                        <div className="text-sm text-muted-foreground">
                                            Reviews completed: {member._count.id}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">
                                            {member._avg.academicScore ? Math.round(member._avg.academicScore) : 'N/A'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Avg Score</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <FileText className="h-6 w-6" />
                            <span>Review Approvals</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <Users className="h-6 w-6" />
                            <span>Generate Offers</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <TrendingUp className="h-6 w-6" />
                            <span>View Reports</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <BarChart3 className="h-6 w-6" />
                            <span>Team Analytics</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="p-2 bg-green-100 rounded-full">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <div className="font-medium">5 applications approved</div>
                                <div className="text-sm text-muted-foreground">2 hours ago</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="p-2 bg-blue-100 rounded-full">
                                <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <div className="font-medium">3 offer letters generated</div>
                                <div className="text-sm text-muted-foreground">4 hours ago</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="p-2 bg-purple-100 rounded-full">
                                <TrendingUp className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <div className="font-medium">Monthly report generated</div>
                                <div className="text-sm text-muted-foreground">1 day ago</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
