'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Copy,
    Eye,
    Edit,
    Trash2,
    BarChart3,
    ExternalLink,
    ToggleLeft,
    ToggleRight,
    MoreHorizontal
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WidgetEmbedCodeModal } from './WidgetEmbedCodeModal';
import { WidgetPreview } from './WidgetPreview';
import { ApiException } from '@/lib/utils';
import { toast } from 'sonner';

interface WidgetCardProps {
    widget: {
        id: string;
        name: string;
        type: string;
        settings: {
            theme: string;
            primaryColor: string;
            borderRadius: number;
            width: string;
            height: string;
        };
        embedCode: string;
        previewUrl: string;
        publicUrl: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    };
    analytics?: {
        totalViews: number;
        totalSubmissions: number;
        conversionRate: number;
    };
    onEdit: (widgetId: string) => void;
    onDelete: (widgetId: string) => void;
    onToggleActive: (widgetId: string, isActive: boolean) => void;
    onViewAnalytics: (widgetId: string) => void;
    className?: string;
}

export function WidgetCard({
    widget,
    analytics,
    onEdit,
    onDelete,
    onToggleActive,
    onViewAnalytics,
    className
}: WidgetCardProps) {
    const [showEmbedModal, setShowEmbedModal] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const handleCopyEmbedCode = async () => {
        try {
            await navigator.clipboard.writeText(widget.embedCode);
            // You could add a toast notification here
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

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(date));
    };

    const getThemeBadgeColor = (theme: string) => {
        const themeColors: Record<string, string> = {
            'modern-light': 'bg-blue-100 text-blue-800',
            'modern-dark': 'bg-slate-100 text-slate-800',
            'minimal-light': 'bg-gray-100 text-gray-800',
            'minimal-dark': 'bg-gray-100 text-gray-800',
            'classic-light': 'bg-green-100 text-green-800',
            'classic-dark': 'bg-purple-100 text-purple-800'
        };
        return themeColors[theme] || 'bg-gray-100 text-gray-800';
    };

    return (
        <>
            <Card className={`hover:shadow-md transition-shadow ${className}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <CardTitle className="text-lg">{widget.name}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                    {widget.type}
                                </Badge>
                                <Badge
                                    variant="secondary"
                                    className={`text-xs ${getThemeBadgeColor(widget.settings.theme)}`}
                                >
                                    {widget.settings.theme.replace('-', ' ')}
                                </Badge>
                                <Badge
                                    variant={widget.isActive ? "default" : "secondary"}
                                    className="text-xs"
                                >
                                    {widget.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(widget.id)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Widget
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setShowPreview(true)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setShowEmbedModal(true)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Embed Code
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onViewAnalytics(widget.id)}>
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    Analytics
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onToggleActive(widget.id, !widget.isActive)}
                                    className={widget.isActive ? 'text-orange-600' : 'text-green-600'}
                                >
                                    {widget.isActive ? (
                                        <>
                                            <ToggleLeft className="h-4 w-4 mr-2" />
                                            Deactivate
                                        </>
                                    ) : (
                                        <>
                                            <ToggleRight className="h-4 w-4 mr-2" />
                                            Activate
                                        </>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onDelete(widget.id)}
                                    className="text-red-600"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Analytics Summary */}
                    {analytics && (
                        <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 rounded-lg">
                            <div className="text-center">
                                <div className="text-lg font-semibold text-slate-900">
                                    {analytics.totalViews.toLocaleString()}
                                </div>
                                <div className="text-xs text-slate-600">Views</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-semibold text-slate-900">
                                    {analytics.totalSubmissions.toLocaleString()}
                                </div>
                                <div className="text-xs text-slate-600">Submissions</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-semibold text-slate-900">
                                    {analytics.conversionRate.toFixed(1)}%
                                </div>
                                <div className="text-xs text-slate-600">Conversion</div>
                            </div>
                        </div>
                    )}

                    {/* Widget Details */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Dimensions:</span>
                            <span className="font-medium">
                                {widget.settings.width} × {widget.settings.height}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Border Radius:</span>
                            <span className="font-medium">{widget.settings.borderRadius}px</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Created:</span>
                            <span className="font-medium">{formatDate(widget.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Updated:</span>
                            <span className="font-medium">{formatDate(widget.updatedAt)}</span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyEmbedCode}
                            className="flex-1"
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Code
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(widget.previewUrl, '_blank')}
                            className="flex-1"
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Preview
                        </Button>
                    </div>

                    {/* Theme Preview */}
                    <div className="border rounded-lg p-3 bg-slate-50">
                        <div className="text-xs text-slate-600 mb-2">Theme Preview</div>
                        <div
                            className="w-full h-16 rounded border"
                            style={{
                                backgroundColor: widget.settings.primaryColor,
                                borderRadius: `${widget.settings.borderRadius}px`
                            }}
                        />
                        <div className="text-xs text-slate-500 mt-1">
                            {widget.settings.theme.replace('-', ' ')} theme
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Embed Code Modal */}
            {showEmbedModal && (
                <WidgetEmbedCodeModal
                    widget={widget}
                    onClose={() => setShowEmbedModal(false)}
                />
            )}

            {/* Preview Modal */}
            {showPreview && (
                <WidgetPreview
                    widget={widget}
                    onClose={() => setShowPreview(false)}
                />
            )}
        </>
    );
}
