#!/usr/bin/env tsx

import { execSync } from 'child_process';
import path from 'path';

/**
 * Test runner specifically for Search API
 * This script runs all search-related tests including unit and integration tests
 */

const PROJECT_ROOT = path.join(__dirname, '..');

console.log('🧪 Running Search API Test Suite');
console.log('='.repeat(50));

async function runTests() {
  try {
    console.log('\n📋 Running Unit Tests for Search API...');
    execSync('npx vitest run tests/unit/search-api.test.ts --reporter=verbose', {
      cwd: PROJECT_ROOT,
      stdio: 'inherit'
    });

    console.log('\n🌐 Running Integration Tests for Search API...');
    execSync('npx vitest run tests/integration/search-api.integration.test.ts --reporter=verbose', {
      cwd: PROJECT_ROOT,
      stdio: 'inherit'
    });

    console.log('\n✅ All Search API tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Search API tests failed:', error);
    process.exit(1);
  }
}

// Performance benchmark
async function runPerformanceTests() {
  console.log('\n⚡ Running Performance Tests...');
  
  try {
    const startTime = Date.now();
    
    // Test search endpoint response time
    const response = await fetch('http://localhost:3000/api/kos/search?q=test&sort=quality');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const endTime = Date.now();
    
    console.log(`📊 Search API Performance:`);
    console.log(`   Response Time: ${endTime - startTime}ms`);
    console.log(`   Results Count: ${data.data?.results?.length || 0}`);
    console.log(`   Total Records: ${data.data?.pagination?.totalCount || 0}`);
    
    if (endTime - startTime > 1000) {
      console.warn('⚠️  Warning: Search API response time > 1000ms');
    } else {
      console.log('✅ Search API performance is good');
    }
    
  } catch (error) {
    console.warn('⚠️  Could not run performance tests:', error);
  }
}

// Coverage report for search API
async function generateCoverage() {
  console.log('\n📈 Generating Test Coverage for Search API...');
  
  try {
    execSync('npx vitest run tests/unit/search-api.test.ts tests/integration/search-api.integration.test.ts --coverage --reporter=verbose', {
      cwd: PROJECT_ROOT,
      stdio: 'inherit'
    });
  } catch (error) {
    console.warn('⚠️  Could not generate coverage report:', error);
  }
}

// Main execution
async function main() {
  console.log(`🏠 Project Root: ${PROJECT_ROOT}`);
  console.log(`📅 Test Run: ${new Date().toISOString()}`);
  
  // Check if server is running
  try {
    const healthCheck = await fetch('http://localhost:3000/api/kos/search?limit=1');
    if (!healthCheck.ok) {
      console.warn('⚠️  Server might not be running on http://localhost:3000');
      console.warn('   Integration tests may fail. Please start the dev server with: npm run dev');
    } else {
      console.log('✅ Server is running and accessible');
    }
  } catch (error) {
    console.warn('⚠️  Could not connect to server. Please start with: npm run dev');
  }
  
  // Run all tests
  await runTests();
  
  // Run performance tests if server is available
  await runPerformanceTests();
  
  // Generate coverage if requested
  if (process.argv.includes('--coverage')) {
    await generateCoverage();
  }
  
  console.log('\n🎉 Search API test suite completed!');
  console.log('='.repeat(50));
}

if (require.main === module) {
  main().catch(console.error);
}

export { runTests, runPerformanceTests, generateCoverage };
