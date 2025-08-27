import React from 'react';
import { clsx } from 'clsx';

export interface UserRolePillProps { role: 'ADMIN' | 'SELLER' | 'RENTER'; }

const colors: Record<UserRolePillProps['role'], string> = {
  ADMIN: 'bg-red-100 text-red-800',
  SELLER: 'bg-blue-100 text-blue-800',
  RENTER: 'bg-green-100 text-green-800',
};

export const UserRolePill: React.FC<UserRolePillProps> = ({ role }) => (
  <span className={clsx('inline-flex px-2 py-1 text-xs font-semibold rounded-full', colors[role])}>{role}</span>
);
