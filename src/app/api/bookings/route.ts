import { withAnyRole, AuthenticatedRequest } from '@/lib/middleware';
import { db } from '@/db';
import { bookings, kos, posts, users } from '@/db/schema';
import { eq, desc, and, gte, lte, or, count } from 'drizzle-orm';
import { ok, fail } from '@/types/api';
import { z } from 'zod';
import { parsePagination, buildPaginationMeta } from '@/lib/pagination';

// Schema for booking creation
const createBookingSchema = z.object({
  kosId: z.coerce.number().int().positive(),
  checkInDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: 'Invalid date format' }),
  duration: z.coerce.number().int().positive().max(12), // max 12 months
  notes: z.string().max(500).optional(),
});

interface BookingFilters {
  status?: string;
}

function parseFilters(url: string): BookingFilters & { searchParams: URLSearchParams } {
  const { searchParams } = new URL(url);
  const status = searchParams.get('status') || undefined;
  return { status, searchParams };
}

// GET /api/bookings - Get user's bookings or all bookings (admin/seller as appropriate)
export const GET = withAnyRole(async (request: AuthenticatedRequest) => {
  try {
    // Auto-complete expired confirmed bookings
    await db
      .update(bookings)
      .set({ status: 'completed', updatedAt: new Date() })
      .where(and(eq(bookings.status, 'confirmed'), lte(bookings.checkOutDate, new Date())));

    const { status, searchParams } = parseFilters(request.url);
    const { page, limit, offset } = parsePagination(searchParams, { page: 1, limit: 10 });

    // Build where conditions based on user role
    let whereConditions;
    if (request.user!.role === 'ADMIN') {
      whereConditions = undefined; // all
    } else if (request.user!.role === 'SELLER') {
      // Seller sees bookings for kos they own (posts.userId)
      whereConditions = eq(posts.userId, request.user!.userId);
    } else {
      // Renter sees only their own bookings
      whereConditions = eq(bookings.userId, request.user!.userId);
    }

    if (status) {
      const statusCondition = eq(bookings.status, status);
      whereConditions = whereConditions ? and(whereConditions, statusCondition) : statusCondition;
    }

    // Select fields
    const baseSelect = {
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
    } as const;

    const includeUser = request.user!.role === 'ADMIN' || request.user!.role === 'SELLER';

    const userBookings = await db
      .select({
        ...baseSelect,
        ...(includeUser ? { user: { id: users.id, name: users.name, username: users.username, contact: users.contact } } : {}),
      })
      .from(bookings)
      .innerJoin(kos, eq(bookings.kosId, kos.id))
      .innerJoin(posts, eq(kos.postId, posts.id))
      .innerJoin(users, eq(bookings.userId, users.id))
      .where(whereConditions)
      .orderBy(desc(bookings.createdAt))
      .limit(limit)
      .offset(offset);

    const totalBookingsResult = await db
      .select({ count: count() })
      .from(bookings)
      .innerJoin(kos, eq(bookings.kosId, kos.id))
      .innerJoin(posts, eq(kos.postId, posts.id))
      .innerJoin(users, eq(bookings.userId, users.id))
      .where(whereConditions);

    const total = Number(totalBookingsResult[0]?.count || 0);
    const pagination = buildPaginationMeta({ page, limit, total });

    return ok('Bookings retrieved successfully', {
      bookings: userBookings,
      pagination,
      filters: { status: status || null },
    });
  } catch (error) {
    console.error('bookings.GET error', error);
    return fail('internal_error', 'Failed to retrieve bookings', undefined, { status: 500 });
  }
});

// POST /api/bookings - Create a new booking
export const POST = withAnyRole(async (request: AuthenticatedRequest) => {
  try {
    const json = await request.json().catch(() => ({}));
    const parsed = createBookingSchema.safeParse(json);
    if (!parsed.success) {
      return fail('validation_error', 'Invalid input data', parsed.error.flatten(), { status: 400 });
    }

    const { kosId, checkInDate: checkInDateStr, duration, notes } = parsed.data;

    // Fetch kos & post price
    const kosData = await db
      .select({ id: kos.id, name: kos.name, price: posts.price, userId: posts.userId })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .where(eq(kos.id, kosId))
      .limit(1);

    if (kosData.length === 0) {
      return fail('not_found', 'Kos not found', undefined, { status: 404 });
    }

    if (kosData[0].userId === request.user!.userId) {
      return fail('forbidden', 'You cannot book your own kos', undefined, { status: 400 });
    }

    const checkInDate = new Date(checkInDateStr);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setMonth(checkOutDate.getMonth() + duration);

    // Conflicting bookings check
    const conflicting = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(and(
        eq(bookings.kosId, kosId),
        or(eq(bookings.status, 'confirmed'), eq(bookings.status, 'pending')),
        or(
          and(gte(bookings.checkInDate, checkInDate), lte(bookings.checkInDate, checkOutDate)),
          and(gte(bookings.checkOutDate, checkInDate), lte(bookings.checkOutDate, checkOutDate)),
          and(lte(bookings.checkInDate, checkInDate), gte(bookings.checkOutDate, checkOutDate))
        )
      ))
      .limit(1);

    if (conflicting.length > 0) {
      return ok('Kos not available for selected dates', {
        available: false,
        conflict: true,
        info: 'Selected date range overlaps existing booking. Adjust your dates.',
      });
    }

    const totalPrice = kosData[0].price * duration;

    const [newBooking] = await db
      .insert(bookings)
      .values({
        kosId,
        userId: request.user!.userId,
        checkInDate,
        checkOutDate,
        duration,
        totalPrice,
        status: 'pending',
        notes,
      })
      .returning();

    return ok('Booking created successfully', {
      booking: {
        ...newBooking,
        kos: { id: kosData[0].id, name: kosData[0].name },
      },
    });
  } catch (error) {
    console.error('bookings.POST error', error);
    return fail('internal_error', 'Failed to create booking', undefined, { status: 500 });
  }
});
