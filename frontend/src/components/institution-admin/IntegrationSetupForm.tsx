'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { apiPost } from '@/lib/utils';

interface IntegrationSetupFormProps {
    platform?: 'GOOGLE_ADS' | 'META' | 'LINKEDIN' | 'WHATSAPP';
}

const platformConfig = {
    GOOGLE_ADS: {
        name: 'Google Ads',
        description: 'Import leads from Google Ads campaigns',
        fields: [
            { name: 'developerToken', label: 'Developer Token', type: 'password', required: true },
            { name: 'clientId', label: 'Client ID', type: 'text', required: true },
            { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
            { name: 'refreshToken', label: 'Refresh Token', type: 'password', required: true },
            { name: 'customerId', label: 'Customer ID', type: 'text', required: true },
        ],
        instructions: 'To get your Google Ads API credentials, visit the Google Ads API Center and create a new application.',
    },
    META: {
        name: 'Meta (Facebook/Instagram)',
        description: 'Import leads from Facebook and Instagram ads',
        fields: [
            { name: 'appId', label: 'App ID', type: 'text', required: true },
            { name: 'appSecret', label: 'App Secret', type: 'password', required: true },
            { name: 'accessToken', label: 'Access Token', type: 'password', required: true },
            { name: 'pageId', label: 'Page ID', type: 'text', required: true },
        ],
        instructions: 'Create a Facebook App in the Meta for Developers console and get your credentials.',
    },
    LINKEDIN: {
        name: 'LinkedIn Marketing',
        description: 'Import leads from LinkedIn campaigns',
        fields: [
            { name: 'clientId', label: 'Client ID', type: 'text', required: true },
            { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
            { name: 'accessToken', label: 'Access Token', type: 'password', required: true },
            { name: 'organizationId', label: 'Organization ID', type: 'text', required: true },
        ],
        instructions: 'Create a LinkedIn app in the LinkedIn Developer Portal and get your API credentials.',
    },
    WHATSAPP: {
        name: 'WhatsApp Business',
        description: 'Send messages through WhatsApp Business API',
        fields: [
            { name: 'accessToken', label: 'Access Token', type: 'password', required: true },
            { name: 'phoneNumberId', label: 'Phone Number ID', type: 'text', required: true },
            { name: 'businessAccountId', label: 'Business Account ID', type: 'text', required: true },
        ],
        instructions: 'Set up WhatsApp Business API through Meta Business and get your credentials.',
    },
};

export default function IntegrationSetupForm({ platform }: IntegrationSetupFormProps) {
    const router = useRouter();
    const [selectedPlatform, setSelectedPlatform] = useState(platform || '');
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const config = selectedPlatform ? platformConfig[selectedPlatform as keyof typeof platformConfig] : null;

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlatform || !config) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const credentials: Record<string, string> = {};
            config.fields.forEach(field => {
                if (formData[field.name]) {
                    credentials[field.name] = formData[field.name];
                }
            });

            const response = await apiPost('/api/integrations', {
                platform: selectedPlatform,
                name: `${config.name} Integration`,
                credentials,
                metadata: {},
            });

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/institution-admin/integrations');
                }, 2000);
            } else {
                setError(response.error || 'Failed to create integration');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Integration Created Successfully!</h2>
                    <p className="text-muted-foreground text-center">
                        Your {config?.name} integration has been set up and is ready to import leads.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Add Integration</h1>
                <p className="text-muted-foreground">
                    Connect your advertising platforms to automatically import leads
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Select Platform</CardTitle>
                    <CardDescription>
                        Choose the advertising platform you want to integrate
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a platform" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(platformConfig).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                    {config.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {config && (
                <Card>
                    <CardHeader>
                        <CardTitle>{config.name} Configuration</CardTitle>
                        <CardDescription>{config.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {config.fields.map((field) => (
                                <div key={field.name} className="space-y-2">
                                    <Label htmlFor={field.name}>
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </Label>
                                    <Input
                                        id={field.name}
                                        type={field.type}
                                        value={formData[field.name] || ''}
                                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                                        required={field.required}
                                        placeholder={`Enter your ${field.label.toLowerCase()}`}
                                    />
                                </div>
                            ))}

                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {config.instructions}
                                </AlertDescription>
                            </Alert>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="flex space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Create Integration
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
