"use client";

import { memo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, RotateCcw } from "lucide-react";

interface LeadsFiltersProps {
  filters: {
    search: string;
    status: string;
    source: string;
    assigneeId: string;
  };
  onFiltersChange: (filters: any) => void;
  onSearch: () => void;
  onReset: () => void;
  loading?: boolean;
}

export const LeadsFilters = memo(function LeadsFilters({ 
  filters, 
  onFiltersChange, 
  onSearch, 
  onReset,
  loading 
}: LeadsFiltersProps) {
  const handleSearchChange = useCallback((value: string) => {
    onFiltersChange(prev => ({ ...prev, search: value }));
  }, [onFiltersChange]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  }, [onSearch]);

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search leads by name, email, or phone..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 focus:ring-blue-200 h-11"
                disabled={loading}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={onSearch}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-11"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button 
              onClick={onReset}
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
