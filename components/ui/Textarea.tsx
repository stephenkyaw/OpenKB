import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, className = '', ...props }) => {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && <label className="text-sm font-medium text-slate-700 ml-1">{label}</label>}
            <textarea
                className={`
                    w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-[12px] 
                    focus:ring-2 focus:ring-primary-500 focus:border-primary-500 block p-3
                    disabled:bg-slate-50 disabled:text-slate-500
                    ${error ? 'border-red-500 focus:ring-red-200' : ''}
                `}
                {...props}
            />
            {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
        </div>
    );
};
