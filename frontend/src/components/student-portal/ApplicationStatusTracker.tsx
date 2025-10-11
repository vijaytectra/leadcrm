import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    FileText,
    DollarSign,
    MessageSquare,
    Calendar
} from "lucide-react";
import { ApplicationProgressStep } from "@/lib/api/admissions";

interface ApplicationStatusTrackerProps {
    progressSteps: ApplicationProgressStep[];
}

export function ApplicationStatusTracker({ progressSteps }: ApplicationStatusTrackerProps) {
    const getStepIcon = (stepName: string, completed: boolean) => {
        if (completed) {
            return <CheckCircle className="h-5 w-5 text-green-600" />;
        }

        switch (stepName) {
            case 'Application Submitted':
                return <FileText className="h-5 w-5 text-blue-600" />;
            case 'Documents Uploaded':
                return <FileText className="h-5 w-5 text-blue-600" />;
            case 'Documents Verified':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'Payment Completed':
                return <DollarSign className="h-5 w-5 text-green-600" />;
            case 'Under Review':
                return <Clock className="h-5 w-5 text-yellow-600" />;
            case 'Admission Decision':
                return <AlertCircle className="h-5 w-5 text-purple-600" />;
            case 'Offer Letter':
                return <MessageSquare className="h-5 w-5 text-blue-600" />;
            case 'Enrolled':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            default:
                return <Clock className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStepStatus = (stepName: string, completed: boolean) => {
        if (completed) {
            return { color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
        }

        switch (stepName) {
            case 'Application Submitted':
                return { color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
            case 'Documents Uploaded':
                return { color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
            case 'Documents Verified':
                return { color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
            case 'Payment Completed':
                return { color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
            case 'Under Review':
                return { color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
            case 'Admission Decision':
                return { color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' };
            case 'Offer Letter':
                return { color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
            case 'Enrolled':
                return { color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
            default:
                return { color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };
        }
    };

    const getProgressPercentage = () => {
        const completedSteps = progressSteps.filter(step => step.completed).length;
        return Math.round((completedSteps / progressSteps.length) * 100);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Application Progress
                    </CardTitle>
                    <Badge variant="outline" className="text-sm">
                        {getProgressPercentage()}% Complete
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Overall Progress</span>
                            <span className="font-medium">{getProgressPercentage()}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${getProgressPercentage()}%` }}
                            />
                        </div>
                    </div>

                    {/* Steps Timeline */}
                    <div className="space-y-3">
                        {progressSteps.map((step, index) => {
                            const status = getStepStatus(step.name, step.completed);
                            const isLast = index === progressSteps.length - 1;

                            return (
                                <div key={index} className="relative">
                                    <div className={`flex items-start gap-4 p-4 rounded-lg border ${status.bgColor} ${status.borderColor}`}>
                                        <div className={`p-2 rounded-full ${status.bgColor}`}>
                                            {getStepIcon(step.name, step.completed)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-medium ${status.color}`}>
                                                {step.name}
                                            </div>
                                            {step.date && (
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    Completed on {new Date(step.date).toLocaleDateString()}
                                                </div>
                                            )}
                                            {!step.completed && !step.date && (
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    Pending
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-shrink-0">
                                            {step.completed ? (
                                                <Badge className="bg-green-100 text-green-800">
                                                    Completed
                                                </Badge>
                                            ) : step.date ? (
                                                <Badge className="bg-yellow-100 text-yellow-800">
                                                    In Progress
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">
                                                    Pending
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Connection Line */}
                                    {!isLast && (
                                        <div className="absolute left-6 top-16 w-0.5 h-6 bg-gray-200" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {progressSteps.filter(step => step.completed).length}
                                </div>
                                <div className="text-sm text-muted-foreground">Completed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {progressSteps.filter(step => !step.completed && step.date).length}
                                </div>
                                <div className="text-sm text-muted-foreground">In Progress</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-600">
                                    {progressSteps.filter(step => !step.completed && !step.date).length}
                                </div>
                                <div className="text-sm text-muted-foreground">Pending</div>
                            </div>
                        </div>
                    </div>

                    {/* Next Steps */}
                    {progressSteps.some(step => !step.completed) && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2 text-blue-800">
                                <AlertCircle className="h-4 w-4" />
                                <span className="font-medium">Next Steps</span>
                            </div>
                            <div className="text-sm text-blue-700 mt-2">
                                {(() => {
                                    const nextStep = progressSteps.find(step => !step.completed);
                                    if (nextStep) {
                                        switch (nextStep.name) {
                                            case 'Documents Uploaded':
                                                return 'Please upload all required documents to proceed with your application.';
                                            case 'Payment Completed':
                                                return 'Complete your payment to continue with the admission process.';
                                            case 'Under Review':
                                                return 'Your application is being reviewed by our admission team.';
                                            case 'Admission Decision':
                                                return 'Your admission decision will be announced soon.';
                                            case 'Offer Letter':
                                                return 'Your offer letter will be generated after approval.';
                                            case 'Enrolled':
                                                return 'Complete your enrollment to finalize your admission.';
                                            default:
                                                return 'Please complete the next step to continue.';
                                        }
                                    }
                                    return 'All steps completed!';
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
