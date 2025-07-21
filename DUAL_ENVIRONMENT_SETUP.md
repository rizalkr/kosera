# Dual Environment Setup Guide

## Overview
Proyek Kosera dapat berjalan di **2 lingkungan**:
1. **Local Development** - menggunakan PostgreSQL lokal
2. **Docker Environment** - menggunakan Docker containers

## Environment Files

### 1. Local Development: `.env.local`
```bash
# Database menggunakan localhost
DATABASE_URL=postgresql://kosera:kosera123@localhost:5432/kosera
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

### 2. Docker Environment: `.env`
```bash
# Database menggunakan Docker hostname 'db'
DATABASE_URL=postgresql://kosera:kosera123@db:5432/kosera
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

## Commands

### Local Development Commands
Gunakan commands ini ketika bekerja di **local environment** (PostgreSQL sudah terinstall di sistem):

```bash
# Database operations
npm run db:generate     # Generate migration files
npm run db:migrate      # Apply migrations ke local DB
npm run db:push         # Push schema langsung ke local DB
npm run db:studio       # Buka Drizzle Studio untuk local DB
npm run db:seed         # Seed data ke local DB
npm run db:seed-photos  # Seed photos ke local DB

# Development
npm run dev             # Start Next.js dev server

# Testing
npm run test            # Run tests locally
npm run test:unit       # Run unit tests
npm run test:integration # Run integration tests
```

### Docker Environment Commands
Gunakan commands ini ketika bekerja di **Docker environment**:

```bash
# Database operations
npm run docker:db:generate     # Generate migration files di container
npm run docker:db:migrate      # Apply migrations ke Docker DB
npm run docker:db:push         # Push schema ke Docker DB
npm run docker:db:studio       # Buka Drizzle Studio untuk Docker DB
npm run docker:db:seed         # Seed data ke Docker DB
npm run docker:db:seed-photos  # Seed photos ke Docker DB

# Development
npm run docker:dev          # Start dengan Docker Compose
npm run docker:dev:detach   # Start Docker Compose di background
npm run docker:dev:down     # Stop Docker containers
npm run docker:dev:clean    # Stop dan remove volumes

# Testing
npm run docker:test            # Run tests di container
npm run docker:test:unit       # Run unit tests di container
npm run docker:test:integration # Run integration tests di container
```

## Setup Instructions

### Setup Local Development

1. **Install PostgreSQL lokal**:
   ```bash
   # Ubuntu/Debian
   sudo apt install postgresql postgresql-contrib
   
   # macOS dengan Homebrew
   brew install postgresql
   ```

2. **Create database dan user**:
   ```sql
   sudo -u postgres psql
   CREATE USER kosera WITH PASSWORD 'kosera123';
   CREATE DATABASE kosera OWNER kosera;
   GRANT ALL PRIVILEGES ON DATABASE kosera TO kosera;
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Run migrations**:
   ```bash
   npm run db:migrate
   ```

5. **Seed data** (opsional):
   ```bash
   npm run db:seed
   npm run db:seed-photos
   ```

6. **Start development**:
   ```bash
   npm run dev
   ```

### Setup Docker Environment

1. **Pastikan Docker dan Docker Compose terinstall**

2. **Start dengan Docker**:
   ```bash
   npm run docker:dev
   ```

3. **Migrations sudah otomatis dijalankan di container**

4. **Seed data** (opsional):
   ```bash
   npm run docker:db:seed
   npm run docker:db:seed-photos
   ```

## How It Works

### Smart Environment Detection
File `drizzle.config.ts` secara otomatis mendeteksi environment:
1. Prioritas pertama: load `.env.local` (untuk local development)
2. Jika `.env.local` tidak ada/tidak lengkap: load `.env` (untuk Docker)

### Database Connections
- **Local**: `postgresql://kosera:kosera123@localhost:5432/kosera`
- **Docker**: `postgresql://kosera:kosera123@db:5432/kosera`

### Commands Structure
- `db:*` - untuk local development
- `docker:db:*` - untuk Docker environment
- `docker:*` - untuk Docker operations

## Troubleshooting

### Error: "getaddrinfo EAI_AGAIN db"
- Anda mencoba menjalankan command local (`npm run db:*`) tetapi config mengarah ke Docker
- **Solution**: Pastikan menggunakan command yang tepat untuk environment Anda

### Error: "Connection refused localhost:5432"
- PostgreSQL lokal tidak berjalan atau belum diinstall
- **Solution**: Install dan start PostgreSQL lokal, atau gunakan Docker environment

### Error: "database does not exist"
- Database belum dibuat
- **Solution**: Buat database sesuai instruksi setup

## Testing Both Environments

### Test Local Environment
```bash
# 1. Check if local PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS

# 2. Test database connection
npm run db:generate

# 3. Expected output: "No schema changes, nothing to migrate 😴"
```

### Test Docker Environment
```bash
# 1. Start Docker environment
npm run docker:dev:detach

# 2. Wait for containers to be ready (check logs)
docker logs kosera-app
docker logs kosera-db

# 3. Test database operations
npm run docker:db:generate

# 4. Clean up
npm run docker:dev:down
```

## Current Status ✅
- ✅ Dual environment setup completed
- ✅ Smart environment detection implemented
- ✅ Database migrations working in both environments
- ✅ All commands properly configured
- ✅ Ready for development in both local and Docker environments
