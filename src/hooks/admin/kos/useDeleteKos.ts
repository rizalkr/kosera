import { useAuthToken } from "@/hooks/auth/useAuthToken";
import { useState } from "react";

export const useDeleteKos = () => {
  const { getToken } = useAuthToken();
  const [loading, setLoading] = useState(false);

  const deleteKos = async (kosId: number) => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/kos/${kosId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete kos');
      }

      return true;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete kos');
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteKos,
    loading,
  };
};
