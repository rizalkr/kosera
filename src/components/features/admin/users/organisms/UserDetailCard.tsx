import React, { useMemo } from 'react';
import { AdminUser } from '@/lib/api/admin';
import { UserDetailHeader } from './UserDetailHeader';
import { UserBasicInfoSection } from '../molecules/UserBasicInfoSection';
import { UserRoleStatusSection } from '../molecules/UserRoleStatusSection';
import { UserRoleDescription } from '../molecules/UserRoleDescription';
import { UserActionButtons } from '../molecules/UserActionButtons';

export interface UserDetailCardProps {
  user: AdminUser;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
  deleting?: boolean;
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const UserDetailCard: React.FC<UserDetailCardProps> = ({ user, onEdit, onDelete, onBack, deleting }) => {
  const createdAt = useMemo(() => formatDate(user.createdAt), [user.createdAt]);
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <UserDetailHeader user={user} />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UserBasicInfoSection user={user} />
          <UserRoleStatusSection user={user} formattedCreatedAt={createdAt} />
        </div>
        <UserRoleDescription role={user.role} />
        <UserActionButtons user={user} onEdit={onEdit} onDelete={onDelete} onBack={onBack} deleting={deleting} />
      </div>
    </div>
  );
};
