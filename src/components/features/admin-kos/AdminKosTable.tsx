// src/components/features/admin-kos/AdminKosTable.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useDeleteKos,
  useRestoreKos,
  useToggleFeatured,
  usePermanentDeleteKos,
  useBulkArchiveKos,
  useBulkPermanentDeleteKos,
  useBulkCleanupKos
} from '@/hooks/admin/kos';
import { showConfirm, showSuccessToast, showErrorToast } from '@/lib/sweetalert';
import type { AdminKosData } from '@/types';

interface AdminKosTableProps {
  kosList: AdminKosData[];
  isLoading: boolean;
  error: string | null;
  showDeleted: boolean;
  onActionComplete: () => void;
}

export function AdminKosTable({
  kosList,
  isLoading,
  error,
  showDeleted,
  onActionComplete,
}: AdminKosTableProps) {
  const router = useRouter();
  const [selectedKos, setSelectedKos] = useState<number[]>([]);

  // Action Hooks
  const { deleteKos, loading: isDeleting } = useDeleteKos();
  const { restoreKos, loading: isRestoring } = useRestoreKos();
  const { toggleFeatured, loading: isToggling } = useToggleFeatured();
  const { permanentDeleteKos, loading: isPermanentDeleting } = usePermanentDeleteKos();
  const { bulkArchiveKos, loading: isBulkArchiving } = useBulkArchiveKos();
  const { bulkPermanentDeleteKos, loading: isBulkPermanentDeleting } = useBulkPermanentDeleteKos();
  const { bulkCleanupKos, loading: isBulkCleaning } = useBulkCleanupKos();
  
  // Reset selection when data changes
  useEffect(() => {
    setSelectedKos([]);
  }, [kosList]);

  const handleSelectAll = () => {
    if (selectedKos.length === kosList.length) {
      setSelectedKos([]);
    } else {
      setSelectedKos(kosList.map((kos) => kos.id));
    }
  };
  
  // --- Handlers for Actions ---

  const handleSingleDelete = async (kosId: number) => {
    const isPermanent = showDeleted;
    const confirmation = await showConfirm(
        isPermanent
        ? 'Kos akan dihapus PERMANEN dari sistem. Tindakan ini tidak dapat dibatalkan.'
        : 'Kos akan dipindahkan ke arsip dan dapat dipulihkan kembali.'
    );

    if (confirmation.isConfirmed) {
      const action = isPermanent ? permanentDeleteKos(kosId) : deleteKos(kosId);
      const success = await action;
      if (success) {
        showSuccessToast(isPermanent ? 'Kos berhasil dihapus permanen.' : 'Kos berhasil diarsipkan.');
        onActionComplete();
      } else {
        showErrorToast('Gagal melakukan aksi.');
      }
    }
  };
  
  const handleBulkAction = async () => {
      const isPermanent = showDeleted;
      const confirmation = await showConfirm(
        isPermanent
        ? `${selectedKos.length} kos yang dipilih akan dihapus PERMANEN.`
        : `${selectedKos.length} kos yang dipilih akan dipindahkan ke arsip.`
      );

      if(confirmation.isConfirmed) {
          const action = isPermanent ? bulkPermanentDeleteKos(selectedKos) : bulkArchiveKos(selectedKos);
          const success = await action;
          if(success){
              showSuccessToast('Aksi massal berhasil dijalankan.');
              onActionComplete();
          } else {
              showErrorToast('Gagal menjalankan aksi massal.');
          }
      }
  }
  
  const handleRestore = async (kosId: number) => {
      // ... same logic as before, using restoreKos hook
  }
  
  // ... (You can add other handlers like handleToggleFeatured here)

  if (isLoading && kosList.length === 0) {
    return <div>Loading...</div>; // Simple loading state
  }
  
  if (error) {
      return <div>Error: {error}</div> // Simple error state
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Bulk Action Buttons */}
        <div className="p-4 border-b border-gray-200">
            {selectedKos.length > 0 && (
                <button
                    onClick={handleBulkAction}
                    disabled={isBulkArchiving || isBulkPermanentDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    {showDeleted ? 'Hapus Permanen' : 'Arsipkan'} ({selectedKos.length})
                </button>
            )}
            {showDeleted && (
                <button
                    onClick={async () => {
                        const confirm = await showConfirm("Anda yakin ingin membersihkan seluruh arsip?");
                        if(confirm.isConfirmed){
                            const success = await bulkCleanupKos();
                            if(success){
                                showSuccessToast("Arsip berhasil dibersihkan.");
                                onActionComplete();
                            } else {
                                showErrorToast("Gagal membersihkan arsip.");
                            }
                        }
                    }}
                    disabled={isBulkCleaning}
                    className="ml-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900"
                >
                    🧹 Cleanup Arsip
                </button>
            )}
        </div>
        
        {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedKos.length === kosList.length && kosList.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Info Kos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {kosList.map((kos) => (
              <tr key={kos.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedKos.includes(kos.id)}
                    onChange={() => {
                        setSelectedKos(prev => 
                            prev.includes(kos.id)
                            ? prev.filter(id => id !== kos.id)
                            : [...prev, kos.id]
                        )
                    }}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{kos.name}</div>
                  <div className="text-sm text-gray-700">{kos.address}, {kos.city}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {showDeleted ? (
                    <button onClick={() => handleRestore(kos.id)} className="text-green-600 hover:text-green-900">
                      Restore
                    </button>
                  ) : (
                    <button onClick={() => handleSingleDelete(kos.id)} className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}