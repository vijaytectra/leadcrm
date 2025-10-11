import DocumentVerifierLayoutWrapper from "@/components/layouts/DocumentVerifierLayoutWrapper";

export default function DocumentVerifierLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DocumentVerifierLayoutWrapper>
            {children}
        </DocumentVerifierLayoutWrapper>
    );
}
