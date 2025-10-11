import AdmissionHeadLayoutWrapper from "@/components/layouts/AdmissionHeadLayoutWrapper";

export default function AdmissionHeadLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdmissionHeadLayoutWrapper>
            {children}
        </AdmissionHeadLayoutWrapper>
    );
}
