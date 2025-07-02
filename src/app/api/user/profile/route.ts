import { NextRequest, NextResponse } from 'next/server';
import { withAnyRole, AuthenticatedRequest } from '@/lib/middleware';

async function getProfileHandler(request: AuthenticatedRequest) {
  const user = request.user!;
  
  return NextResponse.json({
    message: 'Profile retrieved successfully',
    user: {
      userId: user.userId,
      username: user.username,
      role: user.role,
    },
  });
}

export const GET = withAnyRole(getProfileHandler);
