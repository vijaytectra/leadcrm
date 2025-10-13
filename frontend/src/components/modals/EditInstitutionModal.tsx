"use client";

import * as React from "react";
import { Modal, ModalHeader, ModalContent, ModalFooter, ModalCloseButton } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Mail, Phone, MapPin, CreditCard, Users, Sparkles, Star, Crown, AlertTriangle } from "lucide-react";
import { Institution, UpdateInstitutionData, updateInstitution } from "@/lib/api/institutions";
import { toast } from "sonner";

interface EditInstitutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    institution: Institution | null;
    onSuccess: () => void;
}

interface InstitutionFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    subscriptionTier: "STARTER" | "PRO" | "MAX";
    subscriptionStatus: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "EXPIRED";
    maxLeads: number;
    maxTeamMembers: number;
}

export const EditInstitutionModal: React.FC<EditInstitutionModalProps> = ({
    isOpen,
    onClose,
    institution,
    onSuccess
}) => {
    const [formData, setFormData] = React.useState<InstitutionFormData>({
        name: "",
        email: "",
        phone: "",
        address: "",
        subscriptionTier: "STARTER",
        subscriptionStatus: "ACTIVE",
        maxLeads: 500,
        maxTeamMembers: 2
    });

    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [hasChanges, setHasChanges] = React.useState(false);

    // Initialize form data when institution changes
    React.useEffect(() => {
        if (institution) {
            setFormData({
                name: institution.name,
                email: institution.email,
                phone: institution.phone || "",
                address: institution.address || "",
                subscriptionTier: institution.subscriptionTier,
                subscriptionStatus: institution.subscriptionStatus,
                maxLeads: institution.maxLeads,
                maxTeamMembers: institution.maxTeamMembers
            });
            setHasChanges(false);
        }
    }, [institution]);

    const handleInputChange = (field: keyof InstitutionFormData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setHasChanges(true);

        // Auto-update limits based on subscription tier
        if (field === "subscriptionTier") {
            const limits = {
                STARTER: { maxLeads: 500, maxTeamMembers: 2 },
                PRO: { maxLeads: 2000, maxTeamMembers: 10 },
                MAX: { maxLeads: 99999, maxTeamMembers: 999 }
            };
            setFormData(prev => ({
                ...prev,
                maxLeads: limits[value as keyof typeof limits].maxLeads,
                maxTeamMembers: limits[value as keyof typeof limits].maxTeamMembers
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!institution) return;

        setIsSubmitting(true);

        try {
            const updateData: UpdateInstitutionData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                subscriptionTier: formData.subscriptionTier,
                subscriptionStatus: formData.subscriptionStatus,
                maxLeads: formData.maxLeads,
                maxTeamMembers: formData.maxTeamMembers
            };

            await updateInstitution(institution.id, updateData);

            toast.success("Institution updated successfully", {
                description: `${formData.name} has been updated`
            });

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error updating institution:", error);
            toast.error("Failed to update institution", {
                description: error instanceof Error ? error.message : "Please check the details and try again"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const subscriptionTierOptions = [
        {
            value: "STARTER",
            label: "STARTER",
            icon: Sparkles,
            description: "Perfect for small institutions",
            price: "₹5,000/month",
            features: ["Up to 500 leads", "2 team members", "Basic support"],
            gradient: "from-blue-500 to-cyan-500",
            bgGradient: "from-blue-50 to-cyan-50",
            borderColor: "border-blue-200",
            popular: false
        },
        {
            value: "PRO",
            label: "PRO",
            icon: Star,
            description: "Most popular choice",
            price: "₹15,000/month",
            features: ["Up to 2,000 leads", "10 team members", "Priority support"],
            gradient: "from-purple-500 to-violet-600",
            bgGradient: "from-purple-50 to-violet-50",
            borderColor: "border-purple-200",
            popular: true
        },
        {
            value: "MAX",
            label: "MAX",
            icon: Crown,
            description: "For large institutions",
            price: "₹35,000/month",
            features: ["Unlimited leads", "Unlimited team members", "24/7 dedicated support"],
            gradient: "from-orange-500 to-red-500",
            bgGradient: "from-orange-50 to-red-50",
            borderColor: "border-orange-200",
            popular: false
        }
    ];

    const statusOptions = [
        { value: "ACTIVE", label: "Active", color: "text-green-600" },
        { value: "INACTIVE", label: "Inactive", color: "text-gray-600" },
        { value: "SUSPENDED", label: "Suspended", color: "text-red-600" },
        { value: "EXPIRED", label: "Expired", color: "text-orange-600" }
    ];

    if (!institution) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl w-full">
            <form onSubmit={handleSubmit}>
                <ModalHeader>
                    <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center shadow-sm">
                            <Building2 className="h-6 w-6 text-violet-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent">
                                Edit Institution
                            </h2>
                            <p className="text-sm text-slate-600 mt-1">
                                Update {institution.name} details and settings
                            </p>
                        </div>
                    </div>
                    <ModalCloseButton onClose={onClose} />
                </ModalHeader>

                <ModalContent className="w-full bg-gradient-to-br from-slate-50 via-white to-slate-100">
                    <div className="space-y-8">
                        {/* Basic Information */}
                        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
                                <CardTitle className="flex items-center space-x-3 text-slate-800">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                        <Building2 className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <span>Basic Information</span>
                                </CardTitle>
                                <CardDescription className="text-slate-600">
                                    Essential details about the institution
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Institution Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange("name", e.target.value)}
                                            placeholder="e.g., ABC College"
                                            className="border-slate-300 text-black focus:border-violet-400 focus:ring-violet-400/20 rounded-lg transition-all duration-200"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="slug" className="text-sm font-semibold text-slate-700">Slug</Label>
                                        <Input
                                            id="slug"
                                            value={institution.slug}
                                            disabled
                                            className="border-slate-300 text-slate-500 bg-slate-100 rounded-lg"
                                        />
                                        <p className="text-xs text-slate-500">Slug cannot be changed after creation</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address *</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange("email", e.target.value)}
                                                placeholder="admin@institution.edu"
                                                className="pl-12 text-black border-slate-300 focus:border-violet-400 focus:ring-violet-400/20 rounded-lg transition-all duration-200"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                                placeholder="+91 98765 43210"
                                                className="pl-12 text-black border-slate-300 focus:border-violet-400 focus:ring-violet-400/20 rounded-lg transition-all duration-200"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address" className="text-sm font-semibold text-slate-700">Address</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-4 h-4 w-4 text-slate-500" />
                                        <textarea
                                            id="address"
                                            value={formData.address}
                                            onChange={(e) => handleInputChange("address", e.target.value)}
                                            placeholder="Full address of the institution"
                                            className="w-full text-black pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400 transition-all duration-200 resize-none"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Subscription Plan */}
                        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
                                <CardTitle className="flex items-center space-x-3 text-slate-800">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
                                        <CreditCard className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <span>Subscription Plan</span>
                                </CardTitle>
                                <CardDescription className="text-slate-600">
                                    Choose the appropriate subscription tier for your institution
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {subscriptionTierOptions.map((option) => {
                                        const Icon = option.icon;
                                        const isSelected = formData.subscriptionTier === option.value;

                                        return (
                                            <div
                                                key={option.value}
                                                className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${isSelected
                                                    ? `${option.borderColor} bg-gradient-to-br ${option.bgGradient} shadow-lg ring-2 ring-offset-2 ring-purple-200`
                                                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                                                    }`}
                                                onClick={() => handleInputChange("subscriptionTier", option.value)}
                                            >
                                                {option.popular && (
                                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                                        <span className="bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                                            Most Popular
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between mb-4">
                                                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center shadow-md`}>
                                                        <Icon className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div className={`text-right ${isSelected ? 'text-purple-700' : 'text-slate-600'}`}>
                                                        <div className="text-lg font-bold">{option.price}</div>
                                                    </div>
                                                </div>

                                                <h3 className={`font-bold text-lg mb-2 ${isSelected ? 'text-purple-800' : 'text-slate-800'}`}>
                                                    {option.label}
                                                </h3>
                                                <p className={`text-sm mb-4 ${isSelected ? 'text-purple-600' : 'text-slate-600'}`}>
                                                    {option.description}
                                                </p>

                                                <ul className="space-y-2">
                                                    {option.features.map((feature, index) => (
                                                        <li key={index} className={`text-sm flex items-center ${isSelected ? 'text-purple-700' : 'text-slate-600'}`}>
                                                            <div className={`h-1.5 w-1.5 rounded-full mr-2 ${isSelected ? 'bg-purple-500' : 'bg-slate-400'}`} />
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Subscription Status */}
                        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
                                <CardTitle className="flex items-center space-x-3 text-slate-800">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                                        <CreditCard className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <span>Subscription Status</span>
                                </CardTitle>
                                <CardDescription className="text-slate-600">
                                    Current status of the institution's subscription
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-sm font-semibold text-slate-700">Status</Label>
                                    <Select value={formData.subscriptionStatus} onValueChange={(value) => handleInputChange("subscriptionStatus", value)}>
                                        <SelectTrigger className="border-slate-300 focus:border-violet-400 focus:ring-violet-400/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <span className={option.color}>{option.label}</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Limits */}
                        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
                                <CardTitle className="flex items-center space-x-3 text-slate-800">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                                        <Users className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <span>Account Limits</span>
                                </CardTitle>
                                <CardDescription className="text-slate-600">
                                    Limits are automatically set based on the selected subscription tier
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="maxLeads" className="text-sm font-semibold text-slate-700">Maximum Leads</Label>
                                        <div className="relative">
                                            <Input
                                                id="maxLeads"
                                                type="number"
                                                value={formData.maxLeads}
                                                onChange={(e) => handleInputChange("maxLeads", parseInt(e.target.value) || 0)}
                                                min="1"
                                                className="border-slate-300 text-black focus:border-violet-400 focus:ring-violet-400/20 rounded-lg transition-all duration-200"
                                            />
                                            {formData.maxLeads >= 99999 && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                    <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full font-semibold">
                                                        Unlimited
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxTeamMembers" className="text-sm font-semibold text-slate-700">Maximum Team Members</Label>
                                        <div className="relative">
                                            <Input
                                                id="maxTeamMembers"
                                                type="number"
                                                value={formData.maxTeamMembers}
                                                onChange={(e) => handleInputChange("maxTeamMembers", parseInt(e.target.value) || 0)}
                                                min="1"
                                                className="border-slate-300 text-black focus:border-violet-400 focus:ring-violet-400/20 rounded-lg transition-all duration-200"
                                            />
                                            {formData.maxTeamMembers >= 999 && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                    <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full font-semibold">
                                                        Unlimited
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                    <div className="flex items-start space-x-3">
                                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-blue-600 text-xs font-bold">!</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-blue-900">Auto-Configuration</p>
                                            <p className="text-sm text-blue-700 mt-1">
                                                Limits are automatically adjusted when you change the subscription tier. You can manually modify them if needed.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Warning for critical changes */}
                        {hasChanges && (
                            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                                <div className="flex items-start space-x-3">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-amber-900">Changes Detected</p>
                                        <p className="text-sm text-amber-700 mt-1">
                                            You have unsaved changes. Make sure to review all modifications before saving.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ModalContent>

                <ModalFooter className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-b-lg">
                    <div className="flex items-center space-x-4 w-full justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !hasChanges}
                            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center space-x-2">
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Updating...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Building2 className="h-4 w-4" />
                                    <span>Update Institution</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </ModalFooter>
            </form>
        </Modal>
    );
};
