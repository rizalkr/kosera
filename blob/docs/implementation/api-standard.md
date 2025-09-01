# API Response Standard

Semua endpoint API menggunakan envelope JSON konsisten berikut.

## Bentuk Sukses
```
{
  "success": true,
  "message": "Deskripsi singkat",
  "data": { ... },
  "meta": { ...opsional }
}
```

## Bentuk Error
```
{
  "success": false,
  "error": "kode_atau_pesan_singkat",
  "message": "Penjelasan human readable (opsional)",
  "details": { ...opsional }
}
```

## Aturan
- Field `success` wajib.
- Jangan campur struktur lama (misal langsung `users`, `bookings`) tanpa `data`.
- `error` hanya muncul saat `success=false`.
- Gunakan helper `jsonSuccess`, `jsonError`, atau `json` dari `src/lib/api-response.ts`.
- Status HTTP harus tetap signifikan: 200-299 untuk sukses, 4xx untuk client error, 5xx untuk server error.

## Helper
File: `src/lib/api-response.ts`

Fungsi utama:
- `jsonSuccess(data, message?, { status?, meta? })`
- `jsonError(error, { status?, message?, details? })`
- `json(responseUnion)` bila sudah membentuk objek.

## Contoh
### Sukses
```
return jsonSuccess({ users }, 'Users retrieved successfully', { meta: { page, total } });
```

### Validasi Gagal
```
return jsonError('validation_error', { status: 422, message: 'Input tidak valid', details: zodError.format() });
```

### Tidak Ditemukan
```
return jsonError('not_found', { status: 404, message: 'Resource tidak ditemukan' });
```

## Konversi Endpoint Lama
1. Identifikasi payload lama (misal `{ message, users, total }`).
2. Bungkus menjadi:
```
return jsonSuccess({ users, total }, message);
```
3. Error lama `{ error: '...' }` => `jsonError('...', { status: 400 })` atau kode yang sesuai.

## Penamaan Error
Gunakan snake_case pendek:
- `invalid_credentials`
- `unauthorized`
- `forbidden`
- `not_found`
- `validation_error`
- `conflict`
- `rate_limited`
- `internal_error`

## Meta
Gunakan untuk data tambahan non-domain (pagination, cursor, dsb).
```
jsonSuccess({ items }, 'OK', { meta: { page, totalPages } });
```

## Testing
Update seluruh test untuk memeriksa `success === true/false` dan struktur `data`.

---
Dokumen ini akan diperbarui jika ada perubahan standar.
