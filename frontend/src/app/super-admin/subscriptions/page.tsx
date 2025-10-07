"use client";

import React from "react";
import { SuperAdminLayout } from "@/components/layouts/SuperAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    CreditCard,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Calendar,
    DollarSign,
    TrendingUp,
    AlertCircle,
    CheckCircle
} from "lucide-react";

// Mock data
const mockSubscriptions = [
    {
        id: "1",
        institutionName: "ABC College",
        plan: "PRO",
        status: "active",
        amount: 15000,
        billingCycle: "monthly",
        startDate: "2024-01-15",
        nextBilling: "2024-02-15",
        paymentMethod: "Credit Card",
        autoRenew: true,
        features: ["Up to 2,000 leads", "10 team members", "Advanced analytics", "Priority support"]
    },
    {
        id: "2",
        institutionName: "XYZ School",
        plan: "STARTER",
        status: "active",
        amount: 5000,
        billingCycle: "monthly",
        startDate: "2024-01-20",
        nextBilling: "2024-02-20",
        paymentMethod: "Bank Transfer",
        autoRenew: true,
        features: ["Up to 500 leads", "2 team members", "Basic reporting", "Email support"]
    },
    {
        id: "3",
        institutionName: "DEF Institute",
        plan: "MAX",
        status: "pending",
        amount: 35000,
        billingCycle: "monthly",
        startDate: "2024-01-25",
        nextBilling: "2024-02-25",
        paymentMethod: "Credit Card",
        autoRenew: false,
        features: ["Unlimited leads", "Unlimited team members", "White-label solution", "Dedicated support"]
    },
    {
        id: "4",
        institutionName: "GHI University",
        plan: "PRO",
        status: "expired",
        amount: 15000,
        billingCycle: "monthly",
        startDate: "2023-12-01",
        nextBilling: "2024-01-01",
        paymentMethod: "Credit Card",
        autoRenew: false,
        features: ["Up to 2,000 leads", "10 team members", "Advanced analytics", "Priority support"]
    }
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case "active":
            return <Badge variant="success">Active</Badge>;
        case "pending":
            return <Badge variant="warning">Pending</Badge>;
        case "expired":
            return <Badge variant="destructive">Expired</Badge>;
        case "cancelled":
            return <Badge variant="outline">Cancelled</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

const getPlanBadge = (plan: string) => {
    switch (plan) {
        case "STARTER":
            return <Badge variant="outline">STARTER</Badge>;
        case "PRO":
            return <Badge variant="default">PRO</Badge>;
        case "MAX":
            return <Badge variant="secondary">MAX</Badge>;
        default:
            return <Badge variant="outline">{plan}</Badge>;
    }
};

export default function SubscriptionsPage() {
    return (
        <SuperAdminLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
                        <p className="text-gray-600 mt-1">
                            Manage subscription plans and billing for all institutions
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button variant="outline">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                        </Button>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Plan
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">24</div>
                            <p className="text-xs text-muted-foreground">
                                +3 from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">22</div>
                            <p className="text-xs text-muted-foreground">
                                91.7% active rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹85,000</div>
                            <p className="text-xs text-muted-foreground">
                                +12.5% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4.2%</div>
                            <p className="text-xs text-muted-foreground">
                                -1.2% from last month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Plan Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                STARTER Plan
                                <Badge variant="outline">₹5,000/month</Badge>
                            </CardTitle>
                            <CardDescription>
                                Basic plan for small institutions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm">Subscribers:</span>
                                    <span className="font-medium">8</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Revenue:</span>
                                    <span className="font-medium">₹40,000</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Growth:</span>
                                    <span className="text-green-600">+25%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                PRO Plan
                                <Badge variant="default">₹15,000/month</Badge>
                            </CardTitle>
                            <CardDescription>
                                Most popular plan for medium institutions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm">Subscribers:</span>
                                    <span className="font-medium">12</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Revenue:</span>
                                    <span className="font-medium">₹180,000</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Growth:</span>
                                    <span className="text-green-600">+18%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                MAX Plan
                                <Badge variant="secondary">₹35,000/month</Badge>
                            </CardTitle>
                            <CardDescription>
                                Premium plan for large institutions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm">Subscribers:</span>
                                    <span className="font-medium">4</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Revenue:</span>
                                    <span className="font-medium">₹140,000</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Growth:</span>
                                    <span className="text-green-600">+33%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Subscriptions Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>All Subscriptions</CardTitle>
                                <CardDescription>
                                    Manage and monitor all subscription plans
                                </CardDescription>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search subscriptions..."
                                        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <Button variant="outline">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filters
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Institution</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Billing</TableHead>
                                    <TableHead>Next Billing</TableHead>
                                    <TableHead>Auto Renew</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockSubscriptions.map((subscription) => (
                                    <TableRow key={subscription.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{subscription.institutionName}</p>
                                                <p className="text-sm text-muted-foreground">{subscription.paymentMethod}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getPlanBadge(subscription.plan)}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(subscription.status)}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">₹{subscription.amount.toLocaleString()}</p>
                                                <p className="text-sm text-muted-foreground">{subscription.billingCycle}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{new Date(subscription.startDate).toLocaleDateString()}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm">{new Date(subscription.nextBilling).toLocaleDateString()}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {subscription.autoRenew ? "Auto-renewal enabled" : "Manual renewal"}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                {subscription.autoRenew ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                                                )}
                                                <span className="text-sm">
                                                    {subscription.autoRenew ? "Enabled" : "Disabled"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </SuperAdminLayout>
    );
}
