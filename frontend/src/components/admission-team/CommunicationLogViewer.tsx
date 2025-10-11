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
    Mail,
    MessageSquare,
    Phone,
    Search,
    Filter,
    Calendar,
    User,
    Clock
} from "lucide-react";
import { Communication } from "@/lib/api/admissions";

interface CommunicationLogViewerProps {
    communications: Communication[];
    groupedCommunications: Record<string, Communication[]>;
    totalCount: number;
}

export function CommunicationLogViewer({
    communications,
    groupedCommunications,
    totalCount
}: CommunicationLogViewerProps) {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'EMAIL':
                return <Mail className="h-4 w-4" />;
            case 'SMS':
                return <MessageSquare className="h-4 w-4" />;
            case 'WHATSAPP':
                return <Phone className="h-4 w-4" />;
            default:
                return <MessageSquare className="h-4 w-4" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'EMAIL':
                return 'bg-blue-100 text-blue-800';
            case 'SMS':
                return 'bg-green-100 text-green-800';
            case 'WHATSAPP':
                return 'bg-emerald-100 text-emerald-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SENT':
                return 'bg-green-100 text-green-800';
            case 'DELIVERED':
                return 'bg-blue-100 text-blue-800';
            case 'FAILED':
                return 'bg-red-100 text-red-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header and Filters */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Communication Log ({totalCount})
                        </CardTitle>
                        <Button size="sm">
                            Send New Message
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search communications..."
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type</label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="EMAIL">Email</SelectItem>
                                    <SelectItem value="SMS">SMS</SelectItem>
                                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="SENT">Sent</SelectItem>
                                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="FAILED">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Communication Statistics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-blue-600" />
                            <div>
                                <div className="text-2xl font-bold">
                                    {groupedCommunications.EMAIL?.length || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">Emails</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-green-600" />
                            <div>
                                <div className="text-2xl font-bold">
                                    {groupedCommunications.SMS?.length || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">SMS</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-emerald-600" />
                            <div>
                                <div className="text-2xl font-bold">
                                    {groupedCommunications.WHATSAPP?.length || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">WhatsApp</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <div>
                                <div className="text-2xl font-bold">{totalCount}</div>
                                <div className="text-sm text-muted-foreground">Total</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Communications List */}
            {communications.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No communications found</h3>
                        <p className="text-muted-foreground">
                            No communications have been sent for this application yet.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {communications.map((communication) => (
                        <Card key={communication.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-gray-100">
                                            {getTypeIcon(communication.type)}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Badge className={getTypeColor(communication.type)}>
                                                    {communication.type}
                                                </Badge>
                                                <Badge className={getStatusColor(communication.status)}>
                                                    {communication.status}
                                                </Badge>
                                            </div>
                                            {communication.subject && (
                                                <div className="font-medium">{communication.subject}</div>
                                            )}
                                            <div className="text-sm text-muted-foreground max-w-2xl">
                                                {communication.content}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    <span>
                                                        {communication.sender?.firstName} {communication.sender?.lastName}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>
                                                        {new Date(communication.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                            View
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            Resend
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
