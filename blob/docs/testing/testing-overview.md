# Kosera API Testing Suite

A comprehensive testing suite for the Kosera API built with **Vitest** and **Supertest**.

## 🧪 Test Categories

### 1. Unit Tests (`tests/unit/`)
- **API Validation Tests**: Request/response structure validation
- **Security Tests**: Password complexity, email format validation
- **Business Logic Tests**: Role-based access control, endpoint specifications

### 2. Integration Tests (`tests/integration/`)
- **Full API Integration Tests**: End-to-end testing with real HTTP requests
- **Database Integration**: Testing with actual database operations
- **Authentication Flow**: Complete user registration, login, and authorization

### 3. Performance Tests (`tests/performance/`)
- **Response Time Tests**: Measuring API response times
- **Memory Usage Tests**: Detecting memory leaks and resource usage
- **Concurrent Operations**: Testing API under load
- **Edge Cases**: Large payloads, rapid successive calls

### 4. API Route Tests (`tests/auth/`, `tests/user/`, `tests/admin/`)
- **Authentication Tests**: Login, register, verify endpoints
- **User Profile Tests**: Profile retrieval and management
- **Admin Tests**: User management and admin-only operations
- **Middleware Tests**: Authentication and authorization middleware

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Environment variables configured

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials
```

### Running Tests

#### All Tests
```bash
# Run all tests
npm test

# Run all tests once (CI mode)
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

#### Specific Test Categories
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Performance tests only
npm run test:performance

# Authentication API tests only
npm run test:auth-api
```

#### Test Runner
```bash
# Run comprehensive test suite with reporting
npm run test:all
```

## 📊 Test Structure

### Unit Tests
```typescript
// tests/unit/api-validation.test.ts
describe('API Route Unit Tests', () => {
  describe('Authentication Routes', () => {
    it('should validate request structure', () => {
      // Test request validation
    });
  });
});
```

### Integration Tests
```typescript
// tests/integration/api.test.ts
describe('API Integration Tests', () => {
  describe('Authentication Endpoints', () => {
    it('should register a new user', async () => {
      const response = await request(server)
        .post('/api/auth/register')
        .send(userData);
      
      expect(response.status).toBe(201);
    });
  });
});
```

### Performance Tests
```typescript
// tests/performance/load.test.ts
describe('API Performance Tests', () => {
  it('should handle concurrent operations', async () => {
    const startTime = performance.now();
    // Performance testing logic
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(1000);
  });
});
```

## 🔧 Test Configuration

### Vitest Configuration (`vitest.config.ts`)
```typescript
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist', '.next'],
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

### Test Setup (`tests/setup.ts`)
- Environment variable configuration
- Database connection mocking
- Global test utilities

## 📋 Test Coverage

### API Endpoints Tested
- ✅ `POST /api/auth/register` - User registration
- ✅ `POST /api/auth/login` - User login
- ✅ `GET /api/auth/verify` - Token verification
- ✅ `GET /api/user/profile` - User profile retrieval
- ✅ `GET /api/admin/users` - Admin user management

### Test Scenarios
- ✅ Success cases
- ✅ Validation errors
- ✅ Authentication failures
- ✅ Authorization checks
- ✅ Database errors
- ✅ Edge cases
- ✅ Performance limits

## 🛠️ Testing Utilities

### Mock Helpers (`tests/helpers.ts`)
```typescript
// Create authenticated request
const request = createAuthenticatedRequest('GET', 'admin');

// Parse response
const result = await parseResponse(response);

// Mock users
const mockUsers = { admin, seller, renter };
```

### Test Factory (`tests/utils/mock-factory.ts`)
```typescript
// Create database mocks
const { db, mocks } = createMockDb();

// Create JWT mocks
const { jwt, mocks } = createMockJwt();
```

## 📈 Performance Benchmarks

### Expected Response Times
- Authentication: < 500ms
- Profile retrieval: < 200ms
- User listing: < 300ms
- Password hashing: < 2000ms

### Memory Usage
- Token generation: < 50MB for 1000 tokens
- Concurrent operations: < 10MB increase
- Error handling: < 100ms with errors

## 🚨 Error Handling Tests

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `409` - Conflict
- `500` - Internal Server Error

### Error Scenarios
- Missing required fields
- Invalid credentials
- Duplicate user registration
- Malformed tokens
- Database connection failures
- Rate limiting

## 🔍 Debugging Tests

### Running Individual Tests
```bash
# Run specific test file
npx vitest run tests/auth/login.test.ts

# Run specific test pattern
npx vitest run --grep "should login"

# Run with debug output
npx vitest run --reporter=verbose

# Run with coverage
npx vitest run --coverage
```

### Test Debugging
```typescript
// Add debug logging
console.log('Test data:', testData);

// Use test utilities
const { db, mocks } = createMockDb();
console.log('Mock called with:', mocks.mockDbLimit.mock.calls);
```

## 🤝 Contributing

### Adding New Tests
1. Create test file in appropriate directory
2. Follow existing test patterns
3. Add test description and expected behavior
4. Include both success and failure cases
5. Update this README if needed

### Test Naming Convention
- Test files: `*.test.ts`
- Describe blocks: Feature or endpoint name
- Test cases: "should [expected behavior]"

Example:
```typescript
describe('POST /api/auth/register', () => {
  it('should register new user successfully', async () => {
    // Test implementation
  });
  
  it('should fail with duplicate username', async () => {
    // Test implementation
  });
});
```

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
- [Node.js Testing Best Practices](https://github.com/goldbergyoni/nodebestpractices#-6-testing-and-overall-quality-practices)

## 🏆 Test Reports

Tests generate detailed reports in:
- `test-report.json` - Detailed test results
- `coverage/` - Coverage reports (when run with --coverage)
- Console output with summary statistics

## 📝 Notes

- Tests use mocked database operations by default
- Integration tests can be run against a real database
- Performance tests include memory leak detection
- All tests run in isolated environments
- Tests are designed to be deterministic and repeatable
