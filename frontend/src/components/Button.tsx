import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    className,
    variant = 'primary',
    isLoading,
    children,
    ...props
}) => {
    const baseStyles = 'w-full rounded-lg px-5 py-2.5 text-center text-sm font-medium focus:outline-none focus:ring-4';
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-800',
        secondary: 'bg-slate-700 text-white hover:bg-slate-800 focus:ring-slate-800 border border-slate-600',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-900',
    };

    return (
        <button
            className={twMerge(clsx(baseStyles, variants[variant], className, isLoading && 'opacity-50 cursor-not-allowed'))}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <div className="flex items-center justify-center">
                    <svg className="mr-3 h-5 w-5 animate-spin text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    Loading...
                </div>
            ) : (
                children
            )}
        </button>
    );
};
