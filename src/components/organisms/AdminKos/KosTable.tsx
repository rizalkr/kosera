// Presentational KosTable (admin)
'use client';
import React from 'react';
import type { AdminKosData } from '@/types';

export interface KosTableProps {
  kosList: AdminKosData[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  showDeleted: boolean;
  currentPage: number;
  limit: number;
  renderActions: (kos: AdminKosData) => React.ReactNode;
}

export const KosTable: React.FC<KosTableProps> = ({
  kosList,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  showDeleted,
  currentPage,
  limit,
  renderActions,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedIds.length === kosList.length && kosList.length > 0}
                onChange={onToggleSelectAll}
                className="rounded border-gray-300"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">No.</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">ID Kos</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Info Kos</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {kosList.map((kos, index) => {
            const itemNumber = (currentPage - 1) * limit + index + 1;
            return (
              <tr key={kos.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(kos.id)}
                    onChange={() => onToggleSelect(kos.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{itemNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{kos.id}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{kos.name}</div>
                  <div className="text-sm text-gray-700">{kos.address}, {kos.city}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-4">
                  {renderActions(kos)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
