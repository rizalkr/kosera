import { useState, useEffect } from 'react';
import { showError } from '@/lib/sweetalert';

export const useAuthToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get token from localStorage on mount
    const storedToken = localStorage.getItem('auth_token');
    setToken(storedToken);
    setIsLoading(false);

    // Listen for storage changes (e.g., login/logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        setToken(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const getToken = (): string | null => {
    if (!token) {
      showError('Sesi login telah berakhir, silakan login kembali');
      return null;
    }
    return token;
  };

  const setAuthToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('auth_token', newToken);
    } else {
      localStorage.removeItem('auth_token');
    }
    setToken(newToken);
  };

  const clearToken = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
  };

  return {
    token,
    isLoading,
    getToken,
    setAuthToken,
    clearToken,
    hasToken: !!token
  };
};
