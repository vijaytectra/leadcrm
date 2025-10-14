"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { NotificationFilters } from "@/types/notifications";
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface NotificationFiltersProps {
    filters: NotificationFilters;
    onFiltersChange: (filters: NotificationFilters) => void;
    onReset: () => void;
    loading?: boolean;
}

const CATEGORIES = [
    { value: "", label: "All Categories" },
    { value: "LEAD", label: "Lead" },
    { value: "ANNOUNCEMENT", label: "Announcement" },
    { value: "SYSTEM", label: "System" },
    { value: "PAYMENT", label: "Payment" },
    { value: "DOCUMENT", label: "Document" },
    { value: "ADMISSION", label: "Admission" },
    { value: "FINANCE", label: "Finance" },
    { value: "COMMUNICATION", label: "Communication" },
    { value: "PERFORMANCE", label: "Performance" },
];

const TYPES = [
    { value: "", label: "All Types" },
    { value: "INFO", label: "Info" },
    { value: "SUCCESS", label: "Success" },
    { value: "WARNING", label: "Warning" },
    { value: "ERROR", label: "Error" },
    { value: "SYSTEM", label: "System" },
];

const PRIORITIES = [
    { value: "", label: "All Priorities" },
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "URGENT", label: "Urgent" },
];

const READ_STATUS = [
    { value: "", label: "All" },
    { value: "true", label: "Read" },
    { value: "false", label: "Unread" },
];

export function NotificationFiltersComponent({
    filters,
    onFiltersChange,
    onReset,
    loading = false
}: NotificationFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState<NotificationFilters>(filters);

    const handleFilterChange = (key: keyof NotificationFilters, value: any) => {
        const newFilters = { ...localFilters, [key]: value, page: 1 };
        setLocalFilters(newFilters);
    };

    const handleApplyFilters = () => {
        onFiltersChange(localFilters);
        setIsOpen(false);
    };

    const handleReset = () => {
        const resetFilters: NotificationFilters = {
            page: 1,
            limit: 10,
            sortBy: "createdAt",
            sortOrder: "desc"
        };
        setLocalFilters(resetFilters);
        onFiltersChange(resetFilters);
        setIsOpen(false);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.search) count++;
        if (filters.category) count++;
        if (filters.type) count++;
        if (filters.priority) count++;
        if (filters.read !== undefined) count++;
        return count;
    };

    const activeFiltersCount = getActiveFiltersCount();

    return (
        <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search notifications..."
                        value={localFilters.search || ""}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                        className="pl-10"
                        disabled={loading}
                    />
                </div>
            </div>

            {/* Filter Popover */}
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="relative">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                        {activeFiltersCount > 0 && (
                            <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Filter Notifications</h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {/* Category */}
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={localFilters.category || ""}
                                    onValueChange={(value) => handleFilterChange("category", value || undefined)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((category) => (
                                            <SelectItem key={category.value} value={category.value}>
                                                {category.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Type */}
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    value={localFilters.type || ""}
                                    onValueChange={(value) => handleFilterChange("type", value || undefined)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Priority */}
                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={localFilters.priority || ""}
                                    onValueChange={(value) => handleFilterChange("priority", value || undefined)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRIORITIES.map((priority) => (
                                            <SelectItem key={priority.value} value={priority.value}>
                                                {priority.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Read Status */}
                            <div className="space-y-2">
                                <Label htmlFor="read">Read Status</Label>
                                <Select
                                    value={localFilters.read?.toString() || ""}
                                    onValueChange={(value) => handleFilterChange("read", value ? value === "true" : undefined)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select read status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {READ_STATUS.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                            <Button variant="outline" onClick={handleReset}>
                                Reset
                            </Button>
                            <Button onClick={handleApplyFilters}>
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Active filters display */}
            {activeFiltersCount > 0 && (
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Active filters:</span>
                    <div className="flex items-center space-x-1">
                        {filters.search && (
                            <Badge variant="secondary" className="text-xs">
                                Search: {filters.search}
                            </Badge>
                        )}
                        {filters.category && (
                            <Badge variant="secondary" className="text-xs">
                                {CATEGORIES.find(c => c.value === filters.category)?.label}
                            </Badge>
                        )}
                        {filters.type && (
                            <Badge variant="secondary" className="text-xs">
                                {TYPES.find(t => t.value === filters.type)?.label}
                            </Badge>
                        )}
                        {filters.priority && (
                            <Badge variant="secondary" className="text-xs">
                                {PRIORITIES.find(p => p.value === filters.priority)?.label}
                            </Badge>
                        )}
                        {filters.read !== undefined && (
                            <Badge variant="secondary" className="text-xs">
                                {filters.read ? "Read" : "Unread"}
                            </Badge>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
