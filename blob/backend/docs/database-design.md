# 📦 Database Design: Kosera Platform

## Overview
Kosera uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The database is designed to support a boarding house (kos) rental platform with user management, property listings, bookings, and reviews.

## Database Configuration

### Connection Details
```typescript
// Environment Variables Required
DATABASE_URL=postgresql://username:password@localhost:5432/kosera
JWT_SECRET=your-secret-key-here
```

### ORM Setup
- **ORM**: Drizzle ORM
- **Query Builder**: Type-safe SQL queries
- **Migrations**: Managed through `drizzle-kit`
- **Schema**: TypeScript schema definitions

## Current Database Schema

### 1. users
Primary table for all platform users (renters, sellers, and admins).

| Field      | Type                    | Constraints                    | Description                           |
|------------|-------------------------|--------------------------------|---------------------------------------|
| id         | serial                  | PRIMARY KEY, AUTO_INCREMENT    | Unique user identifier                |
| name       | text                    | NOT NULL                       | User's full name                      |
| username   | text                    | UNIQUE, NOT NULL               | Unique username for login             |
| contact    | text                    | NOT NULL                       | Email or phone contact                |
| role       | user_role (enum)        | NOT NULL, DEFAULT 'RENTER'     | User role: ADMIN, SELLER, RENTER      |
| password   | text                    | NOT NULL                       | Bcrypt hashed password                |
| created_at | timestamp               | NOT NULL, DEFAULT NOW()        | Account creation timestamp            |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE INDEX (username)`

**User Roles Enum:**
```sql
CREATE TYPE user_role AS ENUM ('ADMIN', 'SELLER', 'RENTER');
```

### 2. posts
Property listing posts created by sellers.

| Field           | Type      | Constraints                    | Description                           |
|-----------------|-----------|--------------------------------|---------------------------------------|
| id              | serial    | PRIMARY KEY, AUTO_INCREMENT    | Unique post identifier                |
| user_id         | integer   | FOREIGN KEY → users(id), CASCADE | Post owner (seller)                 |
| title           | text      | NOT NULL                       | Property listing title                |
| description     | text      | NOT NULL                       | Detailed property description         |
| price           | integer   | NOT NULL                       | Monthly rent price (in cents)         |
| total_post      | integer   | NOT NULL, DEFAULT 0            | Total posts by user                   |
| total_penjualan | integer   | NOT NULL, DEFAULT 0            | Total sales from this post            |
| created_at      | timestamp | NOT NULL, DEFAULT NOW()        | Post creation timestamp               |
| updated_at      | timestamp | NOT NULL, DEFAULT NOW()        | Last update timestamp                 |

**Relationships:**
- `user_id` → `users.id` (Many-to-One)

### 3. kos
Detailed property information linked to posts.

| Field    | Type     | Constraints                        | Description                           |
|----------|----------|------------------------------------|---------------------------------------|
| id       | serial   | PRIMARY KEY, AUTO_INCREMENT        | Unique property identifier            |
| post_id  | integer  | FOREIGN KEY → posts(id), CASCADE, UNIQUE | Related post (One-to-One)        |
| name     | text     | NOT NULL                           | Property name                         |
| address  | text     | NOT NULL                           | Full property address                 |
| city     | text     | NOT NULL                           | City location                         |
| facilities | text   | NULL                               | Available facilities (JSON string)    |

**Relationships:**
- `post_id` → `posts.id` (One-to-One)

## Planned Database Extensions

### 4. bookings
Property reservation records.

| Field        | Type      | Constraints                    | Description                           |
|--------------|-----------|--------------------------------|---------------------------------------|
| id           | serial    | PRIMARY KEY, AUTO_INCREMENT    | Unique booking identifier             |
| user_id      | integer   | FOREIGN KEY → users(id)        | Booking user (renter)                 |
| kos_id       | integer   | FOREIGN KEY → kos(id)          | Booked property                       |
| booking_date | date      | NOT NULL                       | Booking start date                    |
| end_date     | date      | NOT NULL                       | Booking end date                      |
| status       | text      | NOT NULL, DEFAULT 'PENDING'    | Booking status                        |
| total_price  | integer   | NOT NULL                       | Total booking cost                    |
| created_at   | timestamp | NOT NULL, DEFAULT NOW()        | Booking creation time                 |

**Status Values:** `PENDING`, `CONFIRMED`, `PAID`, `CANCELLED`, `COMPLETED`

### 5. reviews
Property reviews and ratings.

| Field      | Type      | Constraints                    | Description                           |
|------------|-----------|--------------------------------|---------------------------------------|
| id         | serial    | PRIMARY KEY, AUTO_INCREMENT    | Unique review identifier              |
| user_id    | integer   | FOREIGN KEY → users(id)        | Review author                         |
| kos_id     | integer   | FOREIGN KEY → kos(id)          | Reviewed property                     |
| booking_id | integer   | FOREIGN KEY → bookings(id)     | Related booking                       |
| rating     | integer   | NOT NULL, CHECK (1-5)          | Star rating (1-5)                     |
| comment    | text      | NULL                           | Review text                           |
| created_at | timestamp | NOT NULL, DEFAULT NOW()        | Review timestamp                      |

### 6. images
Property photos and media.

| Field       | Type     | Constraints                    | Description                           |
|-------------|----------|--------------------------------|---------------------------------------|
| id          | serial   | PRIMARY KEY, AUTO_INCREMENT    | Unique image identifier               |
| kos_id      | integer  | FOREIGN KEY → kos(id)          | Related property                      |
| url         | text     | NOT NULL                       | Image URL/path                        |
| alt_text    | text     | NULL                           | Alt text for accessibility            |
| is_primary  | boolean  | NOT NULL, DEFAULT FALSE        | Primary display image                 |
| created_at  | timestamp| NOT NULL, DEFAULT NOW()        | Upload timestamp                      |

### 7. payments
Booking payment records.

| Field       | Type      | Constraints                    | Description                           |
|-------------|-----------|--------------------------------|---------------------------------------|
| id          | serial    | PRIMARY KEY, AUTO_INCREMENT    | Unique payment identifier             |
| booking_id  | integer   | FOREIGN KEY → bookings(id)     | Related booking                       |
| amount      | integer   | NOT NULL                       | Payment amount (in cents)             |
| method      | text      | NOT NULL                       | Payment method                        |
| status      | text      | NOT NULL, DEFAULT 'PENDING'    | Payment status                        |
| external_id | text      | NULL                           | Payment gateway reference             |
| paid_at     | timestamp | NULL                           | Payment completion time               |
| created_at  | timestamp | NOT NULL, DEFAULT NOW()        | Payment record creation               |

**Payment Status:** `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `REFUNDED`

