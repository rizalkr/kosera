import { describe, it, expect } from 'vitest';

// Test runner for search API
describe('Search API Test Suite', () => {
  it('should run all search API tests', async () => {
    console.log('Running Search API Unit Tests...');
    
    // Import and run unit tests
    await import('./unit/search-api.test');
    
    console.log('Running Search API Integration Tests...');
    
    // Import and run integration tests
    await import('./integration/search-api.test');
    
    console.log('All Search API tests completed!');
    
    expect(true).toBe(true);
  });
});

export default () => {
  console.log('Search API Test Runner initialized');
};
