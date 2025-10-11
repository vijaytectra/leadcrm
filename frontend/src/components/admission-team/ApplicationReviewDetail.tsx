"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    User,
    Mail,
    Phone,
    Calendar,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Star,
    MessageSquare
} from "lucide-react";
import { Application, AdmissionReview } from "@/lib/api/admissions";

interface ApplicationReviewDetailProps {
    application: Application;
    onReviewSubmit: (data: {
        interviewNotes?: string;
        academicScore?: number;
        recommendations?: string;
        decision?: 'APPROVED' | 'REJECTED' | 'WAITLISTED';
        decisionReason?: string;
    }) => Promise<void>;
    isLoading?: boolean;
}

export function ApplicationReviewDetail({
    application,
    onReviewSubmit,
    isLoading = false
}: ApplicationReviewDetailProps) {
    const [formData, setFormData] = useState({
        interviewNotes: application.admissionReview?.interviewNotes || '',
        academicScore: application.admissionReview?.academicScore || '',
        recommendations: application.admissionReview?.recommendations || '',
        decision: application.admissionReview?.decision || '',
        decisionReason: application.admissionReview?.decisionReason || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onReviewSubmit({
            interviewNotes: formData.interviewNotes || undefined,
            academicScore: formData.academicScore ? Number(formData.academicScore) : undefined,
            recommendations: formData.recommendations || undefined,
            decision: formData.decision as 'APPROVED' | 'REJECTED' | 'WAITLISTED' || undefined,
            decisionReason: formData.decisionReason || undefined,
        });
    };

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

    return (
        <div className="space-y-6">
            {/* Application Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">{application.studentName}</CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge className={getStatusColor(application.status)}>
                                    {application.status.replace('_', ' ')}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    Applied on {new Date(application.submittedAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground">Application ID</div>
                            <div className="font-mono text-sm">{application.id}</div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Student Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Student Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Email</div>
                                    <div className="font-medium">{application.studentEmail || 'Not provided'}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Phone</div>
                                    <div className="font-medium">{application.studentPhone || 'Not provided'}</div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm text-muted-foreground">Course</div>
                                <div className="font-medium">{application.course || 'Not specified'}</div>
                            </div>
                            {application.parentName && (
                                <div>
                                    <div className="text-sm text-muted-foreground">Parent/Guardian</div>
                                    <div className="font-medium">{application.parentName}</div>
                                    {application.parentEmail && (
                                        <div className="text-sm text-muted-foreground">{application.parentEmail}</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Documents Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Documents ({application.documents?.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {application.documents && application.documents.length > 0 ? (
                        <div className="space-y-2">
                            {application.documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <div className="font-medium">{doc.fileName}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {doc.fileType} • {(doc.fileSize / 1024).toFixed(1)} KB
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={
                                        doc.status === 'VERIFIED' ? 'default' :
                                            doc.status === 'REJECTED' ? 'destructive' :
                                                'secondary'
                                    }>
                                        {doc.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-muted-foreground">
                            No documents uploaded
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Payment Status */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Status</CardTitle>
                </CardHeader>
                <CardContent>
                    {application.payments && application.payments.length > 0 ? (
                        <div className="space-y-2">
                            {application.payments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">₹{payment.amount.toLocaleString()}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <Badge variant={
                                        payment.status === 'COMPLETED' ? 'default' :
                                            payment.status === 'PENDING' ? 'secondary' :
                                                'destructive'
                                    }>
                                        {payment.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-muted-foreground">
                            No payments recorded
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Review Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Admission Review
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="academicScore">Academic Score (0-100)</Label>
                                <Input
                                    id="academicScore"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.academicScore}
                                    onChange={(e) => setFormData(prev => ({ ...prev, academicScore: e.target.value }))}
                                    placeholder="Enter score"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="decision">Decision</Label>
                                <Select
                                    value={formData.decision}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, decision: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select decision" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="APPROVED">Approved</SelectItem>
                                        <SelectItem value="REJECTED">Rejected</SelectItem>
                                        <SelectItem value="WAITLISTED">Waitlisted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="interviewNotes">Interview Notes</Label>
                            <Textarea
                                id="interviewNotes"
                                value={formData.interviewNotes}
                                onChange={(e) => setFormData(prev => ({ ...prev, interviewNotes: e.target.value }))}
                                placeholder="Enter interview notes and observations..."
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="recommendations">Recommendations</Label>
                            <Textarea
                                id="recommendations"
                                value={formData.recommendations}
                                onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                                placeholder="Enter recommendations for the student..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="decisionReason">Decision Reason</Label>
                            <Textarea
                                id="decisionReason"
                                value={formData.decisionReason}
                                onChange={(e) => setFormData(prev => ({ ...prev, decisionReason: e.target.value }))}
                                placeholder="Explain the reasoning behind your decision..."
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Save Review'}
                            </Button>
                            <Button type="button" variant="outline">
                                Save as Draft
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Previous Review History */}
            {application.admissionReview && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Review History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="font-medium">Academic Score: {application.admissionReview.academicScore || 'Not scored'}</span>
                            </div>
                            {application.admissionReview.interviewNotes && (
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-1">Interview Notes:</div>
                                    <div className="p-3 bg-gray-50 rounded-lg text-sm">
                                        {application.admissionReview.interviewNotes}
                                    </div>
                                </div>
                            )}
                            {application.admissionReview.recommendations && (
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-1">Recommendations:</div>
                                    <div className="p-3 bg-gray-50 rounded-lg text-sm">
                                        {application.admissionReview.recommendations}
                                    </div>
                                </div>
                            )}
                            <div className="text-sm text-muted-foreground">
                                Last updated: {new Date(application.admissionReview.updatedAt).toLocaleString()}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
