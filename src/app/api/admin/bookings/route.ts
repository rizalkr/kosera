import { requireAdmin } from '@/lib/server-auth';
import { db } from '@/db';
import { bookings, users, kos } from '@/db/schema';
import { eq, and, or, like, gte, lte, desc, sql, type SQL } from 'drizzle-orm';
import { z } from 'zod';
import { ok, fail } from '@/types/api';

// Query validation schema
const querySchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  searchQuery: z.string().optional(),
});

interface BookingUser { id: number; name: string; username: string; contact: string }
interface BookingKos { id: number; name: string; city: string }
interface BookingItem {
  id: number; status: string; checkInDate: string; checkOutDate: string | null; totalPrice: number; createdAt: string; updatedAt: string;
  user: BookingUser; kos: BookingKos;
}
interface BookingsListData { bookings: BookingItem[]; pagination: { page: number; totalPages: number; total: number; hasNext: boolean; hasPrev: boolean } }

/**
 * GET /api/admin/bookings
 * Admin-only list of bookings with filtering, search, and pagination.
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const auth = requireAdmin(request as unknown as import('next/server').NextRequest);
    if (!auth.isAuthenticated) return fail('unauthorized', auth.error || 'Unauthorized', undefined, { status: 401 });

    const { searchParams } = new URL(request.url);
    const raw = Object.fromEntries(searchParams.entries());
    const parsed = querySchema.safeParse(raw);
    if (!parsed.success) return fail('validation_error', 'Invalid query parameters', parsed.error.flatten(), { status: 400 });

    const page = parsed.data.page ? parseInt(parsed.data.page, 10) : 1;
    const limit = parsed.data.limit ? parseInt(parsed.data.limit, 10) : 10;
    const { status, startDate, endDate, searchQuery } = parsed.data;

    if (page < 1) return fail('invalid_pagination', 'Page must be >= 1', undefined, { status: 400 });
    if (limit < 1 || limit > 100) return fail('invalid_pagination', 'Limit must be between 1-100', undefined, { status: 400 });

    const offset = (page - 1) * limit;

    const whereConditions: SQL<unknown>[] = [];
    if (status && status !== 'all') whereConditions.push(eq(bookings.status, status));
    if (startDate) {
      const d = new Date(startDate);
      if (Number.isNaN(d.getTime())) return fail('invalid_date', 'startDate invalid', undefined, { status: 400 });
      whereConditions.push(gte(bookings.createdAt, d));
    }
    if (endDate) {
      const d = new Date(endDate);
      if (Number.isNaN(d.getTime())) return fail('invalid_date', 'endDate invalid', undefined, { status: 400 });
      whereConditions.push(lte(bookings.createdAt, d));
    }
    if (searchQuery) {
      const pattern = `%${searchQuery}%`;
      // Drizzle's or() type can widen to include undefined when used variadically; assert non-undefined.
      const searchOr = or(
        like(users.name, pattern),
        like(users.username, pattern),
        like(users.contact, pattern),
        like(kos.name, pattern),
        like(kos.city, pattern)
      ) as SQL<unknown>; // safe: we always pass 5 conditions
      whereConditions.push(searchOr);
    }

    let combinedWhere: SQL<unknown> | undefined;
    if (whereConditions.length === 1) combinedWhere = whereConditions[0];
    else if (whereConditions.length > 1) combinedWhere = and(...whereConditions);

    // Count query
    const countRows = await (combinedWhere
      ? db.select({ value: sql<number>`count(*)` }).from(bookings).innerJoin(users, eq(bookings.userId, users.id)).innerJoin(kos, eq(bookings.kosId, kos.id)).where(combinedWhere)
      : db.select({ value: sql<number>`count(*)` }).from(bookings).innerJoin(users, eq(bookings.userId, users.id)).innerJoin(kos, eq(bookings.kosId, kos.id))
    );
    const total = countRows[0]?.value || 0;

    // Data query
    const selection = {
      id: bookings.id,
      status: bookings.status,
      checkInDate: bookings.checkInDate,
      checkOutDate: bookings.checkOutDate,
      totalPrice: bookings.totalPrice,
      createdAt: bookings.createdAt,
      updatedAt: bookings.updatedAt,
      user: { id: users.id, name: users.name, username: users.username, contact: users.contact },
      kos: { id: kos.id, name: kos.name, city: kos.city },
    } as const;
    const dataRows = await (combinedWhere
      ? db.select(selection).from(bookings).innerJoin(users, eq(bookings.userId, users.id)).innerJoin(kos, eq(bookings.kosId, kos.id)).where(combinedWhere).orderBy(desc(bookings.createdAt)).limit(limit).offset(offset)
      : db.select(selection).from(bookings).innerJoin(users, eq(bookings.userId, users.id)).innerJoin(kos, eq(bookings.kosId, kos.id)).orderBy(desc(bookings.createdAt)).limit(limit).offset(offset)
    );

    const totalPages = limit ? Math.ceil(total / limit) : 1;
    const items: BookingItem[] = dataRows.map(r => ({
      id: r.id,
      status: r.status,
      checkInDate: r.checkInDate.toISOString().split('T')[0],
      checkOutDate: r.checkOutDate ? r.checkOutDate.toISOString().split('T')[0] : null,
      totalPrice: r.totalPrice,
      createdAt: r.createdAt.toISOString().split('T')[0],
      updatedAt: r.updatedAt.toISOString().split('T')[0],
      user: r.user,
      kos: r.kos,
    }));

    const data: BookingsListData = {
      bookings: items,
      pagination: { page, totalPages, total, hasNext: page < totalPages, hasPrev: page > 1 },
    };

    return ok('Bookings retrieved successfully', data);
  } catch (error) {
    console.error('admin.bookings.GET error', error);
    return fail('internal_error', 'Failed to fetch bookings data', undefined, { status: 500 });
  }
}