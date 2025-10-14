import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    FileText,
    CheckCircle,
    Clock,
    DollarSign,
    MessageSquare,
    Calendar,
    User,
    TrendingUp
} from "lucide-react";
import { Application, ApplicationProgressStep } from "@/lib/api/admissions";

interface StudentPortalDashboardProps {
    application: Application & {
        progressSteps: ApplicationProgressStep[];
    };
}

export function StudentPortalDashboard({ application }: StudentPortalDashboardProps) {
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

    const getProgressPercentage = () => {
        const completedSteps = application.progressSteps.filter(step => step.completed).length;
        return Math.round((completedSteps / application.progressSteps.length) * 100);
    };

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Welcome, {application.studentName}!</CardTitle>
                            <p className="text-muted-foreground">
                                Track your application progress and manage your admission journey
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground">Application ID</div>
                            <div className="font-mono text-sm">{application.id}</div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Application Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Application Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium text-lg">{application.course}</div>
                                <div className="text-sm text-muted-foreground">
                                    Applied on {new Date(application.submittedAt).toLocaleDateString()}
                                </div>
                            </div>
                            <Badge className={getStatusColor(application.status)}>
                                {application.status.replace('_', ' ')}
                            </Badge>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Application Progress</span>
                                <span>{getProgressPercentage()}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${getProgressPercentage()}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Progress Steps */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Application Progress
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {application.progressSteps.map((step, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.completed
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    {step.completed ? (
                                        <CheckCircle className="h-4 w-4" />
                                    ) : (
                                        <div className="w-4 h-4 rounded-full bg-gray-300" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className={`font-medium ${step.completed ? 'text-green-800' : 'text-gray-600'
                                        }`}>
                                        {step.name}
                                    </div>
                                    {step.date && (
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(step.date).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <div>
                                <div className="text-2xl font-bold">{application.documents?.length || 0}</div>
                                <div className="text-sm text-muted-foreground">Documents</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <div>
                                <div className="text-2xl font-bold">{application.payments?.length || 0}</div>
                                <div className="text-sm text-muted-foreground">Payments</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-purple-600" />
                            <div>
                                <div className="text-2xl font-bold">0</div>
                                <div className="text-sm text-muted-foreground">Messages</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-orange-600" />
                            <div>
                                <div className="text-2xl font-bold">{application.appointments?.length || 0}</div>
                                <div className="text-sm text-muted-foreground">Appointments</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="p-2 bg-blue-100 rounded-full">
                                <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <div className="font-medium">Application submitted</div>
                                <div className="text-sm text-muted-foreground">
                                    {new Date(application.submittedAt).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {application.documents && application.documents.length > 0 && (
                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">{application.documents.length} documents uploaded</div>
                                    <div className="text-sm text-muted-foreground">
                                        Latest: {new Date(application.documents[0].createdAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        )}

                        {application.payments && application.payments.length > 0 && (
                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                <div className="p-2 bg-purple-100 rounded-full">
                                    <DollarSign className="h-4 w-4 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">Payment completed</div>
                                    <div className="text-sm text-muted-foreground">
                                        ₹{application.payments[0].amount.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
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
                            <span>Upload Documents</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <DollarSign className="h-6 w-6" />
                            <span>View Payments</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <MessageSquare className="h-6 w-6" />
                            <span>Contact Support</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
