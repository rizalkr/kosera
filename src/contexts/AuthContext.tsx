'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { JWTPayload } from '@/lib/auth';

export interface User {
  id: number;
  name: string;
  username: string;
  contact: string;
  role: 'ADMIN' | 'SELLER' | 'RENTER';
  createdAt?: string;
}

interface AuthContextType {
  user: JWTPayload | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (token: string, userData: JWTPayload) => void;
  logout: () => void;
  checkAuth: () => void;
  requireAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<JWTPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Initialize token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const login = (authToken: string, userData: JWTPayload) => {
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
    setToken(authToken);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setToken(null);
  };

  const requireAuth = (): boolean => {
    return !!(user && token);
  };

  const checkAuth = async () => {
    try {
      // First, get token from state or localStorage
      const currentToken = token || localStorage.getItem('auth_token');
      const userDataStr = localStorage.getItem('user_data');

      if (currentToken && userDataStr) {
        // Make sure state is synchronized
        if (!token) {
          setToken(currentToken);
        }

        // Verify token with server
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${currentToken}`
          }
        });

        if (response.ok) {
          const userData = JSON.parse(userDataStr);
          setUser(userData);
          setToken(currentToken);
        } else {
          // Token is invalid, clear localStorage
          logout();
        }
      } else {
        // No token or user data, make sure state is clean
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    isAuthenticated: !!(user && token),
    isLoading,
    token,
    login,
    logout,
    checkAuth,
    requireAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Utility functions for token management
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
}
