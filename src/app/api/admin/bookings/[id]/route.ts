import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server-auth';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Zod schema for validating booking status update payload.
 */
const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  notes: z.string().optional(),
});

/**
 * PATCH /api/admin/bookings/[id]
 * Allows admin to update the status (and notes) of a booking.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Admin authentication
  const auth = requireAdmin(req);
  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { success: false, error: `Unauthorized - ${auth.error}` },
      { status: 401 }
    );
  }

  const bookingId = Number(params.id);
  if (isNaN(bookingId)) {
    return NextResponse.json(
      { success: false, error: 'Invalid booking ID' },
      { status: 400 }
    );
  }

  let body;
  try {
    body = await req.json();
    updateBookingStatusSchema.parse(body);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body or status value' },
      { status: 400 }
    );
  }

  try {
    const [updatedBooking] = await db
      .update(bookings)
      .set({
        status: body.status,
        notes: body.notes,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    if (!updatedBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        notes: updatedBooking.notes,
        updatedAt: updatedBooking.updatedAt,
      },
    });
  } catch (error) {
    console.error('Admin update booking status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update booking status' },
      { status: 500 }
    );
  }
}