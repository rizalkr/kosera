// Langkah 1: Ekspor kembali semua named export dari setiap modul API.
export * from './admin';
export * from './auth';
export * from './bookings';
export * from './favorites';
export * from './kos';
export * from './seller';
export * from './user';
export * from './utils'; // utils.js berisi fungsi createAuthHeaders dan API_BASE_URL yang digunakan di berbagai modul API.

// Langkah 2: Impor kembali semua modul untuk digabungkan menjadi satu apiClient.
import { adminApi } from './admin';
import { authApi } from './auth';
import { bookingsApi } from './bookings';
import { favoritesApi } from './favorites';
import { kosApi } from './kos';
import { sellerApi } from './seller';
import { userApi } from './user';

// Langkah 3: Gabungkan semua modul menjadi satu objek utama.
const apiClient = {
  admin: adminApi,
  auth: authApi,
  bookings: bookingsApi,
  favorites: favoritesApi,
  kos: kosApi,
  seller: sellerApi,
  user: userApi,
};

// Langkah 4: Ekspor apiClient sebagai default export.
export default apiClient;