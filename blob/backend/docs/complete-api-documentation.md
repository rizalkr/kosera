# API Documentation - Kosera Backend

## 📋 Overview

Dokumentasi lengkap untuk semua API endpoints dalam aplikasi Kosera. Backend menggunakan Next.js App Router dengan TypeScript dan PostgreSQL.

**Base URL**: `http://localhost:3000/api`  
**Authentication**: JWT Bearer Token  
**Content-Type**: `application/json`  

## 🔐 Authentication

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "username": "johndoe",
  "contact": "081234567890",
  "password": "securepassword",
  "role": "RENTER" // ADMIN, SELLER, RENTER
}
```

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "username": "johndoe",
      "contact": "081234567890",
      "role": "RENTER"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepassword"
}
```

### Verify Token
```http
POST /api/auth/verify
Authorization: Bearer {token}
```

## 👤 User Management

### Get User Profile
```http
GET /api/user/profile
Authorization: Bearer {token}
```

### Update User Profile
```http
PUT /api/user/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Updated",
  "contact": "081234567891"
}
```

### Admin: Get All Users
```http
GET /api/admin/users
Authorization: Bearer {admin_token}
```

## 🏠 Kos Management

### Get All Kos
```http
GET /api/kos?page=1&limit=12
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12, max: 50)

### Create Kos
```http
POST /api/kos
Authorization: Bearer {seller_token}
Content-Type: application/json

{
  "title": "Kos Nyaman Jakarta Selatan",
  "description": "Kos dengan fasilitas lengkap",
  "price": 800000,
  "name": "Kos Mawar Indah",
  "address": "Jl. Mawar No. 15, Kebayoran Baru",
  "city": "Jakarta",
  "facilities": "AC, WiFi, Kamar Mandi Dalam, Dapur Bersama",
  "latitude": -6.2088,
  "longitude": 106.8456
}
```

### Get Kos Detail
```http
GET /api/kos/{id}
```

### Update Kos
```http
PUT /api/kos/{id}
Authorization: Bearer {owner_token}
Content-Type: application/json

{
  "title": "Updated title",
  "price": 850000
}
```

### Delete Kos
```http
DELETE /api/kos/{id}
Authorization: Bearer {owner_token}
```

### Get User's Own Kos
```http
GET /api/kos/my
Authorization: Bearer {seller_token}
```

### Track View
```http
POST /api/kos/{id}/view
```

## 🔍 Search & Discovery

### Advanced Search
```http
GET /api/kos/search?q=jakarta&city=Jakarta&min_price=500000&max_price=1000000&min_rating=4.0&facilities=AC,WiFi&sort=quality&page=1&limit=12
```

**Query Parameters**:
- `q`: Search query (searches name, title, description, address, city)
- `city`: Filter by city
- `facilities`: Comma-separated facilities (AND condition)
- `min_price`: Minimum price filter
- `max_price`: Maximum price filter  
- `min_rating`: Minimum rating filter (0.0-5.0)
- `sort`: Sort order
  - `quality` (default): Quality score algorithm
  - `price_asc`: Price low to high
  - `price_desc`: Price high to low
  - `rating`: Rating high to low
  - `newest`: Newest first
  - `popular`: Most viewed first
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12, max: 50)

**Response**:
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": {
    "results": [
      {
        "id": 1,
        "postId": 1,
        "name": "Kos Mawar Indah",
        "address": "Jl. Mawar No. 15, Kebayoran Baru",
        "city": "Jakarta",
        "facilities": "AC, WiFi, Kamar Mandi Dalam",
        "latitude": -6.2088,
        "longitude": 106.8456,
        "title": "Kos Nyaman Jakarta Selatan",
        "description": "Kos dengan fasilitas lengkap",
        "price": 800000,
        "isFeatured": true,
        "viewCount": 150,
        "favoriteCount": 25,
        "averageRating": "4.5",
        "reviewCount": 12,
        "photoCount": 8,
        "qualityScore": "85.5",
        "owner": {
          "id": 2,
          "name": "Seller Name",
          "username": "seller1",
          "contact": "081234567891"
        },
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 25,
      "limit": 12,
      "hasNextPage": true,
      "hasPrevPage": false,
      "nextPage": 2,
      "prevPage": null
    },
    "filters": {
      "query": "jakarta",
      "city": "Jakarta",
      "facilities": ["AC", "WiFi"],
      "minPrice": 500000,
      "maxPrice": 1000000,
      "minRating": 4.0,
      "sortBy": "quality"
    }
  }
}
```

### Get Featured Kos
```http
GET /api/kos/featured?limit=10
```

### Get Recommendations
```http
GET /api/kos/recommendations?limit=10
Authorization: Bearer {token} // Optional for personalization
```

### Get Nearby Kos
```http
GET /api/kos/nearby?lat=-6.2088&lon=106.8456&radius=5&limit=10
```

**Query Parameters**:
- `lat`: Latitude
- `lon`: Longitude
- `radius`: Radius dalam km (default: 5)
- `limit`: Number of results (default: 10, max: 50)

## ⭐ Reviews & Ratings

### Get Kos Reviews
```http
GET /api/kos/{id}/reviews?page=1&limit=10&sort=newest
```

