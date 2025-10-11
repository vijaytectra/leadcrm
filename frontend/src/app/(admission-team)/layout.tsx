import AdmissionTeamLayoutWrapper from "@/components/layouts/AdmissionTeamLayoutWrapper";

export default function AdmissionTeamLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdmissionTeamLayoutWrapper>
            {children}
        </AdmissionTeamLayoutWrapper>
    );
}
