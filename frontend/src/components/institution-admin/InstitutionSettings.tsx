"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Building2,
    Shield,
    Bell,
    Globe,
    Save,
    RefreshCw
} from "lucide-react";

interface InstitutionSettings {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    description: string;
    timezone: string;
    currency: string;
    maxUsers: number;
    maxLeads: number;
    features: {
        formBuilder: boolean;
        analytics: boolean;
        integrations: boolean;
        customBranding: boolean;
        apiAccess: boolean;
    };
    notifications: {
        emailNotifications: boolean;
        smsNotifications: boolean;
        pushNotifications: boolean;
        weeklyReports: boolean;
        monthlyReports: boolean;
    };
    security: {
        twoFactorAuth: boolean;
        sessionTimeout: number;
        passwordPolicy: string;
        ipWhitelist: string[];
    };
}

interface InstitutionSettingsProps {
    settings: InstitutionSettings;
    tenantSlug: string;
}

export function InstitutionSettings({ settings, tenantSlug }: InstitutionSettingsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState(settings);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Implement save logic
            await new Promise(resolve => setTimeout(resolve, 1000));
     
        } catch (error) {
            console.error("Error saving settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNestedChange = (parent: string, field: string, value: boolean | string | number) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
                [field]: value
            }
        }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-heading-text">
                        Institution Settings
                    </h1>
                    <p className="text-subtext mt-1">
                        Configure your institution&apos;s settings and preferences
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="text-sm">
                        {tenantSlug}
                    </Badge>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Building2 className="h-5 w-5 mr-2" />
                                Basic Information
                            </CardTitle>
                            <CardDescription>
                                Update your institution&apos;s basic information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Institution Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        placeholder="Your Institution Name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Contact Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        placeholder="contact@institution.com"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        value={formData.website}
                                        onChange={(e) => handleInputChange("website", e.target.value)}
                                        placeholder="https://www.institution.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => handleInputChange("address", e.target.value)}
                                    placeholder="123 Main Street, City, State, ZIP"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    placeholder="Brief description of your institution..."
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Globe className="h-5 w-5 mr-2" />
                                Regional Settings
                            </CardTitle>
                            <CardDescription>
                                Configure timezone and currency settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <Select
                                        value={formData.timezone}
                                        onValueChange={(value) => handleInputChange("timezone", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select timezone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UTC">UTC</SelectItem>
                                            <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                            <SelectItem value="America/Chicago">Central Time</SelectItem>
                                            <SelectItem value="America/Denver">Mountain Time</SelectItem>
                                            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                                            <SelectItem value="Europe/London">London</SelectItem>
                                            <SelectItem value="Asia/Kolkata">India Standard Time</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="currency">Currency</Label>
                                    <Select
                                        value={formData.currency}
                                        onValueChange={(value) => handleInputChange("currency", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD ($)</SelectItem>
                                            <SelectItem value="EUR">EUR (€)</SelectItem>
                                            <SelectItem value="GBP">GBP (£)</SelectItem>
                                            <SelectItem value="INR">INR (₹)</SelectItem>
                                            <SelectItem value="CAD">CAD (C$)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Features Settings */}
                <TabsContent value="features" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Shield className="h-5 w-5 mr-2" />
                                Feature Access
                            </CardTitle>
                            <CardDescription>
                                Manage which features are available to your institution
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="formBuilder">Form Builder</Label>
                                        <p className="text-sm text-subtext">
                                            Create custom forms and surveys
                                        </p>
                                    </div>
                                    <Switch
                                        id="formBuilder"
                                        checked={formData.features.formBuilder}
                                        onCheckedChange={(checked: boolean) =>
                                            handleNestedChange("features", "formBuilder", checked)
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="analytics">Advanced Analytics</Label>
                                        <p className="text-sm text-subtext">
                                            Access detailed reports and insights
                                        </p>
                                    </div>
                                    <Switch
                                        id="analytics"
                                        checked={formData.features.analytics}
                                        onCheckedChange={(checked: boolean) =>
                                            handleNestedChange("features", "analytics", checked)
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="integrations">Third-party Integrations</Label>
                                        <p className="text-sm text-subtext">
                                            Connect with external services
                                        </p>
                                    </div>
                                    <Switch
                                        id="integrations"
                                        checked={formData.features.integrations}
                                        onCheckedChange={(checked: boolean) =>
                                            handleNestedChange("features", "integrations", checked)
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="customBranding">Custom Branding</Label>
                                        <p className="text-sm text-subtext">
                                            Use your own logo and colors
                                        </p>
                                    </div>
                                    <Switch
                                        id="customBranding"
                                        checked={formData.features.customBranding}
                                        onCheckedChange={(checked: boolean) =>
                                            handleNestedChange("features", "customBranding", checked)
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="apiAccess">API Access</Label>
                                        <p className="text-sm text-subtext">
                                            Access to REST API endpoints
                                        </p>
                                    </div>
                                    <Switch
                                        id="apiAccess"
                                        checked={formData.features.apiAccess}
                                        onCheckedChange={(checked: boolean) =>
                                            handleNestedChange("features", "apiAccess", checked)
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Settings */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Bell className="h-5 w-5 mr-2" />
                                Notification Preferences
                            </CardTitle>
                            <CardDescription>
                                Configure how you receive notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                                        <p className="text-sm text-subtext">
                                            Receive notifications via email
                                        </p>
                                    </div>
                                    <Switch
                                        id="emailNotifications"
                                        checked={formData.notifications.emailNotifications}
                                        onCheckedChange={(checked: boolean) =>
                                            handleNestedChange("notifications", "emailNotifications", checked)
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="smsNotifications">SMS Notifications</Label>
                                        <p className="text-sm text-subtext">
                                            Receive notifications via SMS
                                        </p>
                                    </div>
                                    <Switch
                                        id="smsNotifications"
                                        checked={formData.notifications.smsNotifications}
                                        onCheckedChange={(checked: boolean) =>
                                            handleNestedChange("notifications", "smsNotifications", checked)
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="pushNotifications">Push Notifications</Label>
                                        <p className="text-sm text-subtext">
                                            Receive browser push notifications
                                        </p>
                                    </div>
                                    <Switch
                                        id="pushNotifications"
                                        checked={formData.notifications.pushNotifications}
                                        onCheckedChange={(checked: boolean) =>
                                            handleNestedChange("notifications", "pushNotifications", checked)
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="weeklyReports">Weekly Reports</Label>
                                        <p className="text-sm text-subtext">
                                            Receive weekly performance reports
                                        </p>
                                    </div>
                                    <Switch
                                        id="weeklyReports"
                                        checked={formData.notifications.weeklyReports}
                                        onCheckedChange={(checked: boolean) =>
                                            handleNestedChange("notifications", "weeklyReports", checked)
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="monthlyReports">Monthly Reports</Label>
                                        <p className="text-sm text-subtext">
                                            Receive monthly performance reports
                                        </p>
                                    </div>
                                    <Switch
                                        id="monthlyReports"
                                        checked={formData.notifications.monthlyReports}
                                        onCheckedChange={(checked: boolean) =>
                                            handleNestedChange("notifications", "monthlyReports", checked)
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Shield className="h-5 w-5 mr-2" />
                                Security Settings
                            </CardTitle>
                            <CardDescription>
                                Configure security and access control settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                                        <p className="text-sm text-subtext">
                                            Require 2FA for all users
                                        </p>
                                    </div>
                                    <Switch
                                        id="twoFactorAuth"
                                        checked={formData.security.twoFactorAuth}
                                        onCheckedChange={(checked: boolean) =>
                                            handleNestedChange("security", "twoFactorAuth", checked)
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                                    <Input
                                        id="sessionTimeout"
                                        type="number"
                                        value={formData.security.sessionTimeout}
                                        onChange={(e) =>
                                            handleNestedChange("security", "sessionTimeout", parseInt(e.target.value))
                                        }
                                        placeholder="30"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="passwordPolicy">Password Policy</Label>
                                    <Select
                                        value={formData.security.passwordPolicy}
                                        onValueChange={(value) =>
                                            handleNestedChange("security", "passwordPolicy", value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select password policy" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                                            <SelectItem value="medium">Medium (8+ chars, numbers)</SelectItem>
                                            <SelectItem value="strong">Strong (12+ chars, numbers, symbols)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
