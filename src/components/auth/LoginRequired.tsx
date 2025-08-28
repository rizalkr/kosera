'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export interface LoginRequiredProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string; // login page path
  showModal?: boolean; // show inline modal instead of redirect
}

export const LoginRequired = ({
  children,
  fallback,
  redirectTo = '/auth/login',
  showModal = false,
}: LoginRequiredProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [redirectInitiated, setRedirectInitiated] = useState(false);

  // Open modal automatically if requested and user not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && showModal) {
      setShowLoginModal(true);
    }
  }, [isLoading, isAuthenticated, showModal]);

  // Handle redirect AFTER render to avoid updating Router during render
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !showModal && !fallback && !redirectInitiated) {
      const currentPath = window.location.pathname + window.location.search;
      setRedirectInitiated(true);
      router.replace(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [isLoading, isAuthenticated, showModal, fallback, redirectTo, router, redirectInitiated]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Modal variant
    if (showModal) {
      return (
        <>
          {fallback}
          {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
        </>
      );
    }

    // Fallback UI (custom) without automatic redirect
    if (fallback) {
      return <>{fallback}</>;
    }

    // Redirect spinner state
    if (redirectInitiated) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center text-gray-600">Mengalihkan ke halaman login...</div>
        </div>
      );
    }

    // Initial prompt (will quickly transition to redirect spinner)
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold mb-2">Login Diperlukan</h2>
          <p className="text-gray-600 mb-4">Mengalihkan ke halaman login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Modal login untuk inline actions
const LoginModal = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h3 className="text-lg font-semibold mb-2">Login Diperlukan</h3>
          <p className="text-gray-600 mb-6">Anda perlu login untuk menggunakan fitur ini</p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={() => {
                onClose();
                router.push('/auth/login');
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
