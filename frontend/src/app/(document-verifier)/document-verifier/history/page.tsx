import { Suspense } from "react";
import { DocumentVerificationHistory } from "@/components/documents/DocumentVerificationHistory";
import { DocumentVerificationStats } from "@/components/documents/DocumentVerificationStats";
import { DocumentHistoryFilters } from "@/components/documents/DocumentHistoryFilters";

interface DocumentHistoryPageProps {
    searchParams: Promise<{
        tenant?: string;
        status?: string;
        dateRange?: string;
        page?: string;
    }>;
}

async function getDocumentHistoryData(tenantSlug: string, status?: string, dateRange?: string, page = "1") {
    try {
        // This would be replaced with actual API calls
        return {
            stats: {
                totalDocuments: 156,
                pendingVerification: 23,
                verifiedToday: 12,
                rejectedToday: 3,
                verifiedThisWeek: 45,
                rejectedThisWeek: 8,
            },
            documents: [
                {
                    id: "1",
                    fileName: "passport.pdf",
                    fileType: "application/pdf",
                    fileSize: 1024000,
                    status: "VERIFIED" as const,
                    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                    verifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
                    studentName: "John Doe",
                    studentEmail: "john.doe@example.com",
                    applicationId: "app-1",
                    documentType: {
                        name: "Passport",
                        category: "IDENTITY",
                    },
                    verifier: {
                        id: "verifier-1",
                        firstName: "Jane",
                        lastName: "Smith",
                        email: "jane.smith@college.edu",
                    },
                    comments: "Document is clear and valid",
                },
                {
                    id: "2",
                    fileName: "transcript.pdf",
                    fileType: "application/pdf",
                    fileSize: 2048000,
                    status: "REJECTED" as const,
                    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
                    rejectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                    studentName: "Alice Johnson",
                    studentEmail: "alice.johnson@example.com",
                    applicationId: "app-2",
                    documentType: {
                        name: "Academic Transcript",
                        category: "ACADEMIC",
                    },
                    verifier: {
                        id: "verifier-1",
                        firstName: "Jane",
                        lastName: "Smith",
                        email: "jane.smith@college.edu",
                    },
                    rejectionReason: "Document quality too low, please resubmit with higher resolution",
                },
                {
                    id: "3",
                    fileName: "birth-certificate.pdf",
                    fileType: "application/pdf",
                    fileSize: 1536000,
                    status: "VERIFIED" as const,
                    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
                    verifiedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
                    studentName: "Bob Smith",
                    studentEmail: "bob.smith@example.com",
                    applicationId: "app-3",
                    documentType: {
                        name: "Birth Certificate",
                        category: "IDENTITY",
                    },
                    verifier: {
                        id: "verifier-2",
                        firstName: "Mike",
                        lastName: "Johnson",
                        email: "mike.johnson@college.edu",
                    },
                    comments: "All details verified successfully",
                },
                {
                    id: "4",
                    fileName: "bank-statement.pdf",
                    fileType: "application/pdf",
                    fileSize: 2560000,
                    status: "VERIFIED" as const,
                    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
                    verifiedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
                    studentName: "Sarah Wilson",
                    studentEmail: "sarah.wilson@example.com",
                    applicationId: "app-4",
                    documentType: {
                        name: "Bank Statement",
                        category: "FINANCIAL",
                    },
                    verifier: {
                        id: "verifier-1",
                        firstName: "Jane",
                        lastName: "Smith",
                        email: "jane.smith@college.edu",
                    },
                    comments: "Financial documents verified",
                },
            ],
            pagination: {
                page: parseInt(page),
                limit: 20,
                total: 4,
                pages: 1,
            },
        };
    } catch (error) {
        console.error("Error fetching document history data:", error);
        return null;
    }
}

function DocumentHistorySkeleton() {
    return (
        <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="h-32 bg-gray-200 rounded animate-pulse" />
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default async function DocumentHistoryPage({
    searchParams
}: DocumentHistoryPageProps) {
    const resolvedSearchParams = await searchParams;
    const tenant = resolvedSearchParams.tenant || "demo-tenant";
    const status = resolvedSearchParams.status;
    const dateRange = resolvedSearchParams.dateRange;
    const page = resolvedSearchParams.page || "1";

    const historyData = await getDocumentHistoryData(tenant, status, dateRange, page);

    if (!historyData) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center text-gray-500">
                    Failed to load document history data
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Verification History</h1>
                <p className="text-muted-foreground">
                    View all verified and rejected documents
                </p>
            </div>

            <Suspense fallback={<DocumentHistorySkeleton />}>
                <DocumentVerificationStats stats={historyData.stats} />
                <div className="grid gap-4 md:grid-cols-2">
                    <DocumentHistoryFilters />
                    <DocumentVerificationHistory
                        documents={historyData.documents}
                        pagination={historyData.pagination}
                    />
                </div>
            </Suspense>
        </div>
    );
}
