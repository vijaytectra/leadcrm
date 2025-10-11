import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Users,
    FileText,
    CheckCircle,
    Calendar,
    TrendingUp,
    Clock
} from "lucide-react";
import { AdmissionDashboardStats, AdmissionReview } from "@/lib/api/admissions";

interface AdmissionTeamDashboardProps {
    stats: AdmissionDashboardStats;
    recentReviews: AdmissionReview[];
}

export function AdmissionTeamDashboard({ stats, recentReviews }: AdmissionTeamDashboardProps) {
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalApplications}</div>
                        <p className="text-xs text-muted-foreground">
                            All applications in system
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.pendingReviews}</div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting review
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Reviews</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.completedReviews}</div>
                        <p className="text-xs text-muted-foreground">
                            Reviews completed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.todayAppointments}</div>
                        <p className="text-xs text-muted-foreground">
                            Scheduled for today
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Reviews */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Recent Reviews
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {recentReviews.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            No recent reviews found
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentReviews.map((review) => (
                                <div key={review.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {review.application?.studentName}
                                            </span>
                                            <Badge variant={
                                                review.status === 'COMPLETED' ? 'default' :
                                                    review.status === 'APPROVED' ? 'default' :
                                                        review.status === 'REJECTED' ? 'destructive' :
                                                            'secondary'
                                            }>
                                                {review.status}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Course: {review.application?.course}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Reviewed by: {review.reviewer?.firstName} {review.reviewer?.lastName}
                                        </div>
                                    </div>
                                    <div className="text-right text-sm text-muted-foreground">
                                        {new Date(review.updatedAt).toLocaleDateString()}
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
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <FileText className="h-6 w-6" />
                            <span>Review Applications</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <Calendar className="h-6 w-6" />
                            <span>Schedule Counseling</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <Users className="h-6 w-6" />
                            <span>Bulk Communications</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
