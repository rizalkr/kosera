import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, kos } from '@/db/schema';
import { eq, and, gte, lte, or } from 'drizzle-orm';

// GET /api/kos/[id]/availability - Check kos availability
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kosId = parseInt(id);

    if (isNaN(kosId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid kos ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const checkInDateStr = searchParams.get('checkInDate');
    const durationStr = searchParams.get('duration');

    if (!checkInDateStr || !durationStr) {
      return NextResponse.json(
        { success: false, error: 'checkInDate and duration are required' },
        { status: 400 }
      );
    }

    const duration = parseInt(durationStr);
    if (isNaN(duration) || duration <= 0 || duration > 12) {
      return NextResponse.json(
        { success: false, error: 'Duration must be between 1 and 12 months' },
        { status: 400 }
      );
    }

    // Check if kos exists
    const kosExists = await db
      .select({ id: kos.id })
      .from(kos)
      .where(eq(kos.id, kosId))
      .limit(1);

    if (kosExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kos not found' },
        { status: 404 }
      );
    }

    const checkInDate = new Date(checkInDateStr);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setMonth(checkOutDate.getMonth() + duration);

    // Check for conflicting bookings
    const conflictingBookings = await db
      .select({
        id: bookings.id,
        checkInDate: bookings.checkInDate,
        checkOutDate: bookings.checkOutDate,
        status: bookings.status,
      })
      .from(bookings)
      .where(and(
        eq(bookings.kosId, kosId),
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
      ));

    const isAvailable = conflictingBookings.length === 0;

    // Get upcoming bookings for context (next 3 months)
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
      .where(and(
        eq(bookings.kosId, kosId),
        or(
          eq(bookings.status, 'confirmed'),
          eq(bookings.status, 'pending')
        ),
        gte(bookings.checkInDate, today),
        lte(bookings.checkInDate, threeMonthsFromNow)
      ))
      .orderBy(bookings.checkInDate);

    return NextResponse.json({
      success: true,
      message: 'Availability checked successfully',
      data: {
        available: isAvailable,
        requestedPeriod: {
          checkInDate: checkInDate.toISOString(),
          checkOutDate: checkOutDate.toISOString(),
          duration,
        },
        conflicts: conflictingBookings.map(booking => ({
          checkInDate: booking.checkInDate.toISOString(),
          checkOutDate: booking.checkOutDate?.toISOString(),
          status: booking.status,
        })),
        upcomingBookings: upcomingBookings.map(booking => ({
          checkInDate: booking.checkInDate.toISOString(),
          checkOutDate: booking.checkOutDate?.toISOString(),
          status: booking.status,
        })),
      },
    });

  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
