import type { ApiResponse } from '@/types';

/**
 * Unified API Client Configuration
 */
export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  defaultHeaders?: Record<string, string>;
}

/**
 * API Request Options
 */
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
  requireAuth?: boolean;
}

/**
 * API Error Class
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Unified API Client
 * Provides consistent interface for all API operations with error handling,
 * authentication, retries, and request/response transformation.
 */
export class ApiClient {
  private config: Required<ApiClientConfig>;

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 10000,
      retries: 2,
      defaultHeaders: {
        'Content-Type': 'application/json',
      },
      ...config,
    };
  }

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  /**
   * Create headers with authentication if required
   */
  private createHeaders(options: RequestOptions): Record<string, string> {
    const headers = {
      ...this.config.defaultHeaders,
      ...options.headers,
    };

    if (options.requireAuth !== false) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, unknown>): string {
    const url = new URL(endpoint.startsWith('/') ? endpoint.slice(1) : endpoint, this.config.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Execute HTTP request with retry logic
   */
  private async executeRequest(
    url: string,
    options: RequestOptions,
    attempt = 1
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = options.timeout ?? this.config.timeout;
    const maxRetries = options.retries ?? this.config.retries;

    // Set timeout
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: options.method ?? 'GET',
        headers: this.createHeaders(options),
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      // Retry on network errors
      if (attempt <= maxRetries && (error as Error).name !== 'AbortError') {
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        return this.executeRequest(url, options, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Process API response
   */
  private async processResponse<T>(response: Response): Promise<T> {
    let data: unknown;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch {
      data = null;
    }

    if (!response.ok) {
      const errorMessage = this.extractErrorMessage(data);
      throw new ApiError(
        response.status,
        response.statusText,
        errorMessage,
        data
      );
    }

    return data as T;
  }

  /**
   * Extract error message from response data
   */
  private extractErrorMessage(data: unknown): string {
    if (typeof data === 'object' && data !== null) {
      const apiResponse = data as Partial<ApiResponse>;
      if (apiResponse.error) return apiResponse.error;
      if (apiResponse.message) return apiResponse.message;
    }

    if (typeof data === 'string') return data;
    return 'An unexpected error occurred';
  }

  /**
   * Generic request method
   */
  async request<T>(
    endpoint: string,
    options: RequestOptions = {},
    queryParams?: Record<string, unknown>
  ): Promise<T> {
    const url = this.buildUrl(endpoint, queryParams);
    const response = await this.executeRequest(url, options);
    return this.processResponse<T>(response);
  }

  /**
   * GET request
   */
  async get<T>(
    endpoint: string,
    queryParams?: Record<string, unknown>,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' }, queryParams);
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: unknown,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: unknown,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: unknown,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

/**
 * Default API client instance
 */
export const apiClient = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});
