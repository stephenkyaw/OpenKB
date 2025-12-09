import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, icon, options, className = '', ...props }) => {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && <label className="text-sm font-medium text-slate-700 ml-1">{label}</label>}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        {icon}
                    </div>
                )}
                <select
                    className={`
                        w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-[12px] 
                        focus:ring-2 focus:ring-primary-500 focus:border-primary-500 block p-3 appearance-none
                        disabled:bg-slate-50 disabled:text-slate-500
                        ${icon ? 'pl-10' : 'pl-4'}
                        ${error ? 'border-red-500 focus:ring-red-200' : ''}
                    `}
                    {...props}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <ChevronDown size={16} />
                </div>
            </div>
            {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
        </div>
    );
};
