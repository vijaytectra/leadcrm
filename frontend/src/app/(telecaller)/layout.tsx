import TelecallerLayoutWrapper from "@/components/layouts/TelecallerLayoutWrapper";

export default function TelecallerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <TelecallerLayoutWrapper>
            {children}
        </TelecallerLayoutWrapper>
    );
}
