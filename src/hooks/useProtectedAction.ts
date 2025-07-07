'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export function useProtectedAction() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const executeProtectedAction = (
    action: () => void | Promise<void>,
    options?: {
      redirectTo?: string;
      message?: string;
      showToast?: boolean;
    }
  ) => {
    const {
      redirectTo = '/auth/login',
      message = 'Anda perlu login untuk melakukan aksi ini',
      showToast = true
    } = options || {};

    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      if (showToast && typeof window !== 'undefined') {
        // Note: You'll need to install react-hot-toast
        // For now, we'll use alert
        alert(message);
      }
      
      const currentPath = window.location.pathname;
      router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Execute the action if user is authenticated
    action();
  };

  return { executeProtectedAction, isAuthenticated, isLoading };
}

// Hook for protected mutations
export function useProtectedMutation<T extends (...args: any[]) => any>(
  mutation: T,
  options?: {
    message?: string;
    redirectTo?: string;
  }
): T {
  const { executeProtectedAction } = useProtectedAction();

  return ((...args: Parameters<T>) => {
    executeProtectedAction(() => mutation(...args), options);
  }) as T;
}
