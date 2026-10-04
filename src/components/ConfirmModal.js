"use client"

import React, { useEffect } from 'react'
import { AlertTriangle, Trash2, X, RefreshCw, Power } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CustomLoader } from '@/components/Loader'

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    description = "Are you sure you want to proceed with this action?",
    confirmText = "Delete",
    cancelText = "Cancel",
    type = "danger", // "danger" | "warning" | "reboot"
    isLoading = false,
    itemName = null
}) {
    // Escape key to close
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && !isLoading) onClose()
        }
        if (isOpen) window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [isOpen, onClose, isLoading])

    if (!isOpen) return null

    const typeConfig = {
        danger: {
            icon: Trash2,
            iconColor: "text-rose-500",
            iconBg: "bg-rose-500/10",
            iconBorder: "border-rose-500/20",
            confirmBtn: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20",
            badge: "bg-rose-500/10 text-rose-500 border-rose-500/20"
        },
        warning: {
            icon: AlertTriangle,
            iconColor: "text-amber-500",
            iconBg: "bg-amber-500/10",
            iconBorder: "border-amber-500/20",
            confirmBtn: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20",
            badge: "bg-amber-500/10 text-amber-500 border-amber-500/20"
        },
        reboot: {
            icon: Power,
            iconColor: "text-orange-500",
            iconBg: "bg-orange-500/10",
            iconBorder: "border-orange-500/20",
            confirmBtn: "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20",
            badge: "bg-orange-500/10 text-orange-500 border-orange-500/20"
        }
    }

    const config = typeConfig[type] || typeConfig.danger
    const Icon = config.icon

    return (
        <div suppressHydrationWarning className="fixed inset-0 z-[9500] flex items-center justify-center p-4 sm:p-6 font-figtree">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-950/50 backdrop-blur-[2px] animate-in fade-in duration-200"
                onClick={() => !isLoading && onClose()}
            />

            {/* Modal Dialog Card */}
            <div
                suppressHydrationWarning
                className="relative bg-card-bg w-full max-w-md rounded-2xl border border-pace-border shadow-2xl p-5 sm:p-6 animate-in zoom-in-95 fade-in duration-200 z-10"
            >
                {/* Header with Icon */}
                <div className="flex items-start gap-4">
                    <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border", config.iconBg, config.iconColor, config.iconBorder)}>
                        <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                        <h3 className="text-base font-bold text-admin-value tracking-tight">
                            {title}
                        </h3>
                        <p className="text-xs text-admin-dim mt-1 leading-relaxed">
                            {description}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="absolute right-4 top-4 p-1.5 text-admin-dim hover:text-admin-value hover:bg-pace-bg-subtle rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                        title="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Highlighted item box if supplied */}
                {itemName && (
                    <div className="mt-4 p-3 bg-pace-bg-subtle/80 border border-pace-border/80 rounded-xl flex items-center justify-between gap-3">
                        <span className="text-[11px] font-semibold text-admin-dim uppercase">Target:</span>
                        <span className="text-xs font-bold font-mono text-admin-value truncate">{itemName}</span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-4 py-2.5 bg-pace-bg-subtle hover:bg-pace-border text-admin-dim hover:text-admin-value rounded-xl text-xs font-semibold border border-pace-border transition-all disabled:opacity-50 cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={cn(
                            "w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer",
                            config.confirmBtn
                        )}
                    >
                        {isLoading ? (
                            <>
                                <CustomLoader size="xs" color="white" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <span>{confirmText}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal
