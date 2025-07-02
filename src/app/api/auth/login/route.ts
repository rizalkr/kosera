import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user by username or contact
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      // Also try to find by contact (email)
      const [userByContact] = await db
        .select()
        .from(users)
        .where(eq(users.contact, username))
        .limit(1);

      if (!userByContact) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
      
      // Use the user found by contact
      const isValidPassword = await verifyPassword(password, userByContact.password);
      
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = generateToken({
        userId: userByContact.id,
        username: userByContact.username,
        role: userByContact.role,
      });

      return NextResponse.json({
        message: 'Login successful',
        user: {
          id: userByContact.id,
          name: userByContact.name,
          username: userByContact.username,
          contact: userByContact.contact,
          role: userByContact.role,
          createdAt: userByContact.createdAt,
        },
        token,
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        contact: user.contact,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
