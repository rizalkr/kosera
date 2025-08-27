import React from 'react';
import { clsx } from 'clsx';

export interface UsersFiltersBarProps {
  search: string;
  onSearch: (v: string) => void;
  isSearching: boolean;
  role: string;
  onRoleChange: (r: string) => void;
  onRefresh: () => void;
  loading: boolean;
  selectedCount: number;
  onBulkDelete: () => void;
  showDeleted: boolean;
  toggleShowDeleted: () => void;
  onCreate?: () => void;
}

export const UsersFiltersBar: React.FC<UsersFiltersBarProps> = ({ search, onSearch, isSearching, role, onRoleChange, onRefresh, loading, selectedCount, onBulkDelete, showDeleted, toggleShowDeleted, onCreate }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Cari User {isSearching && <span className="text-blue-500 text-xs">(mencari...)</span>}</label>
        <div className="relative">
          <input type="text" placeholder="Cari nama atau username..." value={search} onChange={(e) => onSearch(e.target.value)} className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent" />
          {isSearching && (<div className="absolute right-3 top-1/2 transform -translate-y-1/2"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"/></div>)}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter Role</label>
        <select value={role} onChange={(e) => onRoleChange(e.target.value)} className="text-gray-500 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent">
          <option value="all">Semua Role</option>
          <option value="ADMIN">Admin</option>
          <option value="SELLER">Seller</option>
          <option value="RENTER">Renter</option>
        </select>
      </div>
      <div className="flex items-end gap-2 flex-wrap">
        <button onClick={onRefresh} disabled={loading} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50">🔄 Refresh</button>
        {selectedCount > 0 && (
          <button onClick={onBulkDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">🗑️ Hapus ({selectedCount})</button>
        )}
        {!showDeleted && onCreate && (
          <button onClick={onCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"><span>➕</span>Tambah User</button>
        )}
        <button onClick={toggleShowDeleted} className={clsx('px-4 py-2 rounded-lg transition-colors flex items-center gap-2', showDeleted ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-orange-600 text-white hover:bg-orange-700')}>{showDeleted ? '👥 Users Aktif' : '🗂️ Arsip Users'}</button>
      </div>
    </div>
  </div>
);
