import React from 'react';
import { inputBase } from '../styles';

export interface BasicInfoValues {
  title: string; description: string; name: string; totalRooms: number | undefined; occupiedRooms?: number | undefined;
}
export interface SectionBasicInfoProps {
  values: BasicInfoValues;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const SectionBasicInfo: React.FC<SectionBasicInfoProps> = ({ values, errors, onChange }) => {
  // Debug render values
  if (typeof window !== 'undefined') {
    // Only log when values change (simple ref check)
    console.debug('[SectionBasicInfo] render values', { totalRooms: values.totalRooms, occupiedRooms: values.occupiedRooms });
  }
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Judul Kos *</label>
          <input id="title" name="title" value={values.title} onChange={onChange} placeholder="Contoh: Kos Putri Nyaman di Pusat Kota" className={`${inputBase} ${errors.title ? 'border-red-300' : 'border-gray-300'}`} />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nama Kos *</label>
          <input id="name" name="name" value={values.name} onChange={onChange} placeholder="Contoh: Kos Putri Mawar" className={`${inputBase} ${errors.name ? 'border-red-300' : 'border-gray-300'}`} />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Kos *</label>
          <textarea id="description" name="description" value={values.description} onChange={onChange} rows={4} placeholder="Jelaskan secara detail..." className={`${inputBase} ${errors.description ? 'border-red-300' : 'border-gray-300'}`} />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>
        <div>
          <label htmlFor="totalRooms" className="block text-sm font-medium text-gray-700 mb-2">Total Kamar *</label>
          <input type="number" id="totalRooms" name="totalRooms" value={values.totalRooms || ''} onChange={(e) => { console.debug('[SectionBasicInfo] totalRooms change', { raw: e.target.value }); onChange(e); }} placeholder="10" min={1} className={`${inputBase} ${errors.totalRooms ? 'border-red-300' : 'border-gray-300'}`} />
          {errors.totalRooms && <p className="text-red-500 text-xs mt-1">{errors.totalRooms}</p>}
        </div>
        <div>
          <label htmlFor="occupiedRooms" className="block text-sm font-medium text-gray-700 mb-2">Kamar Terisi (Opsional)</label>
          <input type="number" id="occupiedRooms" name="occupiedRooms" value={values.occupiedRooms || ''} onChange={(e) => { console.debug('[SectionBasicInfo] occupiedRooms change', { raw: e.target.value }); onChange(e); }} placeholder="2" min={0} max={values.totalRooms || undefined} className={`${inputBase} ${errors.occupiedRooms ? 'border-red-300' : 'border-gray-300'}`} />
          {errors.occupiedRooms && <p className="text-red-500 text-xs mt-1">{errors.occupiedRooms}</p>}
          <p className="text-xs text-gray-500 mt-1">Jumlah kamar yang sudah dihuni saat ini</p>
        </div>
      </div>
    </div>
  );
};
