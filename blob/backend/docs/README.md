# Kosera Backend Development Documentation

Dokumentasi lengkap untuk pengembangan backend aplikasi Kosera - platform pencarian kos/boarding house.

## 📁 Struktur Dokumentasi

- [`development-progress.md`](./development-progress.md) - Progress keseluruhan pengembangan backend
- [`api-documentation.md`](./api-documentation.md) - Dokumentasi lengkap semua API endpoints
- [`search-api-tests.md`](./search-api-tests.md) - Dokumentasi pengujian untuk Search API
- [`database-schema.md`](./database-schema.md) - Dokumentasi skema database dan migrasi
- [`testing-strategy.md`](./testing-strategy.md) - Strategi pengujian dan coverage
- [`deployment-guide.md`](./deployment-guide.md) - Panduan deployment dan konfigurasi

## 🎯 Overview Proyek

Kosera adalah aplikasi web untuk pencarian kos/boarding house yang dibangun dengan:

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Testing**: Vitest
- **Authentication**: JWT
- **Geospatial**: PostGIS support

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup database
npm run db:push
npm run db:seed

# Run development server
npm run dev

# Run tests
npm run test:all
npm run test:search
```

## 📊 Current Status

✅ **Completed Features**:
- User authentication (register, login, verify)
- Kos CRUD operations
- Advanced search with filters, sorting, pagination
- Recommendations system
- Featured kos management
- Reviews and ratings
- Favorites system
- Photo upload management
- Booking system
- Geospatial/nearby search
- Admin analytics
- Comprehensive testing (unit + integration)

🔧 **In Progress**:
- Frontend integration
- Performance optimization
- Advanced analytics

📋 **Planned**:
- Push notifications
- Payment gateway integration
- Real-time chat
- Advanced reporting

## 🏗️ Architecture

```
src/
├── app/api/              # API routes (Next.js App Router)
│   ├── auth/            # Authentication endpoints
│   ├── kos/             # Kos management endpoints
│   ├── user/            # User management endpoints
│   ├── bookings/        # Booking management
│   └── admin/           # Admin endpoints
├── db/                  # Database configuration
│   ├── schema.ts        # Drizzle schema definitions
│   ├── index.ts         # Database connection
│   └── seed.ts          # Database seeding
├── lib/                 # Utility libraries
│   ├── auth.ts          # Authentication utilities
│   └── middleware.ts    # API middleware
└── components/          # React components (UI)

tests/
├── unit/                # Unit tests
├── integration/         # Integration tests
├── auth/                # Authentication tests
├── utils/               # Test utilities
└── performance/         # Performance tests
```

## 📈 Metrics & Performance

- **API Endpoints**: 25+ production-ready endpoints
- **Test Coverage**: 90%+ for core functionality
- **Test Cases**: 200+ automated tests
- **Response Time**: <500ms average for search API
- **Database**: Optimized with indexes and relations

## 🤝 Contributing

1. Lihat [`development-progress.md`](./development-progress.md) untuk status terkini
2. Periksa [`testing-strategy.md`](./testing-strategy.md) untuk panduan testing
3. Ikuti [`api-documentation.md`](./api-documentation.md) untuk API standards
4. Jalankan tests sebelum commit: `npm run test:all`

## 📞 Support

Untuk pertanyaan atau masalah:
- Review dokumentasi di folder ini
- Jalankan `npm run test:search` untuk debugging Search API
- Periksa logs di development console
- Lihat test results untuk debugging
