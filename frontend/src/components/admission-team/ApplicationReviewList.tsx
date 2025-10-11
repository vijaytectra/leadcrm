import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    Filter,
    Eye,
    FileText,
    Clock,
    CheckCircle,
    XCircle
} from "lucide-react";
import { Application } from "@/lib/api/admissions";

interface ApplicationReviewListProps {
    applications: Application[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

function ApplicationCard({ application }: { application: Application }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUBMITTED':
                return 'bg-blue-100 text-blue-800';
            case 'UNDER_REVIEW':
                return 'bg-yellow-100 text-yellow-800';
            case 'DOCUMENTS_VERIFIED':
                return 'bg-green-100 text-green-800';
            case 'PAYMENT_COMPLETED':
                return 'bg-purple-100 text-purple-800';
            case 'ADMITTED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            case 'ENROLLED':
                return 'bg-emerald-100 text-emerald-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getReviewStatus = () => {
        if (application.admissionReview) {
            switch (application.admissionReview.status) {
                case 'COMPLETED':
                    return { icon: CheckCircle, color: 'text-green-600', text: 'Review Complete' };
                case 'IN_REVIEW':
                    return { icon: Clock, color: 'text-yellow-600', text: 'Under Review' };
                case 'APPROVED':
                    return { icon: CheckCircle, color: 'text-green-600', text: 'Approved' };
                case 'REJECTED':
                    return { icon: XCircle, color: 'text-red-600', text: 'Rejected' };
                default:
                    return { icon: Clock, color: 'text-gray-600', text: 'Pending Review' };
            }
        }
        return { icon: Clock, color: 'text-gray-600', text: 'No Review' };
    };

    const reviewStatus = getReviewStatus();
    const StatusIcon = reviewStatus.icon;

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-lg">{application.studentName}</CardTitle>
                        <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(application.status)}>
                                {application.status.replace('_', ' ')}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <StatusIcon className={`h-4 w-4 ${reviewStatus.color}`} />
                                <span>{reviewStatus.text}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                        {new Date(application.submittedAt).toLocaleDateString()}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground">Course:</span>
                        <p className="font-medium">{application.course || 'Not specified'}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-medium">{application.studentEmail || 'Not provided'}</p>
                    </div>
                </div>

                {application.admissionReview && (
                    <div className="space-y-2">
                        <div className="text-sm">
                            <span className="text-muted-foreground">Academic Score:</span>
                            <span className="ml-2 font-medium">
                                {application.admissionReview.academicScore || 'Not scored'}
                            </span>
                        </div>
                        {application.admissionReview.recommendations && (
                            <div className="text-sm">
                                <span className="text-muted-foreground">Recommendations:</span>
                                <p className="text-sm mt-1 p-2 bg-gray-50 rounded">
                                    {application.admissionReview.recommendations}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{application.documents?.length || 0} documents</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                        </Button>
                        <Button size="sm">
                            Review
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ApplicationListSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                    <CardHeader>
                        <div className="h-6 bg-gray-200 rounded w-1/3" />
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                            <div className="h-4 bg-gray-200 rounded w-1/3" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function ApplicationReviewList({ applications, pagination }: ApplicationReviewListProps) {
    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search applications..."
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                                    <SelectItem value="DOCUMENTS_VERIFIED">Documents Verified</SelectItem>
                                    <SelectItem value="PAYMENT_COMPLETED">Payment Completed</SelectItem>
                                    <SelectItem value="ADMITTED">Admitted</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Course</label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="All courses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Courses</SelectItem>
                                    <SelectItem value="engineering">Engineering</SelectItem>
                                    <SelectItem value="medicine">Medicine</SelectItem>
                                    <SelectItem value="business">Business</SelectItem>
                                    <SelectItem value="arts">Arts</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Review Status</label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="All reviews" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Reviews</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_review">In Review</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Applications List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        Applications ({pagination.total})
                    </h2>
                    <div className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.pages}
                    </div>
                </div>

                <Suspense fallback={<ApplicationListSkeleton />}>
                    {applications.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-8">
                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No applications found</h3>
                                <p className="text-muted-foreground">
                                    No applications match your current filters.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {applications.map((application) => (
                                <ApplicationCard key={application.id} application={application} />
                            ))}
                        </div>
                    )}
                </Suspense>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" disabled={pagination.page === 1}>
                        Previous
                    </Button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                            const page = i + 1;
                            return (
                                <Button
                                    key={page}
                                    variant={pagination.page === page ? "default" : "outline"}
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                >
                                    {page}
                                </Button>
                            );
                        })}
                    </div>
                    <Button variant="outline" disabled={pagination.page === pagination.pages}>
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
