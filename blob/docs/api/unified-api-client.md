# Unified API Client

This document describes the unified API client implementation for the Kosera project. The unified client provides consistent error handling, authentication, retries, and request/response transformation across all API operations.

## Features

- **Consistent Interface**: All API modules use the same unified client
- **Automatic Authentication**: Handles JWT token authentication automatically
- **Error Handling**: Standardized error handling with custom `ApiError` class
- **Retry Logic**: Automatic retry for failed network requests
- **Type Safety**: Full TypeScript support with proper typing
- **Request/Response Transformation**: Consistent JSON handling
- **Timeout Management**: Configurable request timeouts

## Core Components

### ApiClient Class

The main `ApiClient` class in `src/lib/api/client.ts` provides:

```typescript
interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  defaultHeaders?: Record<string, string>;
}

class ApiClient {
  // HTTP methods
  async get<T>(endpoint: string, queryParams?: Record<string, unknown>, options?: RequestOptions): Promise<T>
  async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T>
  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T>
  async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T>
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T>
  async request<T>(endpoint: string, options?: RequestOptions, queryParams?: Record<string, unknown>): Promise<T>
}
```

### Request Options

```typescript
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
  requireAuth?: boolean; // Set to false for public endpoints
}
```

### Error Handling

The unified client uses a custom `ApiError` class:

```typescript
class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public response?: unknown
  )
}
```

## Usage Examples

### Basic Usage

```typescript
import { apiClient } from '@/lib/api/client';

// GET request with query parameters
const kos = await apiClient.get('/api/kos', { 
  city: 'Jakarta', 
  limit: 10 
});

// POST request with body
const booking = await apiClient.post('/api/bookings', {
  kosId: 123,
  checkInDate: '2025-01-15',
  duration: 30
});

// PATCH request with custom headers
const result = await apiClient.patch('/api/admin/bookings/123', 
  { status: 'confirmed' },
  { headers: { 'X-Admin-Action': 'status-update' } }
);
```

### Authentication

The client automatically includes JWT tokens from localStorage:

```typescript
// Authenticated request (default behavior)
const profile = await apiClient.get('/api/user/profile');

// Public request (no auth required)
const featured = await apiClient.get('/api/kos/featured', undefined, { 
  requireAuth: false 
});
```

### Error Handling

```typescript
import { ApiError } from '@/lib/api/client';

try {
  const result = await apiClient.post('/api/bookings', bookingData);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error: ${error.message} (Status: ${error.status})`);
    
    // Handle specific status codes
    if (error.status === 401) {
      // Redirect to login
    } else if (error.status === 403) {
      // Show permission denied
    }
  } else {
    console.error('Network or other error:', error);
  }
}
```

## Refactored API Modules

### Authentication API

```typescript
// Before (manual fetch)
const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password }),
});

// After (unified client)
const result = await apiClient.post('/api/auth/login', 
  { username, password }, 
  { requireAuth: false }
);
```

### Admin Bookings API

```typescript
// Before (manual fetch with manual query building)
const queryParams = new URLSearchParams();
if (filters.status) queryParams.set('status', filters.status);
const response = await fetch(`/api/admin/bookings?${queryParams}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// After (unified client)
const result = await apiClient.get('/api/admin/bookings', {
  status: filters.status,
  page: filters.page,
  limit: filters.limit
});
```

## Migration Guide

### Step 1: Update API Modules

Replace manual `fetch` calls with unified client methods:

```typescript
// Old pattern
import { createAuthHeaders, API_BASE_URL } from './utils';

export const someApi = {
  getData: async () => {
    const response = await fetch(`${API_BASE_URL}/api/data`, {
      headers: createAuthHeaders(),
    });
    return response.json();
  }
};

// New pattern
import { apiClient } from './client';

export const someApi = {
  getData: async () => {
    return apiClient.get('/api/data');
  }
};
```

### Step 2: Update Hooks

Replace manual error handling with `ApiError`:

```typescript
// Old pattern
catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to load data');
}

// New pattern
import { ApiError } from '@/lib/api/client';

catch (err) {
  const errorMessage = err instanceof ApiError 
    ? `${err.message} (Status: ${err.status})`
    : err instanceof Error 
    ? err.message 
    : 'Failed to load data';
  
  setError(errorMessage);
}
```

### Step 3: Update Components

Use the new API modules with improved error handling:

```typescript
// Old pattern
import { useAdminBooking } from '@/hooks/admin/useAdminBooking';

// New pattern
import { useAdminBookingV2 } from '@/hooks/admin/useAdminBookingV2';
```

## Benefits

1. **Consistency**: All API calls follow the same pattern
2. **Maintainability**: Changes to authentication, error handling, or request logic only need to be made in one place
3. **Type Safety**: Better TypeScript support with proper error types
4. **Debugging**: Centralized logging and error reporting
5. **Testing**: Easier to mock and test API calls
6. **Performance**: Built-in retry logic and timeout management
7. **Security**: Consistent token handling and header management

## Configuration

The default client is configured in `src/lib/api/client.ts`:

```typescript
export const apiClient = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 10000, // 10 seconds
  retries: 2,
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
});
```

You can create custom clients for different environments:

```typescript
const adminClient = new ApiClient({
  baseUrl: 'https://admin-api.kosera.com',
  timeout: 30000, // Longer timeout for admin operations
  retries: 3,
});
```

## Next Steps

1. **Complete Migration**: Update all remaining API modules to use the unified client
2. **Add Interceptors**: Implement request/response interceptors for logging
3. **Add Caching**: Implement response caching for frequently accessed data
4. **Add Metrics**: Track API performance and error rates
5. **Add Testing**: Create comprehensive tests for the unified client
