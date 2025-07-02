import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 12;

export type UserRole = 'ADMIN' | 'SELLER' | 'RENTER';

export interface JWTPayload {
  userId: number;
  username: string;
  role: UserRole;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcryptjs.hash(password, SALT_ROUNDS);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcryptjs.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '7d' // Token expires in 7 days
  });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}
