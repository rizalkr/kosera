import React from 'react';
import { AdminUser } from '@/lib/api/admin';
import { AvatarCircle } from '../atoms/AvatarCircle';

export interface UserDetailHeaderProps {
  user: AdminUser;
}

export const UserDetailHeader: React.FC<UserDetailHeaderProps> = ({ user }) => (
  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
    <div className="flex items-center space-x-4">
      <AvatarCircle name={user.name} />
      <div>
        <h2 className="text-2xl font-bold">{user.name}</h2>
        <p className="text-blue-100">@{user.username}</p>
      </div>
    </div>
  </div>
);
