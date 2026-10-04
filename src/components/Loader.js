import React from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Custom Spinner / Ring Loader
 */
export function CustomLoader({ size = "md", color = "purple", className }) {
    const sizeMap = {
        xs: "w-3.5 h-3.5 border-[1.5px]",
        sm: "w-4 h-4 border-2",
        md: "w-6 h-6 border-2",
        lg: "w-9 h-9 border-[3px]",
        xl: "w-12 h-12 border-4",
    }

    const colorMap = {
        purple: "border-pace-purple/20 border-t-pace-purple text-pace-purple",
        white: "border-white/25 border-t-white text-white",
        emerald: "border-emerald-500/20 border-t-emerald-500 text-emerald-500",
        dim: "border-pace-border border-t-admin-dim text-admin-dim",
    }

    return (
        <div
            className={cn(
                "rounded-full animate-spin shrink-0",
                sizeMap[size] || sizeMap.md,
                colorMap[color] || colorMap.purple,
                className
            )}
            style={{ animationDuration: '0.65s' }}
            role="status"
            aria-label="Loading"
        />
    )
}

/**
 * Full Page or Container Custom Loader
 */
export function PageLoader({ text = "Loading data...", className }) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-16 sm:py-24 space-y-4 animate-in fade-in duration-300 font-figtree", className)}>
            <div className="relative flex items-center justify-center">
                {/* Outer glowing pulse ring */}
                <div className="absolute w-12 h-12 rounded-2xl bg-pace-purple/10 animate-ping opacity-75" style={{ animationDuration: '2s' }} />
                {/* Middle border card */}
                <div className="w-12 h-12 rounded-2xl bg-card-bg border border-pace-border shadow-sm flex items-center justify-center relative z-10">
                    <CustomLoader size="md" color="purple" />
                </div>
            </div>
            {text && (
                <p className="text-xs font-semibold text-admin-dim tracking-wide animate-pulse">
                    {text}
                </p>
            )}
        </div>
    )
}

/**
 * Reusable Stackable Action Button Group for Page Headers
 */
export function HeaderActions({ children, className }) {
    return (
        <div className={cn(
            "flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto",
            className
        )}>
            {children}
        </div>
    )
}

/**
 * Modern Reload Button with Custom Micro Loader
 */
export function ReloadButton({ 
    onClick, 
    isLoading = false, 
    label = "Refresh", 
    className,
    disabled = false,
    title = "Refresh data"
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isLoading || disabled}
            title={title}
            className={cn(
                "w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5",
                "bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl",
                "hover:bg-pace-purple/5 hover:text-pace-purple hover:border-pace-purple/30",
                "transition-all duration-150 disabled:opacity-50 text-xs font-semibold cursor-pointer shadow-xs active:scale-[0.98]",
                className
            )}
        >
            {isLoading ? (
                <CustomLoader size="xs" color="purple" />
            ) : (
                <RefreshCw size={14} className="shrink-0 transition-transform group-hover:rotate-45" />
            )}
            <span>{isLoading ? "Refreshing..." : label}</span>
        </button>
    )
}

export default CustomLoader
