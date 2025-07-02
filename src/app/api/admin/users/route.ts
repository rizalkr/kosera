import { NextRequest, NextResponse } from 'next/server';
import { withAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { db, users } from '@/db';

async function getAllUsersHandler(request: AuthenticatedRequest) {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        contact: users.contact,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users);

    return NextResponse.json({
      message: 'Users retrieved successfully',
      users: allUsers,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAdmin(getAllUsersHandler);
