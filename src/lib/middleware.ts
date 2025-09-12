import { verifyToken, extractTokenFromHeader, JWTPayload, UserRole } from './auth';
import { jsonError } from './api-response';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// Middleware for authentication (framework-agnostic)
export function withAuth(handler: (req: AuthenticatedRequest) => Promise<Response>) {
  return async (request: Request) => {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return jsonError('unauthorized', { status: 401, message: 'Authentication required' });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return jsonError('invalid_token', { status: 401, message: 'Invalid or expired token' });
    }

    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = payload;

    return handler(authenticatedRequest);
  };
}

// Middleware for role-based authorization
export function withRole(roles: UserRole[]) {
  return function(handler: (req: AuthenticatedRequest) => Promise<Response>) {
    return withAuth(async (request: AuthenticatedRequest) => {
      const user = request.user!;

      if (!roles.includes(user.role)) {
        return jsonError('forbidden', { status: 403, message: 'Insufficient permissions' });
      }

      return handler(request);
    });
  };
}

export const withAdmin = withRole(['ADMIN']);
export const withSellerOrAdmin = withRole(['SELLER', 'ADMIN']);
export const withAnyRole = withRole(['ADMIN', 'SELLER', 'RENTER']);
