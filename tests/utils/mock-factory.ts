import { vi } from 'vitest';
import { db } from '@/db';
import { users, posts, kos } from '@/db/schema';
import { generateToken, hashPassword } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export const createMockDb = () => {
  const mockDbLimit = vi.fn();
  const mockDbReturning = vi.fn();
  const mockDbFrom = vi.fn();
  
  return {
    mocks: {
      mockDbLimit,
      mockDbReturning,
      mockDbFrom,
    },
    db: {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: mockDbLimit,
          }),
        }),
      }),
      insert: () => ({
        values: () => ({
          returning: mockDbReturning,
        }),
      }),
    },
    users: {},
  };
};

export const createMockJwt = () => {
  const mockSign = vi.fn();
  const mockVerify = vi.fn();
  
  return {
    mocks: {
      mockSign,
      mockVerify,
    },
    jwt: {
      sign: mockSign,
      verify: mockVerify,
    },
  };
};

// Utility functions for integration tests
export async function createTestUser(usernamePrefix: string, role: 'ADMIN' | 'SELLER' | 'RENTER' = 'RENTER') {
  const timestamp = Date.now();
  const username = `${usernamePrefix}_${timestamp}`;
  const password = await hashPassword('testpassword123');
  
  const [newUser] = await db
    .insert(users)
    .values({
      name: `Test ${usernamePrefix}`,
      username,
      contact: `${usernamePrefix}@test.com`,
      role,
      password
    })
    .returning();
  
  return newUser;
}

export function createAuthToken(payload: { userId: number; username: string; role: 'ADMIN' | 'SELLER' | 'RENTER' }) {
  return generateToken(payload);
}

export async function cleanupTestData() {
  try {
    // Delete in order to respect foreign key constraints
    await db.delete(kos).execute();
    await db.delete(posts).execute();
    
    // Clean up test users (those with test usernames)
    await db.delete(users).where(
      // This is a simple cleanup - in real scenarios you might want more sophisticated cleanup
      eq(users.contact, 'test@test.com')
    ).execute();
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}
