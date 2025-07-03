import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth';
import type { UserRole } from '@/lib/auth';
import { vi } from 'vitest';

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

// Helper function to create mock request
export function createMockRequest(
  method: string = 'GET',
  body?: any,
  headers?: Record<string, string>
): NextRequest {
  const url = 'http://localhost:3000/api/test';
  const requestHeaders = new Headers({
    'content-type': 'application/json',
    ...headers,
  });

  if (body) {
    return new NextRequest(url, {
      method,
      headers: requestHeaders,
      body: JSON.stringify(body),
    });
  }

  return new NextRequest(url, {
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
