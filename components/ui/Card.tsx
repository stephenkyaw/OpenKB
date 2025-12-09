import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
    hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, hoverEffect = false }) => {
    return (
        <div
            onClick={onClick}
            className={`
                bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden
                ${hoverEffect ? 'transition-all duration-300 hover:shadow-lg hover:border-primary-300 cursor-pointer' : ''}
                ${className}
            `}
        >
            {children}
        </div>
    );
};
