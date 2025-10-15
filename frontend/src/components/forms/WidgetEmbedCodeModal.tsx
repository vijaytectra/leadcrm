'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Copy,
    Check,
    ExternalLink,
    Code,
    Monitor,
    Smartphone,
    Tablet,
    X
} from 'lucide-react';
import { toast } from 'sonner';
import { ApiException } from '@/lib/utils';

interface WidgetEmbedCodeModalProps {
    widget: {
        id: string;
        name: string;
        embedCode: string;
        previewUrl: string;
        publicUrl: string;
        settings: {
            width: string;
            height: string;
            borderRadius: number;
        };
    };
    onClose: () => void;
    className?: string;
}

export function WidgetEmbedCodeModal({
    widget,
    onClose,
    className
}: WidgetEmbedCodeModalProps) {
    const [copied, setCopied] = useState(false);
    const [selectedSize, setSelectedSize] = useState<'responsive' | 'fixed'>('responsive');

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(widget.embedCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy embed code:', err);
            if (err instanceof ApiException) {
                console.error("Error fetching preferences:", err.message);
                toast.error(err.message);
            } else {
                console.error("Error fetching preferences:", err);
                toast.error("Failed to copy embed code");
            }
        }
    };

    const getResponsiveCode = () => {
        return `<div style="position: relative; width: 100%; height: 0; padding-bottom: 75%;">
  <iframe 
    src="${widget.publicUrl}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: ${widget.settings.borderRadius}px;"
    allowtransparency="true"
  ></iframe>
</div>`;
    };

    const getFixedCode = () => {
        return widget.embedCode;
    };

    const currentCode = selectedSize === 'responsive' ? getResponsiveCode() : getFixedCode();

    const getPreviewDimensions = () => {
        if (selectedSize === 'responsive') {
            return { width: '100%', height: '400px' };
        }
        return {
            width: widget.settings.width,
            height: widget.settings.height
        };
    };

    const previewDimensions = getPreviewDimensions();

    return (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${className}`}>
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Embed Code for &ldquo;{widget.name}&rdquo;</CardTitle>
                        <p className="text-sm text-slate-600 mt-1">
                            Copy and paste this code into your website
                        </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Code Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-medium">Embed Code</Label>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant={selectedSize === 'responsive' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedSize('responsive')}
                                    >
                                        Responsive
                                    </Button>
                                    <Button
                                        variant={selectedSize === 'fixed' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedSize('fixed')}
                                    >
                                        Fixed Size
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm text-slate-600">
                                        {selectedSize === 'responsive' ? 'Responsive iframe' : 'Fixed dimensions'}
                                    </Label>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCopyCode}
                                        disabled={copied}
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="h-4 w-4 mr-2" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Code
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <Textarea
                                    value={currentCode}
                                    readOnly
                                    className="font-mono text-xs bg-slate-900 text-slate-100 border-slate-700 min-h-[120px]"
                                    placeholder="Embed code will appear here..."
                                />
                            </div>

                            {/* Instructions */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Instructions</Label>
                                <div className="space-y-2 text-sm text-slate-600">
                                    <div className="flex items-start space-x-2">
                                        <span className="font-medium">1.</span>
                                        <span>Copy the embed code above</span>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <span className="font-medium">2.</span>
                                        <span>Paste it into your website&apos;s HTML where you want the form to appear</span>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <span className="font-medium">3.</span>
                                        <span>Save and publish your website</span>
                                    </div>
                                </div>
                            </div>

                            {/* Size Options */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Size Options</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="responsive"
                                            name="size"
                                            checked={selectedSize === 'responsive'}
                                            onChange={() => setSelectedSize('responsive')}
                                            className="text-blue-600"
                                        />
                                        <Label htmlFor="responsive" className="text-sm">
                                            Responsive - Adapts to container width
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="fixed"
                                            name="size"
                                            checked={selectedSize === 'fixed'}
                                            onChange={() => setSelectedSize('fixed')}
                                            className="text-blue-600"
                                        />
                                        <Label htmlFor="fixed" className="text-sm">
                                            Fixed - {widget.settings.width} × {widget.settings.height}
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preview Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-medium">Live Preview</Label>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(widget.previewUrl, '_blank')}
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Open Full Preview
                                    </Button>
                                </div>
                            </div>

                            <div className="border rounded-lg p-4 bg-slate-50">
                                <div
                                    className="mx-auto border rounded-lg overflow-hidden"
                                    style={previewDimensions}
                                >
                                    <iframe
                                        src={widget.publicUrl}
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        className="border-0"
                                        title="Widget Preview"
                                    />
                                </div>
                            </div>

                            {/* Widget Info */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Widget Information</Label>
                                <div className="space-y-1 text-sm text-slate-600">
                                    <div className="flex justify-between">
                                        <span>Widget ID:</span>
                                        <span className="font-mono text-xs">{widget.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Public URL:</span>
                                        <span className="font-mono text-xs truncate max-w-[200px]">
                                            {widget.publicUrl}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Border Radius:</span>
                                        <span>{widget.settings.borderRadius}px</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(widget.previewUrl, '_blank')}
                                    className="w-full"
                                >
                                    <Monitor className="h-4 w-4 mr-2" />
                                    Preview in New Tab
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(widget.publicUrl, '_blank')}
                                    className="w-full"
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Public Form
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        <Button onClick={handleCopyCode} disabled={copied}>
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Code
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
