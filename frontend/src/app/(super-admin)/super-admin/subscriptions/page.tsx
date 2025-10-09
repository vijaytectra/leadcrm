"use client";

import React from "react";

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

    Calendar,
    DollarSign,
    TrendingUp,
    AlertCircle,
    CheckCircle
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";


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
            return <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm">Active</Badge>;
        case "pending":
            return <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-sm">Pending</Badge>;
        case "expired":
            return <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm">Expired</Badge>;
        case "cancelled":
            return <Badge variant="outline" className="border-gray-300 text-gray-600">Cancelled</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

const getPlanBadge = (plan: string) => {
    switch (plan) {
        case "STARTER":
            return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-sm font-medium">STARTER</Badge>;
        case "PRO":
            return <Badge className="bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-sm font-medium">PRO</Badge>;
        case "MAX":
            return <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm font-medium">MAX</Badge>;
        default:
            return <Badge variant="outline">{plan}</Badge>;
    }
};

export default function SubscriptionsPage() {
    return (
        <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>

            <div className="space-y-8 p-2">
                {/* Page Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-2xl border border-blue-100/50">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                            Subscriptions
                        </h1>
                        <p className="text-gray-600 mt-2 text-lg font-medium">
                            Manage subscription plans and billing for all institutions
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                        </Button>
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Plan
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-semibold text-gray-700">Total Subscriptions</CardTitle>
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                <CreditCard className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">24</div>
                            <p className="text-sm text-green-600 font-medium mt-1">
                                +3 from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-semibold text-gray-700">Active</CardTitle>
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">22</div>
                            <p className="text-sm text-gray-600 font-medium mt-1">
                                91.7% active rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-semibold text-gray-700">Monthly Revenue</CardTitle>
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
                                <DollarSign className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">₹85,000</div>
                            <p className="text-sm text-green-600 font-medium mt-1">
                                +12.5% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-semibold text-gray-700">Churn Rate</CardTitle>
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">4.2%</div>
                            <p className="text-sm text-green-600 font-medium mt-1">
                                -1.2% from last month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Plan Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-cyan-50 to-blue-100 border-cyan-200/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300">
                        <CardHeader className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-t-lg">
                            <CardTitle className="flex items-center justify-between text-gray-800">
                                <span className="font-bold">STARTER Plan</span>
                                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm font-bold">₹5,000/month</Badge>
                            </CardTitle>
                            <CardDescription className="font-medium text-gray-600">
                                Basic plan for small institutions
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Subscribers:</span>
                                    <span className="font-bold text-gray-900">8</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Revenue:</span>
                                    <span className="font-bold text-gray-900">₹40,000</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Growth:</span>
                                    <span className="text-green-600 font-bold">+25%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
                        <CardHeader className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-t-lg">
                            <CardTitle className="flex items-center justify-between text-gray-800">
                                <span className="font-bold">PRO Plan</span>
                                <Badge className="bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-sm font-bold">₹15,000/month</Badge>
                            </CardTitle>
                            <CardDescription className="font-medium text-gray-600">
                                Most popular plan for medium institutions
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Subscribers:</span>
                                    <span className="font-bold text-gray-900">12</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Revenue:</span>
                                    <span className="font-bold text-gray-900">₹180,000</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Growth:</span>
                                    <span className="text-green-600 font-bold">+18%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-indigo-50 to-purple-100 border-indigo-200/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
                        <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-t-lg">
                            <CardTitle className="flex items-center justify-between text-gray-800">
                                <span className="font-bold">MAX Plan</span>
                                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm font-bold">₹35,000/month</Badge>
                            </CardTitle>
                            <CardDescription className="font-medium text-gray-600">
                                Premium plan for large institutions
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Subscribers:</span>
                                    <span className="font-bold text-gray-900">4</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Revenue:</span>
                                    <span className="font-bold text-gray-900">₹140,000</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Growth:</span>
                                    <span className="text-green-600 font-bold">+33%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Subscriptions Table */}
                <Card className="bg-gradient-to-br from-white to-gray-50/50 border-gray-200/50 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-t-lg border-b border-gray-200/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold text-gray-900">All Subscriptions</CardTitle>
                                <CardDescription className="text-gray-600 font-medium mt-1">
                                    Manage and monitor all subscription plans
                                </CardDescription>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search subscriptions..."
                                        className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm font-medium w-72 transition-all duration-200"
                                    />
                                </div>
                                <Button variant="outline" className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-xl transition-all duration-200">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filters
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/80">
                                    <TableRow className="border-gray-200/50">
                                        <TableHead className="font-semibold text-gray-800">Institution</TableHead>
                                        <TableHead className="font-semibold text-gray-800">Plan</TableHead>
                                        <TableHead className="font-semibold text-gray-800">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-800">Amount</TableHead>
                                        <TableHead className="font-semibold text-gray-800">Billing</TableHead>
                                        <TableHead className="font-semibold text-gray-800">Next Billing</TableHead>
                                        <TableHead className="font-semibold text-gray-800">Auto Renew</TableHead>
                                        <TableHead className="font-semibold text-gray-800">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockSubscriptions.map((subscription, index) => (
                                        <TableRow key={subscription.id} className={`hover:bg-gray-50/60 transition-colors duration-200 border-gray-200/30 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'}`}>
                                            <TableCell className="py-4">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{subscription.institutionName}</p>
                                                    <p className="text-sm text-gray-500 font-medium">{subscription.paymentMethod}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {getPlanBadge(subscription.plan)}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {getStatusBadge(subscription.status)}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div>
                                                    <p className="font-bold text-gray-900">₹{subscription.amount.toLocaleString()}</p>
                                                    <p className="text-sm text-gray-500 font-medium">{subscription.billingCycle}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-2 py-1">
                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm font-medium text-gray-700">{new Date(subscription.startDate).toLocaleDateString()}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{new Date(subscription.nextBilling).toLocaleDateString()}</p>
                                                    <p className="text-xs text-gray-500 font-medium">
                                                        {subscription.autoRenew ? "Auto-renewal enabled" : "Manual renewal"}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center space-x-2">
                                                    {subscription.autoRenew ? (
                                                        <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded-lg">
                                                            <CheckCircle className="h-4 w-4" />
                                                            <span className="text-sm font-medium">Enabled</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center space-x-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg">
                                                            <AlertCircle className="h-4 w-4" />
                                                            <span className="text-sm font-medium">Disabled</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center space-x-1">
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-800 rounded-lg">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-800 rounded-lg">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
