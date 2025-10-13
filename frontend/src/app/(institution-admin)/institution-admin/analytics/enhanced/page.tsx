import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LeadFunnelChart from '@/components/analytics/LeadFunnelChart';
import ConversionRateChart from '@/components/analytics/ConversionRateChart';
import SourcePerformanceChart from '@/components/analytics/SourcePerformanceChart';
import { apiGet } from '@/lib/utils';

async function EnhancedAnalytics() {
    const [funnelData, conversionData, sourceData] = await Promise.all([
        apiGet('/api/analytics/funnel?period=30d'),
        apiGet('/api/analytics/conversions?period=30d'),
        apiGet('/api/analytics/sources?period=30d'),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Enhanced Analytics</h1>
                <p className="text-muted-foreground">
                    Deep insights into your lead generation and conversion performance
                </p>
            </div>

            <Tabs defaultValue="funnel" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="funnel">Lead Funnel</TabsTrigger>
                    <TabsTrigger value="conversions">Conversion Rate</TabsTrigger>
                    <TabsTrigger value="sources">Source Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="funnel">
                    {funnelData.success ? (
                        <LeadFunnelChart data={funnelData.data} />
                    ) : (
                        <Card>
                            <CardContent className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">📊</div>
                                    <h3 className="text-xl font-semibold mb-2">No funnel data available</h3>
                                    <p className="text-muted-foreground">
                                        Start generating leads to see your funnel analytics
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="conversions">
                    {conversionData.success ? (
                        <ConversionRateChart data={conversionData.data} />
                    ) : (
                        <Card>
                            <CardContent className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">📈</div>
                                    <h3 className="text-xl font-semibold mb-2">No conversion data available</h3>
                                    <p className="text-muted-foreground">
                                        Convert some leads to see conversion analytics
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="sources">
                    {sourceData.success ? (
                        <SourcePerformanceChart data={sourceData.data} />
                    ) : (
                        <Card>
                            <CardContent className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">🎯</div>
                                    <h3 className="text-xl font-semibold mb-2">No source data available</h3>
                                    <p className="text-muted-foreground">
                                        Import leads from different sources to see performance analytics
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function EnhancedAnalyticsPage() {
    return (
        <Suspense fallback={<div>Loading analytics...</div>}>
            <EnhancedAnalytics />
        </Suspense>
    );
}
