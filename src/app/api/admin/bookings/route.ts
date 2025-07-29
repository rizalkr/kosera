import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server-auth';
import { db } from '@/db';
import { bookings, users, kos } from '@/db/schema';
import { eq, and, or, like, gte, lte, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication using the server auth utility
    const auth = requireAdmin(request);
    
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { success: false, error: `Unauthorized - ${auth.error}` },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const searchQuery = searchParams.get('searchQuery');

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];

    if (status && status !== 'all') {
      whereConditions.push(eq(bookings.status, status));
    }
    
    if (startDate) {
      whereConditions.push(gte(bookings.createdAt, new Date(startDate)));
    }
    
    if (endDate) {
      whereConditions.push(lte(bookings.createdAt, new Date(endDate)));
    }

    // Add search functionality
    if (searchQuery) {
      whereConditions.push(
        or(
          like(users.name, `%${searchQuery}%`),
          like(users.username, `%${searchQuery}%`),
          like(users.contact, `%${searchQuery}%`),
          like(kos.name, `%${searchQuery}%`),
          like(kos.city, `%${searchQuery}%`)
        )
      );
    }

    // Fetch bookings with pagination and joins
    const bookingsQuery = db
      .select({
        id: bookings.id,
        status: bookings.status,
        checkInDate: bookings.checkInDate,
        checkOutDate: bookings.checkOutDate,
        totalPrice: bookings.totalPrice,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          contact: users.contact,
        },
        kos: {
          id: kos.id,
          name: kos.name,
          city: kos.city,
        }
      })
      .from(bookings)
      .innerJoin(users, eq(bookings.userId, users.id))
      .innerJoin(kos, eq(bookings.kosId, kos.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(bookings.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const countQuery = db
      .select({ count: bookings.id })
      .from(bookings)
      .innerJoin(users, eq(bookings.userId, users.id))
      .innerJoin(kos, eq(bookings.kosId, kos.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const [bookingsData, countResult] = await Promise.all([
      bookingsQuery,
      countQuery
    ]);

    const totalCount = countResult.length;
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        bookings: bookingsData.map(booking => ({
          id: booking.id,
          user: booking.user,
          kos: booking.kos,
          status: booking.status,
          checkInDate: booking.checkInDate.toISOString().split('T')[0],
          checkOutDate: booking.checkOutDate?.toISOString().split('T')[0] || null,
          totalPrice: booking.totalPrice,
          createdAt: booking.createdAt.toISOString().split('T')[0],
          updatedAt: booking.updatedAt.toISOString().split('T')[0],
        })),
        pagination: {
          page,
          totalPages,
          total: totalCount,
          hasNext: hasNextPage,
          hasPrev: hasPrevPage,
        }
      }
    });

  } catch (error) {
    console.error('Admin bookings API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error - Failed to fetch bookings data' 
      },
      { status: 500 }
    );
  }
} 