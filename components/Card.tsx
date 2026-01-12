import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm ${className}`}>
            {children}
        </div>
    );
};
