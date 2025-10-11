import StudentPortalLayoutWrapper from "@/components/layouts/StudentPortalLayoutWrapper";

export default function StudentPortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <StudentPortalLayoutWrapper>
            {children}
        </StudentPortalLayoutWrapper>
    );
}
