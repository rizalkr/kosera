import { useState, useCallback } from 'react';
import { z } from 'zod';
import { createKosRequestSchema, type CreateKosRequest, type CreateKosResponse, createKos } from '@/lib/api/kos';
import { showError, showLoading, showSuccess } from '@/lib/sweetalert';
import { AppError } from '@/types/common';
import { useRouter } from 'next/navigation';
import { useAuthToken } from '@/hooks/auth/useAuthToken';

export interface KosFormData extends CreateKosRequest { latitude?: number; longitude?: number; }
export interface UseCreateKosFormResult {
  formData: KosFormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  addFacility: (facility: string) => void;
}

export const useCreateKosForm = (): UseCreateKosFormResult => {
  const router = useRouter();
  const { getToken, hasValidToken } = useAuthToken();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<KosFormData>({
    title: '', description: '', price: 0, name: '', address: '', city: '', facilities: '', totalRooms: 0, occupiedRooms: undefined, latitude: undefined, longitude: undefined,
  });

  const handleInputChange: UseCreateKosFormResult['handleInputChange'] = useCallback((e) => {
    const { name, value } = e.target;
    const numericFields = ['price','totalRooms','occupiedRooms','latitude','longitude'];
    const parsed = numericFields.includes(name) ? (value === '' ? undefined : parseFloat(value)) : value;
    console.debug('[CreateKosForm] handleInputChange', { name, rawValue: value, parsed });
    setFormData(prev => ({
      ...prev,
      [name]: parsed,
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const validationErrors: Record<string, string> = {};
    console.debug('[CreateKosForm] validateForm - start', formData);
    try {
      createKosRequestSchema.parse({
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        name: formData.name,
        address: formData.address,
        city: formData.city,
        facilities: formData.facilities,
        totalRooms: Number(formData.totalRooms),
        occupiedRooms: formData.occupiedRooms ? Number(formData.occupiedRooms) : undefined,
      });
    } catch (e) {
      const issues = (e as z.ZodError).issues;
      console.debug('[CreateKosForm] validateForm - zod issues', issues);
      issues.forEach(i => { validationErrors[i.path.join('.')] = i.message; });
    }
    if (formData.occupiedRooms && formData.occupiedRooms > (formData.totalRooms || 0)) validationErrors.occupiedRooms = 'Kamar terisi tidak boleh lebih dari total kamar';
    if (formData.occupiedRooms && formData.occupiedRooms < 0) validationErrors.occupiedRooms = 'Kamar terisi tidak boleh negatif';

    console.debug('[CreateKosForm] validateForm - errors', validationErrors);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [formData]);

  const submit = useCallback(async (): Promise<CreateKosResponse> => {
    const payload: CreateKosRequest = {
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      name: formData.name,
      address: formData.address,
      city: formData.city,
      facilities: formData.facilities,
      totalRooms: Number(formData.totalRooms),
      occupiedRooms: formData.occupiedRooms ? Number(formData.occupiedRooms) : undefined,
    };
    console.debug('[CreateKosForm] submit - payload', payload);
    const response = await createKos(payload);
    console.debug('[CreateKosForm] submit - response', response);
    return response;
  }, [formData]);

  const handleSubmit: UseCreateKosFormResult['handleSubmit'] = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    showLoading('Menyimpan kos baru...');
    try {
      if (!hasValidToken()) throw new Error('Authentication required');
      const token = getToken();
      if (!token) throw new Error('No valid token available');
      console.debug('[CreateKosForm] handleSubmit - token present, proceeding');
      const result = await submit();
      if ('error' in result && result.error) throw new Error(result.error);
      await showSuccess('Kos baru berhasil dibuat! Anda akan dialihkan ke halaman detail kos.', 'Berhasil!');
      const newKosId = result.data?.id; 
      console.debug('[CreateKosForm] handleSubmit - newKosId', newKosId);
      router.push(newKosId ? `/seller/kos/${newKosId}` : '/seller/kos');
    } catch (error) {
      const appError = error as AppError;
      console.error('Error creating kos:', appError);
      await showError(appError.message || 'Terjadi kesalahan saat membuat kos baru. Silakan coba lagi.', 'Gagal Menyimpan');
      setErrors({ general: appError.message || 'Terjadi kesalahan saat membuat kos baru' });
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, hasValidToken, getToken, submit, router]);

  const addFacility = useCallback((facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility) ? prev.facilities : prev.facilities ? `${prev.facilities}, ${facility}` : facility,
    }));
  }, []);

  return { formData, errors, isSubmitting, handleInputChange, handleSubmit, addFacility };
};
