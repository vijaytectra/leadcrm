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
import { Filter, Download, Calendar, FileText } from "lucide-react";

export function ReportFilters() {
  const [filters, setFilters] = useState({
    type: "summary",
    period: "30d",
    format: "json",
    startDate: "",
    endDate: "",
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const generateReport = () => {
   
    // This would trigger the report generation
  };

  const downloadReport = () => {
  
    // This would trigger the report download
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Report Filters
        </CardTitle>
        <CardDescription>
          Configure and generate financial reports
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Report Type</Label>
            <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary Report</SelectItem>
                <SelectItem value="detailed">Detailed Report</SelectItem>
                <SelectItem value="reconciliation">Reconciliation Report</SelectItem>
                <SelectItem value="revenue">Revenue Report</SelectItem>
                <SelectItem value="refunds">Refunds Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
            <Label htmlFor="format">Export Format</Label>
            <Select value={filters.format} onValueChange={(value) => handleFilterChange("format", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button onClick={generateReport}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button variant="outline" onClick={downloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Quick Report Options */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Reports</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              setFilters(prev => ({ ...prev, type: "summary", period: "7d" }));
              generateReport();
            }}>
              <Calendar className="h-3 w-3 mr-1" />
              Weekly Summary
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              setFilters(prev => ({ ...prev, type: "detailed", period: "30d" }));
              generateReport();
            }}>
              <FileText className="h-3 w-3 mr-1" />
              Monthly Detail
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              setFilters(prev => ({ ...prev, type: "reconciliation", period: "30d" }));
              generateReport();
            }}>
              <Filter className="h-3 w-3 mr-1" />
              Reconciliation
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              setFilters(prev => ({ ...prev, type: "revenue", period: "90d" }));
              generateReport();
            }}>
              <Calendar className="h-3 w-3 mr-1" />
              Quarterly Revenue
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