### 8. favorites
User saved properties.

| Field      | Type      | Constraints                    | Description                           |
|------------|-----------|--------------------------------|---------------------------------------|
| id         | serial    | PRIMARY KEY, AUTO_INCREMENT    | Unique favorite identifier            |
| user_id    | integer   | FOREIGN KEY → users(id)        | User who favorited                    |
| kos_id     | integer   | FOREIGN KEY → kos(id)          | Favorited property                    |
| created_at | timestamp | NOT NULL, DEFAULT NOW()        | When favorited                        |

**Unique Constraint:** `UNIQUE(user_id, kos_id)` - Prevents duplicate favorites

## Database Relationships

### Entity Relationship Diagram
```
users (1) ─── (M) posts (1) ─── (1) kos
  │                               │
  │── (M) bookings (M) ───────────┘
  │── (M) reviews (M) ─────────────┘
  │── (M) favorites (M) ───────────┘
  
bookings (1) ─── (M) payments
bookings (1) ─── (M) reviews
kos (1) ─── (M) images
```

### Relationship Details

**users → posts** (One-to-Many)
- One user can create multiple property posts
- Cascade delete: Deleting user removes their posts

**posts → kos** (One-to-One)
- Each post has exactly one property detail record
- Cascade delete: Deleting post removes property details