**Query Parameters**:
- `page`: Page number
- `limit`: Items per page
- `sort`: `newest`, `oldest`, `rating_high`, `rating_low`

### Add Review
```http
POST /api/kos/{id}/reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 5,
  "comment": "Kos sangat nyaman dan bersih"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Review added successfully",
  "data": {
    "review": {
      "id": 1,
      "kosId": 1,
      "userId": 1,
      "rating": 5,
      "comment": "Kos sangat nyaman dan bersih",
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "statistics": {
      "totalReviews": 13,
      "averageRating": 4.6,
      "ratingDistribution": {
        "5": 8,
        "4": 3,
        "3": 2,
        "2": 0,
        "1": 0
      }
    }
  }
}
```

## ❤️ Favorites

### Get User Favorites
```http
GET /api/user/favorites?page=1&limit=12
Authorization: Bearer {token}
```

### Add to Favorites
```http
POST /api/user/favorites
Authorization: Bearer {token}
Content-Type: application/json

{
  "kosId": 1
}
```

### Remove from Favorites
```http
DELETE /api/user/favorites
Authorization: Bearer {token}
Content-Type: application/json

{
  "kosId": 1
}
```

## 📷 Photo Management

### Get Kos Photos
```http
GET /api/kos/{id}/photos
```

### Upload Photo
```http
POST /api/kos/{id}/photos
Authorization: Bearer {owner_token}
Content-Type: application/json

{
  "url": "https://example.com/photo.jpg",
  "caption": "Kamar tidur utama",
  "isPrimary": false
}
```

### Delete Photo
```http
DELETE /api/kos/{id}/photos
Authorization: Bearer {owner_token}
Content-Type: application/json

{
  "photoId": 1
}
```

## 📅 Booking System

### Get User Bookings
```http
GET /api/bookings?status=pending&page=1&limit=10
Authorization: Bearer {token}
```

**Query Parameters**:
- `status`: `pending`, `confirmed`, `cancelled`, `completed`
- `page`: Page number
- `limit`: Items per page

### Create Booking
```http
POST /api/bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "kosId": 1,
  "checkInDate": "2025-02-01T00:00:00.000Z",
  "duration": 6,
  "notes": "Booking untuk semester baru"
}
```

### Get Booking Detail
```http
GET /api/bookings/{id}
Authorization: Bearer {token}
```

### Update Booking
```http
PUT /api/bookings/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "confirmed",
  "notes": "Pembayaran telah diterima"
}
```

### Cancel Booking
```http
DELETE /api/bookings/{id}
Authorization: Bearer {token}
```

### Check Availability
```http
GET /api/kos/{id}/availability?checkInDate=2025-02-01&duration=6
```

## 📊 Admin Analytics

### Get Analytics Dashboard
```http
GET /api/admin/analytics
Authorization: Bearer {admin_token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "newThisMonth": 25,
      "byRole": {
        "RENTER": 120,
        "SELLER": 28,
        "ADMIN": 2
      }
    },
    "kos": {
      "total": 45,
      "featured": 12,
      "averagePrice": 650000,
      "topCities": [
        { "city": "Jakarta", "count": 18 },
        { "city": "Bandung", "count": 12 }
      ]
    },
    "bookings": {
      "total": 89,
      "thisMonth": 15,
      "byStatus": {
        "pending": 8,
        "confirmed": 45,
        "completed": 30,
        "cancelled": 6
      },
      "totalRevenue": 58500000
    },
    "topKos": [
      {
        "id": 1,
        "name": "Kos Premium Jakarta",
        "viewCount": 450,
        "favoriteCount": 35,
        "bookingCount": 12
      }
    ]
  }
}
```

## 🌍 Geocoding

### Geocode Address
```http
GET /api/geocode?address=Jl.%20Sudirman%20Jakarta
```

## 📋 Response Format Standards

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information" // Optional
}
```

### Pagination Response
```json
{
  "success": true,
  "data": {
    "results": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 48,
      "limit": 10,
      "hasNextPage": true,
      "hasPrevPage": false,
      "nextPage": 2,
      "prevPage": null
    }
  }
}
```

## 🚨 Error Codes

| HTTP Status | Description | Example |
|-------------|-------------|---------|
| 200 | Success | Operation completed successfully |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input parameters |
| 401 | Unauthorized | Invalid or missing authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Internal Server Error | Server error occurred |

## 🔒 Authentication & Authorization

### JWT Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full access to all endpoints, analytics, user management |
| **SELLER** | Manage own kos, view bookings, upload photos |
| **RENTER** | Search kos, make bookings, add reviews, manage favorites |

### Protected Endpoints
- `POST /api/kos` - Requires SELLER role
- `PUT/DELETE /api/kos/{id}` - Requires ownership or ADMIN
- `GET /api/admin/*` - Requires ADMIN role
- `POST /api/bookings` - Requires authentication
- `POST /api/kos/{id}/reviews` - Requires authentication

## 📈 Rate Limiting

- **Search endpoints**: 100 requests per minute
- **Authentication**: 10 requests per minute
- **General API**: 1000 requests per hour per user

## 🧪 Testing Endpoints

### Health Check
```http
GET /api/health
```

### Test Database Connection
```http
GET /api/test/db
```

---

**Version**: 1.0  
**Last Updated**: July 5, 2025  
**Maintainer**: Backend Development Team
