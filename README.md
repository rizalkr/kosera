# 🚀 Kosera API Documentation

[![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-0.44.2-green)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)](https://www.postgresql.org/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest-yellow)](https://vitest.dev/)

**Kosera API** is a robust boarding house (kos) rental platform API built with Next.js, TypeScript, and PostgreSQL. This API provides comprehensive endpoints for user management, authentication, property listings, and bookings.

## 📚 Documentation

- **[📖 API Documentation](./blob/docs/api/api-documentation.md)** - Complete API reference with examples
- **[🗄️ Database Schema](./blob/docs/api/database-design.md)** - Database design and relationships
- **[🧪 Testing Guide](./blob/docs/testing/testing-guide.md)** - Comprehensive testing documentation
- **[🚀 Deployment Guide](./blob/docs/deployment/deployment-guide.md)** - Production deployment instructions
- **[🏗️ Implementation Guide](./blob/docs/implementation/)** - Feature implementation documentation
- **[📋 Documentation Index](./blob/docs/README.md)** - Complete documentation overview

## 🔗 Quick API Reference

### Base URL
```
Local Development: http://localhost:3000
Production: https://your-domain.com
```

### Authentication
All protected endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```
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
## 🔗 API Endpoints Overview

### 🔐 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/auth/verify` | Verify JWT token |

### 👤 User Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/user/profile` | Get user profile | ✅ |

### 👨‍💼 Admin Operations
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/admin/users` | Get all users | ✅ Admin |

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.1 (App Router)
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with bcryptjs
- **Testing**: Vitest + Supertest
- **Validation**: Zod schemas
- **API**: RESTful with Next.js API routes

## 🚀 Quick Start

### Prerequisites
```bash
# Node.js 18 or higher
node --version  # v18.0.0+

# PostgreSQL 15 or higher
psql --version  # PostgreSQL 15+
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

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Required Environment Variables:**
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/kosera"

# JWT Security
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Application
NODE_ENV="development"
PORT=3000
```
### 4. Database Setup
```bash
# Start PostgreSQL (using Docker)
docker run -d --name kosera-db \
  -p 5432:5432 \
  -e POSTGRES_DB=kosera \
  -e POSTGRES_USER=kosera \
  -e POSTGRES_PASSWORD=your-password \
  postgres:14

# Generate and run migrations
npm run db:generate
npm run db:migrate

# (Optional) Seed database with test data
npm run db:seed
```

### 5. Start Development Server
```bash
# Standard development mode
npm run dev

# With Turbopack (faster)
npm run dev --turbo

# Access API at http://localhost:3000
```

## 📝 API Usage Examples

### User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "username": "johndoe",
    "contact": "john@example.com",
    "password": "securepassword123",
    "role": "RENTER"
  }'
```

### User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepassword123"
  }'
```

### Access Protected Endpoint
```bash
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```

## 🧪 Testing

### Run All Tests
```bash
# Complete test suite
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Performance tests
npm run test:performance

# Test coverage
npm run test:coverage
```

### Test Categories
- **Unit Tests**: Individual function testing
- **Integration Tests**: End-to-end API testing
- **Performance Tests**: Load and response time testing
- **Security Tests**: Authentication and authorization testing

## 🗄️ Database Schema

### Current Tables
- **users**: User accounts and authentication
- **posts**: Property listings
- **kos**: Property details

### Planned Extensions
- **bookings**: Reservation management
- **reviews**: User reviews and ratings
- **payments**: Payment processing
- **favorites**: Saved properties

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with 7-day expiry
- Password hashing using bcryptjs (12 salt rounds)
- Role-based access control (ADMIN, SELLER, RENTER)
- Secure token verification middleware

### API Security
- Input validation on all endpoints
- SQL injection prevention with parameterized queries
- Rate limiting (recommended for production)
- CORS configuration
- Security headers

## 📊 API Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { /* response data */ },
  "timestamp": "2025-07-03T16:30:00.000Z"
}
```

### Error Response
```json
{
  "error": "Error message description",
  "status": 400
}
```

### HTTP Status Codes
- `200` OK - Request successful
- `201` Created - Resource created
- `400` Bad Request - Invalid input
- `401` Unauthorized - Authentication required
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource not found
- `409` Conflict - Resource already exists
- `500` Internal Server Error - Server error

## 🚀 Deployment

### Environment Setup
```bash
# Production environment
NODE_ENV=production
DATABASE_URL=<production-database-url>
JWT_SECRET=<secure-production-secret>
```

### Deployment Platforms
- **Vercel** (Recommended): Zero-config deployment
- **Railway**: Includes PostgreSQL database
- **Digital Ocean**: App Platform with managed database
- **AWS**: ECS/Lambda with RDS

### Build Commands
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📈 Performance

### Response Time Targets
- Authentication: < 500ms
- Profile retrieval: < 200ms
- Admin operations: < 300ms

### Optimization Features
- Database connection pooling
- Query optimization with Drizzle ORM
- JWT token caching
- Efficient error handling

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards
- TypeScript for type safety
- ESLint + Prettier for code formatting
- Comprehensive test coverage (>85%)
- API documentation for new endpoints

## 📞 Support

### Getting Help
- 📖 [API Documentation](./blob/docs/api/api-documentation.md)
- 🗄️ [Database Schema](./blob/docs/api/database-design.md)
- 🧪 [Testing Guide](./blob/docs/testing/testing-guide.md)
- 🚀 [Deployment Guide](./blob/docs/deployment/deployment-guide.md)
- 🏗️ [Implementation Guides](./blob/docs/implementation/)
- 📋 [All Documentation](./blob/docs/README.md)

### Issue Reporting
- Use GitHub Issues for bug reports
- Include API endpoint and request details
- Provide error logs and expected behavior

---

**API Version:** 1.0.0  
**Last Updated:** July 3, 2025  
**License:** MIT  
**Node.js:** >= 18.0.0  
**Database:** PostgreSQL 14+

