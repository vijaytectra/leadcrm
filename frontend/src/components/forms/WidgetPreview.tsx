'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    X,
    Monitor,
    Smartphone,
    Tablet,
    ExternalLink,
    RefreshCw
} from 'lucide-react';

interface WidgetPreviewProps {
    widget: {
        id: string;
        name: string;
        previewUrl: string;
        publicUrl: string;
        settings: {
            width: string;
            height: string;
            borderRadius: number;
            theme: string;
        };
    };
    onClose: () => void;
    className?: string;
}

export function WidgetPreview({
    widget,
    onClose,
    className
}: WidgetPreviewProps) {
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [refreshKey, setRefreshKey] = useState(0);

    const getPreviewDimensions = () => {
        switch (previewDevice) {
            case 'mobile':
                return { width: '320px', height: '500px' };
            case 'tablet':
                return { width: '768px', height: '600px' };
            default:
                return { width: '100%', height: '600px' };
        }
    };

    const previewDimensions = getPreviewDimensions();

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const getDeviceIcon = (device: string) => {
        switch (device) {
            case 'mobile':
                return <Smartphone className="h-4 w-4" />;
            case 'tablet':
                return <Tablet className="h-4 w-4" />;
            default:
                return <Monitor className="h-4 w-4" />;
        }
    };

    const getDeviceLabel = (device: string) => {
        switch (device) {
            case 'mobile':
                return 'Mobile';
            case 'tablet':
                return 'Tablet';
            default:
                return 'Desktop';
        }
    };

    return (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${className}`}>
            <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Preview: {widget.name}</CardTitle>
                        <p className="text-sm text-slate-600 mt-1">
                            See how your widget will look on different devices
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(widget.previewUrl, '_blank')}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Full Preview
                        </Button>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Device Selector */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">Preview Device:</span>
                            <div className="flex items-center space-x-1">
                                {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
                                    <Button
                                        key={device}
                                        variant={previewDevice === device ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setPreviewDevice(device)}
                                        className="flex items-center space-x-2"
                                    >
                                        {getDeviceIcon(device)}
                                        <span>{getDeviceLabel(device)}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                                {widget.settings.theme.replace('-', ' ')}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                {previewDimensions.width} × {previewDimensions.height}
                            </Badge>
                        </div>
                    </div>

                    {/* Preview Container */}
                    <div className="border rounded-lg p-4 bg-slate-50">
                        <div className="flex items-center justify-center">
                            <div
                                className="border rounded-lg overflow-hidden shadow-lg"
                                style={{
                                    width: previewDimensions.width,
                                    height: previewDimensions.height,
                                    maxWidth: '100%',
                                    borderRadius: `${widget.settings.borderRadius}px`
                                }}
                            >
                                <iframe
                                    key={refreshKey}
                                    src={`${window.location.origin}/widgets/${widget.id}`}
                                    width="100%"
                                    height="100%"
                                    className="border-0"
                                    title={`Widget Preview - ${widget.name}`}
                                    style={{
                                        borderRadius: `${widget.settings.borderRadius}px`
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Widget Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Widget Settings</h4>
                            <div className="space-y-1 text-sm text-slate-600">
                                <div className="flex justify-between">
                                    <span>Theme:</span>
                                    <span className="capitalize">{widget.settings.theme.replace('-', ' ')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Dimensions:</span>
                                    <span>{widget.settings.width} × {widget.settings.height}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Border Radius:</span>
                                    <span>{widget.settings.borderRadius}px</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Preview Information</h4>
                            <div className="space-y-1 text-sm text-slate-600">
                                <div className="flex justify-between">
                                    <span>Current Device:</span>
                                    <span className="capitalize">{getDeviceLabel(previewDevice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Preview Size:</span>
                                    <span>{previewDimensions.width} × {previewDimensions.height}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Widget ID:</span>
                                    <span className="font-mono text-xs">{widget.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => window.open(widget.previewUrl, '_blank')}
                            className="flex-1"
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Full Preview
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.open(widget.publicUrl, '_blank')}
                            className="flex-1"
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Public Form
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
