// Hook: useKosBulkActions - consolidates bulk action logic
'use client';
import { useCallback } from 'react';
import { showConfirm, showSuccessToast, showErrorToast } from '@/lib/sweetalert';
import { useBulkArchiveKos, useBulkPermanentDeleteKos, useBulkCleanupKos } from './';

export interface UseKosBulkActionsParams {
  showDeleted: boolean;
  onActionComplete: () => void;
}

export const useKosBulkActions = ({ showDeleted, onActionComplete }: UseKosBulkActionsParams) => {
  const { bulkArchiveKos, loading: isBulkArchiving } = useBulkArchiveKos();
  const { bulkPermanentDeleteKos, loading: isBulkPermanentDeleting } = useBulkPermanentDeleteKos();
  const { bulkCleanupKos, loading: isBulkCleaning } = useBulkCleanupKos();

  const handleBulk = useCallback(async (selectedIds: number[]) => {
    const isPermanent = showDeleted;
    const confirmation = await showConfirm(
      isPermanent
        ? `${selectedIds.length} kos yang dipilih akan dihapus PERMANEN.`
        : `${selectedIds.length} kos yang dipilih akan dipindahkan ke arsip.`
    );
    if (confirmation.isConfirmed) {
      const success = await (isPermanent
        ? bulkPermanentDeleteKos(selectedIds)
        : bulkArchiveKos(selectedIds));
      if (success) {
        showSuccessToast('Aksi massal berhasil dijalankan.');
        onActionComplete();
      } else {
        showErrorToast('Gagal menjalankan aksi massal.');
      }
    }
  }, [showDeleted, bulkArchiveKos, bulkPermanentDeleteKos, onActionComplete]);

  const handleCleanup = useCallback(async () => {
    const confirmation = await showConfirm('Anda yakin ingin membersihkan seluruh arsip?');
    if (confirmation.isConfirmed) {
      const success = await bulkCleanupKos();
      if (success) {
        showSuccessToast('Arsip berhasil dibersihkan.');
        onActionComplete();
      } else {
        showErrorToast('Gagal membersihkan arsip.');
      }
    }
  }, [bulkCleanupKos, onActionComplete]);

  return {
    handleBulk,
    handleCleanup,
    isBulkArchiving,
    isBulkPermanentDeleting,
    isBulkCleaning,
  };
};
