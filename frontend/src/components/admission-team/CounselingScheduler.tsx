"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Calendar,
    Clock,
    User,
    Plus,
    Edit,
    Trash2
} from "lucide-react";
import { Appointment, Application } from "@/lib/api/admissions";

interface CounselingSchedulerProps {
    appointments: Appointment[];
    applications?: Application[];
    onSchedule?: (data: {
        applicationId: string;
        studentName: string;
        studentEmail?: string;
        studentPhone?: string;
        scheduledAt: string;
        duration?: number;
        notes?: string;
    }) => Promise<void>;
    onUpdate?: (appointmentId: string, data: {
        scheduledAt?: string;
        duration?: number;
        status?: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
        notes?: string;
    }) => Promise<void>;
    onDelete?: (appointmentId: string) => Promise<void>;
    isLoading?: boolean;
}

export function CounselingScheduler({
    appointments,
    applications,
    onSchedule,
    onUpdate,
    onDelete,
    isLoading = false
}: CounselingSchedulerProps) {
    const [showForm, setShowForm] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [formData, setFormData] = useState({
        applicationId: '',
        studentName: '',
        studentEmail: '',
        studentPhone: '',
        scheduledAt: '',
        duration: 30,
        notes: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAppointment) {
            await onUpdate?.(editingAppointment.id, {
                scheduledAt: formData.scheduledAt,
                duration: formData.duration,
                notes: formData.notes,
            });
            setEditingAppointment(null);
        } else {
            await onSchedule?.(formData);
        }
        setShowForm(false);
        setFormData({
            applicationId: '',
            studentName: '',
            studentEmail: '',
            studentPhone: '',
            scheduledAt: '',
            duration: 30,
            notes: '',
        });
    };

    const handleEdit = (appointment: Appointment) => {
        setEditingAppointment(appointment);
        setFormData({
            applicationId: appointment.applicationId || '',
            studentName: appointment.studentName,
            studentEmail: appointment.studentEmail || '',
            studentPhone: appointment.studentPhone || '',
            scheduledAt: new Date(appointment.scheduledAt).toISOString().slice(0, 16),
            duration: appointment.duration,
            notes: appointment.notes || '',
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingAppointment(null);
        setFormData({
            applicationId: '',
            studentName: '',
            studentEmail: '',
            studentPhone: '',
            scheduledAt: '',
            duration: 30,
            notes: '',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED':
                return 'bg-blue-100 text-blue-800';
            case 'CONFIRMED':
                return 'bg-green-100 text-green-800';
            case 'COMPLETED':
                return 'bg-emerald-100 text-emerald-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            case 'NO_SHOW':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Counseling Schedule</h2>
                    <p className="text-muted-foreground">
                        Manage counseling appointments and sessions
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Appointment
                </Button>
            </div>

            {/* Schedule Form */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="applicationId">Application</Label>
                                    <Select
                                        value={formData.applicationId}
                                        onValueChange={(value) => {
                                            const application = applications?.find(app => app.id === value);
                                            setFormData(prev => ({
                                                ...prev,
                                                applicationId: value,
                                                studentName: application?.studentName || '',
                                                studentEmail: application?.studentEmail || '',
                                                studentPhone: application?.studentPhone || '',
                                            }));
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select application" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {applications?.map((app) => (
                                                <SelectItem key={app.id} value={app.id}>
                                                    {app.studentName} - {app.course}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="studentName">Student Name</Label>
                                    <Input
                                        id="studentName"
                                        value={formData.studentName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="studentEmail">Email</Label>
                                    <Input
                                        id="studentEmail"
                                        type="email"
                                        value={formData.studentEmail}
                                        onChange={(e) => setFormData(prev => ({ ...prev, studentEmail: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="studentPhone">Phone</Label>
                                    <Input
                                        id="studentPhone"
                                        value={formData.studentPhone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, studentPhone: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="scheduledAt">Date & Time</Label>
                                    <Input
                                        id="scheduledAt"
                                        type="datetime-local"
                                        value={formData.scheduledAt}
                                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration (minutes)</Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        min="15"
                                        max="120"
                                        value={formData.duration}
                                        onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Add any notes about the counseling session..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Saving...' : (editingAppointment ? 'Update' : 'Schedule')}
                                </Button>
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Appointments List */}
            <div className="space-y-4">
                {appointments.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-8">
                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No appointments scheduled</h3>
                            <p className="text-muted-foreground">
                                Schedule your first counseling appointment to get started.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    appointments.map((appointment) => (
                        <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium">{appointment.studentName}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                                {appointment.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    {new Date(appointment.scheduledAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                <span>
                                                    {new Date(appointment.scheduledAt).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                <span>{appointment.duration} min</span>
                                            </div>
                                        </div>
                                        {appointment.studentEmail && (
                                            <div className="text-sm text-muted-foreground">
                                                {appointment.studentEmail}
                                            </div>
                                        )}
                                        {appointment.notes && (
                                            <div className="text-sm p-2 bg-gray-50 rounded">
                                                {appointment.notes}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(appointment)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onDelete?.(appointment.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
