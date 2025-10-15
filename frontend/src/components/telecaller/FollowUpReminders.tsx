"use client";

import { memo, useCallback, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Calendar,
    Clock,
    Search,
    Phone,
    Mail,
    MessageSquare,
    Video,
    CheckCircle,
    AlertCircle,
    XCircle
} from "lucide-react";

interface FollowUpReminder {
    id: string;
    type: string;
    priority: string;
    status: string;
    scheduledAt: string;
    notes?: string;
    completedAt?: string;
    lead: {
        id: string;
        name: string;
        phone?: string;
        status: string;
    };
}

interface FollowUpRemindersProps {
    tenantSlug: string;
}

export const FollowUpReminders = memo(function FollowUpReminders({
    tenantSlug
}: FollowUpRemindersProps) {
    const [reminders, setReminders] = useState<FollowUpReminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");

    const fetchReminders = useCallback(async () => {
        try {
            setLoading(true);
            // This would be replaced with actual API call
            // const response = await getFollowUpReminders(tenantSlug, { ... });
            // For now, using mock data
            setReminders([]);
            // TODO: Use tenantSlug when implementing actual API call
        } catch (error) {
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantSlug]);

    useEffect(() => {
        fetchReminders();
    }, [fetchReminders]);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "CALL":
                return <Phone className="h-4 w-4 text-blue-500" />;
            case "EMAIL":
                return <Mail className="h-4 w-4 text-green-500" />;
            case "SMS":
            case "WHATSAPP":
                return <MessageSquare className="h-4 w-4 text-purple-500" />;
            case "MEETING":
                return <Video className="h-4 w-4 text-orange-500" />;
            default:
                return <Calendar className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "OVERDUE":
                return <XCircle className="h-4 w-4 text-red-500" />;
            case "PENDING":
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            default:
                return <Calendar className="h-4 w-4 text-gray-500" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "URGENT":
                return "bg-red-100 text-red-800";
            case "HIGH":
                return "bg-orange-100 text-orange-800";
            case "MEDIUM":
                return "bg-yellow-100 text-yellow-800";
            case "LOW":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "bg-green-100 text-green-800";
            case "OVERDUE":
                return "bg-red-100 text-red-800";
            case "PENDING":
                return "bg-yellow-100 text-yellow-800";
            case "CANCELLED":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const isOverdue = (scheduledAt: string, status: string) => {
        if (status !== "PENDING") return false;
        return new Date(scheduledAt) < new Date();
    };

    const handleCompleteReminder = async (reminderId: string) => {
        try {
            // This would be replaced with actual API call
            // await completeFollowUpReminder(tenantSlug, reminderId);
          
            // Refresh the list
            fetchReminders();
        } catch (error) {
        }
    };

    const handleCancelReminder = async (reminderId: string) => {
        try {
            // This would be replaced with actual API call
            // await cancelFollowUpReminder(tenantSlug, reminderId);
          
            // Refresh the list
            fetchReminders();
        } catch (error) {
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading follow-up reminders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters and Search */}
            <Card>
                <CardHeader>
                    <CardTitle>Follow-up Reminders</CardTitle>
                    <CardDescription>Manage your scheduled follow-up activities</CardDescription>
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
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="OVERDUE">Overdue</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Filter by priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priorities</SelectItem>
                                <SelectItem value="URGENT">Urgent</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="LOW">Low</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="CALL">Call</SelectItem>
                                <SelectItem value="EMAIL">Email</SelectItem>
                                <SelectItem value="SMS">SMS</SelectItem>
                                <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                                <SelectItem value="MEETING">Meeting</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Reminders List */}
            <div className="space-y-3">
                {reminders.map((reminder) => {
                    const isOverdueReminder = isOverdue(reminder.scheduledAt, reminder.status);
                    const actualStatus = isOverdueReminder ? "OVERDUE" : reminder.status;

                    return (
                        <Card
                            key={reminder.id}
                            className={`hover:shadow-md transition-shadow ${isOverdueReminder ? "border-red-200 bg-red-50" : ""
                                }`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {getStatusIcon(actualStatus)}
                                            {getTypeIcon(reminder.type)}
                                            <h3 className="font-semibold text-lg">{reminder.lead.name}</h3>
                                            <Badge className={getStatusColor(actualStatus)}>
                                                {actualStatus}
                                            </Badge>
                                            <Badge className={getPriorityColor(reminder.priority)}>
                                                {reminder.priority}
                                            </Badge>
                                            <Badge variant="outline">
                                                {reminder.type}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="h-4 w-4" />
                                                <span>{reminder.lead.phone || "No phone"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                <span className={isOverdueReminder ? "text-red-600 font-medium" : ""}>
                                                    {formatDate(reminder.scheduledAt)}
                                                </span>
                                            </div>
                                            {reminder.completedAt && (
                                                <div className="flex items-center gap-2 text-sm text-green-600">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span>Completed: {formatDate(reminder.completedAt)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {reminder.notes && (
                                            <div className="text-sm text-muted-foreground mb-2">
                                                <p className="font-medium">Notes:</p>
                                                <p>{reminder.notes}</p>
                                            </div>
                                        )}

                                        {isOverdueReminder && (
                                            <div className="text-sm text-red-600 font-medium mb-2">
                                                ⚠️ This follow-up is overdue!
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2 ml-4">
                                        {reminder.status === "PENDING" && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    onClick={()=>{}}
                                                    className="flex items-center gap-2"
                                                >
                                                    {getTypeIcon(reminder.type)}
                                                    {reminder.type === "CALL" ? "Make Call" :
                                                        reminder.type === "EMAIL" ? "Send Email" :
                                                            reminder.type === "SMS" ? "Send SMS" :
                                                                reminder.type === "WHATSAPP" ? "Send WhatsApp" :
                                                                    "Schedule Meeting"}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleCompleteReminder(reminder.id)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    Mark Complete
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleCancelReminder(reminder.id)}
                                                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                        {reminder.status === "COMPLETED" && (
                                            <Badge className="bg-green-100 text-green-800">
                                                Completed
                                            </Badge>
                                        )}
                                        {reminder.status === "CANCELLED" && (
                                            <Badge className="bg-gray-100 text-gray-800">
                                                Cancelled
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {reminders.length === 0 && !loading && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No follow-up reminders found</h3>
                        <p className="text-muted-foreground">
                            {searchTerm || statusFilter !== "all" || priorityFilter !== "all" || typeFilter !== "all"
                                ? "Try adjusting your search or filter criteria."
                                : "You don't have any scheduled follow-ups yet. Create your first follow-up reminder!"
                            }
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
});
