import React from 'react';
import { AdminUserListItem } from '@/lib/api/admin';
import { Checkbox } from '../atoms/Checkbox';
import { UserRolePill } from '../atoms/UserRolePill';
import { ActionIconButton } from '../atoms/ActionIconButton';

export interface UsersTableProps {
  users: AdminUserListItem[];
  showDeleted: boolean;
  selected: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({ users, showDeleted, selected, onToggleSelect, onToggleSelectAll, onView, onEdit, onDelete, onRestore }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left"><Checkbox ariaLabel="select all" checked={selected.length === users.length && users.length > 0} onChange={onToggleSelectAll} /></th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">User</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Contact</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Role</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">{showDeleted ? 'Tanggal Dihapus' : 'Tanggal Daftar'}</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">{showDeleted ? 'Dihapus Oleh' : 'Dibuat Oleh'}</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Aksi</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {users.map(user => (
          <tr key={user.id} className="hover:bg-gray-50">
            <td className="px-6 py-4"><Checkbox ariaLabel={`select user ${user.id}`} checked={selected.includes(user.id)} onChange={() => onToggleSelect(user.id)} /></td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{user.id}</td>
            <td className="px-6 py-4 whitespace-nowrap"><div><div className="text-sm font-medium text-gray-900">{user.name}</div><div className="text-sm text-gray-700">@{user.username}</div></div></td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.contact}</td>
            <td className="px-6 py-4 whitespace-nowrap"><UserRolePill role={user.role} /></td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{showDeleted && user.deletedAt ? new Date(user.deletedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : new Date(user.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{showDeleted ? (user.deleterInfo ? (<div><div className="text-sm font-medium text-gray-900">{user.deleterInfo.name}</div><div className="text-sm text-gray-700">@{user.deleterInfo.username}</div></div>) : (<span className="text-gray-400">-</span>)) : (user.creatorInfo ? (<div><div className="text-sm font-medium text-gray-900">{user.creatorInfo.name}</div><div className="text-sm text-gray-700">@{user.creatorInfo.username}</div></div>) : (<span className="text-gray-400">System</span>))}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><div className="flex space-x-2">
              <ActionIconButton title="Lihat Detail" onClick={() => onView(user.id)} icon="👁️" color="blue" />
              {!showDeleted ? (<>
                <ActionIconButton title="Edit User" onClick={() => onEdit(user.id)} icon="✏️" color="green" />
                <ActionIconButton title="Hapus User" onClick={() => onDelete(user.id)} icon="🗑️" color="red" />
              </>) : (
                <ActionIconButton title="Pulihkan User" onClick={() => onRestore(user.id)} icon="♻️" color="green" />
              )}
            </div></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
