// src/components/molecules/EmptyState.tsx
'use client';
import React from 'react';
import clsx from 'clsx';
import { Card } from '@/components/atoms';

export type EmptyStateVariant = 'default' | 'search' | 'error' | 'onboarding';

export interface EmptyStateProps {
  /** Judul utama empty state */
  title: string;
  /** Deskripsi tambahan yang menjelaskan konteks */
  description?: string;
  /** Ikon / ilustrasi (emoji atau komponen) */
  icon?: React.ReactNode;
  /** Node actions (biasanya kumpulan Button atom) */
  actions?: React.ReactNode;
  /** Varian styling semantik */
  variant?: EmptyStateVariant;
  /** Custom className */
  className?: string;
  /** Optional test id */
  'data-testid'?: string;
}

const variantClasses: Record<EmptyStateVariant, string> = {
  default: 'bg-white border border-gray-200',
  search: 'bg-blue-50 border border-blue-100',
  error: 'bg-red-50 border border-red-200',
  onboarding: 'bg-indigo-50 border border-indigo-100',
};

/**
 * Molecule: EmptyState
 * Komponen reusable untuk menampilkan keadaan tanpa data / hasil dengan pesan & CTA konsisten.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actions,
  variant = 'default',
  className,
  'data-testid': dataTestId,
}) => {
  return (
    <Card
      className={clsx('text-center p-8', variantClasses[variant], className)}
      padding="none"
      bordered
      data-testid={dataTestId}
      role="status"
      aria-live="polite"
    >
      {icon && <div className="mb-4 text-5xl" aria-hidden>{icon}</div>}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 text-sm max-w-md mx-auto mb-6">{description}</p>
      )}
      {actions && (
        <div className="flex items-center justify-center gap-3 flex-wrap">{actions}</div>
      )}
    </Card>
  );
};
