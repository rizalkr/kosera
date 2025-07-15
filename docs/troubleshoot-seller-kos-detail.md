# Troubleshooting: Data Seller Kos Detail Menampilkan 0

## Masalah
Halaman detail kos seller (`/seller/kos/[id]`) menampilkan semua statistik sebagai 0:
- Total Booking: 0
- Total Dilihat: 0  
- Tingkat Hunian: 0%
- Total Pendapatan: Rp 0
- Kamar Terisi/Kosong: 0

## Langkah Debugging

### 1. ✅ **Perbaikan Error TypeScript (SELESAI)**
**Error yang diperbaiki:**
- `Property 'isActive' does not exist on type 'SellerKosData'`
- `Property 'verified' does not exist on type 'SellerKosData'`  
- `Property 'roomType' does not exist on type 'SellerKosData'`

**Solusi:**
- Updated `getKosStatus()` untuk menggunakan status default "Aktif"
- Removed reference ke `kosData.roomType`, menggunakan "Standar" sebagai default
- Added debug logging untuk melihat data yang dikembalikan API

### 2. 🔍 **Debug Console Logging**
Ditambahkan logging di komponen untuk melihat:
```javascript
console.log('🔍 Seller Kos Detail Debug:', {
  kosId,
  kosResponse, 
  kosData,
  isLoading,
  error
});
```

### 3. 📊 **Kemungkinan Penyebab Data 0**

#### A. **Tidak Ada Data Sample di Database**
- Database mungkin kosong atau tidak memiliki data kos untuk seller yang login
- Perlu data sample untuk testing

#### B. **API Authentication Issues**
- Token tidak valid atau expired
- User bukan role SELLER
- User tidak memiliki kos dengan ID yang diminta

#### C. **Database Query Issues**
- Booking table kosong
- Relasi antar table tidak benar
- Calculate statistics mengembalikan 0

#### D. **API Response Structure Issues**
- API mengembalikan data tapi structure berbeda dari yang diexpect
- Statistics object tidak ter-populate dengan benar

## Langkah Troubleshooting

### 1. **Cek Browser Console**
1. Buka halaman `/seller/kos/[id]` 
2. Buka Developer Tools (F12)
3. Lihat Console tab untuk debug log
4. Perhatikan data yang di-log:
   ```
   🔍 Seller Kos Detail Debug: {
     kosId: "1",
     kosResponse: { success: true, data: {...} },
     kosData: { name: "...", statistics: {...} },
     isLoading: false,
     error: null
   }
   ```

### 2. **Manual API Test**
Jalankan script debug di console browser:
```javascript
// Copy-paste script dari debug-seller-kos.js ke browser console
// atau jalankan manual:
debugSellerKosAPI(1); // ganti 1 dengan kosId yang sesuai
```

### 3. **Cek Authentication**
```javascript
debugUserAuth(); // di browser console
```

### 4. **Verifikasi Database Data**
Cek apakah ada data di tables:
```sql
-- Cek users dengan role SELLER
SELECT id, username, role FROM users WHERE role = 'SELLER';

-- Cek posts milik seller
SELECT p.id, p.title, p.price, u.username 
FROM posts p 
JOIN users u ON p.userId = u.id 
WHERE u.role = 'SELLER';

-- Cek kos data
SELECT k.id, k.name, k.postId, p.title, p.price
FROM kos k
JOIN posts p ON k.postId = p.id
JOIN users u ON p.userId = u.id
WHERE u.role = 'SELLER';

-- Cek bookings
SELECT b.*, k.name as kos_name
FROM bookings b
JOIN kos k ON b.kosId = k.id
JOIN posts p ON k.postId = p.id
JOIN users u ON p.userId = u.id
WHERE u.role = 'SELLER';
```

## Solusi Berdasarkan Hasil Debug

### Jika Data API Kosong:
1. **Tambah Data Sample**:
   - Buat user dengan role SELLER
   - Buat posts untuk seller tersebut
   - Buat kos entries
   - Buat sample bookings untuk generate statistics

### Jika Authentication Issues:
1. **Cek Token**:
   ```javascript
   localStorage.getItem('auth_token')
   localStorage.getItem('user_data') 
   ```
2. **Re-login** sebagai seller
3. **Verify** role user adalah 'SELLER'

### Jika API Structure Issues:
1. **Cek API Response** di Network tab
2. **Verify** endpoint `/api/seller/kos/[id]` mengembalikan data yang benar
3. **Check** apakah `statistics` object ter-populate

## Quick Fix - Tambah Data Sample

```sql
-- Script untuk menambah data sample (run di database)
-- 1. Pastikan ada user seller
INSERT INTO users (name, username, password, contact, role) 
VALUES ('Test Seller', 'testseller', '$2a$10$abcd...', '081234567890', 'SELLER')
ON CONFLICT (username) DO NOTHING;

-- 2. Tambah post
WITH seller_id AS (SELECT id FROM users WHERE username = 'testseller')
INSERT INTO posts (title, description, price, userId, totalPost, totalPenjualan, viewCount)
SELECT 'Kos Test Seller', 'Kos untuk testing', 1500000, seller_id.id, 10, 3, 150
FROM seller_id;

-- 3. Tambah kos
WITH post_data AS (
  SELECT p.id as post_id FROM posts p 
  JOIN users u ON p.userId = u.id 
  WHERE u.username = 'testseller'
)
INSERT INTO kos (postId, name, address, city)
SELECT post_data.post_id, 'Kos Test Seller', 'Jl. Test No. 123', 'Jakarta'
FROM post_data;

-- 4. Tambah sample bookings
WITH kos_data AS (
  SELECT k.id as kos_id FROM kos k
  JOIN posts p ON k.postId = p.id
  JOIN users u ON p.userId = u.id
  WHERE u.username = 'testseller'
), renter_data AS (
  SELECT id FROM users WHERE role = 'RENTER' LIMIT 1
)
INSERT INTO bookings (kosId, userId, checkInDate, duration, totalPrice, status)
SELECT kos_data.kos_id, renter_data.id, '2024-01-01', 6, 9000000, 'confirmed'
FROM kos_data, renter_data;
```

## Expected Result Setelah Fix

Setelah troubleshooting, halaman seller kos detail harus menampilkan:
- ✅ Total Booking: > 0
- ✅ Total Dilihat: > 0 (dari posts.viewCount)
- ✅ Tingkat Hunian: calculated dari occupied/total rooms
- ✅ Total Pendapatan: > 0 (dari bookings.totalPrice)
- ✅ Kamar Terisi/Kosong: calculated dari booking statistics

## Files Terkait
- `/src/app/seller/kos/[id]/page.tsx` - UI Component
- `/src/app/api/seller/kos/[id]/route.ts` - API Endpoint  
- `/src/hooks/useApi.ts` - React Query Hook
- `/src/lib/api.ts` - API Client
- `/debug-seller-kos.js` - Debug Script

## Status
- ✅ TypeScript errors fixed
- ✅ Debug logging added
- 🔍 Awaiting debug results untuk identify root cause
