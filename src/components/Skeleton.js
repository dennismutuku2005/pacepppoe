import React from 'react';
import { cn } from '@/lib/utils';

// Base shimmer skeleton bar
export const Skeleton = ({ className }) => (
    <div className={cn("shimmer-wrapper rounded", className)} />
);

// Card skeleton for dashboard metrics
export const CardSkeleton = () => (
    <div className="bg-card-bg border border-pace-border rounded-xl p-5">
        <div className="flex justify-between items-start mb-4">
            <Skeleton className="w-10 h-10 rounded-xl" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3.5 w-16" />
        </div>
    </div>
);

// Uniform table skeleton row
export const TableRowSkeleton = ({ cols = 6, rows = 8, colHeight = "h-4" }) => (
    <>
        {[...Array(rows)].map((_, i) => (
            <tr key={`skel-${i}`} className="border-b border-pace-border last:border-0">
                <td colSpan={cols} className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-lg shrink-0 opacity-60" />
                        <Skeleton
                            className={cn(
                                colHeight,
                                "rounded-md flex-1 opacity-50",
                                i % 3 === 0 ? "max-w-[50%]" : i % 3 === 1 ? "max-w-[70%]" : "max-w-[40%]"
                            )}
                        />
                        <Skeleton className="w-16 h-5 rounded-full shrink-0 opacity-40" />
                    </div>
                </td>
            </tr>
        ))}
    </>
);

// Premium Full Page Table Layout Skeleton (Desktop & Mobile)
export const TablePageSkeleton = () => (
    <div className="space-y-6 animate-pulse font-figtree pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
            <div className="space-y-2">
                <Skeleton className="h-7 w-48 bg-gray-200 dark:bg-gray-800" />
                <Skeleton className="h-3.5 w-64 bg-gray-200 dark:bg-gray-800" />
            </div>
            <Skeleton className="h-10 w-32 rounded-xl bg-gray-200 dark:bg-gray-800 shrink-0" />
        </div>

        {/* Search controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Skeleton className="h-10 w-full sm:w-80 rounded-xl bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* Matrix Table */}
        <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-sm">
            <div className="border-b border-pace-border bg-pace-bg-subtle/50 px-6 py-4 flex justify-between items-center">
                <Skeleton className="h-4 w-1/4 bg-gray-200 dark:bg-gray-800" />
                <Skeleton className="h-4 w-1/5 bg-gray-200 dark:bg-gray-800 hidden md:block" />
                <Skeleton className="h-4 w-1/6 bg-gray-200 dark:bg-gray-800" />
            </div>
            <div className="divide-y divide-pace-border">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-pace-bg-subtle/50 transition-all">
                        <div className="flex items-center gap-3 w-1/3">
                            <Skeleton className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-800 shrink-0" />
                            <div className="space-y-1.5 w-full">
                                <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800" />
                                <Skeleton className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800" />
                            </div>
                        </div>
                        <div className="w-1/4 hidden md:block">
                            <Skeleton className="h-3.5 w-24 bg-gray-200 dark:bg-gray-800" />
                        </div>
                        <div className="w-1/5 flex justify-center">
                            <Skeleton className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-800" />
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800" />
                            <Skeleton className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// Premium Full Page Card Grid Layout Skeleton (Desktop & Mobile)
export const CardPageSkeleton = () => (
    <div className="space-y-6 animate-pulse font-figtree pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
            <div className="space-y-2">
                <Skeleton className="h-7 w-48 bg-gray-200 dark:bg-gray-800" />
                <Skeleton className="h-3.5 w-64 bg-gray-200 dark:bg-gray-800" />
            </div>
            <Skeleton className="h-10 w-32 rounded-xl bg-gray-200 dark:bg-gray-800 shrink-0" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card-bg border border-pace-border rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800" />
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-28 bg-gray-200 dark:bg-gray-800" />
                                <Skeleton className="h-3 w-16 bg-gray-200 dark:bg-gray-800" />
                            </div>
                        </div>
                        <Skeleton className="h-5 w-14 rounded-full bg-gray-200 dark:bg-gray-800" />
                    </div>
                    <div className="space-y-2.5 pt-2">
                        <div className="flex justify-between">
                            <Skeleton className="h-3 w-20 bg-gray-200 dark:bg-gray-800" />
                            <Skeleton className="h-3 w-12 bg-gray-200 dark:bg-gray-800" />
                        </div>
                        <div className="flex justify-between">
                            <Skeleton className="h-3 w-24 bg-gray-200 dark:bg-gray-800" />
                            <Skeleton className="h-3 w-16 bg-gray-200 dark:bg-gray-800" />
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-pace-border">
                        <Skeleton className="h-9 flex-1 rounded-xl bg-gray-200 dark:bg-gray-800" />
                        <Skeleton className="h-9 w-9 rounded-xl bg-gray-200 dark:bg-gray-800" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// Premium Full Page Form/Config Layout Skeleton (Desktop & Mobile)
export const FormPageSkeleton = () => (
    <div className="space-y-6 animate-pulse font-figtree pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
            <div className="space-y-2">
                <Skeleton className="h-7 w-48 bg-gray-200 dark:bg-gray-800" />
                <Skeleton className="h-3.5 w-64 bg-gray-200 dark:bg-gray-800" />
            </div>
            <Skeleton className="h-10 w-32 rounded-xl bg-gray-200 dark:bg-gray-800 shrink-0" />
        </div>

        {/* Form Body */}
        <div className="bg-card-bg border border-pace-border rounded-xl p-6 sm:p-8 space-y-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-3 w-24 bg-gray-200 dark:bg-gray-800" />
                        <Skeleton className="h-10 w-full rounded-xl bg-gray-200 dark:bg-gray-800" />
                    </div>
                ))}
            </div>
            <div className="space-y-2 pt-2">
                <Skeleton className="h-3 w-32 bg-gray-200 dark:bg-gray-800" />
                <Skeleton className="h-24 w-full rounded-xl bg-gray-200 dark:bg-gray-800" />
            </div>
            <div className="flex justify-end pt-4 border-t border-pace-border">
                <Skeleton className="h-10 w-36 rounded-xl bg-gray-200 dark:bg-gray-800" />
            </div>
        </div>
    </div>
);
