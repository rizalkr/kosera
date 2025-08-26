// Action bar + per-row actions for admin kos table
'use client';
import React from 'react';
import type { AdminKosData } from '@/types';
import { Button } from '@/components/atoms';

export interface KosTableActionsProps {
  selectedCount: number;
  isBulkArchiving: boolean;
  isBulkPermanentDeleting: boolean;
  isBulkCleaning: boolean;
  showDeleted: boolean;
  onBulkArchive: () => void;
  onBulkPermanentDelete: () => void;
  onCleanup: () => void;
}

export const KosTableActions: React.FC<KosTableActionsProps> = ({
  selectedCount,
  isBulkArchiving,
  isBulkPermanentDeleting,
  isBulkCleaning,
  showDeleted,
  onBulkArchive,
  onBulkPermanentDelete,
  onCleanup,
}) => {
  return (
    <div className="p-4 border-b border-gray-200 flex items-center gap-2">
      {selectedCount > 0 && !showDeleted && (
        <Button
          variant="danger"
          size="sm"
          onClick={onBulkArchive}
          isLoading={isBulkArchiving}
        >
          Arsipkan ({selectedCount})
        </Button>
      )}
      {selectedCount > 0 && showDeleted && (
        <Button
          variant="danger"
          size="sm"
          onClick={onBulkPermanentDelete}
          isLoading={isBulkPermanentDeleting}
        >
          Hapus Permanen ({selectedCount})
        </Button>
      )}
      {showDeleted && (
        <Button
          variant="danger"
          size="sm"
          onClick={onCleanup}
          isLoading={isBulkCleaning}
        >
          🧹 Cleanup Arsip
        </Button>
      )}
    </div>
  );
};

export interface RowActionButtonsProps {
  kos: AdminKosData;
  showDeleted: boolean;
  isRestoring: boolean;
  isDeleting: boolean;
  isPermanentDeleting: boolean;
  onRestore: (id: number) => void;
  onDelete: (id: number, permanent: boolean) => void;
}

export const RowActionButtons: React.FC<RowActionButtonsProps> = ({
  kos,
  showDeleted,
  isRestoring,
  isDeleting,
  isPermanentDeleting,
  onRestore,
  onDelete,
}) => {
  if (showDeleted) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => onRestore(kos.id)}
          disabled={isRestoring}
          className="text-green-600 hover:text-green-900 disabled:opacity-50"
        >
          Restore
        </button>
        <button
          onClick={() => onDelete(kos.id, true)}
          disabled={isPermanentDeleting}
          className="text-red-600 hover:text-red-900 disabled:opacity-50"
        >
          Delete Permanently
        </button>
      </div>
    );
  }
  return (
    <button
      onClick={() => onDelete(kos.id, false)}
      disabled={isDeleting}
      className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
    >
      Archive
    </button>
  );
};
