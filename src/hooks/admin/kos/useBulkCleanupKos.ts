import { useState } from "react";
import { adminApi } from "@/lib/api";

export const useBulkCleanupKos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bulkCleanupKos = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.bulkCleanupKos();
      if (!response.success) {
        throw new Error(response.message || 'Failed to cleanup archived kos');
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { bulkCleanupKos, loading, error };
};