// Hook: useKosSelection - manage selection state for kos table
'use client';
import { useState, useCallback } from 'react';

export interface UseKosSelectionResult {
  selectedIds: number[];
  toggleSelect: (id: number) => void;
  clear: () => void;
  toggleSelectAll: (allIds: number[]) => void;
}

export const useKosSelection = (): UseKosSelectionResult => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  const clear = useCallback(() => setSelectedIds([]), []);

  const toggleSelectAll = useCallback((allIds: number[]) => {
    setSelectedIds(prev => prev.length === allIds.length ? [] : allIds);
  }, []);

  return { selectedIds, toggleSelect, clear, toggleSelectAll };
};
