"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export function BatchVerificationPanel() {
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
    const [batchAction, setBatchAction] = useState<"verify" | "reject" | null>(null);

    const handleBatchVerify = () => {
        setBatchAction("verify");
        // Implement batch verification logic
        
    };

    const handleBatchReject = () => {
        setBatchAction("reject");
        // Implement batch rejection logic
  
    };

    const clearSelection = () => {
        setSelectedDocuments([]);
        setBatchAction(null);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Batch Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {selectedDocuments.length > 0 ? (
                    <>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                                {selectedDocuments.length} document(s) selected
                            </span>
                            <Button variant="ghost" size="sm" onClick={clearSelection}>
                                Clear
                            </Button>
                        </div>

                        <div className="flex space-x-2">
                            <Button
                                onClick={handleBatchVerify}
                                className="flex-1"
                                variant="default"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Verify All
                            </Button>
                            <Button
                                onClick={handleBatchReject}
                                className="flex-1"
                                variant="destructive"
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject All
                            </Button>
                        </div>

                        {batchAction && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    {batchAction === "verify"
                                        ? "Verifying selected documents..."
                                        : "Rejecting selected documents..."
                                    }
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">
                            Select documents to perform batch actions
                        </p>
                    </div>
                )}

                <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Quick Stats</span>
                        <div className="flex space-x-2">
                            <Badge variant="outline">Pending: 23</Badge>
                            <Badge variant="outline">Urgent: 5</Badge>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
