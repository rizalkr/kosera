import { useState } from "react";
import { adminApi } from "@/lib/api";

export const useBulkPermanentDeleteKos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bulkPermanentDeleteKos = async (kosIds: number[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.bulkPermanentDeleteKos(kosIds);
      if (!response.success) {
        throw new Error(response.message || 'Failed to permanently delete selected kos');
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { bulkPermanentDeleteKos, loading, error };
};