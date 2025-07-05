import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth';
import type { UserRole } from '@/lib/auth';
import { vi } from 'vitest';
import { db, users, posts, kos } from '@/db';
import { eq, or } from 'drizzle-orm';

// Base URL for API testing
export const BASE_URL = 'http://localhost:3000';

// Mock user data for testing
export const mockUsers = {
  admin: {
    id: 1,
    name: 'Admin User',
    username: 'admin',
    contact: 'admin@example.com',
    role: 'ADMIN' as UserRole,
    password: 'hashedPassword123',
    createdAt: new Date(),
  },
  seller: {
    id: 2,
    name: 'Seller User',
    username: 'seller',
    contact: 'seller@example.com',
    role: 'SELLER' as UserRole,
    password: 'hashedPassword456',
    createdAt: new Date(),
  },
  renter: {
    id: 3,
    name: 'Renter User',
    username: 'renter',
    contact: 'renter@example.com',
    role: 'RENTER' as UserRole,
    password: 'hashedPassword789',
    createdAt: new Date(),
  },
};

// Generate test tokens
export const testTokens = {
  admin: generateToken({
    userId: mockUsers.admin.id,
    username: mockUsers.admin.username,
    role: mockUsers.admin.role,
  }),
  seller: generateToken({
    userId: mockUsers.seller.id,
    username: mockUsers.seller.username,
    role: mockUsers.seller.role,
  }),
  renter: generateToken({
    userId: mockUsers.renter.id,
    username: mockUsers.renter.username,
    role: mockUsers.renter.role,
  }),
};

// Create a test user in the database
export async function createUser(userData: {
  name: string;
  username: string;
  contact: string;
  role: 'ADMIN' | 'SELLER' | 'RENTER';
  password: string;
}) {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create user: ${error.error || response.statusText}`);
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}

// Login and get a token for a test user
export async function createLoginToken(username: string, password: string): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to login: ${error.error || response.statusText}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error creating login token:', error);
    throw error;
  }
}

// Delete all test data from the database
export async function deleteTestData() {
  try {
    // Delete kos first (due to foreign key constraints)
    await db.delete(kos);
    
    // Delete posts
    await db.delete(posts);
    
    // Delete test users (those with test prefixes)
    await db.delete(users).where(
      or(
        eq(users.username, 'testseller_kos'),
        eq(users.username, 'testadmin_kos'),
        eq(users.username, 'testrenter_kos'),
        eq(users.username, 'testseller2_kos'),
        eq(users.username, 'testadmin2_kos'),
        eq(users.username, 'testrenter2_kos')
      )
    );
    
    console.log('Test data cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up test data:', error);
    // Don't throw the error to avoid failing tests due to cleanup issues
  }
}

// Helper function to create mock request
export function createMockRequest(
  method: string = 'GET',
  body?: any,
  headers?: Record<string, string>,
  url?: string
): NextRequest {
  const requestUrl = url || 'http://localhost:3000/api/test';
  const requestHeaders = new Headers({
    'content-type': 'application/json',
    ...headers,
  });

  if (body) {
    return new NextRequest(requestUrl, {
      method,
      headers: requestHeaders,
      body: JSON.stringify(body),
    });
  }

  return new NextRequest(requestUrl, {
    method,
    headers: requestHeaders,
  });
}

// Helper function to create authenticated request
export function createAuthenticatedRequest(
  method: string = 'GET',
  userType: keyof typeof testTokens = 'admin',
  body?: any,
  additionalHeaders?: Record<string, string>
): NextRequest {
  return createMockRequest(method, body, {
    authorization: `Bearer ${testTokens[userType]}`,
    ...additionalHeaders,
  });
}

// Helper function to parse NextResponse
export async function parseResponse(response: NextResponse) {
  const text = await response.text();
  try {
    return {
      status: response.status,
      data: JSON.parse(text),
    };
  } catch {
    return {
      status: response.status,
      data: text,
    };
  }
}

// Mock database functions
export const mockDb = {
  users: {
    findByUsername: vi.fn(),
    findByContact: vi.fn(),
    create: vi.fn(),
    findAll: vi.fn(),
  },
  reset: () => {
    Object.values(mockDb.users).forEach(fn => fn.mockReset());
  },
};
