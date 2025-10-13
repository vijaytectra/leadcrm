"use client";

import * as React from "react";
import { Modal, ModalHeader, ModalContent, ModalFooter, ModalCloseButton } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Building2,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Users,
    Sparkles,
    Star,
    Crown,
    Calendar,
    TrendingUp,
    DollarSign,
    UserCheck,
    AlertCircle,
    Clock,
    CheckCircle,
    XCircle,
    Edit,
    Trash2
} from "lucide-react";
import { Institution } from "@/lib/api/institutions";

interface ViewInstitutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    institution: Institution | null;
    onEdit: (institution: Institution) => void;
    onDelete: (institution: Institution) => void;
}

export const ViewInstitutionModal: React.FC<ViewInstitutionModalProps> = ({
    isOpen,
    onClose,
    institution,
    onEdit,
    onDelete
}) => {
    if (!institution) return null;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return <Badge variant="default" className="bg-green-500">Active</Badge>;
            case "INACTIVE":
                return <Badge variant="secondary">Inactive</Badge>;
            case "SUSPENDED":
                return <Badge variant="destructive">Suspended</Badge>;
            case "EXPIRED":
                return <Badge variant="outline">Expired</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const getTierBadge = (tier: string) => {
        switch (tier) {
            case "STARTER":
                return (
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                        <Sparkles className="h-3 w-3 mr-1" />
                        STARTER
                    </Badge>
                );
            case "PRO":
                return (
                    <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                        <Star className="h-3 w-3 mr-1" />
                        PRO
                    </Badge>
                );
            case "MAX":
                return (
                    <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
                        <Crown className="h-3 w-3 mr-1" />
                        MAX
                    </Badge>
                );
            default:
                return <Badge variant="outline">{tier}</Badge>;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "INACTIVE":
                return <Clock className="h-4 w-4 text-gray-400" />;
            case "SUSPENDED":
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            case "EXPIRED":
                return <XCircle className="h-4 w-4 text-orange-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-400" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl w-full">
            <ModalHeader>
                <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center shadow-sm">
                        <Building2 className="h-6 w-6 text-violet-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent">
                            {institution.name}
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                            Institution Details & Statistics
                        </p>
                    </div>
                </div>
                <ModalCloseButton onClose={onClose} />
            </ModalHeader>

            <ModalContent className="w-full bg-gradient-to-br from-slate-50 via-white to-slate-100">
                <div className="space-y-6">
                    {/* Basic Information */}
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
                            <CardTitle className="flex items-center space-x-3 text-slate-800">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                    <Building2 className="h-4 w-4 text-blue-600" />
                                </div>
                                <span>Basic Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Institution Name</label>
                                    <p className="text-slate-900 font-medium">{institution.name}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Slug</label>
                                    <p className="text-slate-900 font-mono text-sm bg-slate-100 px-2 py-1 rounded">{institution.slug}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                                    <div className="flex items-center space-x-2">
                                        <Mail className="h-4 w-4 text-slate-500" />
                                        <p className="text-slate-900">{institution.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                                    <div className="flex items-center space-x-2">
                                        <Phone className="h-4 w-4 text-slate-500" />
                                        <p className="text-slate-900">{institution.phone || "Not provided"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Address</label>
                                <div className="flex items-start space-x-2">
                                    <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
                                    <p className="text-slate-900">{institution.address || "Not provided"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Subscription Information */}
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
                            <CardTitle className="flex items-center space-x-3 text-slate-800">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
                                    <CreditCard className="h-4 w-4 text-purple-600" />
                                </div>
                                <span>Subscription Details</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Subscription Tier</label>
                                    <div className="flex items-center space-x-2">
                                        {getTierBadge(institution.subscriptionTier)}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Status</label>
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(institution.subscriptionStatus)}
                                        {getStatusBadge(institution.subscriptionStatus)}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Subscription Start</label>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-slate-500" />
                                        <p className="text-slate-900">{formatDate(institution.subscriptionStart)}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Subscription End</label>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-slate-500" />
                                        <p className="text-slate-900">{formatDate(institution.subscriptionEnd)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Limits & Usage */}
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
                            <CardTitle className="flex items-center space-x-3 text-slate-800">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                                    <Users className="h-4 w-4 text-emerald-600" />
                                </div>
                                <span>Account Limits & Usage</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Team Members</label>
                                    <div className="flex items-center space-x-2">
                                        <UserCheck className="h-4 w-4 text-slate-500" />
                                        <p className="text-slate-900">
                                            {institution._count.users} / {institution.maxTeamMembers === 999 ? "Unlimited" : institution.maxTeamMembers}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Leads</label>
                                    <div className="flex items-center space-x-2">
                                        <TrendingUp className="h-4 w-4 text-slate-500" />
                                        <p className="text-slate-900">
                                            {institution._count.leads} / {institution.maxLeads === 99999 ? "Unlimited" : institution.maxLeads}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Total Payments</label>
                                <div className="flex items-center space-x-2">
                                    <DollarSign className="h-4 w-4 text-slate-500" />
                                    <p className="text-slate-900">{institution._count.payments} transactions</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timestamps */}
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
                            <CardTitle className="flex items-center space-x-3 text-slate-800">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-100 to-gray-100 flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-slate-600" />
                                </div>
                                <span>Timestamps</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Created</label>
                                    <p className="text-slate-900">{formatDate(institution.createdAt)}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Last Updated</label>
                                    <p className="text-slate-900">{formatDate(institution.updatedAt)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </ModalContent>

            <ModalFooter className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-b-lg">
                <div className="flex items-center space-x-4 w-full justify-between">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => onEdit(institution)}
                            className="border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onDelete(institution)}
                            className="border-red-300 hover:border-red-400 hover:bg-red-50 text-red-700 hover:text-red-800 transition-all duration-200"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
                    >
                        Close
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
};
