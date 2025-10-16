import React from 'react';
import { notFound } from 'next/navigation';
import { PublicWidgetForm } from '@/components/forms/PublicWidgetForm';

interface WidgetPageProps {
    params: {
        widgetId: string;
    };
    searchParams: {
        theme?: string;
        primaryColor?: string;
        borderRadius?: string;
    };
}

export default async function PublicWidgetPage({ params, searchParams }: WidgetPageProps) {
    const resolvedParams = await params;
    const { widgetId } = resolvedParams;
    const resolvedSearchParams = await searchParams;
    const { theme, primaryColor, borderRadius } = resolvedSearchParams;

    try {
        return (
            <PublicWidgetForm
                widgetId={widgetId}
                theme={theme}
                primaryColor={primaryColor}
                borderRadius={borderRadius}
            />
        );
    } catch (error) {
        console.error('Error loading widget:', error);
        notFound();
    }
}