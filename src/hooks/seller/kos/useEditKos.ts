import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { showConfirm, showError, showLoading, showSuccess } from '@/lib/sweetalert';
import { AppError } from '@/types/common';
import { sellerApi } from '@/lib/api/seller';
import { apiClient } from '@/lib/api/client';
import { z } from 'zod';
import { EditKosRequest, editKosRequestSchema, UseEditKosHook } from '@/types';

// Zod schema for edit kos (reuse createKosRequestSchema with optional fields if needed)


export const editKosResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.number(),
  }).partial().optional(),
  error: z.string().optional(),
}).passthrough();


const defaultForm: EditKosRequest = {
  title: '',
  description: '',
  price: 0,
  name: '',
  address: '',
  city: '',
  facilities: '',
  totalRooms: 0,
  occupiedRooms: undefined,
  latitude: undefined,
  longitude: undefined,
};

export const useEditKos = (): UseEditKosHook => {
  const params = useParams();
  const router = useRouter();
  const kosId = parseInt(params.id as string);
  const [formData, setFormData] = useState<EditKosRequest>(defaultForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing kos via sellerApi (already validated at higher level if needed)
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await sellerApi.getKosDetail(kosId);
        if (res.success && res.data) {
          const d = res.data as { title?: string; description?: string; price?: number; name?: string; address?: string; city?: string; facilities?: string; totalRooms?: number; occupiedRooms?: number; latitude?: number; longitude?: number };
          setFormData(prev => ({
            ...prev,
            title: d.title ?? '',
            description: d.description ?? '',
            price: d.price ?? 0,
            name: d.name ?? '',
            address: d.address ?? '',
            city: d.city ?? '',
            facilities: d.facilities ?? '',
            totalRooms: d.totalRooms ?? 0,
            occupiedRooms: d.occupiedRooms ?? undefined,
            latitude: d.latitude ?? undefined,
            longitude: d.longitude ?? undefined,
          }));
        } else {
          throw new Error('Data kos tidak ditemukan');
        }
      } catch (e: unknown) {
        const err = e as AppError;
        showError(err.message || 'Gagal memuat data kos');
        router.push('/seller/kos');
      } finally {
        setIsLoading(false);
      }
    };
    if (!isNaN(kosId)) load();
  }, [kosId, router]);

  const validate = useCallback((data: EditKosRequest): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!data.title.trim()) errs.title = 'Judul kos wajib diisi';
    if (!data.description.trim()) errs.description = 'Deskripsi kos wajib diisi';
    if (!data.price || data.price <= 0) errs.price = 'Harga harus lebih dari 0';
    if (!data.name.trim()) errs.name = 'Nama kos wajib diisi';
    if (!data.address.trim()) errs.address = 'Alamat kos wajib diisi';
    if (!data.city.trim()) errs.city = 'Kota wajib dipilih';
    if (!data.facilities.trim()) errs.facilities = 'Fasilitas kos wajib diisi';
    if (!data.totalRooms || data.totalRooms <= 0) errs.totalRooms = 'Total kamar harus lebih dari 0';
    if (data.occupiedRooms && data.occupiedRooms > data.totalRooms) errs.occupiedRooms = 'Kamar terisi tidak boleh lebih dari total kamar';
    if (data.occupiedRooms && data.occupiedRooms < 0) errs.occupiedRooms = 'Kamar terisi tidak boleh negatif';
    return errs;
  }, []);

  const handleChange: UseEditKosHook['handleChange'] = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['price','totalRooms','occupiedRooms','latitude','longitude'].includes(name) ? (value === '' ? undefined : Number(value)) : value,
    }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit: UseEditKosHook['handleSubmit'] = async (e) => {
    e.preventDefault();
    const v = validate(formData);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    const confirm = await showConfirm('Apakah Anda yakin ingin menyimpan perubahan pada kos ini?', 'Konfirmasi Perubahan', 'Ya, Simpan', 'Batal');
    if (!confirm.isConfirmed) return;

    setIsSubmitting(true);
    showLoading('Menyimpan perubahan...');
    try {
      // Use validated client for PUT
      const payload = editKosRequestSchema.parse(formData);
      const res = await apiClient.putValidated(`/api/kos/${kosId}`, editKosResponseSchema, payload);
      if (res.success) {
        await showSuccess('Perubahan kos berhasil disimpan! Anda akan dialihkan ke halaman detail kos.', 'Berhasil!');
        router.push(`/seller/kos/${kosId}`);
      } else {
        await showError(res.error || 'Gagal menyimpan perubahan');
      }
    } catch (e: unknown) {
      const err = e as AppError;
      await showError(err.message || 'Terjadi kesalahan saat menyimpan perubahan', 'Gagal Menyimpan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    const confirm = await showConfirm('Apakah Anda yakin ingin membatalkan perubahan? Semua perubahan yang belum disimpan akan hilang.', 'Konfirmasi Batal', 'Ya, Batalkan', 'Tetap Edit');
    if (confirm.isConfirmed) router.push(`/seller/kos/${kosId}`);
  };

  return { kosId, formData, isLoading, isSubmitting, errors, handleChange, handleSubmit, handleCancel };
};
