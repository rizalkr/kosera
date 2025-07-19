import { NextResponse } from 'next/server';
import { withAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { db, users } from '@/db';
import { eq, sql, count, isNull, ilike } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function getAllUsersHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const showDeleted = searchParams.get('showDeleted') === 'true';
    
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];
    
    // Show only active users by default, or only deleted users if showDeleted=true
    if (showDeleted) {
      whereConditions.push(sql`${users.deletedAt} IS NOT NULL`);
    } else {
      whereConditions.push(isNull(users.deletedAt));
    }
    
    if (search) {
      whereConditions.push(
        sql`(${users.name} ILIKE ${'%' + search + '%'} OR ${users.username} ILIKE ${'%' + search + '%'} OR ${users.contact} ILIKE ${'%' + search + '%'})`
      );
    }
    
    if (role && role !== 'all') {
      whereConditions.push(eq(users.role, role as 'ADMIN' | 'SELLER' | 'RENTER'));
    }

    // Combine conditions with AND
    let whereCondition;
    if (whereConditions.length === 1) {
      whereCondition = whereConditions[0];
    } else if (whereConditions.length > 1) {
      whereCondition = whereConditions[0];
      for (let i = 1; i < whereConditions.length; i++) {
        whereCondition = sql`${whereCondition} AND ${whereConditions[i]}`;
      }
    }

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(users)
      .where(whereCondition);
    
    const total = totalResult[0]?.count || 0;

    // Get users with pagination
    const userQuery = db
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
      .where(whereCondition)
      .limit(limit)
      .offset(offset)
      .orderBy(users.createdAt);

    const allUsers = await userQuery;

    // Get creator and deleter info for users that have them
    const usersWithCreatorInfo = await Promise.all(
      allUsers.map(async (user) => {
        let creatorInfo = null;
        let deleterInfo = null;

        if (user.createdBy) {
          const creator = await db
            .select({
              id: users.id,
              name: users.name,
              username: users.username,
              contact: users.contact,
            })
            .from(users)
            .where(eq(users.id, user.createdBy))
            .limit(1);
          creatorInfo = creator[0] || null;
        }

        if (user.deletedBy) {
          const deleter = await db
            .select({
              id: users.id,
              name: users.name,
              username: users.username,
              contact: users.contact,
            })
            .from(users)
            .where(eq(users.id, user.deletedBy))
            .limit(1);
          deleterInfo = deleter[0] || null;
        }

        return {
          ...user,
          creatorInfo,
          deleterInfo,
        };
      })
    );

    return NextResponse.json({
      message: 'Users retrieved successfully',
      users: usersWithCreatorInfo,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      showDeleted,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function createUserHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { name, username, contact, role, password } = body;

    // Get current admin user ID
    const currentUserId = request.user?.userId;

    // Validation
    if (!name || !username || !contact || !role || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!['ADMIN', 'SELLER', 'RENTER'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if username already exists (excluding soft deleted users)
    const existingUser = await db
      .select()
      .from(users)
      .where(sql`${users.username} = ${username} AND ${users.deletedAt} IS NULL`)
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        name,
        username,
        contact,
        role: role as any,
        password: hashedPassword,
        createdBy: currentUserId,
      })
      .returning({
        id: users.id,
        name: users.name,
        username: users.username,
        contact: users.contact,
        role: users.role,
        createdAt: users.createdAt,
        createdBy: users.createdBy,
      });

    return NextResponse.json({
      message: 'User created successfully',
      user: newUser[0],
    }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAdmin(getAllUsersHandler);
export const POST = withAdmin(createUserHandler);
