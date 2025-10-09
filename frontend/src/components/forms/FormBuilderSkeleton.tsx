"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function FormBuilderSkeleton() {
    return (
        <div className="flex h-[calc(100vh-200px)] bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Sidebar Skeleton */}
            <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-10 w-full" />
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>

                    <div className="space-y-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <div className="grid grid-cols-1 gap-2">
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Canvas Skeleton */}
            <div className="flex-1 flex flex-col">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-48" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                </div>

                {/* Canvas Content Skeleton */}
                <div className="flex-1 overflow-auto">
                    <div className="max-w-4xl mx-auto p-6">
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <Skeleton className="h-16 w-16 rounded-full mb-4" />
                            <Skeleton className="h-6 w-48 mb-2" />
                            <Skeleton className="h-4 w-64 mb-4" />
                            <div className="flex space-x-2">
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-8 w-24" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Property Panel Skeleton */}
            <div className="w-80 bg-slate-50 border-l border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <div className="flex space-x-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                    </div>
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>

                    <div className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
