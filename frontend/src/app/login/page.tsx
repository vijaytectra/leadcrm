"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { ApiException } from "@/lib/utils";

// Validation schema
const loginSchema = z.object({
    tenant: z.string().min(1, "Tenant slug is required").min(3, "Tenant slug must be at least 3 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Predefined role credentials for testing
const roleCredentials = [
    {
        role: "Super Admin",
        tenant: "lead101",
        email: "superadmin@lead101.com",
        password: "SuperAdmin123!",
        description: "Platform owner and administrator"
    },
    {
        role: "Institution Admin",
        tenant: "arunai-engineering-college",
        email: "vijay.r20799@gmail.com",
        password: "Vijay@123",
        description: "School administrator"
    },
    {
        role: "Telecaller",
        tenant: "arunai-engineering-college",
        email: "sigofix534@lorkex.com",
        password: "Vijay@123",
        description: "Lead contact specialist"
    },
    {
        role: "Document Verifier",
        tenant: "arunai-engineering-college",
        email: "ricojo2704@lorkex.com",
        password: "Vijay@123",
        description: "Document validation specialist"
    },
    {
        role: "Finance Team",
        tenant: "arunai-engineering-college",
        email: "tefano4892@gta5hx.com",
        password: "Vijay@123",
        description: "Fee and payment management"
    },
    {
        role: "Admission Team",
        tenant: "arunai-engineering-college",
        email: "admission@demoschool.com",
        password: "Vijay@123",
        description: "Admission counseling"
    },
    {
        role: "Admission Head",
        tenant: "arunai-engineering-college",
        email: "head@demoschool.com",
        password: "Vijay@123",
        description: "Final admission decisions"
    },
    {
        role: "Student",
        tenant: "arunai-engineering-college",
        email: "student@demoschool.com",
        password: "Vijay@123",
        description: "Student portal access"
    },
    {
        role: "Parent",
        tenant: "arunai-engineering-college",
        email: "parent@demoschool.com",
        password: "Vijay@123",
        description: "Parent portal access"
    }
];

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading } = useAuthStore();
    const [showPassword, setShowPassword] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [selectedRole, setSelectedRole] = React.useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        watch,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: "onChange",
    });

    const onSubmit = async (data: LoginFormData) => {
        setError(null);
        try {
            // Call login and wait for it to complete
            await login(data);

            // Get the UPDATED user and tenant slug from the store AFTER login
            const { user, currentTenantSlug } = useAuthStore.getState();



            // Now route based on the updated user role
            if (user?.role === "INSTITUTION_ADMIN") {
                router.push(`/institution-admin/dashboard?tenant=${currentTenantSlug}`);
            }
            else if (user?.role === "SUPER_ADMIN") {
                router.push("/super-admin/dashboard");
            }
            else if (user?.role === "TELECALLER") {
                router.push(`/telecaller/dashboard?tenant=${currentTenantSlug}`);
            }
            else if (user?.role === "DOCUMENT_VERIFIER") {
                router.push(`/document-verifier/dashboard?tenant=${currentTenantSlug}`);
            }
            else if (user?.role === "FINANCE_TEAM") {
                router.push(`/finance-team/dashboard?tenant=${currentTenantSlug}`);
            }
            else if (user?.role === "ADMISSION_TEAM") {
                router.push(`/admission-team/dashboard?tenant=${currentTenantSlug}`);
            }
            else if (user?.role === "ADMISSION_HEAD") {
                router.push(`/admission-head/dashboard?tenant=${currentTenantSlug}`);
            }
            else if (user?.role === "STUDENT") {
                router.push(`/student/dashboard?tenant=${currentTenantSlug}`);
            }
            else if (user?.role === "PARENT") {
                router.push(`/parent/dashboard?tenant=${currentTenantSlug}`);
            }
            else {
                router.push("/");
            }
        } catch (err: unknown) {
            if (err instanceof ApiException) {
                setError(err.error.error || "Login failed");
            } else {
                setError("Login failed. Please check your credentials.");
            }
        }
    };

    const handleRoleSelect = (role: typeof roleCredentials[0]) => {
        setValue("tenant", role.tenant);
        setValue("email", role.email);
        setValue("password", role.password);
        setSelectedRole(role.role);
        setError(null);
    };

    const currentValues = watch();

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8">
                {/* Login Form */}
                <div className="flex items-center justify-center">
                    <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="text-center space-y-2">
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Welcome Back
                            </CardTitle>
                            <CardDescription className="text-gray-600">
                                Sign in to your CRM workspace
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tenant" className="text-sm font-medium">
                                        Institution Slug
                                    </Label>
                                    <Input
                                        id="tenant"
                                        placeholder="your-institution"
                                        {...register("tenant")}
                                        className={`transition-colors text-black ${errors.tenant ? "border-red-500 focus:border-red-500" : ""}`}
                                    />
                                    {errors.tenant && (
                                        <p className="text-sm text-red-500">{errors.tenant.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        {...register("email")}
                                        className={`transition-colors text-black ${errors.email ? "border-red-500 focus:border-red-500" : ""}`}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500">{errors.email.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            {...register("password")}
                                            className={`pr-10 text-black transition-colors ${errors.password ? "border-red-500 focus:border-red-500" : ""}`}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-400" />
                                            )}
                                        </Button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-sm text-red-500">{errors.password.message}</p>
                                    )}
                                </div>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5"
                                    disabled={isSubmitting || isLoading}
                                >
                                    {isSubmitting || isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        "Sign In"
                                    )}
                                </Button>
                            </form>

                            <div className="text-center space-y-2">
                                <p className="text-sm text-gray-600">
                                    <a href="/forgot-password" className="text-blue-600 hover:underline">
                                        Forgot your password?
                                    </a>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Need help?{" "}
                                    <a href="#" className="text-blue-600 hover:underline">
                                        Contact support
                                    </a>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Role Selection */}
                <div className="flex items-center justify-center">
                    <div className="w-full max-w-md">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Quick Login for Testing
                            </h2>
                            <p className="text-gray-600">
                                Select a role to auto-fill credentials
                            </p>
                        </div>

                        <div className="grid gap-3">
                            {roleCredentials.map((role, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleRoleSelect(role)}
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${selectedRole === role.role
                                        ? "border-blue-500 bg-blue-50 shadow-md"
                                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{role.role}</h3>
                                            <p className="text-sm text-gray-600">{role.description}</p>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {role.tenant}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {selectedRole && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className="font-medium text-blue-900 mb-2">Selected: {selectedRole}</h4>
                                <div className="text-sm text-blue-700 space-y-1">
                                    <p><strong>Tenant:</strong> {currentValues.tenant}</p>
                                    <p><strong>Email:</strong> {currentValues.email}</p>
                                    <p><strong>Password:</strong> {currentValues.password}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}