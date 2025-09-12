import { verifyToken, extractTokenFromHeader } from './auth';

export interface ServerAuthResult {
  isAuthenticated: boolean;
  user: {
    userId: number;
    username: string;
    role: 'ADMIN' | 'SELLER' | 'RENTER';
  } | null;
  error?: string;
}

// Accept standard Fetch API Request (removes NextRequest dependency for testability)
export const serverAuth = (request: Request): ServerAuthResult => {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization'));

    if (!token) {
      return {
        isAuthenticated: false,
        user: null,
        error: 'No token provided'
      };
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return {
        isAuthenticated: false,
        user: null,
        error: 'Invalid token'
      };
    }

    return {
      isAuthenticated: true,
      user: {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role
      }
    };
  } catch {
    return {
      isAuthenticated: false,
      user: null,
      error: 'Authentication failed'
    };
  }
};

export const requireAuth = (request: Request): ServerAuthResult => {
  const auth = serverAuth(request);

  if (!auth.isAuthenticated) {
    return {
      isAuthenticated: false,
      user: null,
      error: auth.error || 'Authentication required'
    };
  }

  return auth;
};

export const requireRole = (
  request: Request,
  requiredRoles: ('ADMIN' | 'SELLER' | 'RENTER')[]
): ServerAuthResult => {
  const auth = requireAuth(request);

  if (!auth.isAuthenticated || !auth.user) {
    return auth;
  }

  if (!requiredRoles.includes(auth.user.role)) {
    return {
      isAuthenticated: false,
      user: null,
      error: `Access denied. Required roles: ${requiredRoles.join(', ')}`
    };
  }

  return auth;
};

export const requireAdmin = (request: Request): ServerAuthResult => {
  return requireRole(request, ['ADMIN']);
};

export const requireSeller = (request: Request): ServerAuthResult => {
  return requireRole(request, ['SELLER', 'ADMIN']);
};

export const requireRenter = (request: Request): ServerAuthResult => {
  return requireRole(request, ['RENTER']);
};
