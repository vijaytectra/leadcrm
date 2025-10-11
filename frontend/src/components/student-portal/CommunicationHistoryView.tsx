'use client';

import { useState } from 'react';
import { MessageSquare, Phone, Mail, Calendar, User } from 'lucide-react';

interface Communication {
    id: string;
    type: 'email' | 'phone' | 'sms' | 'appointment';
    subject: string;
    content: string;
    sender: string;
    date: Date;
    status: 'sent' | 'delivered' | 'read' | 'failed';
}

export default function CommunicationHistoryView() {
    const [communications] = useState<Communication[]>([
        {
            id: '1',
            type: 'email',
            subject: 'Application Status Update',
            content: 'Your application has been received and is under review...',
            sender: 'Admission Team',
            date: new Date('2024-01-15T10:30:00'),
            status: 'read',
        },
        {
            id: '2',
            type: 'phone',
            subject: 'Follow-up Call',
            content: 'Called to discuss application requirements...',
            sender: 'Admission Team',
            date: new Date('2024-01-16T14:20:00'),
            status: 'delivered',
        },
        {
            id: '3',
            type: 'appointment',
            subject: 'Counseling Session Scheduled',
            content: 'Your counseling session has been scheduled for...',
            sender: 'Admission Team',
            date: new Date('2024-01-17T09:00:00'),
            status: 'sent',
        },
        {
            id: '4',
            type: 'sms',
            subject: 'Document Reminder',
            content: 'Please upload your academic transcripts...',
            sender: 'Admission Team',
            date: new Date('2024-01-18T16:45:00'),
            status: 'delivered',
        },
    ]);

    const getTypeIcon = (type: Communication['type']) => {
        switch (type) {
            case 'email':
                return <Mail className="h-5 w-5 text-blue-500" />;
            case 'phone':
                return <Phone className="h-5 w-5 text-green-500" />;
            case 'sms':
                return <MessageSquare className="h-5 w-5 text-purple-500" />;
            case 'appointment':
                return <Calendar className="h-5 w-5 text-orange-500" />;
        }
    };

    const getStatusColor = (status: Communication['status']) => {
        switch (status) {
            case 'sent':
                return 'text-blue-600 bg-blue-50';
            case 'delivered':
                return 'text-green-600 bg-green-50';
            case 'read':
                return 'text-purple-600 bg-purple-50';
            case 'failed':
                return 'text-red-600 bg-red-50';
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const getTimeAgo = (date: Date) => {
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return formatDate(date);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Communication History</h1>
                <p className="text-gray-600 mt-1">View all communications with the institution</p>
            </div>

            {/* Summary */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {communications.filter(c => c.type === 'email').length}
                        </div>
                        <div className="text-sm text-gray-500">Emails</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {communications.filter(c => c.type === 'phone').length}
                        </div>
                        <div className="text-sm text-gray-500">Calls</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {communications.filter(c => c.type === 'sms').length}
                        </div>
                        <div className="text-sm text-gray-500">SMS</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                            {communications.filter(c => c.type === 'appointment').length}
                        </div>
                        <div className="text-sm text-gray-500">Appointments</div>
                    </div>
                </div>
            </div>

            {/* Communication List */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Communications</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {communications.map((comm) => (
                        <div key={comm.id} className="px-6 py-4">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    {getTypeIcon(comm.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-900">{comm.subject}</p>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-500">{getTimeAgo(comm.date)}</span>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(comm.status)}`}
                                            >
                                                {comm.status}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{comm.content}</p>
                                    <div className="flex items-center mt-2 text-sm text-gray-500">
                                        <User className="h-4 w-4 mr-1" />
                                        <span>{comm.sender}</span>
                                        <span className="mx-2">•</span>
                                        <span>{formatDate(comm.date)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
