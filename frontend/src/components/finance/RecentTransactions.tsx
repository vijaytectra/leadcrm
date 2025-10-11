import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, CreditCard, Building, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Transaction {
    id: string;
    studentName: string;
    amount: number;
    status: "COMPLETED" | "PENDING" | "FAILED";
    paymentMethod: string;
    transactionDate: string;
}

interface RecentTransactionsProps {
    transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
            case "PENDING":
                return <Badge variant="secondary">Pending</Badge>;
            case "FAILED":
                return <Badge variant="destructive">Failed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPaymentMethodIcon = (method: string) => {
        switch (method.toLowerCase()) {
            case "credit card":
                return <CreditCard className="h-4 w-4" />;
            case "bank transfer":
                return <Building className="h-4 w-4" />;
            default:
                return <Receipt className="h-4 w-4" />;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Recent Transactions
                </CardTitle>
                <CardDescription>
                    Latest payment activities
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {transactions.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            No recent transactions
                        </div>
                    ) : (
                        transactions.map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                        {getPaymentMethodIcon(transaction.paymentMethod)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-gray-900">
                                                {transaction.studentName}
                                            </p>
                                            {getStatusBadge(transaction.status)}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {transaction.paymentMethod}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {formatDistanceToNow(new Date(transaction.transactionDate), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900">
                                        {formatCurrency(transaction.amount)}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
