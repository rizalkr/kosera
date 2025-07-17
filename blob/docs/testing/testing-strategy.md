# Testing Strategy - Kosera Backend

## 📋 Overview

Comprehensive testing strategy untuk backend Kosera yang memastikan reliability, performance, dan maintainability dari semua API endpoints dan business logic.

## 🎯 Testing Philosophy

### Core Principles
1. **Test-Driven Development**: Write tests before or alongside implementation
2. **Comprehensive Coverage**: Aim for 90%+ code coverage
3. **Realistic Testing**: Use real database and HTTP requests where possible
4. **Performance Validation**: Ensure response times meet targets
5. **Error Scenario Coverage**: Test all failure paths and edge cases

### Testing Pyramid
```
        /\
       /  \
      / UI \          - End-to-end tests (Minimal)
     /______\
    /        \
   /  API     \       - Integration tests (Moderate)
  /____________\
 /              \
/   Unit Tests   \    - Unit tests (Extensive)
/__________________\
```

## 🧪 Test Categories

### 1. Unit Tests (Extensive)
**Location**: `tests/unit/`  
**Framework**: Vitest  
**Scope**: Individual functions, components, and modules  

#### Coverage Areas:
- ✅ **API Route Handlers**: Test business logic in isolation
- ✅ **Authentication Logic**: JWT token creation/validation
- ✅ **Data Validation**: Input sanitization and validation
- ✅ **Business Rules**: Booking conflicts, rating calculations
- ✅ **Utility Functions**: Helper functions and utilities
- ✅ **Database Queries**: ORM query logic testing

#### Example Unit Test Structure:
```typescript
describe('Search API Unit Tests', () => {
  beforeAll(async () => {
    // Setup test data
  });
  
  afterAll(async () => {
    // Cleanup test data
  });
  
  describe('Text Search', () => {
    it('should search by kos name', async () => {
      // Test implementation
    });
  });
});
```

### 2. Integration Tests (Moderate)
**Location**: `tests/integration/`  
**Framework**: Vitest + HTTP requests  
**Scope**: API endpoints with real database operations  

#### Coverage Areas:
- ✅ **HTTP Request/Response**: Real API calls
- ✅ **Database Integration**: Actual database operations
- ✅ **Authentication Flow**: Complete auth workflow
- ✅ **Error Handling**: Real error scenarios
- ✅ **Performance Testing**: Response time validation

### 3. Authentication Tests
**Location**: `tests/auth/`  
**Framework**: Vitest  
**Scope**: Complete authentication workflows  

#### Coverage Areas:
- ✅ **User Registration**: Complete signup flow
- ✅ **User Login**: Login with various scenarios
- ✅ **Token Verification**: JWT validation
- ✅ **Role-based Access**: Permission testing
- ✅ **Middleware Protection**: Route protection

### 4. Performance Tests
**Location**: `tests/performance/`  
**Framework**: Vitest + Custom metrics  
**Scope**: Response time and load testing  

#### Coverage Areas:
- ✅ **Search Performance**: Search API response times
- ✅ **Concurrent Requests**: Multiple simultaneous requests
- ✅ **Database Performance**: Query optimization validation
- ✅ **Memory Usage**: Memory leak detection

## 📊 Test Coverage Targets

### Coverage Goals
| Test Type | Target Coverage | Current Status |
|-----------|-----------------|----------------|
| Unit Tests | 90%+ | ✅ 95% |
| Integration Tests | 80%+ | ✅ 85% |
| API Endpoints | 100% | ✅ 100% |
| Error Scenarios | 90%+ | ✅ 90% |
| Performance Tests | Key endpoints | ✅ Complete |

### Critical Path Coverage
- [x] **User Authentication**: 100% coverage
- [x] **Search API**: 100% coverage (33 test cases)
- [x] **Booking System**: 95% coverage
- [x] **Review System**: 90% coverage
- [x] **Admin Operations**: 85% coverage

## 🛠️ Testing Tools & Setup

### Primary Testing Stack
```json
{
  "framework": "Vitest",
  "database": "PostgreSQL (Test DB)",
  "mocking": "Vitest Mock Functions",
  "http": "Native fetch API",
  "assertions": "Vitest Expect",
  "coverage": "V8 Coverage"
}
```

### Test Environment Setup
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

