import React from 'react';
import { inputMuted } from '../styles';

export interface SectionLocationProps {
  address: string; city: string; price: number | undefined;
  errors: Record<string, string>;
  cities: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const SectionLocation: React.FC<SectionLocationProps> = ({ address, city, price, errors, cities, onChange }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Lokasi</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="text-gray-500 md:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap *</label>
            <textarea id="address" name="address" value={address} onChange={onChange} rows={3} placeholder="Contoh: Jl. Merdeka No. 123..." className={`${inputMuted} ${errors.address ? 'border-red-300' : 'border-gray-300'}`} />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">Kota *</label>
          <select id="city" name="city" value={city} onChange={onChange} className={`${inputMuted} ${errors.city ? 'border-red-300' : 'border-gray-300'}`} >
            <option value="">Pilih Kota</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">Harga per Bulan *</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">Rp</span>
            <input type="number" id="price" name="price" value={price || ''} onChange={onChange} placeholder="500000" min={0} className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-500 ${errors.price ? 'border-red-300' : 'border-gray-300'}`} />
          </div>
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
        </div>
      </div>
    </div>
  );
};
