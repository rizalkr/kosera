import React from 'react';
import { inputBase } from '../styles';

export interface SectionFacilitiesProps {
  facilities: string;
  errors: Record<string, string>;
  suggestions: string[];
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onAdd: (facility: string) => void;
}

export const SectionFacilities: React.FC<SectionFacilitiesProps> = ({ facilities, errors, suggestions, onChange, onAdd }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Fasilitas</h2>
      <div>
        <label htmlFor="facilities" className="block text-sm font-medium text-gray-700 mb-2">Fasilitas yang Tersedia *</label>
        <textarea id="facilities" name="facilities" value={facilities} onChange={onChange} rows={3} placeholder="Contoh: WiFi, AC, Kamar Mandi Dalam..." className={`${inputBase} ${errors.facilities ? 'border-red-300' : 'border-gray-300'}`} />
        {errors.facilities && <p className="text-red-500 text-xs mt-1">{errors.facilities}</p>}
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-2">Saran fasilitas (klik untuk menambahkan):</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(f => (
              <button key={f} type="button" onClick={() => onAdd(f)} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full border border-gray-200 transition-colors">{f}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
