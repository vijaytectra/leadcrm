"use client";

import * as React from "react";
import { Modal, ModalHeader, ModalContent, ModalFooter, ModalCloseButton } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail, Phone, MapPin, CreditCard, Users } from "lucide-react";

interface AddInstitutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: InstitutionFormData) => Promise<void>;
}

interface InstitutionFormData {
    name: string;
    slug: string;
    email: string;
    phone: string;
    address: string;
    subscriptionTier: "STARTER" | "PRO" | "MAX";
    maxLeads: number;
    maxTeamMembers: number;
}

export const AddInstitutionModal: React.FC<AddInstitutionModalProps> = ({
    isOpen,
    onClose,
    onSubmit
}) => {
    const [formData, setFormData] = React.useState<InstitutionFormData>({
        name: "",
        slug: "",
        email: "",
        phone: "",
        address: "",
        subscriptionTier: "STARTER",
        maxLeads: 500,
        maxTeamMembers: 2
    });

    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleInputChange = (field: keyof InstitutionFormData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Auto-generate slug from name
        if (field === "name") {
            const slug = value.toString()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            setFormData(prev => ({
                ...prev,
                slug
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await onSubmit(formData);
            // Reset form
            setFormData({
                name: "",
                slug: "",
                email: "",
                phone: "",
                address: "",
                subscriptionTier: "STARTER",
                maxLeads: 500,
                maxTeamMembers: 2
            });
            onClose();
        } catch (error) {
            console.error("Error creating institution:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const subscriptionTierOptions = [
        { value: "STARTER", label: "STARTER", description: "Up to 500 leads, 2 team members", price: "₹5,000/month" },
        { value: "PRO", label: "PRO", description: "Up to 2,000 leads, 10 team members", price: "₹15,000/month" },
        { value: "MAX", label: "MAX", description: "Unlimited leads, unlimited team members", price: "₹35,000/month" }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <ModalHeader>
                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Add New Institution</h2>
                            <p className="text-sm text-muted-foreground">
                                Create a new educational institution account
                            </p>
                        </div>
                    </div>
                    <ModalCloseButton onClose={onClose} />
                </ModalHeader>

                <ModalContent>
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Building2 className="h-5 w-5" />
                                    <span>Basic Information</span>
                                </CardTitle>
                                <CardDescription>
                                    Essential details about the institution
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Institution Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange("name", e.target.value)}
                                            placeholder="e.g., ABC College"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="slug">Slug *</Label>
                                        <Input
                                            id="slug"
                                            value={formData.slug}
                                            onChange={(e) => handleInputChange("slug", e.target.value)}
                                            placeholder="e.g., abc-college"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address *</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange("email", e.target.value)}
                                                placeholder="admin@institution.edu"
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                                placeholder="+91 98765 43210"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <textarea
                                            id="address"
                                            value={formData.address}
                                            onChange={(e) => handleInputChange("address", e.target.value)}
                                            placeholder="Full address of the institution"
                                            className="w-full pl-10 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Subscription Plan */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <CreditCard className="h-5 w-5" />
                                    <span>Subscription Plan</span>
                                </CardTitle>
                                <CardDescription>
                                    Choose the appropriate subscription tier
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {subscriptionTierOptions.map((option) => (
                                        <div
                                            key={option.value}
                                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${formData.subscriptionTier === option.value
                                                    ? "border-primary bg-primary/5"
                                                    : "border-muted hover:border-primary/50"
                                                }`}
                                            onClick={() => handleInputChange("subscriptionTier", option.value)}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-medium">{option.label}</h3>
                                                <div className="text-sm font-semibold text-primary">
                                                    {option.price}
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {option.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Limits */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Users className="h-5 w-5" />
                                    <span>Account Limits</span>
                                </CardTitle>
                                <CardDescription>
                                    Set limits for leads and team members
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="maxLeads">Maximum Leads</Label>
                                        <Input
                                            id="maxLeads"
                                            type="number"
                                            value={formData.maxLeads}
                                            onChange={(e) => handleInputChange("maxLeads", parseInt(e.target.value) || 0)}
                                            min="1"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxTeamMembers">Maximum Team Members</Label>
                                        <Input
                                            id="maxTeamMembers"
                                            type="number"
                                            value={formData.maxTeamMembers}
                                            onChange={(e) => handleInputChange("maxTeamMembers", parseInt(e.target.value) || 0)}
                                            min="1"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </ModalContent>

                <ModalFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Institution"}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};
