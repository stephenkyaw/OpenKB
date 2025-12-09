import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    className = '',
    id,
    ...props
}) => {
    return (
        <div className="space-y-1.5">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-slate-700 pl-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-600 transition-colors">
                        {icon}
                    </div>
                )}
                <input
                    id={id}
                    className={`
            block w-full bg-slate-50 border rounded-[14px] 
            focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
            text-slate-900 placeholder-slate-400 text-sm outline-none transition-all
            ${icon ? 'pl-10' : 'px-4'} py-3
            ${error ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && <p className="text-xs text-red-500 pl-1">{error}</p>}
        </div>
    );
};
