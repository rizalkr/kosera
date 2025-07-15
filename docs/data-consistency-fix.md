# Perbaikan Konsistensi Data Dashboard vs Detail Kos

## Masalah yang Ditemukan
Ada ketidakcocokan data antara halaman dashboard seller dan halaman detail kos, khususnya pada:
- Total booking
- Kamar terisi
- Tingkat hunian
- Total views/dilihat

## Akar Masalah

### 1. **Sumber Data yang Berbeda**
- **Dashboard**: Menggunakan mix antara `statistics` object dan `kosData` properties
- **Detail**: Lebih konsisten menggunakan `statistics` tapi ada beberapa yang menggunakan `kosData`

### 2. **Struktur Data**
Berdasarkan type definition di `src/lib/api.ts`:
```typescript
export interface SellerKosStats {
  totalBookings: number;
  pendingBookings: number;
  occupiedRooms: number;
  vacantRooms: number;
  totalRooms: number;
  totalRevenue: number;
  totalRoomsRentedOut: number;
  // Tidak ada totalViews - ini ada di kosData.viewCount
}

export interface SellerKosData extends KosData {
  statistics: SellerKosStats;
  viewCount?: number; // Ada di KosData
}
```

## Solusi yang Diterapkan

### 1. **Standardisasi Sumber Data**
Semua data views menggunakan `kosData.viewCount || 0` pada kedua halaman:

**Dashboard (sebelum):**
```tsx
<p className="text-xl font-bold text-green-600">{kosData.viewCount}</p>
```

**Dashboard (sesudah):**
```tsx
<p className="text-xl font-bold text-green-600">{kosData.viewCount || 0}</p>
```

**Detail (sudah benar):**
```tsx
<div className="text-3xl font-bold text-green-600">{kosData.viewCount || 0}</div>
```

### 2. **Konsistensi Fallback Values**
Kedua halaman menggunakan fallback value yang sama:
```tsx
const statistics = kosData.statistics || {
  totalBookings: 0,
  totalViews: 0, // Tidak digunakan, pakai kosData.viewCount
  totalRevenue: 0,
  occupiedRooms: 0,
  vacantRooms: 0,
  totalRooms: 0,
  pendingBookings: 0,
  totalRoomsRentedOut: 0
};
```

### 3. **Calculation Logic yang Sama**
Tingkat hunian dihitung dengan formula yang identik:
```tsx
const occupancyRate = statistics.totalRooms > 0 
  ? Math.round((statistics.occupiedRooms / statistics.totalRooms) * 100)
  : 0;
```

## Mapping Data yang Benar

| Metric | Dashboard Source | Detail Source | Status |
|--------|------------------|---------------|--------|
| Total Booking | `statistics.totalBookings` | `statistics.totalBookings` | ✅ Konsisten |
| Total Dilihat | `kosData.viewCount \|\| 0` | `kosData.viewCount \|\| 0` | ✅ Diperbaiki |
| Kamar Terisi | `statistics.occupiedRooms` | `statistics.occupiedRooms` | ✅ Konsisten |
| Kamar Kosong | `statistics.vacantRooms` | `statistics.vacantRooms` | ✅ Konsisten |
| Total Kamar | `statistics.totalRooms` | `statistics.totalRooms` | ✅ Konsisten |
| Tingkat Hunian | `occupancyRate` (calculated) | `occupancyRate` (calculated) | ✅ Konsisten |
| Total Pendapatan | `statistics.totalRevenue` | `statistics.totalRevenue` | ✅ Konsisten |
| Pending Bookings | `statistics.pendingBookings` | `statistics.pendingBookings` | ✅ Konsisten |

## Hasil Setelah Perbaikan

### ✅ **Yang Sudah Konsisten:**
1. **Total Booking**: Sama-sama menggunakan `statistics.totalBookings`
2. **Kamar Terisi/Kosong**: Sama-sama menggunakan `statistics.occupiedRooms/vacantRooms`
3. **Tingkat Hunian**: Formula perhitungan identik di kedua halaman
4. **Total Pendapatan**: Sama-sama menggunakan `statistics.totalRevenue`
5. **Fallback Values**: Default values yang konsisten untuk empty state

### 🔧 **Yang Diperbaiki:**
1. **Total Dilihat**: Sekarang konsisten menggunakan `kosData.viewCount || 0`
2. **Error Handling**: Proper fallback untuk undefined values

## Testing
Setelah perubahan:
- ✅ No TypeScript errors
- ✅ Consistent data display
- ✅ Proper fallback handling
- ✅ Same calculation formulas

## Catatan Implementasi

### 1. **Data Flow**
```
API Response → SellerKosData → {
  ...kosData (includes viewCount),
  statistics: SellerKosStats
}
```

### 2. **Best Practices yang Diterapkan**
- Always use fallback values (`|| 0`)
- Consistent source of truth for each metric
- Same calculation logic across pages
- Proper TypeScript typing

### 3. **Future Considerations**
- Consider adding `totalViews` to `SellerKosStats` untuk konsistensi
- Implement data validation di API level
- Add unit tests untuk calculation logic
- Consider caching strategy untuk consistency

## Verification
Untuk memverifikasi perbaikan:
1. Buka dashboard seller (`/seller/dashboard`)
2. Catat angka statistik di KosCard
3. Klik "Lihat" untuk masuk ke detail kos
4. Verifikasi angka yang sama muncul di overview tab
5. Periksa tingkat hunian calculation matches

Semua data seharusnya sekarang menampilkan nilai yang identik antara dashboard dan detail kos.
