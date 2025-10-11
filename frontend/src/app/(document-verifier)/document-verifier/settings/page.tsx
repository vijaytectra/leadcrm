import { Suspense } from "react";
import { DocumentTypeSettings } from "@/components/documents/DocumentTypeSettings";
import { VerificationSettings } from "@/components/documents/VerificationSettings";
import { UserPreferences } from "@/components/documents/UserPreferences";

interface DocumentSettingsPageProps {
    searchParams: Promise<{
        tenant?: string;
    }>;
}

async function getDocumentSettingsData(tenantSlug: string) {
    try {
        // This would be replaced with actual API calls
        return {
            documentTypes: [
                {
                    id: "1",
                    name: "Passport",
                    description: "Valid passport document",
                    category: "IDENTITY",
                    isRequired: true,
                    maxFileSize: 10485760, // 10MB
                    allowedFormats: ["application/pdf", "image/jpeg", "image/png"],
                    isActive: true,
                    checklists: [
                        {
                            id: "1",
                            title: "Document is clear and readable",
                            description: "All text and images are clearly visible",
                            isRequired: true,
                            order: 1,
                        },
                        {
                            id: "2",
                            title: "Document is not expired",
                            description: "Check expiration date if applicable",
                            isRequired: true,
                            order: 2,
                        },
                    ],
                },
                {
                    id: "2",
                    name: "Academic Transcript",
                    description: "Official academic transcript",
                    category: "ACADEMIC",
                    isRequired: true,
                    maxFileSize: 10485760,
                    allowedFormats: ["application/pdf"],
                    isActive: true,
                    checklists: [
                        {
                            id: "3",
                            title: "Transcript is official",
                            description: "Must be an official transcript from the institution",
                            isRequired: true,
                            order: 1,
                        },
                        {
                            id: "4",
                            title: "All grades are visible",
                            description: "All course grades and GPA are clearly shown",
                            isRequired: true,
                            order: 2,
                        },
                    ],
                },
                {
                    id: "3",
                    name: "Birth Certificate",
                    description: "Official birth certificate",
                    category: "IDENTITY",
                    isRequired: false,
                    maxFileSize: 10485760,
                    allowedFormats: ["application/pdf", "image/jpeg", "image/png"],
                    isActive: true,
                    checklists: [
                        {
                            id: "5",
                            title: "Document is official",
                            description: "Must be an official birth certificate",
                            isRequired: true,
                            order: 1,
                        },
                    ],
                },
            ],
            verificationSettings: {
                autoAssignDocuments: true,
                requireComments: true,
                allowBatchVerification: true,
                notificationPreferences: {
                    emailNotifications: true,
                    browserNotifications: true,
                    newDocumentAlerts: true,
                    verificationReminders: true,
                },
                defaultVerificationTime: 24, // hours
                maxDocumentsPerBatch: 10,
            },
            userPreferences: {
                theme: "light",
                language: "en",
                timezone: "UTC",
                dateFormat: "MM/DD/YYYY",
                itemsPerPage: 20,
                defaultSortBy: "uploadedAt",
                defaultSortOrder: "asc",
            },
        };
    } catch (error) {
        console.error("Error fetching document settings data:", error);
        return null;
    }
}

function DocumentSettingsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-64 bg-gray-200 rounded animate-pulse" />
                    ))}
                </div>
                <div className="space-y-6">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default async function DocumentSettingsPage({
    searchParams
}: DocumentSettingsPageProps) {
    const resolvedSearchParams = await searchParams;
    const tenant = resolvedSearchParams.tenant || "demo-tenant";

    const settingsData = await getDocumentSettingsData(tenant);

    if (!settingsData) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center text-gray-500">
                    Failed to load document settings data
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Document Settings</h1>
                <p className="text-muted-foreground">
                    Configure document types, verification settings, and preferences
                </p>
            </div>

            <Suspense fallback={<DocumentSettingsSkeleton />}>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <DocumentTypeSettings documentTypes={settingsData.documentTypes} />
                        <VerificationSettings settings={settingsData.verificationSettings} />
                    </div>
                    <div className="space-y-6">
                        <UserPreferences preferences={settingsData.userPreferences} />
                    </div>
                </div>
            </Suspense>
        </div>
    );
}
