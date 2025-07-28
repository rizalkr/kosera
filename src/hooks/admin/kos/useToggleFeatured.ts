import { useAuthToken } from "@/hooks/auth/useAuthToken";
import { useState } from "react";

export const useToggleFeatured = () => {
  const { getToken } = useAuthToken();
  const [loading, setLoading] = useState(false);

  const toggleFeatured = async (kosId: number, isFeatured: boolean) => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/kos/${kosId}/featured`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFeatured }),
      });

      if (!response.ok) {
        throw new Error('Failed to update featured status');
      }

      return true;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update featured status');
    } finally {
      setLoading(false);
    }
  };

  return {
    toggleFeatured,
    loading,
  };
};
