import { Suspense } from "react";
import { PaymentHistory } from "@/components/student/PaymentHistory";
import { RefundRequestForm } from "@/components/student/RefundRequestForm";
import { RefundStatus } from "@/components/student/RefundStatus";

interface StudentPaymentsPageProps {
    searchParams: Promise<{
        tenant?: string;
    }>;
}

async function getStudentPaymentsData(tenantSlug: string) {
    try {
        // This would be replaced with actual API calls
        return {
            payments: [
                {
                    id: "1",
                    amount: 2500,
                    currency: "USD",
                    status: "COMPLETED",
                    paymentMethod: "Credit Card",
                    transactionId: "txn_123456789",
                    createdAt: new Date().toISOString(),
                    application: {
                        id: "app-1",
                        studentName: "John Doe",
                        studentEmail: "john.doe@example.com",
                    },
                },
                {
                    id: "2",
                    amount: 1500,
                    currency: "USD",
                    status: "PENDING",
                    paymentMethod: "Bank Transfer",
                    transactionId: "txn_987654321",
                    createdAt: new Date().toISOString(),
                    application: {
                        id: "app-1",
                        studentName: "John Doe",
                        studentEmail: "john.doe@example.com",
                    },
                },
            ],
            refundRequests: [
                {
                    id: "1",
                    amount: 500,
                    reason: "Duplicate payment",
                    status: "PENDING",
                    requestedAt: new Date().toISOString(),
                    payment: {
                        id: "1",
                        amount: 2500,
                        currency: "USD",
                        status: "COMPLETED",
                    },
                },
            ],
        };
    } catch (error) {
        console.error("Error fetching student payments data:", error);
        return null;
    }
}

function StudentPaymentsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
                    ))}
                </div>
                <div className="space-y-4">
                    {Array.from({ length: 1 }).map((_, i) => (
                        <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default async function StudentPaymentsPage({
    searchParams
}: StudentPaymentsPageProps) {
    const resolvedSearchParams = await searchParams;
    const tenant = resolvedSearchParams.tenant || "demo-tenant";

    const paymentsData = await getStudentPaymentsData(tenant);

    if (!paymentsData) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center text-gray-500">
                    Failed to load payments data
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payments & Refunds</h1>
                <p className="text-muted-foreground">
                    View your payment history and request refunds
                </p>
            </div>

            <Suspense fallback={<StudentPaymentsSkeleton />}>
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-6">
                        <PaymentHistory payments={paymentsData.payments} />
                        <RefundRequestForm />
                    </div>
                    <RefundStatus refundRequests={paymentsData.refundRequests} />
                </div>
            </Suspense>
        </div>
    );
}
