import React from 'react';
import { AdminUser } from '@/lib/api/admin';

export interface UserRoleDescriptionProps {
  role: AdminUser['role'];
}

export const UserRoleDescription: React.FC<UserRoleDescriptionProps> = ({ role }) => {
  const description = {
    ADMIN: 'User dengan akses penuh untuk mengelola sistem, termasuk user management dan dashboard admin.',
    SELLER: 'User yang memiliki kos dan dapat mengelola listing kos untuk disewakan kepada renter.',
    RENTER: 'User yang mencari kos untuk disewa, dapat browsing dan booking kos yang tersedia.'
  }[role];

  return (
    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-semibold text-blue-800 mb-2">Keterangan Role {role}:</h4>
      <p className="text-sm text-blue-700">{description}</p>
    </div>
  );
};
