import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, username, contact, password, role = 'RENTER' } = body;

    // Validate required fields
    if (!name || !username || !contact || !password) {
      return NextResponse.json(
        { error: 'Name, username, contact, and password are required' },
        { status: 400 }
      );
    }

    // Check if username or contact already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    const existingContact = await db
      .select()
      .from(users)
      .where(eq(users.contact, contact))
      .limit(1);

    if (existingContact.length > 0) {
      return NextResponse.json(
        { error: 'Contact already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        username,
        contact,
        password: hashedPassword,
        role: role as 'ADMIN' | 'SELLER' | 'RENTER',
      })
      .returning({
        id: users.id,
        name: users.name,
        username: users.username,
        contact: users.contact,
        role: users.role,
        createdAt: users.createdAt,
      });

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      username: newUser.username,
      role: newUser.role,
    });

    return NextResponse.json({
      message: 'User registered successfully',
      user: newUser,
      token,
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
