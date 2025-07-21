import { NextResponse } from 'next/server';
import { withAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { db, users } from '@/db';
import { eq, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

type UserRole = 'ADMIN' | 'SELLER' | 'RENTER';

async function getUserHandler(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const userId = parseInt(pathSegments[pathSegments.length - 1]);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const user = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        contact: users.contact,
        role: users.role,
        createdAt: users.createdAt,
        deletedAt: users.deletedAt,
        createdBy: users.createdBy,
        deletedBy: users.deletedBy,
      })
      .from(users)
      .where(sql`${users.id} = ${userId} AND ${users.deletedAt} IS NULL`)
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User retrieved successfully',
      user: user[0],
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateUserHandler(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const userId = parseInt(pathSegments[pathSegments.length - 1]);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, username, contact, role, password } = body;

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Validation
    if (!name || !username || !contact || !role) {
      return NextResponse.json(
        { error: 'Name, username, contact, and role are required' },
        { status: 400 }
      );
    }

    if (!['ADMIN', 'SELLER', 'RENTER'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if username is taken by another user
    if (username !== existingUser[0].username) {
      const usernameCheck = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (usernameCheck.length > 0) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: {
      name: string;
      username: string;
      contact: string;
      role: UserRole;
      password?: string;
    } = {
      name,
      username,
      contact,
      role: role as UserRole,
    };

    // Update password if provided
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        username: users.username,
        contact: users.contact,
        role: users.role,
        createdAt: users.createdAt,
      });

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser[0],
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function deleteUserHandler(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const userId = parseInt(pathSegments[pathSegments.length - 1]);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get current admin user ID
    const currentUserId = request.user?.userId;

    // Check if user exists and not already deleted
    const existingUser = await db
      .select()
      .from(users)
      .where(sql`${users.id} = ${userId} AND ${users.deletedAt} IS NULL`)
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found or already deleted' },
        { status: 404 }
      );
    }

    // Prevent deleting the current admin user if we have user info
    if (request.user && typeof request.user === 'object' && 'userId' in request.user) {
      if (existingUser[0].id === request.user.userId) {
        return NextResponse.json(
          { error: 'Cannot delete your own account' },
          { status: 400 }
        );
      }
    }

    // Soft delete user
    await db
      .update(users)
      .set({
        deletedAt: new Date(),
        deletedBy: currentUserId,
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function restoreUserHandler(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const userId = parseInt(pathSegments[pathSegments.length - 1]);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Check if user exists and is deleted
    const existingUser = await db
      .select()
      .from(users)
      .where(sql`${users.id} = ${userId} AND ${users.deletedAt} IS NOT NULL`)
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found or not deleted' },
        { status: 404 }
      );
    }

    // Restore user (remove soft delete)
    await db
      .update(users)
      .set({
        deletedAt: null,
        deletedBy: null,
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      message: 'User restored successfully',
    });
  } catch (error) {
    console.error('Restore user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAdmin(getUserHandler);
export const PUT = withAdmin(updateUserHandler);
export const DELETE = withAdmin(deleteUserHandler);
export const PATCH = withAdmin(restoreUserHandler);
