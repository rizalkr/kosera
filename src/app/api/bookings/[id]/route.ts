// Refactored to standardized Fetch API + envelope (ok/fail)
// TODO: Add rate limiting & enhanced auditing for booking status changes.
import { db } from '@/db';
import { bookings, kos, posts, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { z } from 'zod';
import { ok, fail } from '@/types/api';

// Schema for booking update
const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  notes: z.string().optional(),
});

interface BookingDetail {
  id: number; checkInDate: Date; checkOutDate: Date | null; duration: number; totalPrice: number; status: string; notes: string | null; createdAt: Date; updatedAt: Date; userId: number;
  kos: { id: number; name: string; address: string; city: string; facilities: string | null };
  post: { id: number; title: string; price: number; userId: number };
  user: { id: number; name: string; username: string; contact: string };
}

/** GET /api/bookings/[id] */
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    if (!token) return fail('unauthorized', 'Authentication required', undefined, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return fail('invalid_token', 'Invalid or expired token', undefined, { status: 401 });

    const { id } = await ctx.params;
    const bookingId = Number.parseInt(id, 10);
    if (Number.isNaN(bookingId)) return fail('invalid_id', 'Invalid booking ID', undefined, { status: 400 });

    const rows = await db
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
        kos: { id: kos.id, name: kos.name, address: kos.address, city: kos.city, facilities: kos.facilities },
        post: { id: posts.id, title: posts.title, price: posts.price, userId: posts.userId },
        user: { id: users.id, name: users.name, username: users.username, contact: users.contact },
      })
      .from(bookings)
      .innerJoin(kos, eq(bookings.kosId, kos.id))
      .innerJoin(posts, eq(kos.postId, posts.id))
      .innerJoin(users, eq(bookings.userId, users.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (rows.length === 0) return fail('not_found', 'Booking not found', undefined, { status: 404 });
    const booking = rows[0] as BookingDetail;

    const canAccess = payload.role === 'ADMIN' || booking.userId === payload.userId || booking.post.userId === payload.userId;
    if (!canAccess) return fail('forbidden', 'Access denied', undefined, { status: 403 });

    return ok('Booking retrieved successfully', { booking });
  } catch (error) {
    console.error('booking.GET error', error);
    return fail('internal_error', 'Failed to retrieve booking', undefined, { status: 500 });
  }
}

/** PUT /api/bookings/[id] */
export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    if (!token) return fail('unauthorized', 'Authentication required', undefined, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return fail('invalid_token', 'Invalid or expired token', undefined, { status: 401 });

    const { id } = await ctx.params;
    const bookingId = Number.parseInt(id, 10);
    if (Number.isNaN(bookingId)) return fail('invalid_id', 'Invalid booking ID', undefined, { status: 400 });

    let body: unknown;
    try { body = await request.json(); } catch { return fail('invalid_json', 'Invalid JSON body', undefined, { status: 400 }); }
    const parsed = updateBookingSchema.safeParse(body);
    if (!parsed.success) return fail('validation_error', 'Invalid input data', parsed.error.flatten(), { status: 400 });
    const update = parsed.data;

    const rows = await db
      .select({ id: bookings.id, userId: bookings.userId, status: bookings.status, kosOwnerId: posts.userId })
      .from(bookings)
      .innerJoin(kos, eq(bookings.kosId, kos.id))
      .innerJoin(posts, eq(kos.postId, posts.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);
    if (rows.length === 0) return fail('not_found', 'Booking not found', undefined, { status: 404 });
    const current = rows[0];

    const allowedTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['cancelled'],
      cancelled: [],
      completed: [],
    };

    const currentStatus = current.status;
    const nextStatus = update.status;
    let canUpdate = false; let invalidTransition = false;

    if (payload.role === 'ADMIN') {
      if (nextStatus === 'completed') canUpdate = currentStatus === 'confirmed';
      else if (nextStatus === currentStatus) invalidTransition = true;
      else if (allowedTransitions[currentStatus]?.includes(nextStatus)) canUpdate = true; else invalidTransition = true;
    } else if (current.kosOwnerId === payload.userId) {
      if (nextStatus === 'completed') invalidTransition = true; else if (nextStatus === currentStatus) invalidTransition = true; else if (allowedTransitions[currentStatus]?.includes(nextStatus)) canUpdate = true; else invalidTransition = true;
    } else if (current.userId === payload.userId) {
      if (currentStatus === 'pending' && nextStatus === 'cancelled') canUpdate = true; else invalidTransition = true;
    }

    if (!canUpdate) return invalidTransition
      ? fail('invalid_transition', 'Invalid status transition', undefined, { status: 400 })
      : fail('forbidden', 'You cannot perform this action', undefined, { status: 403 });

    const [updated] = await db.update(bookings).set({ status: nextStatus, notes: update.notes, updatedAt: new Date() }).where(eq(bookings.id, bookingId)).returning();
    return ok('Booking updated successfully', { booking: updated });
  } catch (error) {
    console.error('booking.PUT error', error);
    return fail('internal_error', 'Failed to update booking', undefined, { status: 500 });
  }
}

/** DELETE /api/bookings/[id] */
export async function DELETE(request: Request, ctx: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    if (!token) return fail('unauthorized', 'Authentication required', undefined, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return fail('invalid_token', 'Invalid or expired token', undefined, { status: 401 });
    if (payload.role !== 'ADMIN') return fail('forbidden', 'Admin access required', undefined, { status: 403 });

    const { id } = await ctx.params;
    const bookingId = Number.parseInt(id, 10);
    if (Number.isNaN(bookingId)) return fail('invalid_id', 'Invalid booking ID', undefined, { status: 400 });

    const deleted = await db.delete(bookings).where(eq(bookings.id, bookingId)).returning();
    if (deleted.length === 0) return fail('not_found', 'Booking not found', undefined, { status: 404 });

    return ok('Booking deleted successfully', {});
  } catch (error) {
    console.error('booking.DELETE error', error);
    return fail('internal_error', 'Failed to delete booking', undefined, { status: 500 });
  }
}
