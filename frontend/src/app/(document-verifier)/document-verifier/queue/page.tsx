import { Suspense } from "react";
import { DocumentQueue } from "@/components/documents/DocumentQueue";
import { DocumentQueueFilters } from "@/components/documents/DocumentQueueFilters";
import { BatchVerificationPanel } from "@/components/documents/BatchVerificationPanel";

interface DocumentQueuePageProps {
    searchParams: Promise<{
        tenant?: string;
        status?: string;
        page?: string;
    }>;
}

async function getDocumentQueueData(tenantSlug: string, status?: string, page = "1") {
    try {
        // This would be replaced with actual API calls
        // For now, returning mock data structure
        return {
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
            ],
            pagination: {
                page: parseInt(page),
                limit: 20,
                total: 2,
                pages: 1,
            },
        };
    } catch (error) {
        console.error("Error fetching document queue:", error);
        return null;
    }
}

function DocumentQueueSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
            </div>
            <div className="grid gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 bg-gray-200 rounded animate-pulse" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
                                <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
                            </div>
                            <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default async function DocumentQueuePage({
    searchParams
}: DocumentQueuePageProps) {
    const resolvedSearchParams = await searchParams;
    const tenant = resolvedSearchParams.tenant || "demo-tenant";
    const status = resolvedSearchParams.status;
    const page = resolvedSearchParams.page || "1";

    const queueData = await getDocumentQueueData(tenant, status, page);

    if (!queueData) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center text-gray-500">
                    Failed to load document queue
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Document Queue</h1>
                <p className="text-muted-foreground">
                    Review and verify pending documents
                </p>
            </div>

            <Suspense fallback={<DocumentQueueSkeleton />}>
                <div className="space-y-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <DocumentQueueFilters />
                        </div>
                        <BatchVerificationPanel />
                    </div>
                    <DocumentQueue
                        documents={queueData.documents}
                        pagination={queueData.pagination}
                    />
                </div>
            </Suspense>
        </div>
    );
}
