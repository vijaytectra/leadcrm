'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Palette,
    Monitor,
    Smartphone,
    Tablet,
    Copy,
    Eye,
    Download,
    Settings,
    X
} from 'lucide-react';
import {
    WidgetThemePreset,
    THEME_PRESETS,
    getThemeStyles,
    getThemePreviewStyles
} from '@/lib/widget-themes';

interface WidgetGeneratorProps {
    formId: string;
    formTitle: string;
    onGenerate: (config: WidgetConfig) => void;
    onClose: () => void;
    className?: string;
}

interface WidgetConfig {
    name: string;
    styling: {
        theme: WidgetThemePreset;
        primaryColor: string;
        borderRadius: number;
        width: string;
        height: string;
    };
}

export function WidgetGenerator({
    formId,
    formTitle,
    onGenerate,
    onClose,
    className
}: WidgetGeneratorProps) {
    const [config, setConfig] = useState<WidgetConfig>({
        name: `${formTitle} Widget`,
        styling: {
            theme: 'modern-light',
            primaryColor: '#3b82f6',
            borderRadius: 8,
            width: '100%',
            height: '600px'
        }
    });

    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

    const handleGenerate = () => {
        onGenerate(config);
    };

    const handleThemeChange = (theme: WidgetThemePreset) => {
        const themeStyles = getThemeStyles(theme);
        setConfig(prev => ({
            ...prev,
            styling: {
                ...prev.styling,
                theme,
                primaryColor: themeStyles.primaryColor
            }
        }));
    };

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

    return (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${className}`}>
            <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Generate Widget</CardTitle>
                        <p className="text-sm text-slate-600 mt-1">
                            Create an embeddable widget for "{formTitle}"
                        </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Configuration Panel */}
                        <div className="space-y-6">
                            {/* Basic Settings */}
                            <div className="space-y-4">
                                <Label className="text-base font-medium">Basic Settings</Label>

                                <div>
                                    <Label htmlFor="widget-name" className="text-sm text-slate-600">
                                        Widget Name
                                    </Label>
                                    <Input
                                        id="widget-name"
                                        value={config.name}
                                        onChange={(e) => setConfig(prev => ({
                                            ...prev,
                                            name: e.target.value
                                        }))}
                                        className="mt-1"
                                        placeholder="Enter widget name"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="widget-width" className="text-sm text-slate-600">
                                            Width
                                        </Label>
                                        <Input
                                            id="widget-width"
                                            value={config.styling.width}
                                            onChange={(e) => setConfig(prev => ({
                                                ...prev,
                                                styling: {
                                                    ...prev.styling,
                                                    width: e.target.value
                                                }
                                            }))}
                                            className="mt-1"
                                            placeholder="100%"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="widget-height" className="text-sm text-slate-600">
                                            Height
                                        </Label>
                                        <Input
                                            id="widget-height"
                                            value={config.styling.height}
                                            onChange={(e) => setConfig(prev => ({
                                                ...prev,
                                                styling: {
                                                    ...prev.styling,
                                                    height: e.target.value
                                                }
                                            }))}
                                            className="mt-1"
                                            placeholder="600px"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Theme Selection */}
                            <div className="space-y-4">
                                <Label className="text-base font-medium">Theme Presets</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {THEME_PRESETS.map((preset) => (
                                        <div
                                            key={preset.id}
                                            className={`p-3 border rounded-lg cursor-pointer transition-all ${config.styling.theme === preset.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                            onClick={() => handleThemeChange(preset.id)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className="w-8 h-8 rounded border"
                                                    style={getThemePreviewStyles(preset.id)}
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm">{preset.name}</div>
                                                    <div className="text-xs text-slate-500">{preset.description}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {/* Custom Styling */}
                            <div className="space-y-4">
                                <Label className="text-base font-medium">Custom Styling</Label>

                                <div>
                                    <Label htmlFor="primary-color" className="text-sm text-slate-600">
                                        Primary Color
                                    </Label>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <Input
                                            id="primary-color"
                                            type="color"
                                            value={config.styling.primaryColor}
                                            onChange={(e) => setConfig(prev => ({
                                                ...prev,
                                                styling: {
                                                    ...prev.styling,
                                                    primaryColor: e.target.value
                                                }
                                            }))}
                                            className="w-12 h-10 p-1"
                                        />
                                        <Input
                                            value={config.styling.primaryColor}
                                            onChange={(e) => setConfig(prev => ({
                                                ...prev,
                                                styling: {
                                                    ...prev.styling,
                                                    primaryColor: e.target.value
                                                }
                                            }))}
                                            className="flex-1"
                                            placeholder="#3b82f6"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm text-slate-600">
                                        Border Radius: {config.styling.borderRadius}px
                                    </Label>
                                    <Slider
                                        value={[config.styling.borderRadius]}
                                        onValueChange={([value]) => setConfig(prev => ({
                                            ...prev,
                                            styling: {
                                                ...prev.styling,
                                                borderRadius: value
                                            }
                                        }))}
                                        min={0}
                                        max={20}
                                        step={1}
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preview Panel */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-medium">Preview</Label>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setPreviewDevice('desktop')}
                                    >
                                        <Monitor className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setPreviewDevice('tablet')}
                                    >
                                        <Tablet className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setPreviewDevice('mobile')}
                                    >
                                        <Smartphone className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="border rounded-lg p-4 bg-slate-50">
                                <div
                                    className="mx-auto border rounded-lg overflow-hidden"
                                    style={{
                                        width: previewDimensions.width,
                                        height: previewDimensions.height,
                                        maxWidth: '100%'
                                    }}
                                >
                                    <iframe
                                        src={`/widgets/preview/${formId}?theme=${config.styling.theme}&primaryColor=${encodeURIComponent(config.styling.primaryColor)}&borderRadius=${config.styling.borderRadius}`}
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        className="border-0"
                                        title="Widget Preview"
                                    />
                                </div>
                            </div>

                            {/* Embed Code Preview */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Embed Code</Label>
                                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                                    <code>
                                        {`<iframe 
  src="${window.location.origin}/widgets/${formId}"
  width="${config.styling.width}"
  height="${config.styling.height}"
  frameborder="0"
  style="border-radius: ${config.styling.borderRadius}px; border: none;"
  allowtransparency="true"
></iframe>`}
                                    </code>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const embedCode = `<iframe 
  src="${window.location.origin}/widgets/${formId}"
  width="${config.styling.width}"
  height="${config.styling.height}"
  frameborder="0"
  style="border-radius: ${config.styling.borderRadius}px; border: none;"
  allowtransparency="true"
></iframe>`;
                                        navigator.clipboard.writeText(embedCode);
                                    }}
                                    className="w-full"
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Embed Code
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleGenerate}>
                            <Download className="h-4 w-4 mr-2" />
                            Generate Widget
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
