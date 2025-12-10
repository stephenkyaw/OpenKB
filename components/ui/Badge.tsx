import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'outline';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
    const variants = {
        default: 'bg-slate-100 text-slate-600 border border-slate-200',
        success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        warning: 'bg-amber-50 text-amber-700 border border-amber-100',
        error: 'bg-red-50 text-red-700 border border-red-100',
        outline: 'bg-transparent border border-slate-200 text-slate-500'
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
