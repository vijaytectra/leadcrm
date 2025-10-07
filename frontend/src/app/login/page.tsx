"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ApiException } from "@/lib/utils";
import Link from "next/link";

export default function LoginPage() {
    const { login, isLoading } = useAuth();
    const [tenant, setTenant] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            await login({ tenant, email, password });
            setSuccess("Logged in successfully");
        } catch (err: unknown) {
            if (err instanceof ApiException) {
                setError(err.error.error || "Login failed");
            } else {
                setError("Login failed");
            }
        }
    }

    return (
        <main className="min-h-dvh grid place-items-center px-4">
            <div className="w-full max-w-md">
                <Card className="backdrop-blur-md border-border/50 shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ letterSpacing: "-0.02em" }}>Welcome back</CardTitle>
                        <CardDescription>Sign in to your CRM workspace</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="tenant">Tenant</Label>
                                <Input id="tenant" placeholder="your-institution" value={tenant} onChange={(e) => setTenant(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>

                            {error && (
                                <p className="text-sm text-destructive" role="alert">{error}</p>
                            )}
                            {success && (
                                <p className="text-sm text-green-500" role="status">{success}</p>
                            )}

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Signing in..." : "Sign In"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-muted-foreground">Need help? </span>
                            <Link href="/" className="text-primary underline-offset-4 hover:underline">Contact admin</Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}


