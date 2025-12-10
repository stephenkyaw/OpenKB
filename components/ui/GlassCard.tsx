import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', noPadding = false }) => {
    return (
        <div className={`bg-white/60 backdrop-blur-xl rounded-3xl border border-white/60 shadow-soft overflow-hidden ${noPadding ? '' : 'p-6 md:p-8'} ${className}`}>
            {children}
        </div>
    );
};
