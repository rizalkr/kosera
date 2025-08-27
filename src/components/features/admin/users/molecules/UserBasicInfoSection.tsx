import React from 'react';
import { InfoLabelValue } from '../atoms/InfoLabelValue';
import { AdminUser } from '@/lib/api/admin';

export interface UserBasicInfoSectionProps {
  user: AdminUser;
}

export const UserBasicInfoSection: React.FC<UserBasicInfoSectionProps> = ({ user }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Informasi Dasar</h3>
    <InfoLabelValue label="ID User" value={`#${user.id}`} />
    <InfoLabelValue label="Nama Lengkap" value={user.name} />
    <InfoLabelValue label="Username" value={`@${user.username}`} />
    <InfoLabelValue label="Kontak" value={user.contact} />
  </div>
);
