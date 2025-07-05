# Kosera API Documentation - Additional Endpoints

## Overview
This document describes the additional API endpoints that have been implemented to complete the Kosera boarding house search application. These endpoints complement the existing core APIs and provide functionality for reviews, favorites, photo management, and bookings.

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Reviews API

### GET /api/kos/[id]/reviews
Get reviews for a specific kos with pagination and statistics.

**Parameters:**
- `id` (path) - Kos ID
- `page` (query, optional) - Page number (default: 1)
- `limit` (query, optional) - Items per page (default: 10, max: 50)

**Response:**
```json
{
  "success": true,
  "message": "Reviews retrieved successfully",
  "data": {
    "reviews": [
      {
        "id": 1,
        "rating": 5,
        "comment": "Great place to stay!",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
        "user": {
          "id": 1,
          "name": "John Doe",
          "username": "johndoe"
        }
      }
    ],
    "statistics": {
      "averageRating": 4.5,
      "totalReviews": 12,
      "ratingDistribution": {
        "5": 5,
        "4": 4,
        "3": 2,
        "2": 1,
        "1": 0
      }
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalReviews": 12,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### POST /api/kos/[id]/reviews
Create a new review for a kos. Requires authentication.

**Parameters:**
- `id` (path) - Kos ID

**Body:**
```json
{
  "rating": 5,
  "comment": "Excellent kos with great facilities!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "review": {
      "id": 1,
      "kosId": 1,
      "userId": 1,
      "rating": 5,
      "comment": "Excellent kos with great facilities!",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

## Favorites API

### GET /api/user/favorites
Get user's favorite kos list. Requires authentication.

**Parameters:**
- `page` (query, optional) - Page number (default: 1)
- `limit` (query, optional) - Items per page (default: 10, max: 50)

**Response:**
```json
{
  "success": true,
  "message": "Favorites retrieved successfully",
  "data": {
    "favorites": [
      {
        "id": 1,
        "createdAt": "2024-01-01T00:00:00Z",
        "kos": {
          "id": 1,
          "name": "Kos Mawar",
          "address": "Jl. Mawar No. 12",
          "city": "Semarang",
          "facilities": "AC, WiFi, Kamar Mandi Dalam"
        },
        "post": {
          "id": 1,
          "title": "Kos Putri Mawar - Strategis",
          "price": 500000,
          "averageRating": "4.5",
          "reviewCount": 12
        },
        "owner": {
          "id": 2,
          "name": "Owner Name",
          "username": "owner",
          "contact": "081234567890"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalFavorites": 5,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### POST /api/user/favorites
Add a kos to user's favorites. Requires authentication.

**Body:**
```json
{
  "kosId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Kos added to favorites successfully",
  "data": {
    "favorite": {
      "id": 1,
      "userId": 1,
      "kosId": 1,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### DELETE /api/user/favorites
Remove a kos from user's favorites. Requires authentication.

**Body:**
```json
{
  "kosId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Kos removed from favorites successfully"
}
```

## Photos API

### GET /api/kos/[id]/photos
Get all photos for a specific kos.

**Parameters:**
- `id` (path) - Kos ID

**Response:**
```json
{
  "success": true,
  "message": "Photos retrieved successfully",
  "data": {
    "photos": [
      {
        "id": 1,
        "url": "https://example.com/photo1.jpg",
        "caption": "Main room with AC",
        "isPrimary": true,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### POST /api/kos/[id]/photos
Upload a new photo for a kos. Requires authentication and ownership.

**Parameters:**
- `id` (path) - Kos ID

**Body:**
```json
{
  "url": "https://example.com/new-photo.jpg",
  "caption": "Beautiful room view",
  "isPrimary": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Photo uploaded successfully",
  "data": {
    "photo": {
      "id": 1,
      "kosId": 1,
      "url": "https://example.com/new-photo.jpg",
      "caption": "Beautiful room view",
      "isPrimary": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### DELETE /api/kos/[id]/photos
Delete a photo from a kos. Requires authentication and ownership.

**Parameters:**
- `id` (path) - Kos ID

**Body:**
```json
{
  "photoId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Photo deleted successfully"
}
```

## Bookings API

### GET /api/bookings
Get user's bookings or all bookings (admin). Requires authentication.

**Parameters:**
- `page` (query, optional) - Page number (default: 1)
- `limit` (query, optional) - Items per page (default: 10, max: 50)
- `status` (query, optional) - Filter by status (pending, confirmed, cancelled, completed)

**Response:**
```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": {
    "bookings": [
      {
        "id": 1,
        "checkInDate": "2024-02-01T00:00:00Z",
        "checkOutDate": "2024-05-01T00:00:00Z",
        "duration": 3,
        "totalPrice": 1500000,
        "status": "confirmed",
        "notes": "Student accommodation",
        "createdAt": "2024-01-01T00:00:00Z",
        "kos": {
          "id": 1,
          "name": "Kos Mawar",
          "address": "Jl. Mawar No. 12",
          "city": "Semarang"
        },
        "post": {
          "id": 1,
          "title": "Kos Putri Mawar",
          "price": 500000
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalBookings": 5,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### POST /api/bookings
Create a new booking. Requires authentication.

**Body:**
```json
{
  "kosId": 1,
  "checkInDate": "2024-02-01T00:00:00Z",
  "duration": 3,
  "notes": "Student accommodation for semester"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": {
      "id": 1,
      "kosId": 1,
      "userId": 1,
      "checkInDate": "2024-02-01T00:00:00Z",
      "checkOutDate": "2024-05-01T00:00:00Z",
      "duration": 3,
      "totalPrice": 1500000,
      "status": "pending",
      "notes": "Student accommodation for semester",
      "createdAt": "2024-01-01T00:00:00Z",
      "kos": {
        "id": 1,
        "name": "Kos Mawar"
      }
    }
  }
}
```

### GET /api/bookings/[id]
Get a specific booking. Requires authentication and appropriate access.

**Parameters:**
- `id` (path) - Booking ID

**Response:**
```json
{
  "success": true,
  "message": "Booking retrieved successfully",
  "data": {
    "booking": {
      "id": 1,
      "checkInDate": "2024-02-01T00:00:00Z",
      "checkOutDate": "2024-05-01T00:00:00Z",
      "duration": 3,
      "totalPrice": 1500000,
      "status": "confirmed",
      "notes": "Student accommodation",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "kos": {
        "id": 1,
        "name": "Kos Mawar",
        "address": "Jl. Mawar No. 12",
        "city": "Semarang",
        "facilities": "AC, WiFi, Kamar Mandi Dalam"
      },
      "post": {
        "id": 1,
        "title": "Kos Putri Mawar",
        "price": 500000
      },
      "user": {
        "id": 1,
        "name": "John Doe",
        "username": "johndoe",
        "contact": "081234567890"
      }
    }
  }
}
```

### PUT /api/bookings/[id]
Update booking status. Requires authentication and appropriate permissions.

**Parameters:**
- `id` (path) - Booking ID

**Body:**
```json
{
  "status": "confirmed",
  "notes": "Booking confirmed by kos owner"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking updated successfully",
  "data": {
    "booking": {
      "id": 1,
      "status": "confirmed",
      "notes": "Booking confirmed by kos owner",
      "updatedAt": "2024-01-02T00:00:00Z"
    }
  }
}
```

### DELETE /api/bookings/[id]
Delete a booking (admin only). Requires admin authentication.

**Parameters:**
- `id` (path) - Booking ID

**Response:**
```json
{
  "success": true,
  "message": "Booking deleted successfully"
}
```

## Availability API

### GET /api/kos/[id]/availability
Check kos availability for specific dates.

**Parameters:**
- `id` (path) - Kos ID
- `checkInDate` (query) - Check-in date (ISO format)
- `duration` (query) - Duration in months (1-12)

**Response:**
```json
{
  "success": true,
  "message": "Availability checked successfully",
  "data": {
    "available": true,
    "requestedPeriod": {
      "checkInDate": "2024-02-01T00:00:00Z",
      "checkOutDate": "2024-05-01T00:00:00Z",
      "duration": 3
    },
    "conflicts": [],
    "upcomingBookings": [
      {
        "checkInDate": "2024-06-01T00:00:00Z",
        "checkOutDate": "2024-12-01T00:00:00Z",
        "status": "confirmed"
      }
    ]
  }
}
```

## Error Responses

All endpoints may return these common error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid input data",
  "details": [
    {
      "path": ["rating"],
      "message": "Expected number, received string"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": "You have already reviewed this kos"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Database Schema Changes

The following tables have been added to support these new features:

### reviews
- `id` (serial, primary key)
- `kos_id` (integer, foreign key to kos.id)
- `user_id` (integer, foreign key to users.id) 
- `rating` (integer, 1-5)
- `comment` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### favorites
- `id` (serial, primary key)
- `user_id` (integer, foreign key to users.id)
- `kos_id` (integer, foreign key to kos.id)
- `created_at` (timestamp)
- Unique constraint on (user_id, kos_id)

### kos_photos
- `id` (serial, primary key)
- `kos_id` (integer, foreign key to kos.id)
- `url` (text)
- `caption` (text, optional)
- `is_primary` (boolean, default false)
- `created_at` (timestamp)

### bookings
- `id` (serial, primary key)
- `kos_id` (integer, foreign key to kos.id)
- `user_id` (integer, foreign key to users.id)
- `check_in_date` (timestamp)
- `check_out_date` (timestamp, optional)
- `duration` (integer, months)
- `total_price` (integer)
- `status` (text, default 'pending')
- `notes` (text, optional)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Usage Examples

### Complete User Flow Example

1. **User searches for kos:**
   ```
   GET /api/kos/search?city=Semarang&minPrice=300000&maxPrice=600000
   ```

2. **User views kos details and photos:**
   ```
   GET /api/kos/1
   GET /api/kos/1/photos
   ```

3. **User checks reviews:**
   ```
   GET /api/kos/1/reviews?page=1&limit=5
   ```

4. **User adds to favorites:**
   ```
   POST /api/user/favorites
   Body: {"kosId": 1}
   ```

5. **User checks availability:**
   ```
   GET /api/kos/1/availability?checkInDate=2024-02-01T00:00:00Z&duration=3
   ```

6. **User makes booking:**
   ```
   POST /api/bookings
   Body: {
     "kosId": 1,
     "checkInDate": "2024-02-01T00:00:00Z",
     "duration": 3,
     "notes": "Student accommodation"
   }
   ```

7. **User leaves review after stay:**
   ```
   POST /api/kos/1/reviews
   Body: {
     "rating": 5,
     "comment": "Great place to stay!"
   }
   ```

These additional endpoints complete the Kosera API and provide full functionality for a boarding house search and booking application.
