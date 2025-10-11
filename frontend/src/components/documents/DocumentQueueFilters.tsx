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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";

export function DocumentQueueFilters() {
    const [filters, setFilters] = useState({
        search: "",
        status: "all",
        documentType: "all",
        dateRange: "all",
    });

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            search: "",
            status: "all",
            documentType: "all",
            dateRange: "all",
        });
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== "" && value !== "all");

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="search">Search</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="search"
                                placeholder="Search documents..."
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
                                <SelectItem value="UPLOADED">Pending</SelectItem>
                                <SelectItem value="VERIFIED">Verified</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="documentType">Document Type</Label>
                        <Select value={filters.documentType} onValueChange={(value) => handleFilterChange("documentType", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                <SelectItem value="IDENTITY">Identity Documents</SelectItem>
                                <SelectItem value="ACADEMIC">Academic Documents</SelectItem>
                                <SelectItem value="FINANCIAL">Financial Documents</SelectItem>
                                <SelectItem value="GENERAL">General Documents</SelectItem>
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
            </CardContent>
        </Card>
    );
}
