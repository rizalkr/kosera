import React from 'react';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';

export const UserLoadingState: React.FC = () => (
  <div className="min-h-screen bg-[#A9E4DE] pt-20">
    <Header />
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data user...</p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);
