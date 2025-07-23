// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  contact: string;
  role: 'RENTER' | 'SELLER' | 'ADMIN';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    user: User;
  };
  error?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  contact: string;
  role?: 'RENTER' | 'SELLER';
}

// Form Data Types
export interface UserFormData {
  username: string;
  email: string;
  fullName: string;
  contact: string;
  role: 'RENTER' | 'SELLER' | 'ADMIN';
  password?: string;
}
