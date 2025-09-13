'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { showError, showSuccess } from '@/lib/sweetalert';
import { loginSchema, type LoginSchema } from '@/lib/validation/authSchemas';
import { z } from 'zod';
import clsx from 'clsx';

// -------------------- Atomic Components --------------------
interface TextInputProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
}
export const TextInput = ({ id, name, label, type = 'text', value, onChange, disabled, placeholder, error }: TextInputProps) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={clsx(
        'w-full text-gray-600 px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors placeholder:text-gray-500',
        error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
      )}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

interface PasswordInputProps extends Omit<TextInputProps, 'type'> {
  show: boolean;
  toggle: () => void;
}
export const PasswordInput = ({ id, name, label, value, onChange, disabled, placeholder, show, toggle, error }: PasswordInputProps) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={clsx(
          'w-full text-black px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors pr-12 placeholder:text-gray-500',
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
        )}
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

interface SubmitButtonProps {
  loading: boolean;
  children: React.ReactNode;
}
export const SubmitButton = ({ loading, children }: SubmitButtonProps) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {loading ? (
      <div className="flex items-center justify-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {children}
      </div>
    ) : children}
  </button>
);

// -------------------- Page Component --------------------
 type FormState = LoginSchema;

interface FormErrors {
  username?: string;
  password?: string;
  general?: string;
}

export const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [formData, setFormData] = useState<FormState>({ username: '', password: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (formErrors[e.target.name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const parsed = loginSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      parsed.error.issues.forEach(issue => {
        const field = issue.path[0] as keyof FormErrors;
        fieldErrors[field] = issue.message;
      });
      setFormErrors(fieldErrors);
      return false;
    }
    setFormErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const response = await authApi.login(formData.username, formData.password);
      if (response.success && response.data?.token && response.data.user) {
        const { token, user } = response.data;
        login(token, { userId: user.id, username: user.username, role: user.role });
        await showSuccess('Login berhasil!', `Selamat datang kembali, ${user.username}!`);
        const from = searchParams.get('from') || '/';
        router.push(from);
        // router.refresh(); // Possibly unnecessary; comment out while debugging token persistence
      } else {
        await showError(response.error || response.message || 'Username atau password salah', 'Login Gagal');
      }
    } catch (error) {
      const message = error instanceof z.ZodError ? error.issues.map(i => i.message).join(', ') : (error as Error).message;
      await showError(message, 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Masuk ke Kosera</h1>
          <p className="text-gray-600">Temukan kos impian Anda</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <TextInput
            id="username"
            name="username"
            label="Username"
            value={formData.username}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Masukkan username"
            error={formErrors.username}
          />
          <PasswordInput
            id="password"
            name="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Masukkan password"
            show={showPassword}
            toggle={() => setShowPassword(s => !s)}
            error={formErrors.password}
          />
          {formErrors.general && <p className="text-sm text-red-600">{formErrors.general}</p>}
          <SubmitButton loading={isLoading}>Masuk...</SubmitButton>
        </form>
        <div className="mt-8 text-center">
          <p className="text-gray-600">Belum punya akun?{' '}<Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">Daftar sekarang</Link></p>
        </div>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 font-medium mb-2">Akun Demo:</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Admin:</strong> admin1 / admin123</p>
            <p><strong>Seller:</strong> seller1 / seller123</p>
            <p><strong>Renter:</strong> renter1 / renter123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
