import React from 'react';
import { clsx } from 'clsx';

export interface ActionIconButtonProps {
  title: string;
  onClick: () => void;
  icon: string;
  color?: 'blue' | 'green' | 'red' | 'gray';
}

const base = 'px-2 py-1 rounded transition-colors text-sm';
const variants: Record<NonNullable<ActionIconButtonProps['color']>, string> = {
  blue: 'text-blue-600 hover:text-blue-900 hover:bg-blue-50',
  green: 'text-green-600 hover:text-green-900 hover:bg-green-50',
  red: 'text-red-600 hover:text-red-900 hover:bg-red-50',
  gray: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
};

export const ActionIconButton: React.FC<ActionIconButtonProps> = ({ title, onClick, icon, color = 'blue' }) => (
  <button title={title} onClick={onClick} className={clsx(base, variants[color])}>{icon}</button>
);
