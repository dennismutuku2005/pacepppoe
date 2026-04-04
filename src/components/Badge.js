import React from 'react';
import { cn } from '@/lib/utils';

export const Badge = ({ children, variant = 'default', className }) => {
    const variants = {
        default: 'bg-pace-bg-subtle text-admin-label border-pace-border',
        success: 'bg-pace-green/10 text-pace-green border-pace-green/20',
        warning: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        error: 'bg-red-500/10 text-red-500 border-red-500/20',
        info: 'bg-pace-purple/10 text-pace-purple border-pace-purple/20',
        outline: 'bg-transparent text-admin-dim border-pace-border font-medium',
        secondary: 'bg-pace-bg-subtle text-admin-dim border-pace-border'
    };

    return (
        <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-sm border inline-flex items-center",
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
};
