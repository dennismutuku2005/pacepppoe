"use client"

import React, { useEffect } from 'react'
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle, Fingerprint, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    type = 'info', // 'info' | 'success' | 'error' | 'warning' | 'danger'
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    isLoading = false,
    showCancel = true,
    icon: CustomIcon,
    children,
    footer,
    maxWidth = 'max-w-md'
}) {
    // Escape key to close
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [isOpen, onClose])

    if (!isOpen) return null

    const typeConfig = {
        primary: {
            icon: ShieldCheck,
            color: 'text-pace-purple',
            bg: 'bg-pace-purple/10',
            border: 'border-pace-purple/20',
            btn: 'bg-pace-purple hover:bg-pace-purple/90 shadow-sm'
        },
        info: {
            icon: Info,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            btn: 'bg-blue-600 hover:bg-blue-700 shadow-sm'
        },
        success: {
            icon: CheckCircle2,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
            border: 'border-green-500/20',
            btn: 'bg-green-600 hover:bg-green-700 shadow-sm'
        },
        error: {
            icon: AlertCircle,
            color: 'text-red-500',
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            btn: 'bg-red-600 hover:bg-red-700 shadow-sm'
        },
        warning: {
            icon: AlertTriangle,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/20',
            btn: 'bg-orange-600 hover:bg-orange-700 shadow-sm'
        },
        danger: {
            icon: Fingerprint,
            color: 'text-red-500',
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            btn: 'bg-red-600 hover:bg-red-700 shadow-sm'
        }
    }

    const config = typeConfig[type] || typeConfig.info
    const Icon = CustomIcon || config.icon

    return (
        <div suppressHydrationWarning className="fixed inset-0 z-[9000] flex items-center justify-center p-4 sm:p-8">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div suppressHydrationWarning className={cn("relative bg-card-bg w-full rounded-2xl border border-pace-border animate-in zoom-in-95 fade-in duration-300 max-h-[calc(100vh-4rem)] flex flex-col transition-colors duration-300", maxWidth)}>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex flex-col gap-1">
                            {CustomIcon && (
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mb-4 border transition-colors", config.bg, config.color, config.border)}>
                                    <Icon size={20} />
                                </div>
                            )}
                            <h3 className="text-lg font-semibold text-admin-value tracking-tight">{title}</h3>
                            {description && <p className="text-xs font-medium text-admin-dim mt-0.5">{description}</p>}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-pace-bg-subtle rounded-xl text-admin-dim hover:text-foreground transition-all"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Children Content */}
                    {children && (
                        <div className="mt-6">
                            {children}
                        </div>
                    )}

                    {/* Footer / Actions */}
                    {footer !== null && (footer || onConfirm) && (
                        <div className="mt-8 flex items-center gap-3">
                            {footer ? footer : (
                                <>
                                    {showCancel && (
                                        <button
                                            onClick={onClose}
                                            disabled={isLoading}
                                            className="flex-1 px-4 py-2.5 bg-card-bg border border-pace-border text-admin-dim rounded-xl text-sm font-medium hover:bg-pace-bg-subtle transition-all disabled:opacity-50"
                                        >
                                            {cancelText}
                                        </button>
                                    )}
                                    <button
                                        onClick={onConfirm}
                                        disabled={isLoading}
                                        className={cn(
                                            "flex-[2] px-4 py-2.5 text-white rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2",
                                            config.btn
                                        )}
                                    >
                                        {isLoading ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : confirmText}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
