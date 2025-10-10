"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Modal,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from "@/components/ui/modal";
import { User, CreateUserRequest, UpdateUserRequest } from "@/lib/api/users";

// Zod schema for user validation
const userSchema = z.object({
    email: z.string().email("Invalid email format"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().optional(),
    role: z.enum([
        "INSTITUTION_ADMIN",
        "TELECALLER",
        "DOCUMENT_VERIFIER",
        "FINANCE_TEAM",
        "ADMISSION_TEAM",
        "ADMISSION_HEAD",
    ]),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
    user?: User | null;
    isLoading?: boolean;
}

const roleLabels: Record<string, string> = {
    INSTITUTION_ADMIN: "Institution Admin",
    TELECALLER: "Telecaller",
    DOCUMENT_VERIFIER: "Document Verifier",
    FINANCE_TEAM: "Finance Team",
    ADMISSION_TEAM: "Admission Team",
    ADMISSION_HEAD: "Admission Head",
};

export function UserForm({ isOpen, onClose, onSubmit, user, isLoading = false }: UserFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            email: user?.email || "",
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            phone: user?.phone || "",
            role: (user?.role as UserFormData["role"]) || "TELECALLER",
        },
    });

    const watchedRole = watch("role");

    // Update form values when user prop changes
    useEffect(() => {
        if (user) {
            setValue("email", user.email);
            setValue("firstName", user.firstName);
            setValue("lastName", user.lastName);
            setValue("phone", user.phone || "");
            setValue("role", user.role as UserFormData["role"]);
        } else {
            // Reset form for new user
            setValue("email", "");
            setValue("firstName", "");
            setValue("lastName", "");
            setValue("phone", "");
            setValue("role", "TELECALLER");
        }
    }, [user, setValue]);

    const handleFormSubmit = async (data: UserFormData) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
            reset();
            onClose();
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalContent className="w-full">
                <ModalHeader className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">
                        {user ? "Edit User" : "Add New User"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {user
                            ? "Update user information and role."
                            : "Create a new user account for your institution."
                        }
                    </p>
                </ModalHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 mt-5">
                        <div>
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                                id="firstName"
                                {...register("firstName")}
                                placeholder="John"
                                className={errors.firstName ? "border-red-500" : ""}
                            />
                            {errors.firstName && (
                                <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                                id="lastName"
                                {...register("lastName")}
                                placeholder="Doe"
                                className={errors.lastName ? "border-red-500" : ""}
                            />
                            {errors.lastName && (
                                <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            {...register("email")}
                            placeholder="john.doe@example.com"
                            className={errors.email ? "border-red-500" : ""}
                            disabled={!!user} // Don't allow email changes for existing users
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="phone">Phone (Optional)</Label>
                        <Input
                            id="phone"
                            {...register("phone")}
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>

                    <div>
                        <Label htmlFor="role">Role *</Label>
                        <Select
                            value={watchedRole}
                            onValueChange={(value) => setValue("role", value as UserFormData["role"])}
                        >
                            <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(roleLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.role && (
                            <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
                        )}
                    </div>

                    {!user && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">
                                        Auto-Generated Credentials
                                    </h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <p>A secure password will be automatically generated and sent to the user&apos;s email address along with their login credentials.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {user && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Editing User Account
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <p>You are editing an existing user account. The user&apos;s login credentials will remain unchanged.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <ModalFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || isLoading}>
                            {isSubmitting ? "Saving..." : user ? "Update User" : "Add User"}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}
