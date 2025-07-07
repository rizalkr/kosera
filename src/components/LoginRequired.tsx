'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface LoginRequiredProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  showModal?: boolean;
}

export default function LoginRequired({ 
  children, 
  fallback, 
  redirectTo = '/auth/login',
  showModal = false 
}: LoginRequiredProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showModal) {
      return (
        <>
          {fallback}
          {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
        </>
      );
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    // Redirect to login
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
    }
    
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold mb-2">Login Diperlukan</h2>
          <p className="text-gray-600 mb-4">Anda perlu login untuk mengakses fitur ini</p>
          <button
            onClick={() => router.push(redirectTo)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login Sekarang
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Modal login untuk inline actions
function LoginModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h3 className="text-lg font-semibold mb-2">Login Diperlukan</h3>
          <p className="text-gray-600 mb-6">
            Anda perlu login untuk menggunakan fitur ini
          </p>
          
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
}
