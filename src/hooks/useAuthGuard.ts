'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export const useAuthGuard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const requireAuth = (action: string = 'melakukan aksi ini') => {
    if (isLoading) return false;
    
    if (!isAuthenticated) {
      // Store the current path to redirect back after login
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/auth/login?from=${encodeURIComponent(currentPath)}&message=${encodeURIComponent(`Anda harus login untuk ${action}`)}`);
      return false;
    }
    
    return true;
  };

  const requireRole = (requiredRoles: ('ADMIN' | 'SELLER' | 'RENTER')[], action: string = 'mengakses fitur ini') => {
    if (!requireAuth(action)) return false;
    
    if (user && !requiredRoles.includes(user.role)) {
      alert(`Anda tidak memiliki izin untuk ${action}. Role yang diperlukan: ${requiredRoles.join(', ')}`);
      return false;
    }
    
    return true;
  };

  const checkFavoritePermission = () => {
    return requireAuth('menambah/menghapus favorit');
  };

  const checkBookingPermission = () => {
    return requireRole(['RENTER'], 'melakukan booking');
  };

  const checkKosManagementPermission = () => {
    return requireRole(['SELLER', 'ADMIN'], 'mengelola kos');
  };

  const checkAdminPermission = () => {
    return requireRole(['ADMIN'], 'mengakses panel admin');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    requireAuth,
    requireRole,
    checkFavoritePermission,
    checkBookingPermission,
    checkKosManagementPermission,
    checkAdminPermission,
  };
};
