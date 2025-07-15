import { useAuth } from '@/contexts/AuthContext';

export const useAuthToken = () => {
  const { token, isAuthenticated, isLoading } = useAuth();

  const getToken = (): string | null => {
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
  };

  const setAuthToken = (newToken: string | null) => {
    // This will be handled by AuthContext methods
    if (newToken) {
      localStorage.setItem('auth_token', newToken);
    } else {
      localStorage.removeItem('auth_token');
    }
    // Note: We don't have direct setToken here, this should be handled by AuthContext
  };

  const clearToken = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    // Note: We don't have direct setToken here, this should be handled by AuthContext
  };

  const hasValidToken = (): boolean => {
    const currentToken = getToken();
    return !!currentToken && !isLoading;
  };

  return {
    token: getToken(), // Always return the most current token
    isLoading,
    getToken,
    setAuthToken,
    clearToken,
    hasToken: !!getToken(),
    hasValidToken,
    isAuthenticated: isAuthenticated && !!getToken()
  };
};