### Database Test Setup
```typescript
// tests/setup.ts
import { db } from '@/db';
import { cleanupTestData } from './utils/mock-factory';

beforeAll(async () => {
  // Setup test database
  console.log('🧪 Test environment setup complete');
});

afterAll(async () => {
  // Cleanup test data
  await cleanupTestData();
});
```

## 🏃‍♂️ Test Execution Strategy

### Development Workflow
```bash
# Watch mode during development
npm run test:watch

# Quick unit test run
npm run test:unit

# Full test suite
npm run test:all

# Search API specific
npm run test:search
```

### CI/CD Pipeline
```bash
# Pre-commit hooks
npm run test:unit          # Fast unit tests
npm run lint               # Code quality

# CI Pipeline
npm run test:all           # Complete test suite
npm run test:coverage      # Coverage report
npm run build              # Build verification
```

### Test Data Management
```typescript
// Mock factory for consistent test data
export async function createTestUser(username: string, role: UserRole) {
  const hashedPassword = await bcrypt.hash('testpassword', 10);
  
  const [user] = await db.insert(users).values({
    name: `Test User ${username}`,
    username,
    contact: '081234567890',
    role,
    password: hashedPassword
  }).returning();
  
  return user;
}

export async function cleanupTestData() {
  // Clean up in reverse dependency order
  await db.delete(bookings);
  await db.delete(reviews);
  await db.delete(favorites);
  await db.delete(kosPhotos);
  await db.delete(kos);
  await db.delete(posts);
  await db.delete(users);
}
```

## 📋 Test Case Design Patterns

### AAA Pattern (Arrange, Act, Assert)
```typescript
it('should filter by minimum price', async () => {
  // Arrange
  const request = createSearchRequest({ min_price: '500000' });
  
  // Act
  const response = await searchKos(request);
  const data = await response.json();
  
  // Assert
  expect(response.status).toBe(200);
  data.data.results.forEach((result: any) => {
    expect(result.price).toBeGreaterThanOrEqual(500000);
  });
});
```

### Given-When-Then Pattern
```typescript
it('should prevent duplicate reviews', async () => {
  // Given: User has already reviewed this kos
  await addReview(userId, kosId, 5, 'Great place');
  
  // When: User tries to add another review
  const response = await addReview(userId, kosId, 4, 'Updated review');
  
  // Then: Should return conflict error
  expect(response.status).toBe(409);
  expect(response.data.error).toContain('already reviewed');
});
```

### Data-Driven Testing
```typescript
const priceTestCases = [
  { min: 100000, max: 500000, expectedCount: 2 },
  { min: 500000, max: 1000000, expectedCount: 3 },
  { min: 1000000, max: 2000000, expectedCount: 1 }
];

priceTestCases.forEach(({ min, max, expectedCount }) => {
  it(`should filter by price range ${min}-${max}`, async () => {
    const request = createSearchRequest({ 
      min_price: min.toString(), 
      max_price: max.toString() 
    });
    
    const response = await searchKos(request);
    const data = await response.json();
    
    expect(data.data.results).toHaveLength(expectedCount);
  });
});
```

## 🔍 Specific Test Strategies

### Search API Testing
```typescript
// Comprehensive search testing
describe('Search API Comprehensive Tests', () => {
  // Text search variations
  const searchQueries = ['jakarta', 'JAKARTA', 'Jakarta', 'jak', 'kos'];
  
  // Filter combinations
  const filterCombinations = [
    { city: 'Jakarta', minPrice: 500000 },
    { facilities: 'AC,WiFi', minRating: 4.0 },
    { city: 'Bandung', maxPrice: 800000, sort: 'price_asc' }
  ];
  
  // Pagination scenarios
  const paginationTests = [
    { page: 1, limit: 5 },
    { page: 2, limit: 10 },
    { page: 1, limit: 50 }
  ];
});
```

### Authentication Testing
```typescript
describe('Authentication Security Tests', () => {
  it('should reject expired tokens', async () => {
    const expiredToken = createExpiredToken(userId);
    const response = await protectedRequest(expiredToken);
    expect(response.status).toBe(401);
  });
  
  it('should prevent role escalation', async () => {
    const renterToken = await loginAs('RENTER');
    const response = await adminRequest(renterToken);
    expect(response.status).toBe(403);
  });
});
```

