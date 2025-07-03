# 🧪 Kosera Testing Guide

## Overview
Kosera uses a comprehensive testing suite built with **Vitest** and **Supertest** to ensure API reliability, performance, and security. The testing strategy covers unit tests, integration tests, performance tests, and security validations.

## Testing Framework

### Core Technologies
- **Test Runner**: Vitest v3.2.4
- **HTTP Testing**: Supertest v7.1.1
- **Mocking**: Vitest built-in mocks
- **Environment**: Node.js with jsdom
- **Coverage**: Vitest coverage reports

### Test Configuration
```typescript
// vitest.config.ts
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

## Test Categories

### 1. Unit Tests (`tests/unit/`)
Tests individual functions and components in isolation.

**Files:**
- `api-validation.test.ts` - Request/response validation
- Tests authentication logic, password validation, role permissions

**Example:**
```typescript
describe('API Route Unit Tests', () => {
  describe('Security Validations', () => {
    it('should validate password complexity', () => {
      const weakPassword = '123';
      const strongPassword = 'SecurePass123!';
      
      expect(validatePassword(weakPassword)).toBe(false);
      expect(validatePassword(strongPassword)).toBe(true);
    });
  });
});
```

### 2. Integration Tests (`tests/integration/`)
Tests complete API workflows with real HTTP requests.

**Files:**
- `api.test.ts` - End-to-end API testing

**Features Tested:**
- User registration and login flow
- JWT token verification
- Profile management
- Admin operations
- Error handling

**Example:**
```typescript
describe('API Integration Tests', () => {
  it('should register a new user', async () => {
    const response = await request(server)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        username: 'testuser',
        contact: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
  });
});
```

### 3. Performance Tests (`tests/performance/`)
Tests system performance under various loads.

**Files:**
- `load.test.ts` - Performance benchmarking

**Metrics Tested:**
- Response time validation
- Memory usage monitoring
- Concurrent operation handling
- Resource leak detection

**Example:**
```typescript
describe('API Performance Tests', () => {
  it('should handle concurrent operations', async () => {
    const promises = Array(100).fill(null).map(() =>
      hashPassword('testpassword123')
    );
    
    const startTime = performance.now();
    await Promise.all(promises);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(5000);
  });
});
```

### 4. API Route Tests (`tests/auth/`, `tests/user/`, `tests/admin/`)
Tests specific API endpoints with mocked dependencies.

**Files:**
- `tests/auth/login.test.ts` - Login endpoint
- `tests/auth/register.test.ts` - Registration endpoint
- `tests/auth/verify.test.ts` - Token verification
- `tests/user/profile.test.ts` - User profile
- `tests/admin/users.test.ts` - Admin operations

### 5. Library Tests (`tests/lib/`)
Tests utility functions and middleware.

**Files:**
- `auth.test.ts` - Authentication utilities
- `middleware/auth.test.ts` - Authentication middleware

## Running Tests

### All Tests
```bash
# Run complete test suite
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with file watching
npm run test:watch

