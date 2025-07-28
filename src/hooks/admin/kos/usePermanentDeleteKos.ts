import { useState } from "react";
import { adminApi } from "@/lib/api";

export const usePermanentDeleteKos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const permanentDeleteKos = async (kosId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.permanentDeleteKos(kosId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to permanently delete kos');
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { permanentDeleteKos, loading, error };
};