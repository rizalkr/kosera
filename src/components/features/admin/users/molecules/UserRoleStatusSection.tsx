import React from 'react';
import { UserRoleBadge } from '../atoms/UserRoleBadge';
import { InfoLabelValue } from '../atoms/InfoLabelValue';
import { AdminUser } from '@/lib/api/admin';

export interface UserRoleStatusSectionProps {
  user: AdminUser;
  formattedCreatedAt: string;
}

export const UserRoleStatusSection: React.FC<UserRoleStatusSectionProps> = ({ user, formattedCreatedAt }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Role & Status</h3>
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
      <UserRoleBadge role={user.role} />
    </div>
    <InfoLabelValue label="Tanggal Daftar" value={formattedCreatedAt} />
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
      <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">Aktif</span>
    </div>
  </div>
);
