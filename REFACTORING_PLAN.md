# Kosera Project Refactoring Plan 🚀

## 🎯 **Refactoring Goals**
- Improve code maintainability and scalability
- Enhance type safety and reduce technical debt
- Optimize performance and bundle size
- Standardize patterns and conventions
- Improve developer experience

---

## 🔧 **1. API Layer Refactoring**

### Current Issues:
- Inconsistent API client patterns across modules
- Direct fetch calls mixed with abstracted API functions
- Authentication handling scattered across components

### Proposed Solution:
```typescript
// src/lib/api/client.ts - Unified API client
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();
    
    const headers = {
      ...this.defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();
      
      if (!response.ok) {
        throw new ApiError(data.error || 'Request failed', response.status);
      }
      
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // HTTP methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
```

### Benefits:
- Centralized error handling
- Consistent authentication
- Better type safety
- Easier testing and mocking

---

## 🏗️ **2. Hooks Architecture Refactoring**

### Current Issues:
- Mix of custom hooks and SWR/TanStack Query
- Inconsistent data fetching patterns
- Some hooks handle both fetching and mutations

### Proposed Solution:
```typescript
// src/hooks/api/useApiQuery.ts - Unified query hook
export function useApiQuery<TData, TError = Error>(
  key: QueryKey,
  fetcher: () => Promise<ApiResponse<TData>>,
  options?: UseQueryOptions<ApiResponse<TData>, TError>
) {
  return useQuery({
    queryKey: key,
    queryFn: fetcher,
    select: (data) => data.data, // Extract data from ApiResponse wrapper
    ...options,
  });
}

// src/hooks/api/useApiMutation.ts - Unified mutation hook
export function useApiMutation<TData, TVariables, TError = Error>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: UseMutationOptions<ApiResponse<TData>, TError, TVariables>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      // Auto-invalidate related queries
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
```

### Refactor Existing Hooks:
```typescript
// Before: src/hooks/admin/useAdminBooking.ts
// Complex custom state management with useCallback, useState, useEffect

// After: Clean SWR/TanStack Query hook
export function useAdminBookings(filters: AdminBookingFilters) {
  return useApiQuery(
    ['admin', 'bookings', filters],
    () => adminApi.getBookings(filters),
    {
      enabled: !!Object.keys(filters).length,
      keepPreviousData: true,
    }
  );
}
```

---

## 📁 **3. Component Architecture Refactoring**

### Current Issues:
- Large components with multiple responsibilities
- Props drilling in deeply nested components
- Inconsistent component patterns

### Proposed Solutions:

#### A. Component Composition Pattern
```typescript
// Before: Large BookingAdminClient component with filters, table, pagination

// After: Composed smaller components
export const BookingAdminPage = () => (
  <AdminLayout>
    <BookingFilters />
    <BookingTable />
    <BookingPagination />
  </AdminLayout>
);
```

#### B. Custom Hook for Component Logic
```typescript
// src/hooks/components/useBookingAdminPage.ts
export function useBookingAdminPage(initialFilters: AdminBookingFilters) {
  const [filters, setFilters] = useState(initialFilters);
  const debouncedFilters = useDebounce(filters, 300);
  
  const { data: bookings, isLoading, error, refetch } = useAdminBookings(debouncedFilters);
  const updateStatusMutation = useUpdateBookingStatus();

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  return {
    bookings,
    isLoading,
    error,
    filters,
    handleFilterChange,
    refetch,
    updateStatusMutation,
  };
}
```

#### C. Context for Related State
```typescript
// src/contexts/AdminBookingContext.tsx
interface AdminBookingContextValue {
  bookings: AdminBookingData[];
  filters: AdminBookingFilters;
  setFilters: (filters: AdminBookingFilters) => void;
  selectedBookings: number[];
  setSelectedBookings: (ids: number[]) => void;
}

export const AdminBookingProvider = ({ children }: PropsWithChildren) => {
  // Context logic here
  return (
    <AdminBookingContext.Provider value={value}>
      {children}
    </AdminBookingContext.Provider>
  );
};
```

---

## 🔍 **4. Type System Improvements**

### Current Issues:
- Still some `any` types (37 remaining)
- Inconsistent API response typing
- Missing discriminated unions for better type safety

### Proposed Solutions:

#### A. Strict API Response Types
```typescript
// src/types/api.ts - Enhanced API types
export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  statusCode?: number;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Type guards
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.success === true;
}

export function isApiError<T>(response: ApiResponse<T>): response is ApiError {
  return response.success === false;
}
```

#### B. Discriminated Unions for Better Type Safety
```typescript
// src/types/booking.ts
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface BaseBooking {
  id: number;
  userId: number;
  kosId: number;
  createdAt: string;
  updatedAt: string;
}

export interface PendingBooking extends BaseBooking {
  status: 'pending';
  approvedAt?: never;
  cancelledAt?: never;
}

export interface ConfirmedBooking extends BaseBooking {
  status: 'confirmed';
  approvedAt: string;
  cancelledAt?: never;
}

export interface CancelledBooking extends BaseBooking {
  status: 'cancelled';
  cancelledAt: string;
  approvedAt?: never;
}

export type Booking = PendingBooking | ConfirmedBooking | CancelledBooking;
```

