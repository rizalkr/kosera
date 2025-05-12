# 📦 Database Design: Kosera

## 1. users
Menyimpan data pengguna aplikasi (penyewa & pemilik/seller).

| Field      | Type      | Keterangan                        |
|------------|-----------|------------------------------------|
| id         | integer   | Primary key, auto-increment        |
| name       | varchar   | Nama lengkap user                  |
| username   | varchar   | Username unik                      |
| contact    | varchar   | Kontak (email/telepon)             |
| role       | varchar   | Role user (admin, seller, renter)  |
| password   | varchar   | Password terenkripsi               |
| created_at | timestamp | Waktu registrasi                   |

---

## 2. posts
Iklan/postingan kos yang dibuat oleh seller.

| Field           | Type      | Keterangan                       |
|-----------------|-----------|-----------------------------------|
| id              | integer   | Primary key, auto-increment       |
| user_id         | integer   | Relasi ke users (pemilik post)    |
| title           | varchar   | Judul post                        |
| description     | text      | Deskripsi post                    |
| price           | integer   | Harga                             |
| total_post      | integer   | Total post oleh user              |
| total_penjualan | integer   | Total penjualan dari post         |
| created_at      | timestamp | Tanggal dibuat                    |
| updated_at      | timestamp | Tanggal update terakhir           |

---

## 3. kos
Detail kos yang diiklankan.

| Field         | Type      | Keterangan                       |
|---------------|-----------|-----------------------------------|
| id            | integer   | Primary key, auto-increment       |
| post_id       | integer   | Relasi ke posts                   |
| name          | varchar   | Nama kos                          |
| address       | text      | Alamat                            |
| city          | varchar   | Kota                              |
| facilities    | text      | Fasilitas kos                     |
| total_booking | integer   | Total booking                     |
| rating        | float     | Rata-rata rating                  |
| ulasan        | text      | Ulasan                            |
| available     | boolean   | Status ketersediaan               |
| created_at    | timestamp | Tanggal dibuat                    |

---

## 4. bookings
Data pemesanan kos oleh user.

| Field        | Type      | Keterangan                       |
|--------------|-----------|-----------------------------------|
| id           | integer   | Primary key, auto-increment       |
| user_id      | integer   | Relasi ke users (penyewa)         |
| kos_id       | integer   | Relasi ke kos                     |
| booking_date | date      | Tanggal booking                   |
| status       | varchar   | Status booking (pending, paid, etc)|
| total_price  | integer   | Total harga booking               |

---

## 5. reviews
Ulasan dan rating dari user ke kos.

| Field      | Type      | Keterangan                       |
|------------|-----------|-----------------------------------|
| id         | integer   | Primary key, auto-increment       |
| user_id    | integer   | Relasi ke users                   |
| kos_id     | integer   | Relasi ke kos                     |
| rating     | integer   | Nilai rating                      |
| comment    | text      | Komentar/ulasan                   |
| created_at | timestamp | Tanggal ulasan                    |

---

## 6. images
Foto-foto kos.

| Field       | Type      | Keterangan                       |
|-------------|-----------|-----------------------------------|
| id          | integer   | Primary key, auto-increment       |
| kos_id      | integer   | Relasi ke kos                     |
| url         | varchar   | URL gambar                        |
| description | varchar   | Deskripsi gambar                  |

---

## 7. payments
Data pembayaran booking.

| Field      | Type      | Keterangan                       |
|------------|-----------|-----------------------------------|
| id         | integer   | Primary key, auto-increment       |
| booking_id | integer   | Relasi ke bookings                |
| amount     | integer   | Jumlah pembayaran                 |
| status     | varchar   | Status pembayaran                 |
| paid_at    | timestamp | Tanggal pembayaran                |

---

## 8. favorites
Kos yang disimpan user.

| Field      | Type      | Keterangan                       |
|------------|-----------|-----------------------------------|
| id         | integer   | Primary key, auto-increment       |
| user_id    | integer   | Relasi ke users                   |
| kos_id     | integer   | Relasi ke kos                     |
| created_at | timestamp | Tanggal ditambahkan ke favorit    |

---

## Relasi Utama

- **users** → **posts** (1:M)
- **posts** → **kos** (1:1)
- **kos** → **bookings**, **reviews**, **images**, **favorites** (1:M)
- **bookings** → **payments** (1:1)

---