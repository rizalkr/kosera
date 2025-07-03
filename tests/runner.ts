#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Kosera API
 * This script runs all tests and provides detailed reporting
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

interface TestResult {
  category: string;
  passed: number;
  failed: number;
  total: number;
  duration: number;
  errors: string[];
}

class TestRunner {
  private results: TestResult[] = [];
  
  async runTests() {
    console.log('🚀 Starting comprehensive API tests...\n');
    
    // Test categories to run
    const testCategories = [
      { name: 'Unit Tests', pattern: 'tests/unit/**/*.test.ts' },
      { name: 'Integration Tests', pattern: 'tests/integration/**/*.test.ts' },
      { name: 'Performance Tests', pattern: 'tests/performance/**/*.test.ts' },
      { name: 'Authentication Tests', pattern: 'tests/auth/**/*.test.ts' },
      { name: 'Middleware Tests', pattern: 'tests/middleware/**/*.test.ts' },
      { name: 'Admin Tests', pattern: 'tests/admin/**/*.test.ts' },
      { name: 'User Tests', pattern: 'tests/user/**/*.test.ts' },
    ];
    
    for (const category of testCategories) {
      await this.runTestCategory(category.name, category.pattern);
    }
    
    this.printSummary();
  }
  
  async runTestCategory(categoryName: string, pattern: string) {
    console.log(`📋 Running ${categoryName}...`);
    
    const startTime = Date.now();
    
    try {
      const { stdout, stderr } = await execAsync(`npm test -- --run ${pattern}`, {
        cwd: process.cwd(),
        env: { ...process.env, NODE_ENV: 'test' }
      });
      
      const duration = Date.now() - startTime;
      const result = this.parseTestOutput(stdout, stderr, categoryName, duration);
      this.results.push(result);
      
      if (result.failed === 0) {
        console.log(`✅ ${categoryName}: ${result.passed}/${result.total} tests passed (${duration}ms)`);
      } else {
        console.log(`❌ ${categoryName}: ${result.passed}/${result.total} tests passed, ${result.failed} failed (${duration}ms)`);
      }
      
    } catch (error: any) {
      console.log(`💥 ${categoryName}: Tests failed to run`);
      console.log(`Error: ${error.message}`);
      
      this.results.push({
        category: categoryName,
        passed: 0,
        failed: 1,
        total: 1,
        duration: Date.now() - startTime,
        errors: [error.message]
      });
    }
    
    console.log('');
  }
  
  parseTestOutput(stdout: string, stderr: string, category: string, duration: number): TestResult {
    // Parse Vitest output to extract test results
    const lines = stdout.split('\n');
    let passed = 0;
    let failed = 0;
    let total = 0;
    const errors: string[] = [];
    
    // Look for test results in the output
    for (const line of lines) {
      if (line.includes('Test Files')) {
        const match = line.match(/(\d+) passed.*?(\d+) failed.*?\((\d+)\)/);
        if (match) {
          passed = parseInt(match[1]);
          failed = parseInt(match[2]);
          total = parseInt(match[3]);
        }
      }
      
      if (line.includes('FAIL') || line.includes('ERROR')) {
        errors.push(line.trim());
      }
    }
    
    if (stderr) {
      errors.push(stderr);
    }
    
    return {
      category,
      passed,
      failed,
      total,
      duration,
      errors
    };
  }
  
  printSummary() {
    console.log('📊 Test Summary Report');
    console.log('='.repeat(50));
    
    let totalPassed = 0;
    let totalFailed = 0;
    let totalTests = 0;
    let totalDuration = 0;
    
    for (const result of this.results) {
      totalPassed += result.passed;
      totalFailed += result.failed;
      totalTests += result.total;
      totalDuration += result.duration;
      
      const status = result.failed === 0 ? '✅' : '❌';
      console.log(`${status} ${result.category.padEnd(20)} | ${result.passed}/${result.total} | ${result.duration}ms`);
    }
    
    console.log('='.repeat(50));
    console.log(`📈 Total: ${totalPassed}/${totalTests} tests passed`);
    console.log(`⏱️  Duration: ${totalDuration}ms`);
    console.log(`💯 Success Rate: ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0}%`);
    
    if (totalFailed > 0) {
      console.log('\n❌ Failed Tests:');
      for (const result of this.results) {
        if (result.failed > 0) {
          console.log(`\n${result.category}:`);
          for (const error of result.errors) {
            console.log(`  - ${error}`);
          }
        }
      }
    }
    
    // Generate report file
    this.generateReport();
  }
  
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        totalTests: this.results.reduce((sum, r) => sum + r.total, 0),
        totalPassed: this.results.reduce((sum, r) => sum + r.passed, 0),
        totalFailed: this.results.reduce((sum, r) => sum + r.failed, 0),
        totalDuration: this.results.reduce((sum, r) => sum + r.duration, 0),
        successRate: this.results.reduce((sum, r) => sum + r.total, 0) > 0 
          ? ((this.results.reduce((sum, r) => sum + r.passed, 0) / this.results.reduce((sum, r) => sum + r.total, 0)) * 100).toFixed(1)
          : '0'
      }
    };
    
    const reportPath = path.join(process.cwd(), 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Self-executing test runner
if (require.main === module) {
  const runner = new TestRunner();
  runner.runTests().catch(console.error);
}

export default TestRunner;
