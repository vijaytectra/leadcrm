"use client";

import { useState } from "react";
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
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
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
            password: "",
        },
    });

    const watchedRole = watch("role");

    const handleFormSubmit = async (data: UserFormData) => {
        setIsSubmitting(true);
        try {
            // Remove password from update requests if not provided
            const submitData = user
                ? { ...data, ...(data.password ? { password: data.password } : {}) }
                : data;

            await onSubmit(submitData);
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
            <ModalContent className="sm:max-w-md">
                <ModalHeader>
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
                    <div className="grid grid-cols-2 gap-4">
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
                        <div>
                            <Label htmlFor="password">Password (Optional)</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register("password")}
                                placeholder="Leave empty for auto-generated password"
                                className={errors.password ? "border-red-500" : ""}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                                If left empty, a secure password will be generated and sent via email.
                            </p>
                        </div>
                    )}

                    {user && (
                        <div>
                            <Label htmlFor="password">New Password (Optional)</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register("password")}
                                placeholder="Leave empty to keep current password"
                                className={errors.password ? "border-red-500" : ""}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                                Leave empty to keep the current password unchanged.
                            </p>
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
