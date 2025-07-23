# Types Structure

This document describes the organized TypeScript type definitions for the Kosera application.

## File Structure

```
src/types/
├── index.ts          # Main barrel export file - re-exports all types
├── common.ts          # Common/shared types used across the application
├── user.ts            # User-related types and authentication
├── kos.ts             # Kos (accommodation) related types
├── booking.ts         # Booking and reservation types
├── favorites.ts       # Favorites and wishlist types
└── cloudinary.ts      # Cloudinary service types (existing)
```

## Files Overview

### `common.ts`
Contains general-purpose types used throughout the application:
- `ApiResponse<T>` - Standard API response wrapper
- `PaginatedResponse<T>` - Paginated API responses
- `AppError` - Application error structure
- `ErrorResponse` - Error response from APIs
- `FormErrors` - Form validation errors
- `SweetAlertResult` - SweetAlert dialog results

### `user.ts`
User management and authentication types:
- `User` - User entity with profile information
- `LoginRequest` / `LoginResponse` - Authentication types
- `RegisterRequest` - User registration
- `UserFormData` - User form handling

### `kos.ts`
Accommodation (kos) related types:
- `KosData` - Main kos entity
- `SellerKosData` - Extended kos data for sellers
- `KosPhoto` / `KosPhotoData` - Photo management
- `KosPhotosResponse` - Photo API responses
- `KosFormData` - Kos creation/editing forms

### `booking.ts`
Booking and reservation types:
- `BookingData` - Booking entity with all related information

### `favorites.ts`
User favorites and wishlist types:
- `FavoriteKos` - Favorite item structure
- `FavoritesResponse` - Favorites API response

## Usage

### Import from main index (recommended)
```typescript
import { User, KosData, ApiResponse } from '@/types';
```

### Import from specific modules
```typescript
import { FavoriteKos } from '@/types/favorites';
import { AppError } from '@/types/common';
import { SellerKosData } from '@/types/kos';
```

## Benefits

1. **Better Organization**: Types are logically grouped by domain
2. **Improved Maintainability**: Easier to find and update related types
3. **Reduced Bundle Size**: Only import what you need
4. **Clear Dependencies**: Easy to see relationships between types
5. **Scalability**: Easy to add new type categories as the app grows

## Migration

All existing imports have been updated to use the new structure. The old `api.ts` file has been removed and replaced with this modular approach.
