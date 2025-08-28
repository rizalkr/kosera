# Kosera API Documentation

[![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-0.44.2-green)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-blue)](https://www.postgresql.org/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest-yellow)](https://vitest.dev/)

**Kosera API** adalah platform API pencarian dan manajemen kos (boarding house) berbasis Next.js (App Router) dengan TypeScript, PostgreSQL 16, dan Drizzle ORM. Menyediakan endpoint komprehensif untuk autentikasi, manajemen pengguna, properti (kos), favorit, review, booking, analitik, serta operasi administrasi lanjutan (soft delete, restore, dan permanent delete).

## Dokumentasi

- **[API Documentation](./blob/docs/api/api-documentation.md)**
- **[Database Schema](./blob/docs/api/database-design.md)**
- **[Testing Guide](./blob/docs/testing/testing-guide.md)**
- **[Deployment Guide](./blob/docs/deployment/deployment-guide.md)**
- **[Implementation Guide](./blob/docs/implementation/)**
- **[Documentation Index](./blob/docs/README.md)**

## Struktur Type & Schema (Terbaru)

Seluruh definisi tipe dan schema Zod telah dipisah agar lebih modular:
- `src/types/kos.ts` – schema dan tipe publik/admin kos
- `src/types/seller-kos.ts` – schema detail kos untuk seller (extend admin kos + statistik)
- `src/lib/api/admin.ts` – hanya menyimpan schema respons admin (duplikasi schema kos dihapus)
- `src/types/` lainnya – konsolidasi tipe domain

Refactor ini mengurangi duplikasi (`adminKosDataSchema` ganda dihapus), menghilangkan cast tidak aman, dan menghapus variabel tidak terpakai untuk menjaga codebase lint-clean.

## Quick API Reference

### Base URL
```
Local: http://localhost:3000
Production: https://your-domain.com
```

### Authentication Header
```
Authorization: Bearer <jwt-token>
```

## Ringkasan Endpoint

### Auth
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | /api/auth/register | Registrasi pengguna |
| POST | /api/auth/login | Login & issue JWT |
| GET  | /api/auth/verify | Verifikasi token |

### Profil & User (Authenticated)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /api/user/profile | Profil pengguna saat ini |
| PUT | /api/user/password | Ganti password |
| GET | /api/user/favorites | List favorit (pagination, filter) |
| POST | /api/user/favorites | Tambah favorit |
| DELETE | /api/user/favorites | Hapus favorit |

### Admin - Users
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /api/admin/users | List users (search, role, showDeleted) |
| POST | /api/admin/users | Buat user baru |
| GET | /api/admin/users/:id | Detail user |
| PUT | /api/admin/users/:id | Update user |
| DELETE | /api/admin/users/:id | Soft delete user |
| PATCH | /api/admin/users/:id | Restore user |

### Admin - Kos Management
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /api/admin/kos | List kos (filter, sort) |
| PATCH | /api/admin/kos/:id/featured | Toggle featured |
| DELETE | /api/admin/kos/:id | Soft delete (archive) |
| PATCH | /api/admin/kos/:id/restore | Restore dari archive |
| DELETE | /api/admin/kos/:id/permanent | Permanent delete (hanya archived) |
| POST | /api/admin/kos/bulk | Bulk soft delete |
| DELETE | /api/admin/kos/bulk | Bulk permanent delete archived |
| DELETE | /api/admin/kos/cleanup | Hapus semua archived |

### Seller
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /api/seller/dashboard | Statistik agregat seller |
| GET | /api/seller/kos/:id | Detail kos milik seller (dengan statistik) |
| GET | /api/kos/my | List kos milik current user (seller/admin) |

### Public Kos & Discovery
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /api/kos | List publik dengan filter harga/kota |
| GET | /api/kos/:id | Detail kos publik (review + statistik) |
| GET | /api/kos/:id/availability | Cek ketersediaan |
| POST | /api/kos/:id/view | Increment view count (rate limited) |
| GET | /api/kos/featured | Featured kos random |
| GET | /api/kos/nearby | Nearby kos (geo search) |
| GET | /api/kos/recommendations | Rekomendasi (filter harga/kota) |
| GET | /api/kos/search | Pencarian lanjutan (query, rating, sort) |

### Reviews
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /api/kos/:id/reviews | List review |
| POST | /api/kos/:id/reviews | Tambah review (auth) |

### Photos
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /api/kos/:id/photos | List foto |
| POST | /api/kos/:id/photos | Tambah foto (auth owner) |
| DELETE | /api/kos/:id/photos | Hapus foto |
| PUT | /api/kos/:id/photos/:photoId/primary | Set primary |
| POST | /api/kos/:id/photos/upload | Upload file (cloud) |

### Bookings
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /api/bookings | List booking (user atau admin) |
| POST | /api/bookings | Buat booking |
| GET | /api/bookings/:id | Detail booking |
| PUT | /api/bookings/:id | Update status booking |
| DELETE | /api/bookings/:id | Hapus booking (admin) |

### Geocode
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /api/geocode | Resolusi alamat (rate limited) |

## Tech Stack

- Framework: Next.js 15.3.1 (App Router)
- Language: TypeScript (strict, tanpa any tidak perlu)
- Database: PostgreSQL 16 + Drizzle ORM
- Auth: JWT + bcryptjs
- Validation: Zod
- Testing: Vitest + Supertest
- Styling (frontend pages): Tailwind CSS

## Perubahan Terbaru (Agustus 28, 2025)

| Kategori | Ringkasan |
|----------|-----------|
| Refactor Types | Ekstraksi schema kos & seller ke `src/types` (menghapus duplikasi) |
| Admin API | Penambahan operasi archive/restore/permanent + bulk + cleanup |
| User Management | Soft delete + restore, audit fields (createdBy, deletedBy) dalam list |
| Analytics | Unified analytics response schema typed via Zod |
| Seller Detail | Schema khusus seller (`sellerKosDetailSchema`) termasuk statistik opsional |
| Type Safety | Penghapusan cast any tidak aman, variabel & import tidak terpakai dibersihkan |
| Booking Modal | Transformasi aman ke `PublicKosData` tanpa unsafe cast langsung |
| Lint | Semua file bebas error/warning ESLint (no-unused-vars, no-explicit-any) |
| Modularisasi | Pemisahan hooks, features, components, dan types lebih konsisten |

## Contoh Respons Sukses
```json
{
  "message": "Operation successful",
  "data": { },
  "timestamp": "2025-08-28T10:00:00.000Z"
}
```

## Contoh Respons Error
```json
{
  "error": "Resource not found",
  "status": 404
}
```

## Status Code Utama
- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 500 Internal Server Error

## Keamanan

- JWT (7 hari) dengan verifikasi middleware
- Hash password (bcryptjs 12 salt rounds)
- Soft delete untuk users & kos (field `deletedAt`) + restore
- Validasi input Zod sebelum operasi DB
- Query parameterized via Drizzle (mencegah SQL injection)
- Rate limiting sederhana (view counter & geocode)

## Testing

Gunakan Vitest untuk unit, integrasi, dan performance. Struktur test berada di `src/tests` dengan kategori terpisah (unit, api, integration, performance, dll).

## Kontribusi

1. Fork repository
2. Buat branch: `git checkout -b feat/nama-fitur`
3. Commit: `feat(scope): deskripsi singkat` (Conventional Commits)
4. Push & buka Pull Request

Standar kode:
- TypeScript strict
- ESLint + Prettier
- Hindari any
- Tambah test & dokumentasi untuk endpoint baru

## Support

- API Docs: ./blob/docs/api/api-documentation.md
- Database Schema: ./blob/docs/api/database-design.md
- Testing Guide: ./blob/docs/testing/testing-guide.md
- Deployment Guide: ./blob/docs/deployment/deployment-guide.md
- Implementation Guides: ./blob/docs/implementation/
- Index: ./blob/docs/README.md

## Metadata

API Version: 1.0.0  
Last Updated: August 28, 2025  
License: MIT  
Node.js: >= 18.0.0  
Database: PostgreSQL 16+

---

Untuk detail lebih lanjut silakan lihat dokumentasi lengkap di folder `blob/docs/`.

