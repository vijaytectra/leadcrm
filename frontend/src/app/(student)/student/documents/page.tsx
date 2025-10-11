import { Suspense } from "react";
import { StudentDocumentUpload } from "@/components/student/StudentDocumentUpload";
import { StudentDocumentList } from "@/components/student/StudentDocumentList";
import { UploadRequirements } from "@/components/student/UploadRequirements";

interface StudentDocumentsPageProps {
    searchParams: Promise<{
        tenant?: string;
    }>;
}

async function getStudentDocumentsData(tenantSlug: string) {
    try {
        // This would be replaced with actual API calls
        return {
            uploadedDocuments: [
                {
                    id: "1",
                    fileName: "passport.pdf",
                    fileType: "application/pdf",
                    fileSize: 1024000,
                    status: "VERIFIED",
                    uploadedAt: new Date().toISOString(),
                    verifiedAt: new Date().toISOString(),
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
                    documentType: {
                        name: "Academic Transcript",
                        category: "ACADEMIC",
                    },
                },
            ],
            requiredDocuments: [
                {
                    id: "1",
                    name: "Passport",
                    description: "Valid passport document",
                    category: "IDENTITY",
                    isRequired: true,
                    maxFileSize: 10485760,
                    allowedFormats: ["application/pdf", "image/jpeg", "image/png"],
                },
                {
                    id: "2",
                    name: "Academic Transcript",
                    description: "Official academic transcript",
                    category: "ACADEMIC",
                    isRequired: true,
                    maxFileSize: 10485760,
                    allowedFormats: ["application/pdf"],
                },
                {
                    id: "3",
                    name: "Birth Certificate",
                    description: "Official birth certificate",
                    category: "IDENTITY",
                    isRequired: false,
                    maxFileSize: 10485760,
                    allowedFormats: ["application/pdf", "image/jpeg", "image/png"],
                },
            ],
        };
    } catch (error) {
        console.error("Error fetching student documents data:", error);
        return null;
    }
}

function StudentDocumentsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
                    ))}
                </div>
                <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default async function StudentDocumentsPage({
    searchParams
}: StudentDocumentsPageProps) {
    const resolvedSearchParams = await searchParams;
    const tenant = resolvedSearchParams.tenant || "demo-tenant";

    const documentsData = await getStudentDocumentsData(tenant);

    if (!documentsData) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center text-gray-500">
                    Failed to load documents data
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Documents</h1>
                <p className="text-muted-foreground">
                    Upload and manage your application documents
                </p>
            </div>

            <Suspense fallback={<StudentDocumentsSkeleton />}>
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-6">
                        <UploadRequirements requiredDocuments={documentsData.requiredDocuments} />
                        <StudentDocumentUpload />
                    </div>
                    <StudentDocumentList documents={documentsData.uploadedDocuments} />
                </div>
            </Suspense>
        </div>
    );
}
