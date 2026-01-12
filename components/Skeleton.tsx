import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rectangular' }) => {
    const baseClasses = 'animate-pulse bg-slate-200 dark:bg-slate-700/50';
    const variantClasses = {
        text: 'h-4 w-full rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-xl',
    };

    return (
        <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
    );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
    return (
        <div className="w-full space-y-4">
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                    <Skeleton variant="circular" className="h-10 w-10 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton variant="text" className="w-1/3" />
                        <Skeleton variant="text" className="w-1/4" />
                    </div>
                    <Skeleton variant="rectangular" className="h-8 w-20" />
                </div>
            ))}
        </div>
    );
};

export const CardSkeleton: React.FC = () => {
    return (
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
                <Skeleton variant="circular" className="h-12 w-12" />
                <Skeleton variant="rectangular" className="h-6 w-16" />
            </div>
            <div className="space-y-2">
                <Skeleton variant="text" className="w-3/4" />
                <Skeleton variant="text" className="w-1/2" />
            </div>
            <div className="pt-4 flex gap-2">
                <Skeleton variant="rectangular" className="h-10 flex-1" />
                <Skeleton variant="rectangular" className="h-10 flex-1" />
            </div>
        </div>
    );
};
