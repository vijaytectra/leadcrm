'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    FileText,
    Download,
    Calendar,
    BarChart3,
    PieChart,
    Table,
    Plus,
    X,
    Save,
    Play
} from 'lucide-react';
import { apiPost, apiGet, ApiException } from '@/lib/utils';

interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    type: string;
    config: any;
    isActive: boolean;
    createdAt: string;
}

interface CustomReportBuilderProps {
    onReportGenerated?: (report: any) => void;
}

const reportTypes = [
    { value: 'FUNNEL', label: 'Lead Funnel', icon: BarChart3, description: 'Track leads through stages' },
    { value: 'CONVERSION', label: 'Conversion Rate', icon: PieChart, description: 'Analyze conversion performance' },
    { value: 'SOURCE', label: 'Source Performance', icon: Table, description: 'Compare lead sources' },
    { value: 'TEAM', label: 'Team Performance', icon: BarChart3, description: 'Team productivity metrics' },
    { value: 'ROI', label: 'Campaign ROI', icon: BarChart3, description: 'Return on investment analysis' },
    { value: 'CUSTOM', label: 'Custom Report', icon: FileText, description: 'Build your own report' },
];

const chartTypes = [
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'line', label: 'Line Chart', icon: BarChart3 },
    { value: 'pie', label: 'Pie Chart', icon: PieChart },
    { value: 'table', label: 'Table', icon: Table },
];

const dateRanges = [
    { value: 'LAST_7_DAYS', label: 'Last 7 Days' },
    { value: 'LAST_30_DAYS', label: 'Last 30 Days' },
    { value: 'LAST_90_DAYS', label: 'Last 90 Days' },
    { value: 'THIS_MONTH', label: 'This Month' },
    { value: 'CUSTOM', label: 'Custom Range' },
];

const availableMetrics = [
    { value: 'totalLeads', label: 'Total Leads', category: 'Volume' },
    { value: 'convertedLeads', label: 'Converted Leads', category: 'Volume' },
    { value: 'conversionRate', label: 'Conversion Rate', category: 'Performance' },
    { value: 'leadsBySource', label: 'Leads by Source', category: 'Source' },
    { value: 'leadsByStatus', label: 'Leads by Status', category: 'Status' },
    { value: 'teamPerformance', label: 'Team Performance', category: 'Team' },
    { value: 'costPerLead', label: 'Cost per Lead', category: 'Cost' },
    { value: 'roi', label: 'ROI', category: 'Performance' },
];

