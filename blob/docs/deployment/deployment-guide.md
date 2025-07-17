# 🚀 Kosera Deployment Guide

## Overview
This guide covers deploying the Kosera API to various environments including development, staging, and production. The application is built with Next.js and can be deployed to multiple platforms.

## Prerequisites

### System Requirements
- **Node.js**: 18.0.0 or higher
- **PostgreSQL**: 14.0 or higher
- **Memory**: Minimum 1GB RAM
- **Storage**: 10GB available space
- **Network**: HTTPS capability for production

### Required Environment Variables
```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Security
JWT_SECRET=your-super-secret-jwt-key-here

# Application Settings
NODE_ENV=production
PORT=3000

# Optional: Database SSL
DATABASE_SSL=true

# Optional: Logging
LOG_LEVEL=info
```

## Local Development Setup

### 1. Clone and Install
```bash
git clone https://github.com/yourusername/kosera.git
cd kosera
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 3. Database Setup
```bash
# Start PostgreSQL (using Docker)
docker run -d --name kosera-db \
  -p 5432:5432 \
  -e POSTGRES_DB=kosera \
  -e POSTGRES_USER=kosera \
  -e POSTGRES_PASSWORD=your-password \
  postgres:14

# Generate database schema
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with test data
npm run db:seed
```

### 4. Start Development Server
```bash
# Start with hot reload
npm run dev

# Start with Turbopack (faster)
npm run dev --turbo

# Access at http://localhost:3000
```

## Production Deployment

### Platform Options

#### 1. Vercel (Recommended)
**Advantages:**
- Built-in Next.js optimization
- Automatic SSL certificates
- Global CDN
- Zero-configuration deployments

**Setup:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Configure environment variables in Vercel dashboard
vercel env add DATABASE_URL
vercel env add JWT_SECRET
```

**vercel.json:**
```json
{
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  },
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  }
}
```

#### 2. Railway
**Advantages:**
- PostgreSQL database included
- Automatic deployments from Git
- Simple pricing model

**Setup:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

**railway.json:**
```json
{
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health"
  }
}
```

#### 3. Digital Ocean App Platform
**Advantages:**
- Competitive pricing
- Database clusters available
- Built-in monitoring

**Setup:**
```yaml
# .do/app.yaml
name: kosera-api
services:
- name: api
  source_dir: /
  github:
    repo: yourusername/kosera
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  env:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    value: ${kosera-db.DATABASE_URL}
  - key: JWT_SECRET
    value: ${JWT_SECRET}

databases:
- name: kosera-db
  engine: PG
  version: "14"
```

#### 4. AWS (Advanced)
**Components:**
- **Compute**: ECS Fargate or Lambda
- **Database**: RDS PostgreSQL
- **Load Balancer**: Application Load Balancer
- **Storage**: S3 for static assets

**Docker Setup:**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["npm", "start"]
```

## Database Deployment

### 1. Managed PostgreSQL (Recommended)
**Providers:**
- **Vercel Postgres**: Integrated with Vercel
- **Railway PostgreSQL**: Automatic backup
- **Digital Ocean Database**: Managed clusters
- **AWS RDS**: High availability options

**Setup Example (Railway):**
```bash
# Add PostgreSQL service
railway add --database postgresql

# Get connection string
railway variables
```

### 2. Self-Managed PostgreSQL
**Requirements:**
- PostgreSQL 14+
- Regular backups
- SSL encryption
- Connection pooling

**Production Configuration:**
```sql
-- Create database
CREATE DATABASE kosera;

-- Create user
CREATE USER kosera_user WITH PASSWORD 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE kosera TO kosera_user;

-- Enable SSL
ALTER SYSTEM SET ssl = on;
```

### 3. Database Migrations
```bash
# Production migration workflow
npm run db:generate
npm run db:migrate

# Rollback if needed
npm run db:rollback
```

## Environment Configuration

### Environment Files
```bash
# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/kosera
JWT_SECRET=your-production-secret
PORT=3000
LOG_LEVEL=warn

# .env.staging
NODE_ENV=staging
DATABASE_URL=postgresql://user:pass@staging-host:5432/kosera_staging
JWT_SECRET=your-staging-secret
PORT=3000
LOG_LEVEL=info
```

### Configuration Validation
```typescript
// src/lib/config.ts
import { z } from 'zod';

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().default(3000),
});

export const config = configSchema.parse(process.env);
```

## Security Configuration

### 1. SSL/TLS Setup
```bash
# Generate SSL certificate (Let's Encrypt)
certbot certonly --webroot -w /var/www/html -d yourdomain.com

# Configure Nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. Security Headers
```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000');
  
  return response;
}
```

