import { Metadata } from 'next';
import PaymentHistoryView from '@/components/student-portal/PaymentHistoryView';

export const metadata: Metadata = {
    title: 'Payment History',
    description: 'View your payment history and transactions',
};

export default function PaymentsPage() {
    return <PaymentHistoryView />;
}