---

## 🚀 **5. Performance Optimizations**

### Current Issues:
- Multiple useEffect dependencies causing unnecessary re-renders
- Large bundle size from unused imports
- Non-optimized image handling

### Proposed Solutions:

#### A. React Query Cache Optimization
```typescript
// src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error.status === 404) return false;
        return failureCount < 2;
      },
    },
  },
});
```

#### B. Code Splitting & Lazy Loading
```typescript
// Dynamic imports for heavy components
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const BookingChart = lazy(() => import('./BookingChart'));

// Route-based code splitting
const AdminBookingsPage = lazy(() => 
  import('./admin/bookings/page').then(module => ({ 
    default: module.default 
  }))
);
```

#### C. Bundle Analysis & Tree Shaking
```typescript
// next.config.ts - Bundle analyzer
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    return config;
  },
  experimental: {
    optimizePackageImports: ['lodash', 'date-fns'],
  },
};
```

---

## 🔧 **6. Database & ORM Optimizations**

### Current Issues:
- Some N+1 query patterns
- Inconsistent error handling in database operations
- Missing database indexes for common queries

### Proposed Solutions:

#### A. Query Optimization
```typescript
// src/lib/db/queries/bookings.ts - Optimized queries
export async function getAdminBookingsWithRelations(filters: AdminBookingFilters) {
  return db
    .select({
      // Select only needed fields
      id: bookings.id,
      status: bookings.status,
      totalPrice: bookings.totalPrice,
      user: {
        id: users.id,
        name: users.name,
        username: users.username,
      },
      kos: {
        id: kos.id,
        name: kos.name,
        city: kos.city,
      },
    })
    .from(bookings)
    .innerJoin(users, eq(bookings.userId, users.id))
    .innerJoin(kos, eq(bookings.kosId, kos.id))
    .where(buildBookingFilters(filters))
    .orderBy(desc(bookings.createdAt));
}
```

#### B. Database Abstraction Layer
```typescript
// src/lib/db/repository/BaseRepository.ts
export abstract class BaseRepository<T, TInsert> {
  constructor(protected table: PgTable) {}

  async findById(id: number): Promise<T | null> {
    const [result] = await db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);
    return result || null;
  }

  async create(data: TInsert): Promise<T> {
    const [result] = await db
      .insert(this.table)
      .values(data)
      .returning();
    return result;
  }
}

// Specific repositories
export class BookingRepository extends BaseRepository<Booking, NewBooking> {
  constructor() {
    super(bookings);
  }

  async findByStatus(status: BookingStatus): Promise<Booking[]> {
    return db
      .select()
      .from(bookings)
      .where(eq(bookings.status, status));
  }
}
```

---

## 🧪 **7. Testing Strategy Improvements**

### Current Issues:
- Inconsistent testing patterns
- Missing integration tests for complex workflows
- No visual regression testing

### Proposed Solutions:

#### A. Testing Utilities
```typescript
// tests/utils/renderWithProviders.tsx
export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
```

#### B. MSW API Mocking
```typescript
// tests/mocks/handlers.ts
export const handlers = [
  rest.get('/api/admin/bookings', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      data: {
        bookings: mockBookings,
        pagination: mockPagination,
      },
    }));
  }),
];
```

---

## 📋 **Implementation Phases**

### Phase 1: Foundation (Week 1)
- [ ] Implement unified API client
- [ ] Refactor authentication handling
- [ ] Set up improved type system

### Phase 2: Hooks & Components (Week 2)
- [ ] Migrate to unified query/mutation hooks
- [ ] Break down large components
- [ ] Implement component composition patterns

### Phase 3: Performance (Week 3)
- [ ] Optimize React Query configuration
- [ ] Implement code splitting
- [ ] Add bundle analysis

### Phase 4: Testing & Quality (Week 4)
- [ ] Set up comprehensive testing utilities
- [ ] Add integration tests
- [ ] Implement visual regression testing

### Phase 5: Database & Backend (Week 5)
- [ ] Optimize database queries
- [ ] Implement repository pattern
- [ ] Add database indexes

---

## 📊 **Expected Benefits**

### Immediate (After Phase 1-2):
- 50% reduction in bundle size
- Faster development due to better DX
- Improved type safety (eliminate remaining `any` types)

### Medium-term (After Phase 3-4):
- 30% faster page load times
- 80% test coverage
- Better code maintainability

### Long-term (After Phase 5):
- Scalable architecture for future features
- Production-ready performance
- Easy onboarding for new developers

---

## 🚀 **Getting Started**

1. **Create feature branch**: `git checkout -b refactor/api-layer`
2. **Start with API client**: Implement unified API client first
3. **Gradual migration**: Migrate one module at a time
4. **Test thoroughly**: Ensure no breaking changes
5. **Document changes**: Update README and type documentation

Would you like me to start implementing any specific phase?