### 3. Rate Limiting
```typescript
// lib/rate-limit.ts
import { NextRequest } from 'next/server';

const rateLimit = new Map();

export function checkRateLimit(request: NextRequest, limit: number = 100) {
  const ip = request.ip || 'anonymous';
  const current = rateLimit.get(ip) || 0;
  
  if (current > limit) {
    return false;
  }
  
  rateLimit.set(ip, current + 1);
  
  // Reset after 1 hour
  setTimeout(() => rateLimit.delete(ip), 3600000);
  
  return true;
}
```

## Monitoring and Logging

### 1. Application Monitoring
```typescript
// lib/monitoring.ts
import { NextRequest, NextResponse } from 'next/server';

export function logRequest(request: NextRequest, response: NextResponse) {
  const log = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    status: response.status,
    userAgent: request.headers.get('user-agent'),
    ip: request.ip,
  };
  
  console.log(JSON.stringify(log));
}
```

### 2. Health Checks
```typescript
// pages/api/health.ts
export default function handler(req: NextRequest, res: NextResponse) {
  // Check database connection
  const dbStatus = await checkDatabaseConnection();
  
  if (!dbStatus) {
    return res.status(503).json({ status: 'unhealthy', database: 'down' });
  }
  
  return res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  });
}
```

### 3. Error Tracking
```typescript
// lib/error-tracking.ts
export function reportError(error: Error, context: any) {
  const errorReport = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };
  
  // Send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry, LogRocket, etc.
    console.error('ERROR:', errorReport);
  }
}
```

## Performance Optimization

### 1. Database Optimization
```typescript
// Database connection pooling
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 2. Caching Strategy
```typescript
// lib/cache.ts
const cache = new Map();

export function getFromCache(key: string) {
  const item = cache.get(key);
  if (item && Date.now() < item.expiry) {
    return item.data;
  }
  cache.delete(key);
  return null;
}

export function setCache(key: string, data: any, ttl: number = 300000) {
  cache.set(key, {
    data,
    expiry: Date.now() + ttl,
  });
}
```

### 3. Build Optimization
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  
  experimental: {
    serverComponentsExternalPackages: ['pg', 'bcryptjs'],
  },
  
  // Bundle analyzer
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
};

module.exports = nextConfig;
```

## Backup and Recovery

### 1. Database Backups
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="kosera"

# Create backup
pg_dump $DATABASE_URL > "$BACKUP_DIR/kosera_backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/kosera_backup_$DATE.sql"

# Keep only last 7 days
find $BACKUP_DIR -name "kosera_backup_*.sql.gz" -mtime +7 -delete

# Upload to cloud storage (optional)
aws s3 cp "$BACKUP_DIR/kosera_backup_$DATE.sql.gz" s3://kosera-backups/
```

### 2. Application Backups
```bash
#!/bin/bash
# backup-app.sh

# Backup source code
tar -czf "kosera-app-$(date +%Y%m%d).tar.gz" \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  /path/to/kosera/

# Backup environment files
cp .env.production "/backups/env-$(date +%Y%m%d).backup"
```

## Scaling Considerations

### 1. Horizontal Scaling
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000-3002:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
    deploy:
      replicas: 3
      
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
```

### 2. Load Balancing
```nginx
# nginx.conf
upstream kosera_app {
    server app:3000;
    server app:3001;
    server app:3002;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://kosera_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
# Check connection
psql $DATABASE_URL -c "SELECT 1"

# Test from application
npm run test-db
```

**Memory Issues**
```bash
# Monitor memory usage
free -h

# Check application memory
ps aux | grep node
```

**SSL Certificate Issues**
```bash
# Test SSL
openssl s_client -connect yourdomain.com:443

# Renew certificate
certbot renew
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm start

# Check logs
tail -f /var/log/kosera/app.log
```

## Security Checklist

### Production Security
- [ ] SSL/TLS certificates configured
- [ ] Database connections encrypted
- [ ] JWT secrets are secure (32+ characters)
- [ ] Rate limiting implemented
- [ ] Security headers configured
- [ ] Input validation on all endpoints
- [ ] Regular security updates
- [ ] Backup encryption enabled
- [ ] Access logs monitored
- [ ] Error messages don't leak sensitive data

### Infrastructure Security
- [ ] Firewall configured
- [ ] Database access restricted
- [ ] Regular security patches
- [ ] Monitoring alerts configured
- [ ] Incident response plan documented

---

**Last Updated:** July 3, 2025
**Deployment Target:** Next.js 15.3.1
**Minimum Node.js:** 18.0.0
**Database:** PostgreSQL 14+
