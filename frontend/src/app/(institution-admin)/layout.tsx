import { Metadata } from "next";
import { InstitutionAdminSidebar } from "@/components/layouts/InstitutionAdminSidebar";
import { InstitutionAdminHeader } from "@/components/layouts/InstitutionAdminHeader";
import { ProtectedRoute } from "@/components/ProtectedRoute";



export const metadata: Metadata = {
    title: "Institution Admin Dashboard",
    description: "Manage your institution's users, settings, and configurations",
};

interface InstitutionAdminLayoutProps {
    children: React.ReactNode;
    params: Promise<{
        tenant?: string;
    }>;
}

export default async function InstitutionAdminLayout({
    children,

}: InstitutionAdminLayoutProps) {


    return (
        <ProtectedRoute allowedRoles={["INSTITUTION_ADMIN"]}>

            <div className="flex h-screen bg-background">
                <InstitutionAdminSidebar />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <InstitutionAdminHeader />
                    <main className="flex-1 overflow-auto p-6">
                        {children}
                    </main>
                </div>
            </div>

        </ProtectedRoute >
    );
}
