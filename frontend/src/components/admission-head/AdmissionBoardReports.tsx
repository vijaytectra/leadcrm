"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    FileText,
    Download,
    Calendar,
    BarChart3,
    TrendingUp,
    Users,
    Target,
    Award
} from "lucide-react";

interface AdmissionBoardReportsProps {
    onGenerateReport: (filters: {
        period: '7d' | '30d' | '90d' | '1y';
        type: 'summary' | 'detailed';
    }) => Promise<{
        period: string;
        dateRange: { startDate: string; endDate: string };
        applicationsByStatus: Array<{ status: string; _count: { id: number } }>;
        applicationsByCourse: Array<{ course: string; _count: { id: number } }>;
        applicationsByMonth: Array<{ month: string; count: number }>;
        teamPerformance: Array<{
            reviewerId: string;
            _count: { id: number };
            _avg: { academicScore: number | null };
        }>;
        conversionFunnel: Array<{ stage: string; count: number }>;
    }>;
    isLoading?: boolean;
}

export function AdmissionBoardReports({
    onGenerateReport,
    isLoading = false
}: AdmissionBoardReportsProps) {
    const [filters, setFilters] = useState({
        period: '30d' as '7d' | '30d' | '90d' | '1y',
        type: 'summary' as 'summary' | 'detailed',
    });
    const [reportData, setReportData] = useState<any>(null);

    const handleGenerateReport = async () => {
        const data = await onGenerateReport(filters);
        setReportData(data);
    };

    const getPeriodLabel = (period: string) => {
        switch (period) {
            case '7d': return 'Last 7 days';
            case '30d': return 'Last 30 days';
            case '90d': return 'Last 90 days';
            case '1y': return 'Last year';
            default: return period;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Admission Board Reports</h2>
                    <p className="text-muted-foreground">
                        Generate comprehensive reports for board meetings and analysis
                    </p>
                </div>
                <Button onClick={handleGenerateReport} disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate Report'}
                </Button>
            </div>

            {/* Report Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Report Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="period">Time Period</Label>
                            <Select
                                value={filters.period}
                                onValueChange={(value: '7d' | '30d' | '90d' | '1y') =>
                                    setFilters(prev => ({ ...prev, period: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7d">Last 7 days</SelectItem>
                                    <SelectItem value="30d">Last 30 days</SelectItem>
                                    <SelectItem value="90d">Last 90 days</SelectItem>
                                    <SelectItem value="1y">Last year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Report Type</Label>
                            <Select
                                value={filters.type}
                                onValueChange={(value: 'summary' | 'detailed') =>
                                    setFilters(prev => ({ ...prev, type: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="summary">Summary Report</SelectItem>
                                    <SelectItem value="detailed">Detailed Report</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Actions</Label>
                            <div className="flex gap-2">
                                <Button onClick={handleGenerateReport} disabled={isLoading} className="flex-1">
                                    {isLoading ? 'Generating...' : 'Generate'}
                                </Button>
                                {reportData && (
                                    <Button variant="outline" className="flex-1">
                                        <Download className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Report Results */}
            {reportData && (
                <div className="space-y-6">
                    {/* Report Header */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                {getPeriodLabel(filters.period)} Report
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <div className="text-sm text-muted-foreground">Report Period</div>
                                    <div className="font-medium">
                                        {new Date(reportData.dateRange.startDate).toLocaleDateString()} - {' '}
                                        {new Date(reportData.dateRange.endDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Report Type</div>
                                    <div className="font-medium capitalize">{filters.type} Report</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Applications by Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Applications by Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {reportData.applicationsByStatus.map((item: any) => (
                                    <div key={item.status} className="p-4 border rounded-lg">
                                        <div className="text-2xl font-bold">{item._count.id}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {item.status.replace('_', ' ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Applications by Course */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Applications by Course
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {reportData.applicationsByCourse.map((item: any) => (
                                    <div key={item.course} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <div className="font-medium">{item.course || 'Not specified'}</div>
                                        </div>
                                        <div className="text-2xl font-bold">{item._count.id}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Monthly Trends */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Monthly Application Trends
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {reportData.applicationsByMonth.map((item: any) => (
                                    <div key={item.month} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="font-medium">{item.month}</div>
                                        <div className="text-2xl font-bold">{item.count}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Team Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Team Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {reportData.teamPerformance.map((member: any) => (
                                    <div key={member.reviewerId} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <div className="font-medium">Reviewer {member.reviewerId.slice(-4)}</div>
                                            <div className="text-sm text-muted-foreground">
                                                Reviews completed: {member._count.id}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold">
                                                {member._avg.academicScore ? Math.round(member._avg.academicScore) : 'N/A'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">Avg Score</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Conversion Funnel */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Conversion Funnel
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {reportData.conversionFunnel.map((stage: any, index: number) => (
                                    <div key={stage.stage} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                                                {index + 1}
                                            </div>
                                            <div className="font-medium">{stage.stage}</div>
                                        </div>
                                        <div className="text-2xl font-bold">{stage.count}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Export Options */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Export Report</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <Button variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export as PDF
                                </Button>
                                <Button variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export as Excel
                                </Button>
                                <Button variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export as CSV
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
