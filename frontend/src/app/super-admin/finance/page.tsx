"use client";

import React from "react";
import { SuperAdminLayout } from "@/components/layouts/SuperAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Banknote,
    PieChart,
    BarChart3,
    Download,
    Filter,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    MoreHorizontal
} from "lucide-react";

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
            return <Badge variant="success">Completed</Badge>;
        case "pending":
            return <Badge variant="warning">Pending</Badge>;
        case "failed":
            return <Badge variant="destructive">Failed</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

const getTypeBadge = (type: string) => {
    switch (type) {
        case "subscription":
            return <Badge variant="default">Subscription</Badge>;
        case "platform_fee":
            return <Badge variant="secondary">Platform Fee</Badge>;
        case "refund":
            return <Badge variant="destructive">Refund</Badge>;
        default:
            return <Badge variant="outline">{type}</Badge>;
    }
};

export default function FinancePage() {
    return (
        <SuperAdminLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
                        <p className="text-gray-600 mt-1">
                            Monitor revenue, platform fees, and financial performance
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button variant="outline">
                            <Calendar className="h-4 w-4 mr-2" />
                            Date Range
                        </Button>
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                        <Button>
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                    </div>
                </div>

                {/* Financial Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{new Intl.NumberFormat('en-US').format(mockFinancialStats.totalRevenue)}</div>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <TrendingUp className="h-3 w-3 text-green-500" />
                                <span className="text-green-500">+{mockFinancialStats.growthRate}%</span>
                                <span>from last month</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{new Intl.NumberFormat('en-US').format(mockFinancialStats.monthlyRevenue)}</div>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <TrendingUp className="h-3 w-3 text-green-500" />
                                <span className="text-green-500">+8.2%</span>
                                <span>from last month</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{new Intl.NumberFormat('en-US').format(mockFinancialStats.platformFees)}</div>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <span>5% of transactions</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{new Intl.NumberFormat('en-US').format(mockFinancialStats.netRevenue)}</div>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <TrendingUp className="h-3 w-3 text-green-500" />
                                <span className="text-green-500">+10.5%</span>
                                <span>from last month</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Revenue Chart and Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Trend Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Trend</CardTitle>
                            <CardDescription>
                                Monthly revenue and platform fees over the last 6 months
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-end space-x-2">
                                {mockRevenueData.map((data, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center">
                                        <div className="w-full flex flex-col items-center space-y-1">
                                            <div
                                                className="bg-primary w-full rounded-t"
                                                style={{
                                                    height: `${(data.revenue / 100000) * 200}px`
                                                }}
                                            />
                                            <div
                                                className="bg-secondary w-full rounded-t"
                                                style={{
                                                    height: `${(data.platformFee / 100000) * 200}px`
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground mt-2">
                                            {data.month}
                                        </span>
                                        <span className="text-xs font-medium">
                                            ₹{(data.revenue / 1000).toFixed(0)}k
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-center space-x-4 mt-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-primary rounded"></div>
                                    <span className="text-sm">Revenue</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-secondary rounded"></div>
                                    <span className="text-sm">Platform Fees</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Key Metrics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Key Metrics</CardTitle>
                            <CardDescription>
                                Important financial indicators and performance metrics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Transaction Count</p>
                                        <p className="text-xs text-muted-foreground">This month</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">{mockFinancialStats.transactionCount}</p>
                                        <div className="flex items-center space-x-1">
                                            <ArrowUpRight className="h-3 w-3 text-green-500" />
                                            <span className="text-xs text-green-500">+15%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Average Transaction</p>
                                        <p className="text-xs text-muted-foreground">Per transaction</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">₹{mockFinancialStats.averageTransaction}</p>
                                        <div className="flex items-center space-x-1">
                                            <ArrowUpRight className="h-3 w-3 text-green-500" />
                                            <span className="text-xs text-green-500">+5%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Platform Fee Rate</p>
                                        <p className="text-xs text-muted-foreground">Percentage</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">5%</p>
                                        <div className="flex items-center space-x-1">
                                            <span className="text-xs text-muted-foreground">Fixed rate</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Growth Rate</p>
                                        <p className="text-xs text-muted-foreground">Month over month</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-green-500">+{mockFinancialStats.growthRate}%</p>
                                        <div className="flex items-center space-x-1">
                                            <TrendingUp className="h-3 w-3 text-green-500" />
                                            <span className="text-xs text-green-500">Healthy growth</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Transactions */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Transactions</CardTitle>
                                <CardDescription>
                                    Latest financial transactions and payments
                                </CardDescription>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search transactions..."
                                        className="pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                                    <TableHead>Type</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Platform Fee</TableHead>
                                    <TableHead>Net Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockTransactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{transaction.institution}</p>
                                                <p className="text-sm text-muted-foreground">{transaction.paymentMethod}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getTypeBadge(transaction.type)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                {transaction.amount > 0 ? (
                                                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                                                )}
                                                <span className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    ₹{new Intl.NumberFormat('en-US').format(Math.abs(transaction.amount))}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">
                                                ₹{new Intl.NumberFormat('en-US').format(Math.abs(transaction.platformFee))}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`font-medium ${transaction.netAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                ₹{new Intl.NumberFormat('en-US').format(Math.abs(transaction.netAmount))}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(transaction.status)}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm">{new Date(transaction.date).toLocaleDateString()}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(transaction.date).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
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
