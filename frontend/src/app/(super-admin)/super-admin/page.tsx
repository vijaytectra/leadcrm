"use client";

import React from "react";


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Building2,
    Users,
    DollarSign,
    TrendingUp,
  
    BarChart3,
    Plus,
    Eye,
    MoreHorizontal
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Mock data
const mockStats = {
    totalInstitutions: 24,
    activeInstitutions: 22,
    totalRevenue: 1250000,
    monthlyRevenue: 85000,
    totalUsers: 156,
    conversionRate: 12.5
};

const mockRecentInstitutions = [
    {
        id: "1",
        name: "ABC College",
        email: "admin@abccollege.edu",
        status: "active",
        subscription: "PRO",
        revenue: 45000,
        users: 12,
        joinedDate: "2024-01-15"
    },
    {
        id: "2",
        name: "XYZ School",
        email: "admin@xyzschool.edu",
        status: "active",
        subscription: "STARTER",
        revenue: 25000,
        users: 5,
        joinedDate: "2024-01-20"
    },
    {
        id: "3",
        name: "DEF Institute",
        email: "admin@definstitute.edu",
        status: "pending",
        subscription: "MAX",
        revenue: 75000,
        users: 18,
        joinedDate: "2024-01-25"
    }
];

const mockRevenueData = [
    { month: "Jan", revenue: 65000 },
    { month: "Feb", revenue: 72000 },
    { month: "Mar", revenue: 78000 },
    { month: "Apr", revenue: 82000 },
    { month: "May", revenue: 85000 },
    { month: "Jun", revenue: 88000 }
];

export default function SuperAdminDashboard() {
    return (
        <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
          
                <div className="space-y-6">
                    {/* Page Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-gray-600 mt-1">
                                Welcome back! Here&apos;s what&apos;s happening with your platform.
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button variant="outline">
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Export Report
                            </Button>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Institution
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Institutions</CardTitle>
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{mockStats.totalInstitutions}</div>
                                <p className="text-xs text-muted-foreground">
                                    {mockStats.activeInstitutions} active
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{mockStats.totalRevenue.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    +12.5% from last month
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{mockStats.monthlyRevenue.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    +8.2% from last month
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{mockStats.totalUsers}</div>
                                <p className="text-xs text-muted-foreground">
                                    Across all institutions
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts and Tables */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Trend</CardTitle>
                                <CardDescription>
                                    Monthly revenue over the last 6 months
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 flex items-end space-x-2">
                                    {mockRevenueData.map((data, index) => (
                                        <div key={index} className="flex-1 flex flex-col items-center">
                                            <div
                                                className="bg-primary w-full rounded-t"
                                                style={{
                                                    height: `${(data.revenue / 100000) * 200}px`
                                                }}
                                            />
                                            <span className="text-xs text-muted-foreground mt-2">
                                                {data.month}
                                            </span>
                                            <span className="text-xs font-medium">
                                                ₹{(data.revenue / 1000).toFixed(0)}k
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>
                                    Latest platform activities and updates
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">New institution registered</p>
                                            <p className="text-xs text-muted-foreground">ABC College - 2 minutes ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Payment received</p>
                                            <p className="text-xs text-muted-foreground">₹45,000 from XYZ School - 1 hour ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Subscription upgraded</p>
                                            <p className="text-xs text-muted-foreground">DEF Institute to MAX plan - 3 hours ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">System alert</p>
                                            <p className="text-xs text-muted-foreground">High server load detected - 5 hours ago</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Institutions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Institutions</CardTitle>
                            <CardDescription>
                                Latest institutions that joined the platform
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {mockRecentInstitutions.map((institution) => (
                                    <div key={institution.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{institution.name}</p>
                                                <p className="text-sm text-muted-foreground">{institution.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <p className="text-sm font-medium">₹{institution.revenue.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground">{institution.users} users</p>
                                            </div>
                                            <Badge
                                                variant={institution.status === "active" ? "success" : "warning"}
                                            >
                                                {institution.status}
                                            </Badge>
                                            <Badge variant="outline">
                                                {institution.subscription}
                                            </Badge>
                                            <div className="flex items-center space-x-2">
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
    
        </ProtectedRoute>
    );
}
