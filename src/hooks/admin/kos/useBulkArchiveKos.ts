import { useAuthToken } from "@/hooks/auth/useAuthToken";
import { useState } from "react";

export const useBulkArchiveKos = () => {
  const { getToken } = useAuthToken();
  const [loading, setLoading] = useState(false);

  const bulkArchiveKos = async (kosIds: number[]) => {
    setLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/kos/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kosIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to archive selected kos');
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { bulkArchiveKos, loading };
};