# Run tests with UI interface
npm run test:ui
```

### Category-Specific Tests
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Performance tests only
npm run test:performance

# Authentication API tests
npm run test:auth-api
```

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/index.html
```

### Custom Test Runner
```bash
# Comprehensive test suite with detailed reporting
npm run test:all
```

## Test Setup and Configuration

### Environment Setup (`tests/setup.ts`)
```typescript
import { beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';

beforeAll(() => {
  // Load test environment variables
  dotenv.config({ path: '.env.test' });
  
  // Setup test database
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/kosera_test';
  process.env.JWT_SECRET = 'test-secret-key';
});

afterAll(() => {
  // Cleanup test resources
});
```

### Test Helpers (`tests/helpers.ts`)
```typescript
export function createAuthenticatedRequest(method: string, role: string) {
  const token = generateTestToken({ role });
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function parseResponse(response: any) {
  return {
    status: response.status,
    body: response.body,
    headers: response.headers,
  };
}

export const mockUsers = {
  admin: { username: 'admin', role: 'ADMIN' },
  seller: { username: 'seller', role: 'SELLER' },
  renter: { username: 'renter', role: 'RENTER' },
};
```

### Mock Factory (`tests/utils/mock-factory.ts`)
```typescript
export function createMockDb() {
  const mocks = {
    select: vi.fn(),
    insert: vi.fn(),
    where: vi.fn(),
    from: vi.fn(),
  };
  
  return { db: mocks, mocks };
}

export function createMockJwt() {
  const mocks = {
    sign: vi.fn(),
    verify: vi.fn(),
  };
  
  return { jwt: mocks, mocks };
}
```

## Test Data Management

### Test Users
```typescript
const testUsers = {
  validUser: {
    name: 'Test User',
    username: 'testuser',
    contact: 'test@example.com',
    password: 'SecurePass123!',
    role: 'RENTER',
  },
  adminUser: {
    name: 'Admin User',
    username: 'admin',
    contact: 'admin@example.com',
    password: 'AdminPass123!',
    role: 'ADMIN',
  },
  sellerUser: {
    name: 'Seller User',
    username: 'seller',
    contact: 'seller@example.com',
    password: 'SellerPass123!',
    role: 'SELLER',
  },
};
```

### Dynamic Test Data
```typescript
// Use timestamps to avoid conflicts between test runs
const timestamp = Date.now();
const uniqueUser = {
  username: `testuser_${timestamp}`,
  contact: `test_${timestamp}@example.com`,
};
```

## Performance Benchmarks

### Response Time Targets
- Authentication endpoints: < 500ms
- Profile retrieval: < 200ms
- Admin operations: < 300ms
- Password hashing: < 2000ms

### Memory Usage Limits
- Token generation: < 50MB for 1000 tokens
- Concurrent operations: < 10MB increase
- Error handling: < 100ms with graceful degradation

### Load Testing Results
```bash
# Concurrent password hashing (100 operations)
✓ Password hashing performance: 1,847ms
✓ Memory usage within limits: 45.2MB peak

# Token generation performance
✓ 1000 tokens generated: 425ms
✓ Memory stable at: 38.1MB
```

## Error Testing

### HTTP Status Code Validation
```typescript
describe('Error Handling', () => {
  it('should return 400 for missing fields', async () => {
    const response = await request(server)
      .post('/api/auth/register')
      .send({ name: 'Incomplete' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Name, username, contact, and password are required');
  });

  it('should return 409 for duplicate username', async () => {
    // First registration
    await createUser({ username: 'duplicate' });
    
    // Second registration with same username
    const response = await request(server)
      .post('/api/auth/register')
      .send({ username: 'duplicate', /* other fields */ });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Username already exists');
  });
});
```

### Security Testing
```typescript
describe('Security Tests', () => {
  it('should handle malformed JSON', async () => {
    const response = await request(server)
      .post('/api/auth/login')
      .send('invalid json');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid JSON format');
  });

  it('should reject invalid tokens', async () => {
    const response = await request(server)
      .get('/api/auth/verify')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid or expired token');
  });
});
```

## Debugging Tests

### Running Individual Tests
```bash
# Run specific test file
npx vitest run tests/auth/login.test.ts

# Run tests matching pattern
npx vitest run --grep "should login"

# Run with verbose output
npx vitest run --reporter=verbose

# Run with debug information
DEBUG=* npm test
```

### Test Debugging Utilities
```typescript
// Add debug logging in tests
it('should debug user creation', async () => {
  console.log('Creating user with data:', userData);
  
  const response = await request(server)
    .post('/api/auth/register')
    .send(userData);
    
  console.log('Response:', {
    status: response.status,
    body: response.body,
  });
  
  expect(response.status).toBe(201);
});
```

### Mock Debugging
```typescript
// Check mock call history
const { db, mocks } = createMockDb();

// After test execution
console.log('Database select calls:', mocks.select.mock.calls);
console.log('Database insert calls:', mocks.insert.mock.calls);
```

## Continuous Integration

### GitHub Actions Configuration
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
```

### Test Reports
```bash
# Generate detailed test report
npm run test:all > test-report.txt

# Generate JSON report for CI
npx vitest run --reporter=json > test-results.json
```

## Best Practices

### Test Organization
1. **Descriptive Names**: Use clear, descriptive test names
2. **Single Responsibility**: Each test should verify one specific behavior
3. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
4. **Independent Tests**: Tests should not depend on each other

### Mock Usage
1. **Mock External Dependencies**: Database, third-party APIs, file system
2. **Test Real Logic**: Don't mock the code being tested
3. **Verify Mock Calls**: Assert that mocks are called with expected parameters
4. **Reset Mocks**: Clean up mocks between tests

### Performance Testing
1. **Set Realistic Targets**: Based on production requirements
2. **Test Under Load**: Simulate concurrent users
3. **Monitor Memory**: Watch for memory leaks
4. **Profile Bottlenecks**: Identify slow operations

### Security Testing
1. **Test Authentication**: Verify token validation
2. **Test Authorization**: Check role-based access
3. **Test Input Validation**: Prevent injection attacks
4. **Test Error Handling**: Don't leak sensitive information

## Troubleshooting

### Common Issues

**Tests Timeout**
```bash
# Increase timeout in vitest.config.ts
testTimeout: 60000 // 60 seconds
```

**Database Connection Errors**
```bash
# Ensure test database is running
docker run -d -p 5432:5432 -e POSTGRES_DB=kosera_test postgres:14
```

**Port Conflicts**
```typescript
// Use dynamic ports in integration tests
const server = app.listen(0); // Random available port
const port = server.address().port;
```

**Memory Leaks**
```typescript
// Proper cleanup in afterEach
afterEach(() => {
  vi.clearAllMocks();
  // Close database connections
  // Clear caches
});
```

### Test Maintenance

1. **Regular Updates**: Keep test data current with schema changes
2. **Cleanup Obsolete Tests**: Remove tests for deprecated features
3. **Update Dependencies**: Keep testing libraries up to date
4. **Review Coverage**: Maintain high test coverage (>80%)

## Contributing

### Adding New Tests
1. Create test file in appropriate directory
2. Follow existing naming conventions
3. Include both success and failure scenarios
4. Add performance tests for new endpoints
5. Update this documentation

### Test Review Checklist
- [ ] Test names are descriptive
- [ ] Both positive and negative cases covered
- [ ] Mocks are properly configured
- [ ] Performance implications considered
- [ ] Security aspects tested
- [ ] Documentation updated

---

**Last Updated:** July 3, 2025
**Test Framework:** Vitest v3.2.4
**Coverage Target:** >85%
**Performance SLA:** API responses <500ms
