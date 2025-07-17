# 🚀 Kosera API Documentation

## Overview
Kosera is a boarding house (kos) rental platform API built with Next.js, TypeScript, and PostgreSQL. This API provides endpoints for user management, authentication, and property listings.

## Base URL
```
Local Development: http://localhost:3000
Production: https://kosera.app
```

## Authentication
The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 🔐 Authentication Endpoints

#### Register User
Creates a new user account.

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "contact": "john@example.com",
  "password": "securepassword123",
  "role": "RENTER" // Optional: ADMIN, SELLER, RENTER (default: RENTER)
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe",
    "contact": "john@example.com",
    "role": "RENTER",
    "createdAt": "2025-07-03T16:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields
- `409 Conflict`: Username or contact already exists
- `500 Internal Server Error`: Server error

#### Login User
Authenticates a user and returns a JWT token.

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "johndoe", // Can be username or email
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe",
    "contact": "john@example.com",
    "role": "RENTER",
    "createdAt": "2025-07-03T16:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request`: Missing username or password / Invalid JSON format
- `401 Unauthorized`: Invalid credentials
- `500 Internal Server Error`: Server error

#### Verify Token
Validates a JWT token and returns user information.

```http
GET /api/auth/verify
```

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200 OK):**
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

**Error Responses:**
- `401 Unauthorized`: No token provided / Invalid or expired token
- `500 Internal Server Error`: Server error

### 👤 User Endpoints

#### Get User Profile
Retrieves the authenticated user's profile information.

```http
GET /api/user/profile
```

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200 OK):**
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

**Error Responses:**
- `401 Unauthorized`: Authentication required / Invalid token
- `500 Internal Server Error`: Server error

### 👨‍💼 Admin Endpoints

#### Get All Users
Retrieves a list of all users (Admin only).

```http
GET /api/admin/users
```

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response (200 OK):**
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
      "createdAt": "2025-07-03T16:30:00.000Z"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "username": "janesmith",
      "contact": "jane@example.com",
      "role": "SELLER",
      "createdAt": "2025-07-03T16:31:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized`: Authentication required / Invalid token
- `403 Forbidden`: Insufficient permissions (not admin)
- `500 Internal Server Error`: Server error

## User Roles

### RENTER
- Can register and login
- Can access profile
- Can view property listings (when implemented)
- Can make bookings (when implemented)

### SELLER
- All RENTER permissions
- Can create and manage property listings (when implemented)
- Can view their bookings and earnings (when implemented)

### ADMIN
- All SELLER permissions
- Can access admin endpoints
- Can view all users
- Can manage all properties and users (when implemented)

## Error Handling

All API endpoints return consistent error responses in the following format:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

## Rate Limiting

Currently, no rate limiting is implemented. It's recommended to implement rate limiting in production:

- Authentication endpoints: 5 requests per minute
- General endpoints: 100 requests per minute
- Admin endpoints: 200 requests per minute

## Security Features

### Password Security
- Passwords are hashed using bcrypt with 12 salt rounds
- Minimum password requirements should be enforced on the client side

### JWT Token Security
- Tokens expire after 7 days
- Tokens include user ID, username, and role
- Use `JWT_SECRET` environment variable for token signing

### Input Validation
- All required fields are validated
- Duplicate usernames and contacts are prevented
- JSON parsing errors are handled gracefully

## Development Guidelines

### Request/Response Format
- All requests and responses use JSON format
- Content-Type header should be `application/json`
- Always include proper HTTP status codes

### Error Logging
- All errors are logged to console with context
- Include request details in error logs
- Use structured logging in production

### Database Transactions
- Use database transactions for multi-step operations
- Implement proper rollback on errors
- Use connection pooling for better performance

## Testing

The API includes comprehensive test coverage:

- Unit tests for individual functions
- Integration tests for API endpoints
- Performance tests for load testing
- Security tests for authentication

Run tests with:
```bash
npm test
```

## Examples

### Complete Registration Flow
```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "username": "testuser",
    "contact": "test@example.com",
    "password": "password123"
  }'

# Login with the user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'

# Use the returned token to access protected endpoints
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Admin Operations
```bash
# Get all users (requires admin token)
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer <admin-jwt-token>"
```

## Future Endpoints

The following endpoints are planned for future implementation:

- `GET /api/properties` - List all properties
- `POST /api/properties` - Create new property (Seller/Admin)
- `GET /api/properties/:id` - Get property details
- `PUT /api/properties/:id` - Update property (Seller/Admin)
- `DELETE /api/properties/:id` - Delete property (Seller/Admin)
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `GET /api/admin/bookings` - Get all bookings (Admin)
- `POST /api/reviews` - Add review
- `GET /api/reviews/:propertyId` - Get property reviews

## Support

For questions or issues:
- Check the test files for usage examples
- Review the database schema documentation
- Contact the development team

---

**Last Updated:** July 3, 2025
**API Version:** 1.0.0
**Framework:** Next.js 15.3.1
**Database:** PostgreSQL with Drizzle ORM
