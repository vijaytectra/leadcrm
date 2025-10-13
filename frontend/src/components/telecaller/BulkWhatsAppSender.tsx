'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import { apiPost, apiGet } from '@/lib/utils';

interface Lead {
    id: string;
    name: string;
    phone: string | null;
    status: string;
}

interface WhatsAppTemplate {
    id: string;
    name: string;
    category: string;
    language: string;
    content: string;
    variables: string[];
}

interface BulkMessageJob {
    id: string;
    message: string;
    recipientCount: number;
    sentCount: number;
    failedCount: number;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    startedAt: string | null;
    completedAt: string | null;
    createdAt: string;
}

export default function BulkWhatsAppSender() {
    const [message, setMessage] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [recentJobs, setRecentJobs] = useState<BulkMessageJob[]>([]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [leadsResponse, templatesResponse, jobsResponse] = await Promise.all([
                apiGet('/api/telecaller/leads'),
                apiGet('/api/telecaller/whatsapp/templates'),
                apiGet('/api/telecaller/whatsapp/bulk'),
            ]);

            if (leadsResponse.success) {
                setLeads(leadsResponse.data.filter((lead: Lead) => lead.phone));
            }
            if (templatesResponse.success) {
                setTemplates(templatesResponse.data);
            }
            if (jobsResponse.success) {
                setRecentJobs(jobsResponse.data);
            }
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedLeads(leads.map(lead => lead.id));
        } else {
            setSelectedLeads([]);
        }
    };

    const handleSelectLead = (leadId: string, checked: boolean) => {
        if (checked) {
            setSelectedLeads(prev => [...prev, leadId]);
        } else {
            setSelectedLeads(prev => prev.filter(id => id !== leadId));
        }
    };

    const handleSendBulkMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || selectedLeads.length === 0) return;

        setIsSending(true);
        setError(null);

        try {
            const response = await apiPost('/api/telecaller/whatsapp/bulk', {
                message,
                templateId: selectedTemplate || undefined,
                leadIds: selectedLeads,
            });

            if (response.success) {
                setSuccess(`Bulk message job created! ${response.data.recipientCount} messages will be sent.`);
                setMessage('');
                setSelectedLeads([]);
                setSelectedTemplate('');
                loadData(); // Refresh jobs
            } else {
                setError(response.error || 'Failed to send bulk messages');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSending(false);
        }
    };

    const getJobStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'PROCESSING':
                return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
            case 'FAILED':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getJobStatusBadge = (status: string) => {
        const variants = {
            PENDING: 'secondary',
            PROCESSING: 'default',
            COMPLETED: 'default',
            FAILED: 'destructive',
        } as const;

        return (
            <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
                {status}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Bulk WhatsApp Messages</h1>
                <p className="text-muted-foreground">
                    Send messages to multiple leads at once
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Message Composer */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5" />
                            Compose Message
                        </CardTitle>
                        <CardDescription>
                            Select leads and compose your bulk message
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSendBulkMessage} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="template">Template (Optional)</Label>
                                <Select
                                    value={selectedTemplate}
                                    onValueChange={setSelectedTemplate}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a template or send a custom message" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Custom Message</SelectItem>
                                        {templates.map((template) => (
                                            <SelectItem key={template.id} value={template.id}>
                                                {template.name} ({template.category})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your message here..."
                                    rows={4}
                                    required
                                />
                                <div className="text-xs text-muted-foreground">
                                    {message.length}/4096 characters
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Select Leads ({selectedLeads.length} selected)</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => loadData()}
                                        disabled={isLoading}
                                    >
                                        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Refresh
                                    </Button>
                                </div>

                                <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-2">
                                    <div className="flex items-center space-x-2 p-2 bg-muted rounded">
                                        <Checkbox
                                            id="select-all"
                                            checked={selectedLeads.length === leads.length && leads.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                        <Label htmlFor="select-all" className="text-sm font-medium">
                                            Select All ({leads.length} leads with phone numbers)
                                        </Label>
                                    </div>

                                    {leads.map((lead) => (
                                        <div key={lead.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded">
                                            <Checkbox
                                                id={lead.id}
                                                checked={selectedLeads.includes(lead.id)}
                                                onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                                            />
                                            <Label htmlFor={lead.id} className="text-sm flex-1">
                                                {lead.name} ({lead.phone})
                                            </Label>
                                            <Badge variant="outline" className="text-xs">
                                                {lead.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {success && (
                                <Alert>
                                    <AlertDescription>{success}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                disabled={isSending || !message.trim() || selectedLeads.length === 0}
                                className="w-full"
                            >
                                {isSending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                <Users className="h-4 w-4 mr-2" />
                                Send to {selectedLeads.length} Lead{selectedLeads.length !== 1 ? 's' : ''}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Recent Jobs */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Recent Jobs
                        </CardTitle>
                        <CardDescription>
                            Track your bulk message campaigns
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentJobs.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No bulk messages sent yet
                                </div>
                            ) : (
                                recentJobs.map((job) => (
                                    <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            {getJobStatusIcon(job.status)}
                                            <div>
                                                <div className="font-medium text-sm">
                                                    {job.recipientCount} recipients
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {job.sentCount} sent, {job.failedCount} failed
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getJobStatusBadge(job.status)}
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(job.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
