"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, Shield } from "lucide-react";
import Link from "next/link";
import { apiPost } from "@/lib/utils";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [token, setToken] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            setToken(token);
        } else {
            setError("Invalid or missing reset token");
        }
    }, [searchParams]);

    const validatePassword = (password: string) => {
        const minLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return {
            minLength,
            hasUpperCase,
            hasLowerCase,
            hasNumbers,
            hasSpecialChar,
            isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
        };
    };

    const passwordValidation = validatePassword(password);
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setMessage("");

        if (!passwordValidation.isValid) {
            setError("Password does not meet security requirements");
            setIsLoading(false);
            return;
        }

        if (!passwordsMatch) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
        
            const res = await apiPost<{ success: boolean, message: string, error: string }>("/auth/reset-password", { token, newPassword: password });
         
            if (res.success) {
                setMessage("Password reset successfully! Redirecting to login...");
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            } else {
                setError(res.error || "Failed to reset password");
            }
            
        } catch (error) {
            setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Set New Password</h1>
                    <p className="text-gray-600">Create a strong and secure password</p>
                </div>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="space-y-1 pb-6">
                        <CardTitle className="text-2xl font-semibold text-center text-gray-800">
                            Reset Password
                        </CardTitle>
                        <CardDescription className="text-center text-gray-600">
                            Choose a strong password to secure your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                        New Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your new password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="pl-10 text-black pr-10 border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
                                        />
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm your new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="pl-10 pr-10 text-black border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
                                        />
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Password Requirements */}
                            {password && (
                                <div className="space-y-2 p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                                    <div className="space-y-1">
                                        <div className={`flex items-center text-xs ${passwordValidation.minLength ? "text-emerald-600" : "text-gray-500"}`}>
                                            <CheckCircle className={`w-3 h-3 mr-2 ${passwordValidation.minLength ? "text-emerald-500" : "text-gray-400"}`} />
                                            At least 8 characters
                                        </div>
                                        <div className={`flex items-center text-xs ${passwordValidation.hasUpperCase ? "text-emerald-600" : "text-gray-500"}`}>
                                            <CheckCircle className={`w-3 h-3 mr-2 ${passwordValidation.hasUpperCase ? "text-emerald-500" : "text-gray-400"}`} />
                                            One uppercase letter
                                        </div>
                                        <div className={`flex items-center text-xs ${passwordValidation.hasLowerCase ? "text-emerald-600" : "text-gray-500"}`}>
                                            <CheckCircle className={`w-3 h-3 mr-2 ${passwordValidation.hasLowerCase ? "text-emerald-500" : "text-gray-400"}`} />
                                            One lowercase letter
                                        </div>
                                        <div className={`flex items-center text-xs ${passwordValidation.hasNumbers ? "text-emerald-600" : "text-gray-500"}`}>
                                            <CheckCircle className={`w-3 h-3 mr-2 ${passwordValidation.hasNumbers ? "text-emerald-500" : "text-gray-400"}`} />
                                            One number
                                        </div>
                                        <div className={`flex items-center text-xs ${passwordValidation.hasSpecialChar ? "text-emerald-600" : "text-gray-500"}`}>
                                            <CheckCircle className={`w-3 h-3 mr-2 ${passwordValidation.hasSpecialChar ? "text-emerald-500" : "text-gray-400"}`} />
                                            One special character
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Password Match Indicator */}
                            {confirmPassword && (
                                <div className={`flex items-center text-sm ${passwordsMatch ? "text-emerald-600" : "text-red-600"}`}>
                                    <CheckCircle className={`w-4 h-4 mr-2 ${passwordsMatch ? "text-emerald-500" : "text-red-500"}`} />
                                    {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                                </div>
                            )}

                            {error && (
                                <Alert className="border-red-200 bg-red-50">
                                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                                </Alert>
                            )}

                            {message && (
                                <Alert className="border-green-200 bg-green-50">
                                    <AlertDescription className="text-green-700">{message}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading || !passwordValidation.isValid || !passwordsMatch}
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Resetting Password...</span>
                                    </div>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center text-sm text-gray-600 hover:text-emerald-600 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Login
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-gray-500">
                    <p>Secure password reset powered by LEAD101</p>
                </div>
            </div>
        </div>
    );
}
