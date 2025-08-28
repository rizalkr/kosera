import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, kos, posts, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { z } from 'zod';

// Schema for booking update
const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  notes: z.string().optional(),
});

// GET /api/bookings/[id] - Get a specific booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const bookingId = parseInt(id);

    if (isNaN(bookingId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid booking ID' },
        { status: 400 }
      );
    }

    // Get booking with full details
    const booking = await db
      .select({
        id: bookings.id,
        checkInDate: bookings.checkInDate,
        checkOutDate: bookings.checkOutDate,
        duration: bookings.duration,
        totalPrice: bookings.totalPrice,
        status: bookings.status,
        notes: bookings.notes,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        userId: bookings.userId,
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
          userId: posts.userId,
        },
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          contact: users.contact,
        },
      })
      .from(bookings)
      .innerJoin(kos, eq(bookings.kosId, kos.id))
      .innerJoin(posts, eq(kos.postId, posts.id))
      .innerJoin(users, eq(bookings.userId, users.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (booking.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    const bookingData = booking[0];

    // Check access permissions
    const canAccess = payload.role === 'ADMIN' || 
                     bookingData.userId === payload.userId || 
                     bookingData.post.userId === payload.userId;

    if (!canAccess) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking retrieved successfully',
      data: { booking: bookingData },
    });

  } catch (error) {
    console.error('Error retrieving booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve booking' },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[id] - Update booking status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const bookingId = parseInt(id);

    if (isNaN(bookingId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid booking ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateBookingSchema.parse(body);

    // Get booking with kos owner info
    const bookingData = await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        status: bookings.status,
        kosOwnerId: posts.userId,
      })
      .from(bookings)
      .innerJoin(kos, eq(bookings.kosId, kos.id))
      .innerJoin(posts, eq(kos.postId, posts.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (bookingData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    const booking = bookingData[0];

    // ---------------- Permission & Transition Logic ----------------
    // Centralized allowed transitions (business rules)
    const allowedTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['cancelled'], // seller can cancel confirmed; completion handled separately for admin
      cancelled: [],
      completed: [],
    };

    const currentStatus = booking.status;
    const nextStatus = validatedData.status;

    let canUpdate = false;
    let invalidTransition = false;

    if (payload.role === 'ADMIN') {
      // Admin: can perform any valid business transition; completion only from confirmed
      if (nextStatus === 'completed') {
        canUpdate = currentStatus === 'confirmed';
        if (!canUpdate) invalidTransition = true; // e.g., trying to complete from pending/cancelled/completed
      } else if (nextStatus === currentStatus) {
        invalidTransition = true; // no-op not allowed
      } else if (allowedTransitions[currentStatus]?.includes(nextStatus)) {
        canUpdate = true;
      } else {
        invalidTransition = true;
      }
    } else if (booking.kosOwnerId === payload.userId) {
      // Seller (kos owner):
      // - pending -> confirmed | cancelled
      // - confirmed -> cancelled
      const sellerAllowed = allowedTransitions[currentStatus] || [];
      if (nextStatus === 'completed') {
        // Explicitly disallow completion by seller
        invalidTransition = true;
      } else if (nextStatus === currentStatus) {
        invalidTransition = true;
      } else if (sellerAllowed.includes(nextStatus)) {
        canUpdate = true;
      } else {
        invalidTransition = true;
      }
    } else if (booking.userId === payload.userId) {
      // Renter:
      // - pending -> cancelled only
      if (currentStatus === 'pending' && nextStatus === 'cancelled') {
        canUpdate = true;
      } else {
        invalidTransition = true;
      }
    }

    if (!canUpdate) {
      if (invalidTransition) {
        return NextResponse.json(
          { success: false, error: 'Invalid status transition' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Unauthorized: You cannot perform this action' },
        { status: 403 }
      );
    }

    // Update booking
    const [updatedBooking] = await db
      .update(bookings)
      .set({
        status: nextStatus,
        notes: validatedData.notes,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      data: { booking: updatedBooking },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id] - Delete a booking (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    if (payload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const bookingId = parseInt(id);

    if (isNaN(bookingId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid booking ID' },
        { status: 400 }
      );
    }

    // Delete booking
    const deletedBooking = await db
      .delete(bookings)
      .where(eq(bookings.id, bookingId))
      .returning();

    if (deletedBooking.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
