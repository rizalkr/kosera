// src/components/atoms/Card.tsx
'use client';
import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  bordered?: boolean;
}

const paddingMap: Record<NonNullable<CardProps['padding']>, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  className,
  children,
  padding = 'md',
  hover = false,
  bordered = true,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'rounded-lg bg-white shadow-sm',
        bordered && 'border border-gray-200',
        hover && 'transition-colors hover:bg-gray-50',
        paddingMap[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  actions?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, actions, className, children, ...props }) => (
  <div className={clsx('mb-4 flex items-start justify-between gap-4', className)} {...props}>
    <div>
      {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
      {children}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={clsx('space-y-4', className)} {...props} />
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={clsx('mt-4 pt-4 border-t border-gray-100', className)} {...props} />
);
