'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, MessageSquare } from 'lucide-react';
import { apiPost } from '@/lib/utils';

interface WhatsAppTemplate {
    id: string;
    name: string;
    category: string;
    language: string;
    content: string;
    variables: string[];
}

interface WhatsAppComposerProps {
    leadId: string;
    leadName: string;
    leadPhone?: string;
    onMessageSent?: () => void;
}

export default function WhatsAppComposer({
    leadId,
    leadName,
    leadPhone,
    onMessageSent
}: WhatsAppComposerProps) {
    const [message, setMessage] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const loadTemplates = async () => {
        if (templates.length > 0) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/telecaller/whatsapp/templates');
            const data = await response.json();
            if (data.success) {
                setTemplates(data.data);
            }
        } catch (err) {
            console.error('Failed to load templates:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSending(true);
        setError(null);

        try {
            const response = await apiPost('/api/telecaller/whatsapp/send', {
                leadId,
                message,
                templateId: selectedTemplate || undefined,
            });

            if (response.success) {
                setSuccess(true);
                setMessage('');
                setSelectedTemplate('');
                onMessageSent?.();
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(response.error || 'Failed to send message');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSending(false);
        }
    };

    const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    WhatsApp Message
                </CardTitle>
                <CardDescription>
                    Send a message to {leadName} {leadPhone && `(${leadPhone})`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSendMessage} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="template">Template (Optional)</Label>
                        <Select
                            value={selectedTemplate}
                            onValueChange={setSelectedTemplate}
                            onOpenChange={loadTemplates}
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
                        {isLoading && <div className="text-sm text-muted-foreground">Loading templates...</div>}
                    </div>

                    {selectedTemplateData && (
                        <div className="p-3 bg-muted rounded-md">
                            <div className="text-sm font-medium mb-1">Template Preview:</div>
                            <div className="text-sm text-muted-foreground">
                                {selectedTemplateData.content}
                            </div>
                            {selectedTemplateData.variables.length > 0 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                    Variables: {selectedTemplateData.variables.join(', ')}
                                </div>
                            )}
                        </div>
                    )}

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

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert>
                            <AlertDescription>Message sent successfully!</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSending || !message.trim()}>
                            {isSending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
