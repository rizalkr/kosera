import React from 'react';
import { clsx } from 'clsx';

export interface UserRoleBadgeProps {
  role: 'ADMIN' | 'SELLER' | 'RENTER';
}

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role }) => {
  const className = clsx(
    'inline-flex px-3 py-1 text-sm font-semibold rounded-full',
    {
      'bg-red-100 text-red-800': role === 'ADMIN',
      'bg-blue-100 text-blue-800': role === 'SELLER',
      'bg-green-100 text-green-800': role === 'RENTER',
    }
  );
  return <span className={className}>{role}</span>;
};
