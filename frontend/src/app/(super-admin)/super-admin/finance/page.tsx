"use client";

import React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    DollarSign,
    TrendingUp,
    CreditCard,
    Banknote,
    BarChart3,
    Download,
    Filter,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    MoreHorizontal
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";


// Mock data
const mockFinancialStats = {
    totalRevenue: 1250000,
    monthlyRevenue: 85000,
    platformFees: 4250,
    netRevenue: 80750,
    growthRate: 12.5,
    transactionCount: 156,
    averageTransaction: 545
};

const mockRevenueData = [
    { month: "Jan", revenue: 65000, platformFee: 3250, netRevenue: 61750 },
    { month: "Feb", revenue: 72000, platformFee: 3600, netRevenue: 68400 },
    { month: "Mar", revenue: 78000, platformFee: 3900, netRevenue: 74100 },
    { month: "Apr", revenue: 82000, platformFee: 4100, netRevenue: 77900 },
    { month: "May", revenue: 85000, platformFee: 4250, netRevenue: 80750 },
    { month: "Jun", revenue: 88000, platformFee: 4400, netRevenue: 83600 }
];

const mockTransactions = [
    {
        id: "1",
        institution: "ABC College",
        type: "subscription",
        amount: 15000,
        platformFee: 750,
        netAmount: 14250,
        status: "completed",
        date: "2024-01-28",
        paymentMethod: "Credit Card"
    },
    {
        id: "2",
        institution: "XYZ School",
        type: "subscription",
        amount: 5000,
        platformFee: 250,
        netAmount: 4750,
        status: "completed",
        date: "2024-01-27",
        paymentMethod: "Bank Transfer"
    },
    {
        id: "3",
        institution: "DEF Institute",
        type: "platform_fee",
        amount: 2500,
        platformFee: 2500,
        netAmount: 0,
        status: "completed",
        date: "2024-01-26",
        paymentMethod: "Credit Card"
    },
    {
        id: "4",
        institution: "GHI University",
        type: "refund",
        amount: -5000,
        platformFee: -250,
        netAmount: -4750,
        status: "completed",
        date: "2024-01-25",
        paymentMethod: "Credit Card"
    }
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case "completed":
            return <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm font-medium">Completed</Badge>;
        case "pending":
            return <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-sm font-medium">Pending</Badge>;
        case "failed":
            return <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm font-medium">Failed</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

const getTypeBadge = (type: string) => {
    switch (type) {
        case "subscription":
            return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-sm font-medium">Subscription</Badge>;
        case "platform_fee":
            return <Badge className="bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-sm font-medium">Platform Fee</Badge>;
        case "refund":
            return <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-sm font-medium">Refund</Badge>;
        default:
            return <Badge variant="outline">{type}</Badge>;
    }
};

export default function FinancePage() {
    return (
        <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <div className="space-y-8 p-2">
                {/* Page Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-6 rounded-2xl border border-emerald-200/50 shadow-lg">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-teal-900 bg-clip-text text-transparent">
                            Finance Dashboard
                        </h1>
                        <p className="text-gray-600 mt-2 text-lg font-medium">
                            Monitor revenue, platform fees, and financial performance
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 rounded-xl">
                            <Calendar className="h-4 w-4 mr-2" />
                            Date Range
                        </Button>
                        <Button variant="outline" className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 rounded-xl">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 rounded-xl">
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                    </div>
                </div>

                {/* Financial Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-200/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-semibold text-gray-700">Total Revenue</CardTitle>
                            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <DollarSign className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">₹{new Intl.NumberFormat('en-US').format(mockFinancialStats.totalRevenue)}</div>
                            <div className="flex items-center space-x-2 text-sm mt-2">
                                <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-lg">
                                    <TrendingUp className="h-3 w-3" />
                                    <span className="font-semibold">+{mockFinancialStats.growthRate}%</span>
                                </div>
                                <span className="text-gray-500 font-medium">from last month</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-semibold text-gray-700">Monthly Revenue</CardTitle>
                            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <BarChart3 className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">₹{new Intl.NumberFormat('en-US').format(mockFinancialStats.monthlyRevenue)}</div>
                            <div className="flex items-center space-x-2 text-sm mt-2">
                                <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-lg">
                                    <TrendingUp className="h-3 w-3" />
                                    <span className="font-semibold">+8.2%</span>
                                </div>
                                <span className="text-gray-500 font-medium">from last month</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-semibold text-gray-700">Platform Fees</CardTitle>
                            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <CreditCard className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">₹{new Intl.NumberFormat('en-US').format(mockFinancialStats.platformFees)}</div>
                            <div className="flex items-center space-x-2 text-sm mt-2">
                                <span className="text-gray-600 font-medium bg-gray-100 px-2 py-0.5 rounded-lg">5% of transactions</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-semibold text-gray-700">Net Revenue</CardTitle>
                            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                                <Banknote className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">₹{new Intl.NumberFormat('en-US').format(mockFinancialStats.netRevenue)}</div>
                            <div className="flex items-center space-x-2 text-sm mt-2">
                                <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-lg">
                                    <TrendingUp className="h-3 w-3" />
                                    <span className="font-semibold">+10.5%</span>
                                </div>
                                <span className="text-gray-500 font-medium">from last month</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Revenue Chart and Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Trend Chart */}
                    <Card className="bg-gradient-to-br from-white to-blue-50/30 border-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 rounded-t-lg border-b border-blue-200/50">
                            <CardTitle className="text-xl font-bold text-gray-900">Revenue Trend</CardTitle>
                            <CardDescription className="text-gray-600 font-medium">
                                Monthly revenue and platform fees over the last 6 months
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="h-64 flex items-end space-x-3 bg-gradient-to-t from-gray-50/50 to-transparent p-4 rounded-xl">
                                {mockRevenueData.map((data, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center">
                                        <div className="w-full flex flex-col items-center space-y-1">
                                            <div
                                                className="bg-gradient-to-t from-blue-500 to-blue-400 w-full rounded-t-lg shadow-sm"
                                                style={{
                                                    height: `${(data.revenue / 100000) * 200}px`
                                                }}
                                            />
                                            <div
                                                className="bg-gradient-to-t from-purple-500 to-purple-400 w-full rounded-t-lg shadow-sm"
                                                style={{
                                                    height: `${(data.platformFee / 100000) * 200}px`
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500 mt-3 font-medium">
                                            {data.month}
                                        </span>
                                        <span className="text-xs font-bold text-gray-800">
                                            ₹{(data.revenue / 1000).toFixed(0)}k
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-center space-x-6 mt-6 bg-gray-50/50 rounded-xl p-3">
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full shadow-sm"></div>
                                    <span className="text-sm font-medium text-gray-700">Revenue</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full shadow-sm"></div>
                                    <span className="text-sm font-medium text-gray-700">Platform Fees</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Key Metrics */}
                    <Card className="bg-gradient-to-br from-white to-purple-50/30 border-purple-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <CardHeader className="bg-gradient-to-r from-purple-50/50 to-pink-50/30 rounded-t-lg border-b border-purple-200/50">
                            <CardTitle className="text-xl font-bold text-gray-900">Key Metrics</CardTitle>
                            <CardDescription className="text-gray-600 font-medium">
                                Important financial indicators and performance metrics
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl border border-gray-200/50">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Transaction Count</p>
                                        <p className="text-xs text-gray-500 font-medium">This month</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-gray-900">{mockFinancialStats.transactionCount}</p>
                                        <div className="flex items-center space-x-1 justify-end">
                                            <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-lg">
                                                <ArrowUpRight className="h-3 w-3" />
                                                <span className="text-xs font-semibold">+15%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-emerald-50/50 rounded-xl border border-gray-200/50">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Average Transaction</p>
                                        <p className="text-xs text-gray-500 font-medium">Per transaction</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-gray-900">₹{mockFinancialStats.averageTransaction}</p>
                                        <div className="flex items-center space-x-1 justify-end">
                                            <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-lg">
                                                <ArrowUpRight className="h-3 w-3" />
                                                <span className="text-xs font-semibold">+5%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50/50 rounded-xl border border-gray-200/50">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Platform Fee Rate</p>
                                        <p className="text-xs text-gray-500 font-medium">Percentage</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-gray-900">5%</p>
                                        <div className="flex items-center space-x-1 justify-end">
                                            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-lg">Fixed rate</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50/50 rounded-xl border border-gray-200/50">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Growth Rate</p>
                                        <p className="text-xs text-gray-500 font-medium">Month over month</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-green-600">+{mockFinancialStats.growthRate}%</p>
                                        <div className="flex items-center space-x-1 justify-end">
                                            <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-lg">
                                                <TrendingUp className="h-3 w-3" />
                                                <span className="text-xs font-semibold">Healthy growth</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Transactions */}
                <Card className="bg-gradient-to-br from-white to-gray-50/50 border-gray-200/50 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-t-lg border-b border-gray-200/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold text-gray-900">Recent Transactions</CardTitle>
                                <CardDescription className="text-gray-600 font-medium mt-1">
                                    Latest financial transactions and payments
                                </CardDescription>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search transactions..."
                                        className="pl-4 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm font-medium w-72 transition-all duration-200"
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
                                        <TableHead className="font-bold text-gray-800">Institution</TableHead>
                                        <TableHead className="font-bold text-gray-800">Type</TableHead>
                                        <TableHead className="font-bold text-gray-800">Amount</TableHead>
                                        <TableHead className="font-bold text-gray-800">Platform Fee</TableHead>
                                        <TableHead className="font-bold text-gray-800">Net Amount</TableHead>
                                        <TableHead className="font-bold text-gray-800">Status</TableHead>
                                        <TableHead className="font-bold text-gray-800">Date</TableHead>
                                        <TableHead className="font-bold text-gray-800">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockTransactions.map((transaction, index) => (
                                        <TableRow key={transaction.id} className={`hover:bg-blue-50/30 transition-colors duration-200 border-gray-200/30 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'}`}>
                                            <TableCell className="py-4">
                                                <div>
                                                    <p className="font-bold text-gray-900">{transaction.institution}</p>
                                                    <p className="text-sm text-gray-500 font-medium">{transaction.paymentMethod}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {getTypeBadge(transaction.type)}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center space-x-2">
                                                    <div className={`p-1 rounded-lg ${transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                                        {transaction.amount > 0 ? (
                                                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                                                        )}
                                                    </div>
                                                    <span className={`font-bold ${transaction.amount > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                        ₹{new Intl.NumberFormat('en-US').format(Math.abs(transaction.amount))}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className="font-bold text-gray-900">
                                                    ₹{new Intl.NumberFormat('en-US').format(Math.abs(transaction.platformFee))}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className={`font-bold ${transaction.netAmount > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                    ₹{new Intl.NumberFormat('en-US').format(Math.abs(transaction.netAmount))}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {getStatusBadge(transaction.status)}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="bg-gray-50 rounded-lg px-3 py-2">
                                                    <p className="text-sm font-bold text-gray-900">{new Date(transaction.date).toLocaleDateString('en-GB')}</p>
                                                    <p className="text-xs text-gray-500 font-medium">
                                                        {new Date(transaction.date).toLocaleDateString('en-GB', { weekday: 'short' })}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center space-x-1">
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg">
                                                        <Eye className="h-4 w-4" />
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
