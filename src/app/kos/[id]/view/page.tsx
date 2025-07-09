'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function KosViewPage() {
  const params = useParams();
  const kosId = params.id;

  return (
    <div className="min-h-screen bg-[#A9E4DE] pt-20">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-4">
            Detail Kos ID: {kosId}
          </h1>
          <p className="text-gray-600">
            Halaman detail kos sedang dalam pengembangan...
          </p>
          <div className="mt-6">
            <Link 
              href="/" 
              className="text-blue-600 hover:underline"
            >
              ← Kembali ke beranda
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}