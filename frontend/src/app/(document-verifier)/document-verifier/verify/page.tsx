import { Suspense } from "react";
import { DocumentVerificationBrowser } from "@/components/documents/DocumentVerificationBrowser";
import { DocumentVerificationStats } from "@/components/documents/DocumentVerificationStats";
import { DocumentQueueSummary } from "@/components/documents/DocumentQueueSummary";

interface DocumentVerificationPageProps {
    searchParams: Promise<{
        tenant?: string;
        status?: string;
        page?: string;
    }>;
}

async function getDocumentVerificationData(tenantSlug: string, status?: string, page = "1") {
    try {
        // This would be replaced with actual API calls
        return {
            stats: {
                totalDocuments: 156,
                pendingVerification: 23,
                verifiedToday: 12,
                rejectedToday: 3,
            },
            queueSummary: {
                urgentDocuments: 5,
                normalDocuments: 18,
                averageProcessingTime: "2.5 hours",
            },
            documents: [
                {
                    id: "1",
                    fileName: "passport.pdf",
                    fileType: "application/pdf",
                    fileSize: 1024000,
                    status: "UPLOADED",
                    uploadedAt: new Date().toISOString(),
                    studentName: "John Doe",
                    studentEmail: "john.doe@example.com",
                    applicationId: "app-1",
                    documentType: {
                        name: "Passport",
                        category: "IDENTITY",
                    },
                },
                {
                    id: "2",
                    fileName: "transcript.pdf",
                    fileType: "application/pdf",
                    fileSize: 2048000,
                    status: "UPLOADED",
                    uploadedAt: new Date().toISOString(),
                    studentName: "Alice Johnson",
                    studentEmail: "alice.johnson@example.com",
                    applicationId: "app-2",
                    documentType: {
                        name: "Academic Transcript",
                        category: "ACADEMIC",
                    },
                },
                {
                    id: "3",
                    fileName: "birth-certificate.pdf",
                    fileType: "application/pdf",
                    fileSize: 1536000,
                    status: "UPLOADED",
                    uploadedAt: new Date().toISOString(),
                    studentName: "Bob Smith",
                    studentEmail: "bob.smith@example.com",
                    applicationId: "app-3",
                    documentType: {
                        name: "Birth Certificate",
                        category: "IDENTITY",
                    },
                },
            ],
            pagination: {
                page: parseInt(page),
                limit: 20,
                total: 3,
                pages: 1,
            },
        };
    } catch (error) {
        console.error("Error fetching document verification data:", error);
        return null;
    }
}

function DocumentVerificationSkeleton() {
    return (
        <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
                ))}
            </div>
            <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
                ))}
            </div>
        </div>
    );
}

export default async function DocumentVerificationPage({
    searchParams
}: DocumentVerificationPageProps) {
    const resolvedSearchParams = await searchParams;
    const tenant = resolvedSearchParams.tenant || "demo-tenant";
    const status = resolvedSearchParams.status;
    const page = resolvedSearchParams.page || "1";

    const verificationData = await getDocumentVerificationData(tenant, status, page);

    if (!verificationData) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center text-gray-500">
                    Failed to load document verification data
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Document Verification</h1>
                <p className="text-muted-foreground">
                    Review and verify documents in the queue
                </p>
            </div>

            <Suspense fallback={<DocumentVerificationSkeleton />}>
                <DocumentVerificationStats stats={verificationData.stats} />
                <div className="grid gap-4 md:grid-cols-2">
                    <DocumentQueueSummary queueSummary={verificationData.queueSummary} />
                    <DocumentVerificationBrowser
                        documents={verificationData.documents}
                        pagination={verificationData.pagination}
                    />
                </div>
            </Suspense>
        </div>
    );
}
