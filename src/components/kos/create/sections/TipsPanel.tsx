import React from 'react';

export const TipsPanel: React.FC = () => (
  <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
    <h3 className="text-lg font-semibold text-blue-900 mb-4">Tips untuk Kos yang Menarik</h3>
    <ul className="space-y-2 text-sm text-blue-800">
      {[
        'Gunakan judul yang menarik dan deskriptif seperti "Kos Putri Nyaman Dekat Kampus"',
        'Sertakan fasilitas lengkap dan kondisi kamar secara detail',
        'Tentukan total kamar dan kamar terisi dengan akurat untuk transparansi',
        'Tentukan harga yang kompetitif sesuai lokasi dan fasilitas',
        'Setelah membuat kos, jangan lupa upload foto untuk menarik lebih banyak penyewa',
      ].map(item => (
        <li key={item} className="flex items-start">
          <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);
