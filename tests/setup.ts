import { config } from 'dotenv';

// Load environment variables for testing
config();

// Test environment is handled by vitest config

// Mock JWT secret for testing
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key-for-vitest';
}

// Mock database connection details for testing
if (!process.env.POSTGRES_HOST) {
  process.env.POSTGRES_HOST = 'localhost';
}
if (!process.env.POSTGRES_PORT) {
  process.env.POSTGRES_PORT = '5432';
}
if (!process.env.POSTGRES_USER) {
  process.env.POSTGRES_USER = 'postgres';
}
if (!process.env.POSTGRES_PASSWORD) {
  process.env.POSTGRES_PASSWORD = 'password';
}
if (!process.env.POSTGRES_DATABASE) {
  process.env.POSTGRES_DATABASE = 'kosera';
}

// Global test setup
console.log('🧪 Test environment setup complete');
