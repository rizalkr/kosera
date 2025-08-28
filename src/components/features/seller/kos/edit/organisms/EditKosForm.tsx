import React from 'react';
import { InputField } from '../atoms/InputField';
import { TextAreaField } from '../atoms/TextAreaField';
import { FacilitiesSuggestions } from '../molecules/FacilitiesSuggestions';
import { UseEditKosHook } from '@/types';

export interface EditKosFormProps extends Pick<UseEditKosHook, 'formData' | 'errors' | 'handleChange' | 'handleSubmit' | 'handleCancel' | 'isSubmitting'> {
  cities: string[];
  facilitiesOptions: string[];
}

export const EditKosForm: React.FC<EditKosFormProps> = ({ formData, errors, handleChange, handleSubmit, handleCancel, isSubmitting, cities, facilitiesOptions }) => {
  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Informasi Dasar */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField id="title" name="title" label="Judul Kos *" value={formData.title} onChange={handleChange} placeholder="Contoh: Kos Putri Nyaman di Pusat Kota" error={errors.title} />
          <InputField id="name" name="name" label="Nama Kos *" value={formData.name} onChange={handleChange} placeholder="Contoh: Kos Putri Mawar" error={errors.name} />
          <TextAreaField id="description" name="description" label="Deskripsi Kos *" value={formData.description} onChange={handleChange} rows={4} className="md:col-span-2" error={errors.description} placeholder="Jelaskan secara detail tentang kos Anda..." />
          <InputField id="totalRooms" name="totalRooms" type="number" label="Total Kamar *" value={formData.totalRooms ?? ''} onChange={handleChange} placeholder="10" error={errors.totalRooms} />
          <InputField id="occupiedRooms" name="occupiedRooms" type="number" label="Kamar Terisi (Opsional)" value={formData.occupiedRooms ?? ''} onChange={handleChange} placeholder="2" error={errors.occupiedRooms} helperText="Jumlah kamar yang sudah dihuni saat ini" />
        </div>
      </div>

      {/* Lokasi */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lokasi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextAreaField id="address" name="address" label="Alamat Lengkap *" value={formData.address} onChange={handleChange} rows={3} className="md:col-span-2" error={errors.address} placeholder="Contoh: Jl. Merdeka No. 123" />
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">Kota *</label>
            <select id="city" name="city" value={formData.city} onChange={handleChange} className={`text-gray-900 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.city ? 'border-red-300' : 'border-gray-300'}`}>
              <option value="">Pilih Kota</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">Harga per Bulan *</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">Rp</span>
              <input type="number" id="price" name="price" value={formData.price ?? ''} onChange={handleChange} placeholder="500000" min={0} className={`text-gray-900 w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.price ? 'border-red-300' : 'border-gray-300'}`} />
            </div>
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>
        </div>
      </div>

      {/* Fasilitas */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Fasilitas</h2>
        <div>
          <TextAreaField id="facilities" name="facilities" label="Fasilitas yang Tersedia *" value={formData.facilities} onChange={handleChange} rows={3} error={errors.facilities} placeholder="Contoh: WiFi, AC, Kamar Mandi Dalam" />
          <FacilitiesSuggestions options={facilitiesOptions} value={formData.facilities} onAdd={(facility) => {
            const current = formData.facilities;
            const next = current ? `${current}, ${facility}` : facility;
            const event = { target: { name: 'facilities', value: next } } as React.ChangeEvent<HTMLTextAreaElement>;
            handleChange(event);
          }} />
        </div>
      </div>

      {/* Koordinat */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Koordinat (Opsional)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField id="latitude" name="latitude" type="number" label="Latitude" value={formData.latitude ?? ''} onChange={handleChange} placeholder="-7.250445" step="any" />
          <InputField id="longitude" name="longitude" type="number" label="Longitude" value={formData.longitude ?? ''} onChange={handleChange} placeholder="112.768845" step="any" />
        </div>
        <p className="text-xs text-gray-500 mt-2">Koordinat membantu penyewa menemukan lokasi kos dengan mudah. Anda bisa mendapatkan koordinat dari Google Maps.</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
        <button type="button" onClick={handleCancel} className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors" disabled={isSubmitting}>Batal</button>
        <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </div>
          ) : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
};
