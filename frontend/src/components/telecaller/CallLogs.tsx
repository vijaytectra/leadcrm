"use client";

import { memo, useCallback, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Phone,
    PhoneCall,
    Clock,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    AlertCircle,
    Play,
    Download
} from "lucide-react";

interface CallLog {
    id: string;
    callType: string;
    status: string;
    outcome?: string;
    duration?: number;
    notes?: string;
    recordingUrl?: string;
    recordingId?: string;
    createdAt: string;
    lead: {
        id: string;
        name: string;
        phone?: string;
        status: string;
    };
}

interface CallLogsProps {
    tenantSlug: string;
}

export const CallLogs = memo(function CallLogs({ tenantSlug }: CallLogsProps) {
    const [callLogs, setCallLogs] = useState<CallLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [outcomeFilter, setOutcomeFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const fetchCallLogs = useCallback(async () => {
        try {
            setLoading(true);
            // This would be replaced with actual API call
            // const response = await getCallLogs(tenantSlug, { ... });
            // For now, using mock data
            setCallLogs([]);
        } catch (error) {
            console.error("Failed to fetch call logs:", error);
        } finally {
            setLoading(false);
        }
    }, [tenantSlug]);

    useEffect(() => {
        fetchCallLogs();
    }, [fetchCallLogs]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "NO_ANSWER":
            case "FAILED":
                return <XCircle className="h-4 w-4 text-red-500" />;
            case "RINGING":
            case "ANSWERED":
                return <Phone className="h-4 w-4 text-blue-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "bg-green-100 text-green-800";
            case "NO_ANSWER":
            case "FAILED":
                return "bg-red-100 text-red-800";
            case "RINGING":
            case "ANSWERED":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-yellow-100 text-yellow-800";
        }
    };

    const getOutcomeColor = (outcome?: string) => {
        if (!outcome) return "bg-gray-100 text-gray-800";

        switch (outcome) {
            case "SUCCESSFUL":
            case "QUALIFIED":
            case "INTERESTED":
                return "bg-green-100 text-green-800";
            case "NOT_INTERESTED":
            case "NOT_QUALIFIED":
                return "bg-red-100 text-red-800";
            case "CALLBACK_REQUESTED":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return "N/A";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const handlePlayRecording = (recordingUrl: string) => {
        // Open recording in new tab or play inline
        window.open(recordingUrl, '_blank');
    };

    const handleDownloadRecording = (recordingUrl: string, fileName: string) => {
        // Download recording file
        const link = document.createElement('a');
        link.href = recordingUrl;
        link.download = fileName;
        link.click();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading call logs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters and Search */}
            <Card>
                <CardHeader>
                    <CardTitle>Call Logs</CardTitle>
                    <CardDescription>View and manage your call history</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by lead name or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="NO_ANSWER">No Answer</SelectItem>
                                <SelectItem value="FAILED">Failed</SelectItem>
                                <SelectItem value="RINGING">Ringing</SelectItem>
                                <SelectItem value="ANSWERED">Answered</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Filter by outcome" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Outcomes</SelectItem>
                                <SelectItem value="SUCCESSFUL">Successful</SelectItem>
                                <SelectItem value="QUALIFIED">Qualified</SelectItem>
                                <SelectItem value="INTERESTED">Interested</SelectItem>
                                <SelectItem value="NOT_INTERESTED">Not Interested</SelectItem>
                                <SelectItem value="CALLBACK_REQUESTED">Callback Requested</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="createdAt">Date</SelectItem>
                                <SelectItem value="duration">Duration</SelectItem>
                                <SelectItem value="status">Status</SelectItem>
                                <SelectItem value="outcome">Outcome</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Call Logs List */}
            <div className="space-y-3">
                {callLogs.map((callLog) => (
                    <Card key={callLog.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        {getStatusIcon(callLog.status)}
                                        <h3 className="font-semibold text-lg">{callLog.lead.name}</h3>
                                        <Badge className={getStatusColor(callLog.status)}>
                                            {callLog.status}
                                        </Badge>
                                        {callLog.outcome && (
                                            <Badge className={getOutcomeColor(callLog.outcome)}>
                                                {callLog.outcome}
                                            </Badge>
                                        )}
                                        <Badge variant="outline">
                                            {callLog.callType}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="h-4 w-4" />
                                            <span>{callLog.lead.phone || "No phone"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>{formatDuration(callLog.duration)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>{formatDate(callLog.createdAt)}</span>
                                        </div>
                                    </div>

                                    {callLog.notes && (
                                        <div className="text-sm text-muted-foreground mb-2">
                                            <p className="font-medium">Notes:</p>
                                            <p>{callLog.notes}</p>
                                        </div>
                                    )}

                                    {callLog.recordingUrl && (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handlePlayRecording(callLog.recordingUrl!)}
                                                className="flex items-center gap-2"
                                            >
                                                <Play className="h-4 w-4" />
                                                Play Recording
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDownloadRecording(
                                                    callLog.recordingUrl!,
                                                    `call-${callLog.id}.mp3`
                                                )}
                                                className="flex items-center gap-2"
                                            >
                                                <Download className="h-4 w-4" />
                                                Download
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {callLogs.length === 0 && !loading && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <PhoneCall className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No call logs found</h3>
                        <p className="text-muted-foreground">
                            {searchTerm || statusFilter !== "all" || outcomeFilter !== "all"
                                ? "Try adjusting your search or filter criteria."
                                : "You haven't made any calls yet. Start by logging your first call!"
                            }
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
});
