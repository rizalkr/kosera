// src/components/features/admin-kos/AdminKosFilter.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchDebounce } from '@/hooks/useDebounce';
import type { AdminKosFilters } from '@/types';

interface AdminKosFilterProps {
  initialFilters: AdminKosFilters;
  onFilterChange: (newFilters: Partial<AdminKosFilters>) => void;
}

export function AdminKosFilter({ initialFilters, onFilterChange }: AdminKosFilterProps) {
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const { debouncedSearchTerm, isSearching } = useSearchDebounce(searchTerm, 400);

  useEffect(() => {
    onFilterChange({ search: debouncedSearchTerm });
  }, [debouncedSearchTerm, onFilterChange]);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Cari Kos {isSearching && <span className="text-blue-500 text-xs">(mencari...)</span>}
          </label>
          <input
            type="text"
            placeholder="Cari nama, alamat, atau kota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">Filter Kota</label>
          <select
            value={initialFilters.city}
            onChange={(e) => onFilterChange({ city: e.target.value })}
            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">Semua Kota</option>
            <option value="Jakarta">Jakarta</option>
            <option value="Bandung">Bandung</option>
            <option value="Semarang">Semarang</option>
            <option value="Yogyakarta">Yogyakarta</option>
            <option value="Surabaya">Surabaya</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">Filter Owner</label>
          <select
            value={initialFilters.ownerType}
            onChange={(e) => onFilterChange({ ownerType: e.target.value })}
            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">Semua Owner</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">Urutkan</label>
          <select
            value={initialFilters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value })}
            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="price_asc">Harga Terendah</option>
            <option value="price_desc">Harga Tertinggi</option>
            <option value="popular">Terpopuler</option>
          </select>
        </div>
      </div>
    </div>
  );
}