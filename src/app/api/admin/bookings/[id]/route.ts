import { requireAdmin } from '@/lib/server-auth';
import type { ServerAuthResult } from '@/lib/server-auth';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { ok, fail } from '@/types/api';

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
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const auth: ServerAuthResult = requireAdmin(req);
  if (!auth.isAuthenticated) {
    return fail('unauthorized', `Unauthorized - ${auth.error}`, undefined, { status: 401 });
  }

  const bookingId = Number(id);
  if (isNaN(bookingId)) {
    return fail('invalid_id', 'Invalid booking ID', undefined, { status: 400 });
  }

  let body: unknown;
  try {
    body = await (req as Request).json();
    updateBookingStatusSchema.parse(body);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return fail(
        'validation_error',
        'Invalid request body or status value',
        e.format(),
        { status: 400 }
      );
    }
    return fail('invalid_body', 'Invalid request body', undefined, {
      status: 400,
    });
  }

  try {
    const payload = body as z.infer<typeof updateBookingStatusSchema>;
    const [updatedBooking] = await db
      .update(bookings)
      .set({
        status: payload.status,
        notes: payload.notes,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    if (!updatedBooking) {
      return fail('not_found', 'Booking not found', undefined, { status: 404 });
    }

    return ok('Booking status updated', {
      id: updatedBooking.id,
      status: updatedBooking.status,
      notes: updatedBooking.notes,
      updatedAt: updatedBooking.updatedAt,
    });
  } catch (error) {
    console.error('Admin update booking status error:', error);
    return fail('update_failed', 'Failed to update booking status', undefined, {
      status: 500,
    });
  }
}