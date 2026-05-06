import React from 'react';
import { cn } from '@/lib/utils';

export const Badge = ({ children, variant = 'default', className }) => {
    const variants = {
        default: 'bg-pace-bg-subtle text-admin-label border-pace-border',
        success: 'bg-green-500/10 text-green-600 border-none',
        warning: 'bg-orange-500/10 text-orange-600 border-none',
        error: 'bg-red-500/10 text-red-600 border-none',
        info: 'bg-pace-purple/10 text-pace-purple border-none',
        outline: 'bg-transparent text-admin-dim border-pace-border',
        secondary: 'bg-pace-bg-subtle text-admin-dim border-pace-border'
    };

    return (
        <span className={cn(
            "text-[10px] font-medium px-2 py-0.5 rounded-full inline-flex items-center",
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
};
