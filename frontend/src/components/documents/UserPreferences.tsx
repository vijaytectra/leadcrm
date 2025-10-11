"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { User, Palette, Globe, Clock, Save } from "lucide-react";

interface UserPreferences {
    theme: "light" | "dark" | "system";
    language: string;
    timezone: string;
    dateFormat: string;
    itemsPerPage: number;
    defaultSortBy: string;
    defaultSortOrder: "asc" | "desc";
}

interface UserPreferencesProps {
    preferences: UserPreferences;
}

export function UserPreferences({ preferences }: UserPreferencesProps) {
    const [formData, setFormData] = useState<UserPreferences>(preferences);
    const [isSaving, setIsSaving] = useState(false);

    const handleSelectChange = (key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleNumberChange = (key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [key]: parseInt(value)
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("Preferences saved:", formData);
        } catch (error) {
            console.error("Error saving preferences:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    User Preferences
                </CardTitle>
                <CardDescription>
                    Customize your document verification experience
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Appearance Settings */}
                <div className="space-y-4">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Appearance
                    </h4>

                    <div className="space-y-2">
                        <Label htmlFor="theme">Theme</Label>
                        <Select value={formData.theme} onValueChange={(value) => handleSelectChange("theme", value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Language Settings */}
                <div className="space-y-4">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Language & Region
                    </h4>

                    <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select value={formData.language} onValueChange={(value) => handleSelectChange("language", value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                                <SelectItem value="hi">Hindi</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select value={formData.timezone} onValueChange={(value) => handleSelectChange("timezone", value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="UTC">UTC</SelectItem>
                                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                <SelectItem value="America/Chicago">Central Time</SelectItem>
                                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                                <SelectItem value="Europe/London">London</SelectItem>
                                <SelectItem value="Europe/Paris">Paris</SelectItem>
                                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                                <SelectItem value="Asia/Kolkata">India</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dateFormat">Date Format</Label>
                        <Select value={formData.dateFormat} onValueChange={(value) => handleSelectChange("dateFormat", value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Display Settings */}
                <div className="space-y-4">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Display Settings
                    </h4>

                    <div className="space-y-2">
                        <Label htmlFor="itemsPerPage">Items per page</Label>
                        <Select value={formData.itemsPerPage.toString()} onValueChange={(value) => handleNumberChange("itemsPerPage", value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="defaultSortBy">Default sort by</Label>
                        <Select value={formData.defaultSortBy} onValueChange={(value) => handleSelectChange("defaultSortBy", value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="uploadedAt">Upload Date</SelectItem>
                                <SelectItem value="fileName">File Name</SelectItem>
                                <SelectItem value="studentName">Student Name</SelectItem>
                                <SelectItem value="status">Status</SelectItem>
                                <SelectItem value="verifiedAt">Verification Date</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="defaultSortOrder">Default sort order</Label>
                        <Select value={formData.defaultSortOrder} onValueChange={(value) => handleSelectChange("defaultSortOrder", value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asc">Ascending</SelectItem>
                                <SelectItem value="desc">Descending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t">
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? "Saving..." : "Save Preferences"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
