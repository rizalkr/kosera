'use client';

import { useState, useEffect } from 'react';
import {
  useDeleteKos,
  useRestoreKos,
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
  currentPage: number; // Ditambahkan untuk nomor urut
  limit: number;       // Ditambahkan untuk nomor urut
  onActionComplete: () => void;
}

export function AdminKosTable({
  kosList,
  isLoading,
  error,
  showDeleted,
  currentPage,
  limit,
  onActionComplete,
}: AdminKosTableProps) {
  const [selectedKos, setSelectedKos] = useState<number[]>([]);

  // Action Hooks
  const { deleteKos, loading: isDeleting } = useDeleteKos();
  const { restoreKos, loading: isRestoring } = useRestoreKos();
  const { permanentDeleteKos, loading: isPermanentDeleting } = usePermanentDeleteKos();
  const { bulkArchiveKos, loading: isBulkArchiving } = useBulkArchiveKos();
  const { bulkPermanentDeleteKos, loading: isBulkPermanentDeleting } = useBulkPermanentDeleteKos();
  const { bulkCleanupKos, loading: isBulkCleaning } = useBulkCleanupKos();
  
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
    const confirmation = await showConfirm('Anda yakin ingin memulihkan kos ini dari arsip?');
    if (confirmation.isConfirmed) {
      const success = await restoreKos(kosId);
      if (success) {
        showSuccessToast('Kos berhasil dipulihkan.');
        onActionComplete();
      } else {
        showErrorToast('Gagal memulihkan kos.');
      }
    }
  }

  if (isLoading && kosList.length === 0) {
    return <div className="text-center p-8">Memuat data...</div>;
  }
  
  if (error) {
    return <div className="text-center p-8 text-red-600">Error: {error}</div>
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center gap-2">
        {selectedKos.length > 0 && (
            <button
              onClick={handleBulkAction}
              disabled={isBulkArchiving || isBulkPermanentDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
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
              className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 disabled:opacity-50"
            >
              🧹 Cleanup Arsip
            </button>
        )}
      </div>
      
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
              {/* Kolom Baru */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                ID Kos
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
            {kosList.map((kos, index) => {
              // Kalkulasi nomor urut berdasarkan halaman saat ini
              const itemNumber = (currentPage - 1) * limit + index + 1;
              return (
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
                  {/* Kolom Baru */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {itemNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {kos.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{kos.name}</div>
                    <div className="text-sm text-gray-700">{kos.address}, {kos.city}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-4">
                    {showDeleted ? (
                      <>
                        <button 
                          onClick={() => handleRestore(kos.id)} 
                          disabled={isRestoring}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          Restore
                        </button>
                        <button 
                          onClick={() => handleSingleDelete(kos.id)} 
                          disabled={isPermanentDeleting}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          Delete Permanently
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleSingleDelete(kos.id)} 
                        disabled={isDeleting}
                        className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                      >
                        Archive
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}