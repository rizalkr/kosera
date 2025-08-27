import React from 'react';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';

export interface UserErrorStateProps {
  error: string | null;
  onRetry: () => void;
  onBack: () => void;
}

export const UserErrorState: React.FC<UserErrorStateProps> = ({ error, onRetry, onBack }) => (
  <div className="min-h-screen bg-[#A9E4DE] pt-20">
    <Header />
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="space-x-4">
          <button onClick={onBack} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">← Kembali ke Daftar User</button>
          <button onClick={onRetry} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">🔄 Coba Lagi</button>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);
