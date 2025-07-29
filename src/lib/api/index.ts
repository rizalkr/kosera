// Langkah 1: Ekspor kembali semua named export dari setiap modul API.
export * from './admin';
export * from './auth';
export * from './bookings';
export * from './client'; // Export unified API client
export * from './favorites';
export * from './kos';
export * from './seller';
export * from './user';
export * from './utils'; // utils.js berisi fungsi createAuthHeaders dan API_BASE_URL yang digunakan di berbagai modul API.

// Langkah 2: Impor kembali semua modul untuk digabungkan menjadi satu apiClient.
import { adminApi } from './admin';
import { authApi } from './auth';
import { bookingsApi } from './bookings';
import { apiClient } from './client';
import { favoritesApi } from './favorites';
import { kosApi } from './kos';
import { sellerApi } from './seller';
import { userApi } from './user';

// Langkah 3: Gabungkan semua modul menjadi satu objek utama.
const api = {
  // Unified client for direct usage
  client: apiClient,
  
  // Domain-specific API modules
  admin: adminApi,
  auth: authApi,
  bookings: bookingsApi,
  favorites: favoritesApi,
  kos: kosApi,
  seller: sellerApi,
  user: userApi,
};

// Langkah 4: Ekspor api sebagai default export.
export default api;