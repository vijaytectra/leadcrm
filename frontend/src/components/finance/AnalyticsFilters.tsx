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
import { Filter, Calendar, BarChart3, TrendingUp } from "lucide-react";

export function AnalyticsFilters() {
  const [filters, setFilters] = useState({
    period: "30d",
    startDate: "",
    endDate: "",
    metric: "all",
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    console.log("Applying analytics filters:", filters);
    // This would trigger the analytics data refresh
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Analytics Filters
        </CardTitle>
        <CardDescription>
          Configure analytics time period and metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="period">Time Period</Label>
            <Select value={filters.period} onValueChange={(value) => handleFilterChange("period", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filters.period === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="metric">Primary Metric</Label>
            <Select value={filters.metric} onValueChange={(value) => handleFilterChange("metric", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Metrics</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="transactions">Transactions</SelectItem>
                <SelectItem value="success_rate">Success Rate</SelectItem>
                <SelectItem value="platform_fees">Platform Fees</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={applyFilters} className="w-full">
          <BarChart3 className="h-4 w-4 mr-2" />
          Apply Filters
        </Button>

        {/* Quick Analytics Options */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Analytics</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              setFilters(prev => ({ ...prev, period: "7d", metric: "revenue" }));
              applyFilters();
            }}>
              <TrendingUp className="h-3 w-3 mr-1" />
              Weekly Revenue
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              setFilters(prev => ({ ...prev, period: "30d", metric: "transactions" }));
              applyFilters();
            }}>
              <BarChart3 className="h-3 w-3 mr-1" />
              Monthly Transactions
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              setFilters(prev => ({ ...prev, period: "90d", metric: "success_rate" }));
              applyFilters();
            }}>
              <Calendar className="h-3 w-3 mr-1" />
              Quarterly Performance
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              setFilters(prev => ({ ...prev, period: "30d", metric: "platform_fees" }));
              applyFilters();
            }}>
              <TrendingUp className="h-3 w-3 mr-1" />
              Fee Analysis
            </Button>
          </div>
        </div>

        {/* Analytics Insights */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Insights</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Peak Revenue Day</span>
              <span className="font-medium text-green-600">Monday</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Best Performing Gateway</span>
              <span className="font-medium text-blue-600">Cashfree</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Avg Processing Time</span>
              <span className="font-medium text-purple-600">2.3 min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Conversion Rate</span>
              <span className="font-medium text-orange-600">94.2%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
