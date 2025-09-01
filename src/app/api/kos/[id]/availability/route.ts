import { db } from '@/db';
import { bookings, kos } from '@/db/schema';
import { eq, and, gte, lte, or } from 'drizzle-orm';
import { ok, fail } from '@/types/api';

// GET /api/kos/[id]/availability - Check kos availability
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await context.params;
    const kosId = Number(id);
    if (!Number.isInteger(kosId) || kosId <= 0) {
      return fail('invalid_id', 'Invalid kos ID', { id }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const checkInDateStr = searchParams.get('checkInDate');
    const durationStr = searchParams.get('duration');

    if (!checkInDateStr || !durationStr) {
      return fail(
        'missing_params',
        'checkInDate and duration are required',
        { checkInDate: checkInDateStr, duration: durationStr },
        { status: 400 }
      );
    }

    const duration = parseInt(durationStr);
    if (isNaN(duration) || duration <= 0 || duration > 12) {
      return fail(
        'invalid_duration',
        'Duration must be between 1 and 12 months',
        { duration: durationStr },
        { status: 400 }
      );
    }

    const kosExists = await db
      .select({ id: kos.id })
      .from(kos)
      .where(eq(kos.id, kosId))
      .limit(1);
    if (!kosExists.length) {
      return fail('not_found', 'Kos not found', undefined, { status: 404 });
    }

    const checkInDate = new Date(checkInDateStr);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setMonth(checkOutDate.getMonth() + duration);

    const conflictingBookings = await db
      .select({
        id: bookings.id,
        checkInDate: bookings.checkInDate,
        checkOutDate: bookings.checkOutDate,
        status: bookings.status,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.kosId, kosId),
          or(eq(bookings.status, 'confirmed'), eq(bookings.status, 'pending')),
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
        )
      );

    const isAvailable = conflictingBookings.length === 0;

    const today = new Date();
    const threeMonthsFromNow = new Date(today);
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    const upcomingBookings = await db
      .select({
        checkInDate: bookings.checkInDate,
        checkOutDate: bookings.checkOutDate,
        status: bookings.status,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.kosId, kosId),
          or(eq(bookings.status, 'confirmed'), eq(bookings.status, 'pending')),
          gte(bookings.checkInDate, today),
          lte(bookings.checkInDate, threeMonthsFromNow)
        )
      )
      .orderBy(bookings.checkInDate);

    return ok('Availability checked successfully', {
      available: isAvailable,
      requestedPeriod: {
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        duration,
      },
      conflicts: conflictingBookings.map(b => ({
        checkInDate: b.checkInDate.toISOString(),
        checkOutDate: b.checkOutDate?.toISOString(),
        status: b.status,
      })),
      upcomingBookings: upcomingBookings.map(b => ({
        checkInDate: b.checkInDate.toISOString(),
        checkOutDate: b.checkOutDate?.toISOString(),
        status: b.status,
      })),
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return fail(
      'internal_error',
      'Failed to check availability',
      undefined,
      { status: 500 }
    );
  }
}
