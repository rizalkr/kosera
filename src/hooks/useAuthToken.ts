import { useAuth } from '@/contexts/AuthContext';
import { useCallback, useMemo } from 'react';

export const useAuthToken = () => {
  const { token, isAuthenticated, isLoading } = useAuth();

  const getToken = useCallback((): string | null => {
    // Primary: Use token from AuthContext state
    if (token) {
      return token;
    }
    
    // Fallback: Get from localStorage if context hasn't loaded yet
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token');
      return storedToken;
    }
    
    return null;
  }, [token]);

  const setAuthToken = useCallback((newToken: string | null) => {
    // This will be handled by AuthContext methods
    if (newToken) {
      localStorage.setItem('auth_token', newToken);
    } else {
      localStorage.removeItem('auth_token');
    }
    // Note: We don't have direct setToken here, this should be handled by AuthContext
  }, []);

  const clearToken = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    // Note: We don't have direct setToken here, this should be handled by AuthContext
  }, []);

  const hasValidToken = useCallback((): boolean => {
    const currentToken = getToken();
    return !!currentToken && !isLoading;
  }, [getToken, isLoading]);

  const currentToken = useMemo(() => getToken(), [getToken]);
  const hasToken = useMemo(() => !!currentToken, [currentToken]);
  const isValidAuthenticated = useMemo(() => !!currentToken && !isLoading, [currentToken, isLoading]);

  return {
    token: currentToken, // Always return the most current token
    isLoading,
    getToken,
    setAuthToken,
    clearToken,
    hasToken,
    hasValidToken,
    isAuthenticated: isAuthenticated && hasToken,
    isValidAuthenticated // Added stable boolean flag for useEffect dependencies
  };
};
