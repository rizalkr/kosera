import { NextResponse } from 'next/server';
import { withAnyRole, AuthenticatedRequest } from '@/lib/middleware';
import { ok } from '@/types/api';

async function getProfileHandler(request: AuthenticatedRequest) {
  const user = request.user!;
  return ok('Profile retrieved successfully', {
    user: {
      userId: user.userId,
      username: user.username,
      role: user.role,
    },
  });
}

export const GET = withAnyRole(getProfileHandler);
