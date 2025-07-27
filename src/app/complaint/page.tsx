"use client";
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import { useState } from 'react';
import { showSuccess } from '@/lib/sweetalert';

export default function ComplaintPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    showSuccess('Terima kasih, pengaduan Anda telah dikirim!', 'Pengaduan Berhasil Dikirim');
    setSubmitted(true);
    // Di sini bisa tambahkan logic kirim ke backend jika ada
  }

  return (
    <div className="min-h-screen px-8 py-6 bg-[#A9E4DE] pt-20">
      <Header />
      <main className="max-w-lg mx-auto mt-12 bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-blue-400 mb-6">Form Pengaduan</h1>
        {submitted ? (
          <div className="text-green-600 font-semibold text-center">
            Terima kasih, pengaduan Anda telah dikirim!
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-blue-400 font-semibold mb-1">Nama</label>
              <input
                type="text"
                name="nama"
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-blue-400 font-semibold mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-blue-400 font-semibold mb-1">Pesan</label>
              <textarea
                name="pesan"
                required
                rows={5}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-400 text-white font-semibold px-6 py-2 rounded hover:bg-blue-500 transition"
            >
              Kirim Pengaduan
            </button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}