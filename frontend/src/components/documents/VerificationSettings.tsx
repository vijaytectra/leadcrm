"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Bell, Clock, Users, Save } from "lucide-react";

interface VerificationSettings {
    autoAssignDocuments: boolean;
    requireComments: boolean;
    allowBatchVerification: boolean;
    notificationPreferences: {
        emailNotifications: boolean;
        browserNotifications: boolean;
        newDocumentAlerts: boolean;
        verificationReminders: boolean;
    };
    defaultVerificationTime: number; // hours
    maxDocumentsPerBatch: number;
}

interface VerificationSettingsProps {
    settings: VerificationSettings;
}

export function VerificationSettings({ settings }: VerificationSettingsProps) {
    const [formData, setFormData] = useState<VerificationSettings>(settings);
    const [isSaving, setIsSaving] = useState(false);

    const handleSwitchChange = (key: string, value: boolean) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleNotificationChange = (key: string, value: boolean) => {
        setFormData(prev => ({
            ...prev,
            notificationPreferences: {
                ...prev.notificationPreferences,
                [key]: value
            }
        }));
    };

    const handleInputChange = (key: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("Settings saved:", formData);
        } catch (error) {
            console.error("Error saving settings:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Verification Settings
                </CardTitle>
                <CardDescription>
                    Configure document verification workflow and preferences
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Workflow Settings */}
                <div className="space-y-4">
                    <h4 className="font-medium text-sm">Workflow Settings</h4>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="autoAssign">Auto-assign documents</Label>
                            <p className="text-sm text-gray-500">
                                Automatically assign new documents to available verifiers
                            </p>
                        </div>
                        <Switch
                            id="autoAssign"
                            checked={formData.autoAssignDocuments}
                            onCheckedChange={(checked) => handleSwitchChange("autoAssignDocuments", checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="requireComments">Require comments</Label>
                            <p className="text-sm text-gray-500">
                                Require verifiers to add comments for all verifications
                            </p>
                        </div>
                        <Switch
                            id="requireComments"
                            checked={formData.requireComments}
                            onCheckedChange={(checked) => handleSwitchChange("requireComments", checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="batchVerification">Allow batch verification</Label>
                            <p className="text-sm text-gray-500">
                                Enable batch processing of multiple documents
                            </p>
                        </div>
                        <Switch
                            id="batchVerification"
                            checked={formData.allowBatchVerification}
                            onCheckedChange={(checked) => handleSwitchChange("allowBatchVerification", checked)}
                        />
                    </div>
                </div>

                {/* Timing Settings */}
                <div className="space-y-4">
                    <h4 className="font-medium text-sm">Timing Settings</h4>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="verificationTime">Default verification time (hours)</Label>
                            <Input
                                id="verificationTime"
                                type="number"
                                value={formData.defaultVerificationTime}
                                onChange={(e) => handleInputChange("defaultVerificationTime", parseInt(e.target.value))}
                                min="1"
                                max="168"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxBatch">Max documents per batch</Label>
                            <Input
                                id="maxBatch"
                                type="number"
                                value={formData.maxDocumentsPerBatch}
                                onChange={(e) => handleInputChange("maxDocumentsPerBatch", parseInt(e.target.value))}
                                min="1"
                                max="50"
                            />
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="space-y-4">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notification Settings
                    </h4>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="emailNotifications">Email notifications</Label>
                                <p className="text-sm text-gray-500">
                                    Receive email notifications for verification activities
                                </p>
                            </div>
                            <Switch
                                id="emailNotifications"
                                checked={formData.notificationPreferences.emailNotifications}
                                onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="browserNotifications">Browser notifications</Label>
                                <p className="text-sm text-gray-500">
                                    Show browser notifications for new documents
                                </p>
                            </div>
                            <Switch
                                id="browserNotifications"
                                checked={formData.notificationPreferences.browserNotifications}
                                onCheckedChange={(checked) => handleNotificationChange("browserNotifications", checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="newDocumentAlerts">New document alerts</Label>
                                <p className="text-sm text-gray-500">
                                    Get notified when new documents are uploaded
                                </p>
                            </div>
                            <Switch
                                id="newDocumentAlerts"
                                checked={formData.notificationPreferences.newDocumentAlerts}
                                onCheckedChange={(checked) => handleNotificationChange("newDocumentAlerts", checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="verificationReminders">Verification reminders</Label>
                                <p className="text-sm text-gray-500">
                                    Receive reminders for pending verifications
                                </p>
                            </div>
                            <Switch
                                id="verificationReminders"
                                checked={formData.notificationPreferences.verificationReminders}
                                onCheckedChange={(checked) => handleNotificationChange("verificationReminders", checked)}
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t">
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? "Saving..." : "Save Settings"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
