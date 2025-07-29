// Common API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    kos: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message?: string;
}

// Error Types
export interface AppError {
  message: string;
  status?: number;
  code?: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
  statusCode?: number;
}

// Form Error Types
export interface FormErrors {
  [key: string]: string | undefined;
  general?: string;
}

// SweetAlert Types
export interface SweetAlertResult {
  isConfirmed: boolean;
  isDenied?: boolean;
  isDismissed?: boolean;
  value?: unknown;
}
