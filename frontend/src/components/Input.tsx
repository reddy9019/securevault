import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={twMerge(
                        clsx(
                            'block w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500',
                            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                            className
                        )
                    )}
                    {...props}
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
