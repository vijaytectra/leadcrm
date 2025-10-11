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
import { Search, Filter, X, Calendar, User } from "lucide-react";

export function DocumentHistoryFilters() {
    const [filters, setFilters] = useState({
        search: "",
        status: "all",
        verifier: "all",
        dateRange: "all",
    });

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            search: "",
            status: "all",
            verifier: "all",
            dateRange: "all",
        });
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== "" && value !== "all");

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    History Filters
                </CardTitle>
                <CardDescription>
                    Filter verification history
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
                                placeholder="Search documents, students..."
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
                                <SelectItem value="VERIFIED">Verified</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="verifier">Verifier</Label>
                        <Select value={filters.verifier} onValueChange={(value) => handleFilterChange("verifier", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="All verifiers" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All verifiers</SelectItem>
                                <SelectItem value="jane-smith">Jane Smith</SelectItem>
                                <SelectItem value="mike-johnson">Mike Johnson</SelectItem>
                                <SelectItem value="sarah-davis">Sarah Davis</SelectItem>
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
                            <span className="text-gray-600">Verified Today</span>
                            <span className="font-medium text-green-600">12</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Rejected Today</span>
                            <span className="font-medium text-red-600">3</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">This Week</span>
                            <span className="font-medium text-blue-600">45</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">This Month</span>
                            <span className="font-medium text-purple-600">156</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
