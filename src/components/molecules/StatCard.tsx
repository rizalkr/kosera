// src/components/molecules/StatCard.tsx
'use client';
import React from 'react';
import { Card } from '@/components/atoms';
import clsx from 'clsx';

export type StatCardColor = 'blue' | 'green' | 'yellow' | 'purple' | 'red';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string; // emoji or icon char
  color?: StatCardColor;
  className?: string;
}

const colorClasses: Record<StatCardColor, string> = {
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  red: 'bg-red-50 text-red-600 border-red-200',
};

/**
 * Molecule: StatCard
 * Reusable statistic card for dashboard metrics built on the Card atom.
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'blue',
  className,
}) => {
  return (
    <Card className={clsx('border p-6', colorClasses[color], className)} padding="none" bordered>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs opacity-60 mt-1">{subtitle}</p>}
        </div>
        <div className="text-3xl opacity-50">{icon}</div>
      </div>
    </Card>
  );
};
