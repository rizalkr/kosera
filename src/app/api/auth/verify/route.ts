import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { ok, fail } from '@/types/api';

/**
 * GET /api/auth/verify
 * Verifies a bearer JWT and returns the decoded user payload.
 * Response envelope standardized via ok/fail helpers.
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return fail('unauthorized', 'No token provided', undefined, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return fail('invalid_token', 'Invalid or expired token', undefined, { status: 401 });
    }

    return ok('Token is valid', {
      user: {
        userId: payload.userId,
        username: payload.username,
        role: payload.role,
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return fail('internal_error', 'Internal server error', undefined, { status: 500 });
  }
}
