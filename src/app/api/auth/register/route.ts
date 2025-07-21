import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, username, contact, password, role = 'RENTER' } = body;

    console.log('Registration attempt:', { name, username, contact, role, passwordLength: password?.length });

    // Validate required fields
    if (!name || !username || !contact || !password) {
      return NextResponse.json(
        { error: 'Name, username, contact, and password are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['ADMIN', 'SELLER', 'RENTER'];
    if (!validRoles.includes(role)) {
      console.error('Invalid role provided:', role);
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // Use database transaction to ensure atomicity
    const result = await db.transaction(async (tx) => {
      // Check if username already exists
      const existingUser = await tx
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUser.length > 0) {
        throw new Error('Username already exists');
      }

      // Check if contact already exists
      const existingContact = await tx
        .select()
        .from(users)
        .where(eq(users.contact, contact))
        .limit(1);

      if (existingContact.length > 0) {
        throw new Error('Contact already exists');
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user within transaction
      const [newUser] = await tx
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

      return { user: newUser, token };
    });

    console.log('Registration successful:', { userId: result.user.id, username: result.user.username });

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        token: result.token,
      }
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Registration error:', error);
    
    // Type guard for database error
    const isDatabaseError = (err: unknown): err is { code: string; constraint?: string; message: string } => {
      return typeof err === 'object' && err !== null && 'code' in err;
    };
    
    // Handle specific database errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage === 'Username already exists') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Username sudah digunakan',
          message: 'Username yang Anda pilih sudah digunakan oleh user lain'
        },
        { status: 409 }
      );
    }
    
    if (errorMessage === 'Contact already exists') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Contact sudah digunakan',
          message: 'Nomor HP/Email yang Anda masukkan sudah terdaftar'
        },
        { status: 409 }
      );
    }

    // Handle PostgreSQL unique constraint violations
    if (isDatabaseError(error) && error.code === '23505') {
      if (error.constraint?.includes('username')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Username sudah digunakan',
            message: 'Username yang Anda pilih sudah digunakan oleh user lain'
          },
          { status: 409 }
        );
      }
      if (error.constraint?.includes('contact')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Contact sudah digunakan', 
            message: 'Nomor HP/Email yang Anda masukkan sudah terdaftar'
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Terjadi kesalahan server, silakan coba lagi'
      },
      { status: 500 }
    );
  }
}
