import React from 'react'
import { cn } from '@/lib/utils'

// Liquid Loader Component
export function LiquidLoader({ className }) {
    return (
        <div className={cn("flex items-center justify-center", className)}>
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-pace-purple/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pace-purple animate-spin"></div>
                <div className="absolute inset-2 rounded-full bg-pace-purple/10 animate-pulse"></div>
            </div>
        </div>
    )
}

// Spinner Component (Simple)
export function Spinner({ size = 16, className }) {
    return (
        <div
            className={cn("animate-spin rounded-full border-2 border-current border-t-transparent", className)}
            style={{ width: size, height: size }}
        />
    )
}

// Loading Button Component
export function LoadingButton({
    children,
    isLoading,
    loadingText = "Loading...",
    className,
    disabled,
    ...props
}) {
    return (
        <button
            disabled={isLoading || disabled}
            className={cn(
                "relative flex items-center justify-center gap-2 transition-all",
                (isLoading || disabled) && "opacity-70 cursor-not-allowed",
                className
            )}
            {...props}
        >
            {isLoading ? (
                <>
                    <Spinner size={16} className="text-current" />
                    <span>{loadingText}</span>
                </>
            ) : (
                children
            )}
        </button>
    )
}

// Page Loader (Full Screen Liquid Loader)
export function PageLoader({ message }) {
    return (
        <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center transition-colors duration-300">
            <LiquidLoader />
            {message && (
                <p className="mt-6 text-[12px] font-bold text-admin-dim uppercase tracking-widest animate-pulse">
                    {message}
                </p>
            )}
        </div>
    )
}

// Skeleton Loader (for tables and content)
export function Skeleton({ className }) {
    return (
        <div className={cn("animate-pulse bg-pace-bg-subtle rounded", className)} />
    )
}
