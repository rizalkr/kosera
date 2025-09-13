'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react';
import { JWTPayload } from '../lib/auth';
import { apiClient } from '@/lib/api/client';
import { z } from 'zod';

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

// Zod schema for verify response (supports both root-level user and data.user)
const userPayloadSchema = z.object({
  userId: z.number(),
  username: z.string(),
  role: z.string(),
});

const verifyResponseSchema = z.object({
  message: z.string().optional(),
  user: userPayloadSchema.optional(),
  data: z.object({ user: userPayloadSchema.optional() }).partial().optional(),
  error: z.string().optional(),
}).passthrough();

type VerifyResponse = z.infer<typeof verifyResponseSchema>;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<JWTPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const initialisedRef = useRef(false);


  // Initialize token from localStorage on mount
  useEffect(() => {
    if (initialisedRef.current) return;
    initialisedRef.current = true;
    try {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user_data');
      if (storedToken) {
        setToken(storedToken);
      }
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser) as JWTPayload;
          setUser(parsed);
        } catch {
          // Silently ignore parse errors
        }
      }
    } catch {
      // Ignore localStorage access errors
    }
  }, []);

  const login = (authToken: string, userData: JWTPayload) => {
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
    setToken(authToken);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setToken(null);
  }, []);

  const requireAuth = (): boolean => {
    return !!(user && token);
  };

  const checkAuth = useCallback(async () => {
    try {
      // First, get token from state or localStorage
      const currentToken = token || localStorage.getItem('auth_token');
      const userDataStr = localStorage.getItem('user_data');

      if (currentToken && userDataStr) {
        // Make sure state is synchronized
        if (!token) {
          setToken(currentToken);
        }
        // Use validated client (pass requireAuth false because we manually attach header below) 
        const response = await apiClient.getValidated<VerifyResponse>('/api/auth/verify', verifyResponseSchema, undefined, { headers: { Authorization: `Bearer ${currentToken}` } });
  interface NestedUser { data?: { user?: { userId: number; username: string; role: string } } }
  const nested = (response as VerifyResponse & NestedUser).data?.user;
  const extractedUser = response.user || nested;
        if (extractedUser) {
          const userData = JSON.parse(userDataStr) as JWTPayload;
          setUser(userData);
          setToken(currentToken);
        } else {
          // Do not aggressively logout; just mark unauthenticated gracefully
          setUser(null);
          setToken(null);
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
  }, [token, logout]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
