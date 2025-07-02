import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, JWTPayload, UserRole } from '@/lib/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

// Middleware for authentication
export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Add user to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = payload;

    return handler(authenticatedRequest);
  };
}

// Middleware for role-based authorization
export function withRole(roles: UserRole[]) {
  return function(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
    return withAuth(async (request: AuthenticatedRequest) => {
      const user = request.user!;

      if (!roles.includes(user.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      return handler(request);
    });
  };
}

// Admin-only middleware
export const withAdmin = withRole(['ADMIN']);

// Seller and Admin middleware
export const withSellerOrAdmin = withRole(['SELLER', 'ADMIN']);

// Any authenticated user middleware
export const withAnyRole = withRole(['ADMIN', 'SELLER', 'RENTER']);
