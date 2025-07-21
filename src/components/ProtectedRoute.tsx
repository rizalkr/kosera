'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: ('ADMIN' | 'SELLER' | 'RENTER')[];
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  allowedRoles = ['ADMIN', 'SELLER', 'RENTER'] 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // Redirect to login with return URL
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/auth/login?from=${encodeURIComponent(currentPath)}`);
        return;
      }

      if (isAuthenticated && user && !allowedRoles.includes(user.role)) {
        // User doesn't have required role
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, isAuthenticated, isLoading, requireAuth, allowedRoles, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#A9E4DE] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-blue-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if auth is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Don't render if user doesn't have required role
  if (isAuthenticated && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
