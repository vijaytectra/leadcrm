"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface VerificationActionsProps {
    documentId: string;
}

export function VerificationActions({ documentId }: VerificationActionsProps) {
    const [action, setAction] = useState<"verify" | "reject" | null>(null);
    const [comments, setComments] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleVerify = async () => {
        setIsSubmitting(true);
        try {
            // API call to verify document
            console.log("Verifying document:", documentId, { comments });
            // await documentApi.verifyDocument(tenant, documentId, { status: "VERIFIED", comments });
            setAction(null);
            setComments("");
        } catch (error) {
            console.error("Error verifying document:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert("Please provide a reason for rejection");
            return;
        }

        setIsSubmitting(true);
        try {
            // API call to reject document
            console.log("Rejecting document:", documentId, {
                rejectionReason,
                comments
            });
            // await documentApi.verifyDocument(tenant, documentId, { 
            //     status: "REJECTED", 
            //     rejectionReason,
            //     comments 
            // });
            setAction(null);
            setRejectionReason("");
            setComments("");
        } catch (error) {
            console.error("Error rejecting document:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setAction(null);
        setComments("");
        setRejectionReason("");
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Verification Actions
                </CardTitle>
                <CardDescription>
                    Approve or reject this document
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!action ? (
                    <div className="flex gap-3">
                        <Button
                            onClick={() => setAction("verify")}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verify Document
                        </Button>
                        <Button
                            onClick={() => setAction("reject")}
                            variant="destructive"
                            className="flex-1"
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Document
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {action === "verify" && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <h4 className="font-medium text-green-900 mb-2">
                                    Verify Document
                                </h4>
                                <p className="text-sm text-green-700 mb-3">
                                    This document meets all verification requirements and will be approved.
                                </p>
                                <div className="space-y-2">
                                    <Label htmlFor="verify-comments">Comments (Optional)</Label>
                                    <Textarea
                                        id="verify-comments"
                                        placeholder="Add any additional notes..."
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        )}

                        {action === "reject" && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <h4 className="font-medium text-red-900 mb-2">
                                    Reject Document
                                </h4>
                                <p className="text-sm text-red-700 mb-3">
                                    This document does not meet verification requirements and will be rejected.
                                </p>
                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="rejection-reason">
                                            Reason for Rejection *
                                        </Label>
                                        <Textarea
                                            id="rejection-reason"
                                            placeholder="Please specify why this document is being rejected..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            rows={3}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="reject-comments">Additional Comments</Label>
                                        <Textarea
                                            id="reject-comments"
                                            placeholder="Any additional notes..."
                                            value={comments}
                                            onChange={(e) => setComments(e.target.value)}
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                onClick={action === "verify" ? handleVerify : handleReject}
                                disabled={isSubmitting || (action === "reject" && !rejectionReason.trim())}
                                className={action === "verify" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                            >
                                {isSubmitting ? "Processing..." : `Confirm ${action === "verify" ? "Verification" : "Rejection"}`}
                            </Button>
                            <Button variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
