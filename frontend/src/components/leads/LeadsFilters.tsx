"use client";

import { memo, useCallback, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";

interface LeadsFiltersProps {
  filters: {
    search: string;
    status: string;
    source: string;
    assigneeId: string;
  };
  onFiltersChange: (filters: any) => void;
  onReset: () => void;
  loading?: boolean;
}

export const LeadsFilters = memo(function LeadsFilters({
  filters,
  onFiltersChange,
  onReset,
  loading
}: LeadsFiltersProps) {

  // Local state for immediate UI response
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Sync local search with external filters only when reset
  useEffect(() => {
    if (filters.search === "" && localSearch !== "") {
      setLocalSearch("");
    }
  }, [filters.search, localSearch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value); // Immediate local update
    onFiltersChange(prev => ({ ...prev, search: value })); // Propagate to parent
  }, [onFiltersChange]);

  const handleReset = useCallback(() => {
    setLocalSearch(""); // Reset local state immediately
    onReset();
  }, [onReset]);

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search leads by name, email, or phone..."
                value={localSearch}
                onChange={handleSearchChange}
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 focus:ring-blue-200 h-11"
              // Remove disabled={loading} - this was causing focus loss!
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleReset}
              variant="outline"
              disabled={loading}
              className="h-11"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
