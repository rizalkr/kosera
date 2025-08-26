'use client';

import { useEffect } from 'react';
import {
  useDeleteKos,
  useRestoreKos,
  usePermanentDeleteKos,
} from '@/hooks/admin/kos';
import { showConfirm, showSuccessToast, showErrorToast } from '@/lib/sweetalert';
import type { AdminKosData } from '@/types';
import { KosTable } from '@/components/organisms/AdminKos/KosTable';
import { KosTableActions, RowActionButtons } from '@/components/organisms/AdminKos/KosTableActions';
import { useKosSelection } from '@/hooks/admin/kos/useKosSelection';
import { useKosBulkActions } from '@/hooks/admin/kos/useKosBulkActions';

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
  const { selectedIds, toggleSelect, toggleSelectAll, clear } = useKosSelection();
  const { deleteKos, loading: isDeleting } = useDeleteKos();
  const { restoreKos, loading: isRestoring } = useRestoreKos();
  const { permanentDeleteKos, loading: isPermanentDeleting } = usePermanentDeleteKos();
  const { handleBulk, handleCleanup, isBulkArchiving, isBulkPermanentDeleting, isBulkCleaning } = useKosBulkActions({ showDeleted, onActionComplete });
   
  useEffect(() => {
    clear();
  }, [kosList]);
 
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
      <KosTableActions
        selectedCount={selectedIds.length}
        isBulkArchiving={isBulkArchiving}
        isBulkPermanentDeleting={isBulkPermanentDeleting}
        isBulkCleaning={isBulkCleaning}
        showDeleted={showDeleted}
        onBulkArchive={() => handleBulk(selectedIds)}
        onBulkPermanentDelete={() => handleBulk(selectedIds)}
        onCleanup={handleCleanup}
      />
      <KosTable
        kosList={kosList}
        selectedIds={selectedIds}
        onToggleSelect={(id) => toggleSelect(id)}
        onToggleSelectAll={() => toggleSelectAll(kosList.map(k => k.id))}
        showDeleted={showDeleted}
        currentPage={currentPage}
        limit={limit}
        renderActions={(kos) => (
          <RowActionButtons
            kos={kos}
            showDeleted={showDeleted}
            isRestoring={isRestoring}
            isDeleting={isDeleting}
            isPermanentDeleting={isPermanentDeleting}
            onRestore={handleRestore}
            onDelete={(id, permanent) => handleSingleDelete(id)}
          />
        )}
      />
    </div>
  );
}