**users → bookings** (One-to-Many)
- One user can make multiple bookings
- Maintains booking history even if user account is deactivated

**kos → bookings** (One-to-Many)
- One property can have multiple bookings over time
- Essential for availability management

**bookings → payments** (One-to-Many)
- One booking can have multiple payment transactions
- Supports partial payments and refunds

**users → reviews** (One-to-Many)
- One user can write multiple reviews
- Maintains review integrity

**kos → reviews** (One-to-Many)
- One property can have multiple reviews
- Essential for property rating calculation

## Database Operations

### Common Queries

#### User Authentication
```sql
-- Find user by username or email
SELECT id, name, username, contact, role, password, created_at 
FROM users 
WHERE username = $1 OR contact = $1;
```

#### Property Listings
```sql
-- Get property with details
SELECT 
    k.id, k.name, k.address, k.city, k.facilities,
    p.title, p.description, p.price,
    u.name as seller_name
FROM kos k
JOIN posts p ON k.post_id = p.id
JOIN users u ON p.user_id = u.id
WHERE k.id = $1;
```

#### User Bookings
```sql
-- Get user's booking history
SELECT 
    b.id, b.booking_date, b.end_date, b.status, b.total_price,
    k.name as property_name, k.address
FROM bookings b
JOIN kos k ON b.kos_id = k.id
WHERE b.user_id = $1
ORDER BY b.created_at DESC;
```

### Performance Considerations

#### Indexes
Current indexes:
- `users.username` - Unique index for fast login lookups
- `users.id` - Primary key for relationships
- `posts.user_id` - Foreign key for user's posts
- `kos.post_id` - Unique foreign key for post-property relationship

Recommended additional indexes:
- `bookings.user_id` - For user booking queries
- `bookings.kos_id` - For property availability queries
- `reviews.kos_id` - For property review aggregation
- `kos.city` - For location-based searches

#### Query Optimization
- Use `LIMIT` and `OFFSET` for pagination
- Implement database connection pooling
- Use prepared statements for repeated queries
- Consider read replicas for heavy read workloads

## Migration Management

### Drizzle Kit Commands
```bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# Push schema changes (development)
npm run db:push

# Open database studio
npm run db:studio

# Seed database with test data
npm run db:seed

# Drop database (dangerous!)
npm run db:drop
```

### Migration Best Practices
1. Always backup before running migrations
2. Test migrations on development first
3. Use transactions for complex migrations
4. Keep migration files in version control
5. Document breaking changes

## Data Validation

### Application Level
- Use Drizzle schema for type safety
- Validate required fields before database operations
- Implement business logic constraints
- Hash passwords before storing

### Database Level
- Use NOT NULL constraints for required fields
- Implement CHECK constraints for valid ranges
- Use UNIQUE constraints to prevent duplicates
- Use foreign key constraints for referential integrity

## Security Considerations

### Data Protection
- Hash passwords with bcrypt (12 rounds)
- Store sensitive data encrypted
- Use parameterized queries to prevent SQL injection
- Implement proper access controls

### Privacy
- Don't log sensitive information
- Implement data retention policies
- Allow users to delete their data
- Comply with data protection regulations

## Backup and Recovery

### Backup Strategy
- Daily automated backups
- Point-in-time recovery capability
- Test backup restoration regularly
- Store backups in secure, separate location

### Disaster Recovery
- Database replication for high availability
- Geographic distribution of backups
- Recovery time objective (RTO): < 4 hours
- Recovery point objective (RPO): < 1 hour

## Monitoring and Maintenance

### Performance Monitoring
- Query performance tracking
- Connection pool monitoring
- Disk usage monitoring
- Slow query identification

### Regular Maintenance
- VACUUM and ANALYZE operations
- Index maintenance
- Statistics updates
- Connection limit monitoring

---

**Last Updated:** July 3, 2025
**Database Version:** PostgreSQL 14+
**ORM Version:** Drizzle ORM v0.44.2
**Schema Version:** 1.0.0