# 🐳 Docker Setup Guide for Kosera API

This guide explains how to set up and run Kosera API using Docker for both development and production environments.

## 📋 Prerequisites

- Docker Engine 20.x+
- Docker Compose 2.x+
- Git

## 🚀 Quick Start

### Development Environment

1. **Clone and navigate to project**
   ```bash
   git clone <repository-url>
   cd kosera
   ```

2. **Copy environment file**
   ```bash
   cp .env.docker .env
   ```

3. **Start development environment**
   ```bash
   npm run docker:dev
   ```

4. **Access the application**
   - API: http://localhost:3000
   - pgAdmin: http://localhost:5050 (admin@kosera.com / admin123)

### Production Environment

1. **Set production environment variables**
   ```bash
   cp .env.docker .env.production
   # Edit .env.production with production values
   ```

2. **Start production environment**
   ```bash
   npm run docker:prod
   ```

## 🛠️ Available Docker Commands

### Development Commands

```bash
# Start development environment
npm run docker:dev

# Start in detached mode (background)
npm run docker:dev:detach

# Stop development environment
npm run docker:dev:down

# Clean up (remove volumes and orphans)
npm run docker:dev:clean
```

### Production Commands

```bash
# Start production environment
npm run docker:prod

# Start in detached mode
npm run docker:prod:detach

# Stop production environment
npm run docker:prod:down
```

### Build Commands

```bash
# Build development image
npm run docker:build

# Build production image
npm run docker:build:prod
```

## 🏗️ Docker Architecture

### Services

1. **app** - Next.js application
   - Development: Hot reload enabled
   - Production: Optimized build
   - Port: 3000

2. **db** - PostgreSQL database
   - Version: PostgreSQL 16 Alpine
   - Port: 5432
   - Persistent data storage

3. **pgadmin** - Database management UI (development only)
   - Port: 5050
   - Web-based database administration

4. **nginx** - Reverse proxy (production only)
   - Port: 80/443
   - Load balancing and caching

### Volumes

- `postgres_data` - Database persistent storage
- `pgadmin_data` - pgAdmin configuration storage

### Networks

- `kosera-network` - Internal network for service communication

## 🔧 Configuration

### Environment Variables

Copy `.env.docker` to `.env` and customize:

```env
# Database
POSTGRES_DB=kosera
POSTGRES_USER=kosera
POSTGRES_PASSWORD=secure-password
DATABASE_URL=postgresql://kosera:secure-password@db:5432/kosera

# Application
JWT_SECRET=your-64-character-secret-key
NODE_ENV=development
PORT=3000
```

### Development vs Production

| Feature | Development | Production |
|---------|------------|------------|
| Hot Reload | ✅ Enabled | ❌ Disabled |
| Source Maps | ✅ Enabled | ❌ Disabled |
| Debug Mode | ✅ Enabled | ❌ Disabled |
| Volume Mounts | ✅ Source code | ❌ Built assets only |
| Database UI | ✅ pgAdmin | ❌ None |
| Reverse Proxy | ❌ Direct access | ✅ Nginx |

## 🧪 Database Operations

### Run Migrations

```bash
# Inside running container
docker-compose exec app npm run db:migrate

# Or from host (if DATABASE_URL points to container)
npm run db:migrate
```

### Seed Database

```bash
# Seed with sample data
docker-compose exec app npm run db:seed

# Seed with photos
docker-compose exec app npm run db:seed-photos
```

### Access Database

```bash
# Using psql in container
docker-compose exec db psql -U kosera -d kosera

# Using pgAdmin (development)
# Open http://localhost:5050
# Server: db, Port: 5432, Database: kosera
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Kill the process or change port in docker-compose.yml
   ```

2. **Database connection issues**
   ```bash
   # Check database health
   docker-compose exec db pg_isready -U kosera
   
   # View database logs
   docker-compose logs db
   ```

3. **Hot reload not working**
   ```bash
   # Ensure volume mounts are correct
   docker-compose down
   docker-compose up --build
   ```

4. **Permission issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs app
docker-compose logs db

# Follow logs in real-time
docker-compose logs -f

# Execute commands in running container
docker-compose exec app bash
docker-compose exec db bash
```

### Health Checks

```bash
# Check service health
docker-compose ps

# Test API health
curl http://localhost:3000/api/auth/verify

# Test database connection
docker-compose exec app npm run test-db
```

## 🚀 Deployment

### Production Deployment

1. **Set up production environment**
   ```bash
   # Copy production environment
   cp .env.docker .env.production
   
   # Edit with secure production values
   nano .env.production
   ```

2. **Deploy with Docker Compose**
   ```bash
   # Build and start
   docker-compose -f docker-compose.prod.yml up -d
   
   # Run migrations
   docker-compose -f docker-compose.prod.yml exec app npm run db:migrate
   ```

3. **Set up SSL (optional)**
   ```bash
   # Add SSL certificates to docker/nginx/ssl/
   # Update nginx.conf for HTTPS
   ```

### Container Registry

```bash
# Tag for registry
docker tag kosera-api:prod your-registry/kosera-api:latest

# Push to registry
docker push your-registry/kosera-api:latest
```

## 📊 Monitoring

### Resource Usage

```bash
# Monitor resource usage
docker stats

# View container resource limits
docker-compose config
```

### Performance

```bash
# Container performance
docker-compose exec app npm run test:performance

# Database performance
docker-compose exec db pg_stat_activity
```

## 🔒 Security

### Production Security Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secret
- [ ] Enable HTTPS with proper certificates
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Database backup strategy
- [ ] Monitor logs for suspicious activity

### Development Security

- [ ] Don't commit .env files
- [ ] Use development-only credentials
- [ ] Keep containers updated
- [ ] Limit network exposure

---

For more detailed information, see the main [README.md](../README.md) or check the [deployment documentation](../blob/docs/deployment/deployment-guide.md).
