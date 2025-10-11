"use client";

import { useState } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, X, Calendar, CreditCard } from "lucide-react";

export function TransactionFilters() {
    const [filters, setFilters] = useState({
        search: "",
        status: "all",
        gateway: "all",
        dateRange: "all",
    });

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            search: "",
            status: "all",
            gateway: "all",
            dateRange: "all",
        });
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== "" && value !== "all");

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Transaction Filters
                </CardTitle>
                <CardDescription>
                    Filter transaction history
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="search">Search</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="search"
                                placeholder="Search by transaction ID, gateway ID..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange("search", e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                <SelectItem value="CREATED">Created</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="FAILED">Failed</SelectItem>
                                <SelectItem value="REFUNDED">Refunded</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gateway">Payment Gateway</Label>
                        <Select value={filters.gateway} onValueChange={(value) => handleFilterChange("gateway", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="All gateways" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All gateways</SelectItem>
                                <SelectItem value="cashfree">Cashfree</SelectItem>
                                <SelectItem value="razorpay">Razorpay</SelectItem>
                                <SelectItem value="stripe">Stripe</SelectItem>
                                <SelectItem value="payu">PayU</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dateRange">Date Range</Label>
                        <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange("dateRange", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="All time" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This week</SelectItem>
                                <SelectItem value="month">This month</SelectItem>
                                <SelectItem value="quarter">This quarter</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={clearFilters} disabled={!hasActiveFilters}>
                        <X className="h-4 w-4 mr-2" />
                        Clear Filters
                    </Button>
                    <Button>
                        Apply Filters
                    </Button>
                </div>

                {/* Quick Stats */}
                <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Today's Revenue</span>
                            <span className="font-medium text-green-600">₹45,230</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Success Rate</span>
                            <span className="font-medium text-blue-600">94.2%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Avg Transaction</span>
                            <span className="font-medium text-purple-600">₹2,450</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Platform Fees</span>
                            <span className="font-medium text-orange-600">₹1,130</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
