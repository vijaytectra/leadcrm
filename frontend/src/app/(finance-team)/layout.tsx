import FinanceTeamLayoutWrapper from "@/components/layouts/FinanceTeamLayoutWrapper";

export default function FinanceTeamLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <FinanceTeamLayoutWrapper>
            {children}
        </FinanceTeamLayoutWrapper>
    );
}
