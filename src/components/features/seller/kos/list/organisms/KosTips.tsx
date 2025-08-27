import React from 'react';

export const KosTips: React.FC = () => (
  <div className="mt-8 bg-blue-50 rounded-xl p-6">
    <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 Tips Pengelolaan Kos</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
      <Tip title="📸 Update Foto Rutin" desc="Foto yang menarik meningkatkan minat penyewa hingga 70%" />
      <Tip title="💰 Harga Kompetitif" desc="Sesuaikan harga dengan kondisi pasar di sekitar lokasi" />
      <Tip title="⚡ Respons Cepat" desc="Balas pertanyaan calon penyewa dalam 24 jam" />
    </div>
  </div>
);

const Tip = ({ title, desc }: { title: string; desc: string }) => (
  <div className="bg-white rounded-lg p-4">
    <div className="font-medium text-gray-800 mb-2">{title}</div>
    <div className="text-gray-600">{desc}</div>
  </div>
);
