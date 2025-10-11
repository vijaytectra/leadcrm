import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DocumentViewer } from "@/components/documents/DocumentViewer";
import { DocumentMetadata } from "@/components/documents/DocumentMetadata";
import { VerificationChecklist } from "@/components/documents/VerificationChecklist";
import { VerificationActions } from "@/components/documents/VerificationActions";

interface DocumentVerificationPageProps {
    params: Promise<{
        id: string;
    }>;
    searchParams: Promise<{
        tenant?: string;
    }>;
}

async function getDocumentData(tenantSlug: string, documentId: string) {
    try {
        // This would be replaced with actual API calls
        // For now, returning mock data structure
        return {
            id: documentId,
            fileName: "passport.pdf",
            filePath: "https://res.cloudinary.com/example/image/upload/v1234567890/sample.pdf",
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
                description: "Valid passport document",
            },
            application: {
                id: "app-1",
                studentName: "John Doe",
                studentEmail: "john.doe@example.com",
            },
        };
    } catch (error) {
        console.error("Error fetching document data:", error);
        return null;
    }
}

function DocumentVerificationSkeleton() {
    return (
        <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <div className="h-96 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="space-y-4">
                    <div className="h-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-48 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>
        </div>
    );
}

export default async function DocumentVerificationPage({ 
    params, 
    searchParams 
}: DocumentVerificationPageProps) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const tenant = resolvedSearchParams.tenant || "demo-tenant";
    const documentId = resolvedParams.id;

    const document = await getDocumentData(tenant, documentId);

    if (!document) {
        notFound();
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Document Verification</h1>
                <p className="text-muted-foreground">
                    Review and verify document: {document.fileName}
                </p>
            </div>

            <Suspense fallback={<DocumentVerificationSkeleton />}>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <DocumentViewer document={document} />
                    </div>
                    <div className="space-y-6">
                        <DocumentMetadata document={document} />
                        <VerificationChecklist documentType={document.documentType} />
                        <VerificationActions documentId={document.id} />
                    </div>
                </div>
            </Suspense>
        </div>
    );
}
