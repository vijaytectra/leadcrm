"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    Download,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Calendar,
    User
} from "lucide-react";
import { OfferLetter } from "@/lib/api/admissions";

interface OfferLetterViewerProps {
    offerLetter: OfferLetter;
    onAccept: () => Promise<void>;
    onDecline: (reason?: string) => Promise<void>;
    isLoading?: boolean;
}

export function OfferLetterViewer({
    offerLetter,
    onAccept,
    onDecline,
    isLoading = false
}: OfferLetterViewerProps) {
    const [showDeclineForm, setShowDeclineForm] = useState(false);
    const [declineReason, setDeclineReason] = useState('');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT':
                return 'bg-gray-100 text-gray-800';
            case 'SENT':
                return 'bg-blue-100 text-blue-800';
            case 'VIEWED':
                return 'bg-yellow-100 text-yellow-800';
            case 'ACCEPTED':
                return 'bg-green-100 text-green-800';
            case 'DECLINED':
                return 'bg-red-100 text-red-800';
            case 'EXPIRED':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACCEPTED':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'DECLINED':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'VIEWED':
                return <Eye className="h-4 w-4 text-yellow-600" />;
            case 'SENT':
                return <Clock className="h-4 w-4 text-blue-600" />;
            default:
                return <FileText className="h-4 w-4 text-gray-600" />;
        }
    };

    const handleAccept = async () => {
        await onAccept();
    };

    const handleDecline = async () => {
        await onDecline(declineReason || undefined);
        setShowDeclineForm(false);
        setDeclineReason('');
    };

    const canRespond = offerLetter.status === 'SENT' || offerLetter.status === 'VIEWED';
    const hasResponded = offerLetter.status === 'ACCEPTED' || offerLetter.status === 'DECLINED';

    return (
        <div className="space-y-6">
            {/* Offer Letter Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Offer Letter
                            </CardTitle>
                            <p className="text-muted-foreground mt-1">
                                {offerLetter.template?.name || 'Standard Offer Letter'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(offerLetter.status)}>
                                {offerLetter.status}
                            </Badge>
                            {getStatusIcon(offerLetter.status)}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Generated on {new Date(offerLetter.createdAt).toLocaleDateString()}</span>
                            </div>
                            {offerLetter.sentAt && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>Sent on {new Date(offerLetter.sentAt).toLocaleDateString()}</span>
                                </div>
                            )}
                            {offerLetter.viewedAt && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Eye className="h-4 w-4" />
                                    <span>Viewed on {new Date(offerLetter.viewedAt).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            {offerLetter.acceptedAt && (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Accepted on {new Date(offerLetter.acceptedAt).toLocaleDateString()}</span>
                                </div>
                            )}
                            {offerLetter.declinedAt && (
                                <div className="flex items-center gap-2 text-sm text-red-600">
                                    <XCircle className="h-4 w-4" />
                                    <span>Declined on {new Date(offerLetter.declinedAt).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Offer Letter Content */}
            <Card>
                <CardHeader>
                    <CardTitle>Offer Letter Content</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="prose max-w-none">
                        <div className="p-6 border rounded-lg bg-gray-50">
                            <h1 className="text-2xl font-bold mb-4">Offer Letter</h1>

                            <div className="space-y-4">
                                <p>
                                    Dear <strong>{offerLetter.application?.studentName}</strong>,
                                </p>

                                <p>
                                    Congratulations! We are pleased to offer you admission to our{' '}
                                    <strong>{offerLetter.application?.course}</strong> program.
                                </p>

                                <p>
                                    Your program will begin on <strong>August 15, 2024</strong> and the total fee is{' '}
                                    <strong>₹2,50,000</strong> per year.
                                </p>

                                <p>
                                    Please confirm your acceptance by <strong>July 30, 2024</strong>.
                                </p>

                                <p>
                                    We look forward to welcoming you to our institution.
                                </p>

                                <div className="mt-6">
                                    <p>Best regards,</p>
                                    <p>Admissions Team</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            {canRespond && !hasResponded && (
                <Card>
                    <CardHeader>
                        <CardTitle>Respond to Offer</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 text-green-800 mb-2">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="font-medium">Accept Offer</span>
                                </div>
                                <p className="text-sm text-green-700 mb-3">
                                    Accept this offer to proceed with your enrollment.
                                </p>
                                <Button
                                    onClick={handleAccept}
                                    disabled={isLoading}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isLoading ? 'Processing...' : 'Accept Offer'}
                                </Button>
                            </div>

                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center gap-2 text-red-800 mb-2">
                                    <XCircle className="h-4 w-4" />
                                    <span className="font-medium">Decline Offer</span>
                                </div>
                                <p className="text-sm text-red-700 mb-3">
                                    Decline this offer if you cannot proceed with enrollment.
                                </p>
                                {!showDeclineForm ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowDeclineForm(true)}
                                        className="border-red-300 text-red-700 hover:bg-red-50"
                                    >
                                        Decline Offer
                                    </Button>
                                ) : (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-red-800 mb-1">
                                                Reason for declining (optional)
                                            </label>
                                            <textarea
                                                value={declineReason}
                                                onChange={(e) => setDeclineReason(e.target.value)}
                                                className="w-full p-2 border border-red-300 rounded-md text-sm"
                                                placeholder="Please provide a reason for declining..."
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleDecline}
                                                disabled={isLoading}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                {isLoading ? 'Processing...' : 'Confirm Decline'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowDeclineForm(false)}
                                                className="border-red-300 text-red-700 hover:bg-red-50"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Response Status */}
            {hasResponded && (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Response</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`p-4 rounded-lg ${offerLetter.status === 'ACCEPTED'
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                            }`}>
                            <div className={`flex items-center gap-2 ${offerLetter.status === 'ACCEPTED' ? 'text-green-800' : 'text-red-800'
                                }`}>
                                {getStatusIcon(offerLetter.status)}
                                <span className="font-medium">
                                    {offerLetter.status === 'ACCEPTED' ? 'Offer Accepted' : 'Offer Declined'}
                                </span>
                            </div>
                            <p className={`text-sm mt-2 ${offerLetter.status === 'ACCEPTED' ? 'text-green-700' : 'text-red-700'
                                }`}>
                                {offerLetter.status === 'ACCEPTED'
                                    ? 'Thank you for accepting our offer. We will contact you soon with next steps.'
                                    : 'We understand your decision. Thank you for your interest in our program.'
                                }
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Download Options */}
            <Card>
                <CardHeader>
                    <CardTitle>Download Options</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Button variant="outline" className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Download PDF
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Print Letter
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
