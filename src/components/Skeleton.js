import React from 'react';
import { cn } from '@/lib/utils';

// Base shimmer skeleton bar
export const Skeleton = ({ className }) => (
    <div className={cn("shimmer-wrapper rounded", className)} />
);

// Card skeleton for dashboard metrics
export const CardSkeleton = () => (
    <div className="bg-card-bg border border-pace-border rounded-xl p-3 sm:p-5">
        <div className="flex justify-between items-start mb-3 sm:mb-4">
            <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
        </div>
        <div>
            <Skeleton className="h-6 sm:h-7 w-20 sm:w-24 mb-1 sm:mb-2" />
            <Skeleton className="h-3 w-16 sm:w-20" />
        </div>
    </div>
);

// Uniform table skeleton row — one row, full-width shimmer bar
// Usage: <TableRowSkeleton cols={7} rows={8} />
export const TableRowSkeleton = ({ cols = 6, rows = 8, colHeight = "h-4" }) => (
    <>
        {[...Array(rows)].map((_, i) => (
            <tr key={`skel-${i}`} className="border-b border-pace-border last:border-0">
                <td colSpan={cols} className="px-6 py-[14px]">
                    <div className="flex items-center gap-3">
                        {/* Leading avatar-ish block */}
                        <Skeleton className="w-7 h-7 rounded-lg shrink-0 opacity-60" />
                        {/* Main content bar — varies width for visual rhythm */}
                        <Skeleton
                            className={cn(
                                colHeight,
                                "rounded-md flex-1 opacity-50",
                                i % 3 === 0 ? "max-w-[70%]" : i % 3 === 1 ? "max-w-[85%]" : "max-w-[60%]"
                            )}
                        />
                        {/* Trailing badge-ish block */}
                        <Skeleton className="w-14 h-4 rounded-full shrink-0 opacity-40" />
                    </div>
                </td>
            </tr>
        ))}
    </>
);