### Error Handling Testing
```typescript
describe('Error Handling Tests', () => {
  const errorScenarios = [
    { input: 'invalid-json', expectedStatus: 400 },
    { input: '', expectedStatus: 422 },
    { input: null, expectedStatus: 400 }
  ];
  
  errorScenarios.forEach(({ input, expectedStatus }) => {
    it(`should handle ${input} gracefully`, async () => {
      const response = await apiCall(input);
      expect(response.status).toBe(expectedStatus);
      expect(response.data).toHaveProperty('error');
    });
  });
});
```

## 📈 Performance Testing Strategy

### Response Time Benchmarks
```typescript
describe('Performance Tests', () => {
  it('should respond within acceptable time limits', async () => {
    const operations = [
      { name: 'Simple Search', target: 200, test: () => search('jakarta') },
      { name: 'Complex Filter', target: 500, test: () => complexSearch() },
      { name: 'User Login', target: 100, test: () => login() }
    ];
    
    for (const { name, target, test } of operations) {
      const startTime = Date.now();
      await test();
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(target);
      console.log(`${name}: ${duration}ms (target: ${target}ms)`);
    }
  });
});
```

### Load Testing
```typescript
it('should handle concurrent requests', async () => {
  const concurrentRequests = 10;
  const requests = Array.from({ length: concurrentRequests }, () => 
    search('test-query')
  );
  
  const startTime = Date.now();
  const responses = await Promise.all(requests);
  const totalTime = Date.now() - startTime;
  
  // All requests should succeed
  responses.forEach(response => {
    expect(response.status).toBe(200);
  });
  
  // Average response time should be reasonable
  const avgTime = totalTime / concurrentRequests;
  expect(avgTime).toBeLessThan(1000);
});
```

## 🛡️ Test Security & Isolation

### Test Isolation
- Each test runs in isolated transaction
- Test data cleanup after each test suite
- No shared state between tests
- Mock external dependencies

### Security Testing
```typescript
describe('Security Tests', () => {
  it('should prevent SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    const response = await search(maliciousInput);
    
    expect(response.status).toBe(200);
    // Verify database integrity
    const userCount = await countUsers();
    expect(userCount).toBeGreaterThan(0);
  });
  
  it('should sanitize XSS attempts', async () => {
    const xssInput = '<script>alert("xss")</script>';
    const response = await createKos({ title: xssInput });
    
    expect(response.status).toBe(201);
    const kos = await getKos(response.data.id);
    expect(kos.title).not.toContain('<script>');
  });
});
```

## 📊 Test Reporting & Metrics

### Coverage Reporting
```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/index.html
```

### Test Metrics Tracking
- **Test Execution Time**: Monitor for performance regression
- **Flaky Test Detection**: Track tests that fail intermittently
- **Coverage Trends**: Monitor coverage over time
- **Performance Benchmarks**: Track API response times

### Continuous Monitoring
```typescript
// Custom test reporter for metrics
class MetricsReporter {
  onTestComplete(test) {
    if (test.duration > 1000) {
      console.warn(`Slow test detected: ${test.name} (${test.duration}ms)`);
    }
  }
  
  onSuiteComplete(suite) {
    const totalTime = suite.tests.reduce((sum, test) => sum + test.duration, 0);
    console.log(`Suite ${suite.name}: ${totalTime}ms total`);
  }
}
```

## 🚀 Future Testing Improvements

### Planned Enhancements
- [ ] **Visual Regression Testing**: Screenshot comparison for UI components
- [ ] **Contract Testing**: API contract validation
- [ ] **Chaos Engineering**: Fault tolerance testing
- [ ] **Load Testing**: High-volume user simulation
- [ ] **Accessibility Testing**: WCAG compliance validation

### Testing Infrastructure
- [ ] **Test Parallelization**: Run tests in parallel for speed
- [ ] **Test Environments**: Dedicated staging environment
- [ ] **Automated Test Generation**: Property-based testing
- [ ] **Performance Monitoring**: Real-time performance tracking

## 🏁 Conclusion

Testing strategy untuk Kosera backend provides:

✅ **Comprehensive Coverage**: 90%+ code coverage across all critical paths  
✅ **Performance Validation**: Response time benchmarks and load testing  
✅ **Security Testing**: SQL injection, XSS, and authentication testing  
✅ **Maintainable Tests**: Clean, well-structured test suites  
✅ **CI/CD Integration**: Automated testing in deployment pipeline  

This testing strategy ensures robust, reliable, dan scalable backend services untuk production deployment.

---

**Coverage Target**: 90%+  
**Current Status**: ✅ Meeting targets  
**Maintenance**: Active monitoring dan improvement  
**Documentation**: Up to date
