import React from 'react';

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
    isFullWidth?: boolean;
    scrollable?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
    children,
    className = '',
    isFullWidth = false,
    scrollable = true
}) => {
    return (
        <div className={`flex-1 ${scrollable ? 'overflow-y-auto' : 'overflow-hidden flex flex-col'} custom-scrollbar bg-slate-25 p-6 md:p-8 ${className}`}>
            <div className={`mx-auto w-full ${isFullWidth ? '' : 'max-w-7xl'} ${scrollable ? 'space-y-8' : 'h-full flex flex-col'} transition-all duration-300`}>
                {children}
            </div>
        </div>
    );
};
