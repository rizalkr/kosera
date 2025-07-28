import { useAuthToken } from "@/hooks/auth/useAuthToken";
import { useState } from "react";

export const useRestoreKos = () => {
  const { getToken } = useAuthToken();
  const [loading, setLoading] = useState(false);

  const restoreKos = async (kosId: number) => {
    setLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/kos/${kosId}/restore`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to restore kos');
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { restoreKos, loading };
};
