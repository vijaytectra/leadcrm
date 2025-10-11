'use client';

import { useState } from 'react';
import { CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Payment {
    id: string;
    amount: number;
    description: string;
    status: 'completed' | 'pending' | 'failed';
    date: Date;
    transactionId: string;
}

export default function PaymentHistoryView() {
    const [payments] = useState<Payment[]>([
        {
            id: '1',
            amount: 5000,
            description: 'Application Fee',
            status: 'completed',
            date: new Date('2024-01-15'),
            transactionId: 'TXN123456789',
        },
        {
            id: '2',
            amount: 2500,
            description: 'Processing Fee',
            status: 'pending',
            date: new Date('2024-01-16'),
            transactionId: 'TXN987654321',
        },
        {
            id: '3',
            amount: 1000,
            description: 'Document Verification Fee',
            status: 'failed',
            date: new Date('2024-01-17'),
            transactionId: 'TXN456789123',
        },
    ]);

    const getStatusIcon = (status: Payment['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'failed':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
        }
    };

    const getStatusColor = (status: Payment['status']) => {
        switch (status) {
            case 'completed':
                return 'text-green-600 bg-green-50';
            case 'pending':
                return 'text-yellow-600 bg-yellow-50';
            case 'failed':
                return 'text-red-600 bg-red-50';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    const totalPaid = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
                <p className="text-gray-600 mt-1">View your payment transactions and history</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Paid</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPaid)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(pendingAmount)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <CreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                            <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment List */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {payments.map((payment) => (
                        <div key={payment.id} className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <CreditCard className="h-8 w-8 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{payment.description}</p>
                                        <p className="text-sm text-gray-500">
                                            {formatDate(payment.date)} • {payment.transactionId}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-lg font-bold text-gray-900">
                                        {formatCurrency(payment.amount)}
                                    </span>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}
                                    >
                                        {getStatusIcon(payment.status)}
                                        <span className="ml-1 capitalize">{payment.status}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
