import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, kos, posts, users } from '@/db/schema';
import { eq, desc, and, gte, lte, or, count } from 'drizzle-orm';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { z } from 'zod';

// Schema for booking creation
const createBookingSchema = z.object({
  kosId: z.number().positive(),
  checkInDate: z.string().datetime(),
  duration: z.number().positive().max(12), // max 12 months
  notes: z.string().optional(),
});

// GET /api/bookings - Get user's bookings or all bookings (admin)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const offset = (page - 1) * limit;
    const status = searchParams.get('status');

    // Build where conditions based on user role
    let whereConditions;
    
    if (payload.role === 'ADMIN') {
      // Admin can see all bookings
      whereConditions = undefined;
    } else if (payload.role === 'SELLER') {
      // Seller can see bookings for their kos (posts they created)
      whereConditions = eq(posts.userId, payload.userId);
    } else {
      // Renter can only see their own bookings
      whereConditions = eq(bookings.userId, payload.userId);
    }

    if (status) {
      const statusCondition = eq(bookings.status, status);
      whereConditions = whereConditions 
        ? and(whereConditions, statusCondition)
        : statusCondition;
    }

    // Get bookings with kos and user details
    const selectFields = {
      id: bookings.id,
      checkInDate: bookings.checkInDate,
      checkOutDate: bookings.checkOutDate,
      duration: bookings.duration,
      totalPrice: bookings.totalPrice,
      status: bookings.status,
      notes: bookings.notes,
      createdAt: bookings.createdAt,
      updatedAt: bookings.updatedAt,
      kos: {
        id: kos.id,
        name: kos.name,
        address: kos.address,
        city: kos.city,
        facilities: kos.facilities,
      },
      post: {
        id: posts.id,
        title: posts.title,
        price: posts.price,
      },
      // Show user details for admin and seller
      ...(payload.role === 'ADMIN' || payload.role === 'SELLER') && {
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          contact: users.contact,
        },
      },
    };

    const userBookings = await db
      .select(selectFields)
      .from(bookings)
      .innerJoin(kos, eq(bookings.kosId, kos.id))
      .innerJoin(posts, eq(kos.postId, posts.id))
      .innerJoin(users, eq(bookings.userId, users.id))
      .where(whereConditions)
      .orderBy(desc(bookings.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalBookings = await db
      .select({ count: count() })
      .from(bookings)
      .innerJoin(kos, eq(bookings.kosId, kos.id))
      .innerJoin(posts, eq(kos.postId, posts.id))
      .where(whereConditions);

    const totalPages = Math.ceil((totalBookings[0]?.count || 0) / limit);

    return NextResponse.json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: {
        bookings: userBookings,
        pagination: {
          page,
          limit,
          totalBookings: totalBookings[0]?.count || 0,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });

  } catch (error) {
    console.error('Error retrieving bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createBookingSchema.parse(body);

    // Check if kos exists and get price
    const kosData = await db
      .select({
        id: kos.id,
        name: kos.name,
        price: posts.price,
        userId: posts.userId,
      })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .where(eq(kos.id, validatedData.kosId))
      .limit(1);

    if (kosData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kos not found' },
        { status: 404 }
      );
    }

    // Users cannot book their own kos
    if (kosData[0].userId === payload.userId) {
      return NextResponse.json(
        { success: false, error: 'You cannot book your own kos' },
        { status: 400 }
      );
    }

    const checkInDate = new Date(validatedData.checkInDate);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setMonth(checkOutDate.getMonth() + validatedData.duration);

    // Check for conflicting bookings
    const conflictingBookings = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(and(
        eq(bookings.kosId, validatedData.kosId),
        or(
          eq(bookings.status, 'confirmed'),
          eq(bookings.status, 'pending')
        ),
        or(
          and(
            gte(bookings.checkInDate, checkInDate),
            lte(bookings.checkInDate, checkOutDate)
          ),
          and(
            gte(bookings.checkOutDate, checkInDate),
            lte(bookings.checkOutDate, checkOutDate)
          ),
          and(
            lte(bookings.checkInDate, checkInDate),
            gte(bookings.checkOutDate, checkOutDate)
          )
        )
      ))
      .limit(1);

    if (conflictingBookings.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Kos is not available for the selected dates' },
        { status: 409 }
      );
    }

    // Calculate total price
    const totalPrice = kosData[0].price * validatedData.duration;

    // Create booking
    const [newBooking] = await db
      .insert(bookings)
      .values({
        kosId: validatedData.kosId,
        userId: payload.userId,
        checkInDate,
        checkOutDate,
        duration: validatedData.duration,
        totalPrice,
        status: 'pending',
        notes: validatedData.notes,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      data: { 
        booking: {
          ...newBooking,
          kos: {
            id: kosData[0].id,
            name: kosData[0].name,
          },
        },
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