export default function CustomReportBuilder({ onReportGenerated }: CustomReportBuilderProps) {
    const [reportName, setReportName] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [reportType, setReportType] = useState('');
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
    const [selectedChartTypes, setSelectedChartTypes] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState('LAST_30_DAYS');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [groupBy, setGroupBy] = useState<string[]>([]);
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [savedTemplates, setSavedTemplates] = useState<ReportTemplate[]>([]);

    const loadSavedTemplates = async () => {
        try {
            const response = await apiGet('/api/analytics/reports');
            if (response.success) {
                setSavedTemplates(response.data);
            }
        } catch (error) {

            if (error instanceof ApiException) {
                console.error('Failed to load templates:', error.message);
            } else {
                console.error('Failed to load templates:', error);
            }
        }
    };

    const handleMetricToggle = (metric: string) => {
        setSelectedMetrics(prev =>
            prev.includes(metric)
                ? prev.filter(m => m !== metric)
                : [...prev, metric]
        );
    };

    const handleChartTypeToggle = (chartType: string) => {
        setSelectedChartTypes(prev =>
            prev.includes(chartType)
                ? prev.filter(c => c !== chartType)
                : [...prev, chartType]
        );
    };

    const handleGroupByToggle = (field: string) => {
        setGroupBy(prev =>
            prev.includes(field)
                ? prev.filter(f => f !== field)
                : [...prev, field]
        );
    };

    const handleSaveTemplate = async () => {
        if (!reportName.trim() || !reportType || selectedMetrics.length === 0) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            const config = {
                metrics: selectedMetrics,
                chartTypes: selectedChartTypes,
                groupBy,
                dateRange: dateRange === 'CUSTOM'
                    ? { start: customStartDate, end: customEndDate }
                    : dateRange,
                filters,
            };

            const response = await apiPost('/api/analytics/reports/custom', {
                name: reportName,
                description: reportDescription,
                type: reportType,
                config,
            });

            if (response.success) {
                setSuccess('Report template saved successfully!');
                loadSavedTemplates();
            } else {
                setError(response.error || 'Failed to save template');
            }
            } catch (error) {
            if (error instanceof ApiException) {
                setError(error.message || 'Failed to save template');
            } else {
                setError(error instanceof Error ? error.message : 'An error occurred');
            }
        }
    };

    const handleGenerateReport = async (templateId?: string) => {
        setIsGenerating(true);
        setError(null);

        try {
            const response = await apiPost(`/api/analytics/reports/${templateId || 'new'}/export`, {
                format: 'PDF',
                periodStart: dateRange === 'CUSTOM' ? customStartDate : undefined,
                periodEnd: dateRange === 'CUSTOM' ? customEndDate : undefined,
            });

            if (response.success) {
                setSuccess('Report generated successfully!');
                onReportGenerated?.(response.data);
            } 
        } catch (error) {
            if (error instanceof ApiException) {
                setError(error.message || 'Failed to generate report');
            } else {
                setError(error instanceof Error ? error.message : 'An error occurred');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Custom Report Builder</h1>
                <p className="text-muted-foreground">
                    Create and schedule custom analytics reports
                </p>
            </div>

            <Tabs defaultValue="builder" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="builder">Report Builder</TabsTrigger>
                    <TabsTrigger value="templates">Saved Templates</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="builder">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Report Configuration */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Report Configuration</CardTitle>
                                <CardDescription>
                                    Set up your custom report parameters
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reportName">Report Name *</Label>
                                    <Input
                                        id="reportName"
                                        value={reportName}
                                        onChange={(e) => setReportName(e.target.value)}
                                        placeholder="Enter report name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reportDescription">Description</Label>
                                    <Textarea
                                        id="reportDescription"
                                        value={reportDescription}
                                        onChange={(e) => setReportDescription(e.target.value)}
                                        placeholder="Describe your report"
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Report Type *</Label>
                                    <Select value={reportType} onValueChange={setReportType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select report type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {reportTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    <div className="flex items-center gap-2">
                                                        <type.icon className="h-4 w-4" />
                                                        {type.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Date Range</Label>
                                    <Select value={dateRange} onValueChange={setDateRange}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dateRanges.map((range) => (
                                                <SelectItem key={range.value} value={range.value}>
                                                    {range.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {dateRange === 'CUSTOM' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Start Date</Label>
                                            <Input
                                                type="date"
                                                value={customStartDate}
                                                onChange={(e) => setCustomStartDate(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>End Date</Label>
                                            <Input
                                                type="date"
                                                value={customEndDate}
                                                onChange={(e) => setCustomEndDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Metrics Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Select Metrics</CardTitle>
                                <CardDescription>
                                    Choose the data points to include in your report
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    {Object.entries(
                                        availableMetrics.reduce((acc, metric) => {
                                            if (!acc[metric.category]) acc[metric.category] = [];
                                            acc[metric.category].push(metric);
                                            return acc;
                                        }, {} as Record<string, typeof availableMetrics>)
                                    ).map(([category, metrics]) => (
                                        <div key={category} className="space-y-2">
                                            <h4 className="font-medium text-sm">{category}</h4>
                                            <div className="space-y-2">
                                                {metrics.map((metric) => (
                                                    <div key={metric.value} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={metric.value}
                                                            checked={selectedMetrics.includes(metric.value)}
                                                            onCheckedChange={() => handleMetricToggle(metric.value)}
                                                        />
                                                        <Label htmlFor={metric.value} className="text-sm">
                                                            {metric.label}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <Label>Chart Types</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {chartTypes.map((chart) => (
                                            <div key={chart.value} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={chart.value}
                                                    checked={selectedChartTypes.includes(chart.value)}
                                                    onCheckedChange={() => handleChartTypeToggle(chart.value)}
                                                />
                                                <Label htmlFor={chart.value} className="text-sm">
                                                    {chart.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Actions */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={handleSaveTemplate}
                                        variant="outline"
                                        disabled={!reportName.trim() || !reportType || selectedMetrics.length === 0}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Template
                                    </Button>
                                    <Button
                                        onClick={() => handleGenerateReport()}
                                        disabled={isGenerating || selectedMetrics.length === 0}
                                    >
                                        {isGenerating && <Play className="h-4 w-4 mr-2 animate-spin" />}
                                        <Download className="h-4 w-4 mr-2" />
                                        Generate Report
                                    </Button>
                                </div>
                            </div>

                            {error && (
                                <Alert variant="destructive" className="mt-4">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {success && (
                                <Alert className="mt-4">
                                    <AlertDescription>{success}</AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="templates">
                    <Card>
                        <CardHeader>
                            <CardTitle>Saved Report Templates</CardTitle>
                            <CardDescription>
                                Manage your saved report configurations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {savedTemplates.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No saved templates yet
                                    </div>
                                ) : (
                                    savedTemplates.map((template) => (
                                        <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <div className="font-medium">{template.name}</div>
                                                <div className="text-sm text-muted-foreground">{template.description}</div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge variant="outline">{template.type}</Badge>
                                                    <Badge variant={template.isActive ? 'default' : 'secondary'}>
                                                        {template.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleGenerateReport(template.id)}
                                                    disabled={isGenerating}
                                                >
                                                    <Download className="h-4 w-4 mr-1" />
                                                    Generate
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="schedule">
                    <Card>
                        <CardHeader>
                            <CardTitle>Schedule Reports</CardTitle>
                            <CardDescription>
                                Set up automated report generation and delivery
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <Calendar className="h-12 w-12 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Scheduled Reports</h3>
                                <p>Schedule reports to be generated and delivered automatically</p>
                                <Button className="mt-4" disabled>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Schedule (Coming Soon)
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
