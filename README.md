# 🏠 Kosera - Platform Pencarian Kos Digital

[![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.6-38B2AC)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-0.44.2-green)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)](https://www.postgresql.org/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest-yellow)](https://vitest.dev/)

Kosera adalah platform modern untuk mencari dan mengelola kos (tempat tinggal sementara) dengan fitur pencarian canggih, peta interaktif, dan sistem manajemen yang komprehensif.

## ✨ Fitur Utama

### 🔍 **Pencarian & Filtrasi**
- Pencarian kos berdasarkan lokasi, harga, dan fasilitas
- Filter advanced dengan multiple criteria
- Peta interaktif dengan geolokasi
- Rekomendasi berbasis preferensi pengguna

### 👥 **Sistem Multi-Role**
- **Renter**: Pencari kos dengan akses pencarian dan booking
- **Seller**: Pemilik kos dengan dashboard manajemen properti
- **Admin**: Administrator dengan akses penuh sistem

### 🗺️ **Peta Interaktif**
- Integrasi React Leaflet dan OpenStreetMap
- Auto-detect lokasi pengguna
- Marker kos dengan detail popup
- Navigasi dan pencarian berbasis lokasi

### 🔐 **Autentikasi & Keamanan**
- JWT-based authentication
- Password hashing dengan bcryptjs
- Role-based access control (RBAC)
- Middleware security untuk API routes

### 📱 **Responsive Design**
- Mobile-first approach
- Modern UI dengan Tailwind CSS
- Interactive components dan animasi
- Cross-platform compatibility

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 15.3.1 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.1.6
- **Maps**: React Leaflet + Leaflet
- **UI Components**: Custom React components
- **Carousel**: Swiper.js

### **Backend**
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM 0.44.2
- **Authentication**: JWT + bcryptjs
- **Migration**: Drizzle Kit

### **Testing**
- **Framework**: Vitest 3.2.4
- **Integration**: Supertest
- **Coverage**: @vitest/ui
- **Performance**: Custom load testing
- **Mocking**: Node mocks HTTP

### **Development Tools**
- **Package Manager**: npm
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript
- **Build Tool**: Next.js (Turbopack)
- **Database Studio**: Drizzle Studio

## 🚀 Quick Start

### Prerequisites

Pastikan Anda memiliki tools berikut terinstall:

```bash
# Node.js 18 atau lebih baru
node --version  # v18.0.0+

# PostgreSQL 15 atau lebih baru
psql --version  # PostgreSQL 15+

# npm (biasanya sudah include dengan Node.js)
npm --version
```

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/kosera.git
cd kosera
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Edit file .env dengan konfigurasi Anda
nano .env
```

**Konfigurasi Environment Variables:**

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/kosera"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"
POSTGRES_USER="your_username"
POSTGRES_PASSWORD="your_password"
POSTGRES_DATABASE="kosera"

# JWT Secret (gunakan string random yang kuat)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Node Environment
NODE_ENV="development"
```

### 4. Setup Database

```bash
# Generate database schema
npm run db:generate

# Push schema ke database
npm run db:push

# (Optional) Seed database dengan data contoh
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📁 Struktur Proyek

```
kosera/
├── 📂 src/
│   ├── 📂 app/                 # Next.js App Router
│   │   ├── 📂 api/            # API Routes
│   │   │   ├── 📂 auth/       # Authentication endpoints
│   │   │   ├── 📂 user/       # User management
│   │   │   └── 📂 admin/      # Admin operations
│   │   ├── 📂 bookings/       # Booking pages
│   │   ├── 📂 services/       # Service pages
│   │   ├── 📄 layout.tsx      # Root layout
│   │   └── 📄 page.tsx        # Homepage
│   ├── 📂 components/         # React Components
│   │   ├── 📂 maps/           # Map components
│   │   ├── 📄 Header.tsx      # Navigation header
│   │   ├── 📄 Footer.tsx      # Site footer
│   │   └── 📄 FilterBar.tsx   # Search filters
│   ├── 📂 db/                 # Database layer
│   │   ├── 📄 schema.ts       # Drizzle schema
│   │   ├── 📄 index.ts        # DB connection
│   │   └── 📄 seed.ts         # Data seeding
│   └── 📂 lib/                # Utilities
│       ├── 📄 auth.ts         # Auth utilities
│       └── 📄 middleware.ts   # API middleware
├── 📂 tests/                  # Test suite
│   ├── 📂 unit/               # Unit tests
│   ├── 📂 integration/        # Integration tests
│   ├── 📂 performance/        # Performance tests
│   └── 📂 auth/               # Auth-specific tests
├── 📂 docs/                   # Documentation
├── 📂 public/                 # Static assets
├── 📄 package.json            # Dependencies
├── 📄 drizzle.config.ts       # Database config
├── 📄 vitest.config.ts        # Test config
└── 📄 README.md               
```

## 🔧 Available Scripts

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Operations
```bash
npm run db:generate  # Generate migration files
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio (Database GUI)
npm run db:seed      # Seed database with sample data
npm run db:drop      # Drop all database tables
```

### Testing
```bash
npm test                    # Run all tests in watch mode
npm run test:run           # Run all tests once
npm run test:unit          # Run unit tests only
npm run test:integration   # Run integration tests
npm run test:performance   # Run performance tests
npm run test:coverage      # Run tests with coverage report
npm run test:ui            # Open Vitest UI
npm run test:all           # Run comprehensive test suite
```

### Manual Testing
```bash
npm run test:auth-manual    # Manual auth API testing
npm run test-db            # Database connection test
npm run test-drizzle       # Drizzle ORM test
```

## 📊 API Documentation

### Authentication Endpoints

#### `POST /api/auth/register`
Registrasi user baru

**Request Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "contact": "john@example.com",
  "password": "securepassword123",
  "role": "RENTER" // ADMIN | SELLER | RENTER
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe",
    "contact": "john@example.com",
    "role": "RENTER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `POST /api/auth/login`
Login user

**Request Body:**
```json
{
  "username": "johndoe", // atau email
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": { /* user data */ },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `GET /api/auth/verify`
Verifikasi JWT token

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "message": "Token is valid",
  "user": {
    "userId": 1,
    "username": "johndoe",
    "role": "RENTER"
  }
}
```

### User Endpoints

#### `GET /api/user/profile`
Mengambil profile user yang sedang login

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Profile retrieved successfully",
  "user": {
    "userId": 1,
    "username": "johndoe",
    "role": "RENTER"
  }
}
```

### Admin Endpoints

#### `GET /api/admin/users`
Mengambil daftar semua user (Admin only)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "message": "Users retrieved successfully",
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "username": "johndoe",
      "contact": "john@example.com",
      "role": "RENTER",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## 🗃️ Database Schema

### Tabel Users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  contact TEXT NOT NULL,
  role user_role DEFAULT 'RENTER' NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### Tabel Posts
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  total_post INTEGER DEFAULT 0 NOT NULL,
  total_penjualan INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### Tabel Kos
```sql
CREATE TABLE kos (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  facilities TEXT
);
```

**Lihat dokumentasi lengkap database:** [Database Design](./docs/database-design.md)

## 🧪 Testing

Kosera memiliki test suite yang komprehensif dengan berbagai kategori testing:

### Test Categories

#### 🔧 Unit Tests
- API validation dan struktur request/response
- Security validation (password, email, token)
- Business logic dan role-based access control

#### 🔗 Integration Tests
- End-to-end API testing dengan Supertest
- Database integration testing
- Authentication flow lengkap

#### ⚡ Performance Tests
- Response time measurement
- Memory leak detection
- Concurrent operations testing
- Large payload handling

#### 🛡️ Route-specific Tests
- Authentication endpoints
- User management
- Admin operations
- Middleware testing

### Running Tests

```bash
# Run all tests dengan watch mode
npm test

# Run tests sekali (CI mode)
npm run test:run

# Run dengan coverage
npm run test:coverage

# Open test UI
npm run test:ui

# Run specific test category
npm run test:unit
npm run test:integration
npm run test:performance
```

### Test Results
```
✅ 95+ tests passing
✅ 100% API endpoint coverage
✅ Authentication & authorization testing
✅ Performance benchmarks
✅ Error handling scenarios
```

**Lihat dokumentasi lengkap testing:** [Testing README](./tests/README.md)

## 🌐 Features & Pages

### 🏠 Homepage (`/`)
- Hero section dengan search
- Featured kos listings
- Interactive map dengan geolocation
- Recommendation carousel

### 📋 Daftar Kos (`/list`)
- Comprehensive kos listings
- Advanced filtering system
- Sort by price, location, facilities
- Pagination dan infinite scroll

### 📅 Bookings (`/bookings`)
- User booking management
- Booking history
- Payment tracking
- Booking modification

### 🚚 Services
- **Angkut Barang** (`/services/angkutBarang`): Coming soon
- **Titip Barang** (`/services/titipBarang`): Coming soon

### 📞 Contact (`/contact`)
- Contact information
- Support channels
- FAQ section

### 📝 Complaint (`/complaint`)
- User complaint system
- Ticket management
- Support communication

## 🔒 Security Features

### Authentication & Authorization
- **JWT-based authentication** dengan secure token generation
- **Password hashing** menggunakan bcryptjs (12 salt rounds)
- **Role-based access control** (RBAC) dengan middleware
- **Token expiration** dan refresh mechanism

### API Security
- **Request validation** untuk semua endpoints
- **CORS configuration** untuk cross-origin requests
- **Rate limiting** untuk mencegah abuse
- **SQL injection protection** dengan Drizzle ORM

### Data Protection
- **Sensitive data filtering** dalam API responses
- **Environment variable protection**
- **Secure headers** dan CSP implementation

## 🎨 UI/UX Design

### Design System
- **Color Palette**: 
  - Primary: Blue (`#3B82F6`, `#60A5FA`)
  - Secondary: Teal (`#A9E4DE`, `#E1F6F2`)
  - Accent: Yellow (`#F3D17C`)
- **Typography**: Geist Sans & Geist Mono
- **Components**: Consistent design language
- **Responsive**: Mobile-first approach

### User Experience
- **Intuitive navigation** dengan breadcrumbs
- **Fast page loads** dengan Next.js optimization
- **Progressive enhancement** untuk offline capability
- **Accessibility** dengan ARIA labels dan keyboard navigation

## 🚀 Deployment

### Production Build
```bash
# Build aplikasi
npm run build

# Start production server
npm run start
```

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
DATABASE_URL=your_production_db_url
JWT_SECRET=your_super_secure_production_secret
```

### Recommended Platforms
- **Vercel**: Optimized untuk Next.js
- **Railway**: Database + app hosting
- **Heroku**: Traditional PaaS
- **AWS**: Full control dengan EC2/RDS

### Database Deployment
```bash
# Run migrations di production
npm run db:migrate

# Push schema changes
npm run db:push
```

## 🤝 Contributing

### Development Workflow
1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Coding Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Follow configured rules
- **Prettier**: Code formatting
- **Conventional Commits**: For commit messages

### Testing Requirements
- Write tests untuk new features
- Maintain test coverage > 80%
- Run test suite sebelum commit
- Update dokumentasi jika diperlukan

## 📈 Performance

### Metrics
- **Page Load**: < 2 seconds
- **API Response**: < 500ms average
- **Lighthouse Score**: 90+ overall
- **Core Web Vitals**: Green metrics

### Optimizations
- **Next.js Image Optimization**
- **Code Splitting** dengan dynamic imports
- **Database Query Optimization**
- **Caching Strategy** untuk static content

## 🛣️ Roadmap

### Phase 1 (Current)
- ✅ Basic authentication system
- ✅ Kos listing dan search
- ✅ Interactive maps
- ✅ Responsive design

### Phase 2 (Next)
- 🔄 Payment integration
- 🔄 Real-time notifications
- 🔄 Advanced filters
- 🔄 Mobile app (React Native)

### Phase 3 (Future)
- 📅 AI-powered recommendations
- 📅 Virtual tour integration
- 📅 Social features
- 📅 Multi-language support

## 📚 Documentation

- **API Documentation**: [API Docs](./docs/api.md)
- **Database Schema**: [Database Design](./docs/database-design.md)
- **Testing Guide**: [Testing README](./tests/README.md)
- **Deployment Guide**: [Deployment Docs](./docs/deployment.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: [Rizal Kurnia](https://github.com/rizalkr)
- **Designer**: [Rizal Kurnia](https://github.com/rizalkr)
- **Product Manager**: [Rizal Kurnia](https://github.com/rizalkr)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [React Leaflet](https://react-leaflet.js.org/) - Map components
- [Vitest](https://vitest.dev/) - Testing framework

---

**📞 Support**: Untuk pertanyaan atau dukungan, silakan buka [issue](https://github.com/yourusername/kosera/issues) atau hubungi tim pengembang.

**⭐ Star this repo** jika project ini membantu Anda!
