import { withRole, AuthenticatedRequest } from '@/lib/middleware';
import { db } from '@/db';
import { kos, posts, bookings, users } from '@/db/schema';
import { eq, and, count, sum } from 'drizzle-orm';
import { ok, fail } from '@/types/api';

// Only SELLER role (admins might have another endpoint for global view)
export const GET = withRole(['SELLER'])(async (request: AuthenticatedRequest) => {
  try {
    // Fetch seller user to confirm (middleware already checked role but we also need id exists)
    const sellerId = request.user!.userId;
    const userRow = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, sellerId)).limit(1);
    if (userRow.length === 0 || userRow[0].role !== 'SELLER') {
      return fail('forbidden', 'Access denied. Seller role required.', undefined, { status: 403 });
    }

    const sellerKos = await db
      .select({
        id: kos.id,
        postId: kos.postId,
        name: kos.name,
        address: kos.address,
        city: kos.city,
        facilities: kos.facilities,
        totalRooms: kos.totalRooms,
        occupiedRooms: kos.occupiedRooms,
        title: posts.title,
        description: posts.description,
        price: posts.price,
        totalPost: posts.totalPost,
        totalPenjualan: posts.totalPenjualan,
        viewCount: posts.viewCount,
        favoriteCount: posts.favoriteCount,
        averageRating: posts.averageRating,
        reviewCount: posts.reviewCount,
        photoCount: posts.photoCount,
        isFeatured: posts.isFeatured,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
      })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .where(eq(posts.userId, sellerId));

    const kosIds = sellerKos.map((k) => k.id);

    const bookingStats = await Promise.all(
      kosIds.map(async (kosId) => {
        const [totalBookings, pendingBookings, confirmedBookings, totalRevenue] = await Promise.all([
          db.select({ count: count() }).from(bookings).where(eq(bookings.kosId, kosId)),
          db.select({ count: count() }).from(bookings).where(and(eq(bookings.kosId, kosId), eq(bookings.status, 'pending'))),
          db.select({ count: count() }).from(bookings).where(and(eq(bookings.kosId, kosId), eq(bookings.status, 'confirmed'))),
          db
            .select({ total: sum(bookings.totalPrice) })
            .from(bookings)
            .where(and(eq(bookings.kosId, kosId), eq(bookings.status, 'confirmed'))),
        ]);
        return {
          kosId,
            totalBookings: Number(totalBookings[0].count || 0),
            pendingBookings: Number(pendingBookings[0].count || 0),
            occupiedRooms: Number(confirmedBookings[0].count || 0),
            totalRevenue: Number(totalRevenue[0].total || 0),
        };
      })
    );

    const dashboardData = sellerKos.map((item) => {
      const stats = bookingStats.find((s) => s.kosId === item.id);
      const totalRoomsValue = item.totalRooms || item.totalPost || 1;
      const occupiedRoomsCalc = stats?.occupiedRooms ?? item.occupiedRooms ?? 0;
      const vacantRooms = Math.max(0, totalRoomsValue - occupiedRoomsCalc);
      return {
        ...item,
        facilities: item.facilities ?? null,
        totalRooms: totalRoomsValue,
        occupiedRooms: occupiedRoomsCalc,
        statistics: {
          totalBookings: stats?.totalBookings || 0,
          pendingBookings: stats?.pendingBookings || 0,
          occupiedRooms: occupiedRoomsCalc,
          vacantRooms,
          totalRooms: totalRoomsValue,
          totalRevenue: stats?.totalRevenue || 0,
          totalRoomsRentedOut: item.totalPenjualan || 0,
        },
      };
    });

    const aggregate = dashboardData.reduce(
      (acc, k) => {
        acc.totalBookings += k.statistics.totalBookings;
        acc.totalPendingBookings += k.statistics.pendingBookings;
        acc.totalOccupiedRooms += k.statistics.occupiedRooms;
        acc.totalVacantRooms += k.statistics.vacantRooms;
        acc.totalRooms += k.statistics.totalRooms;
        acc.totalRevenue += k.statistics.totalRevenue;
        acc.totalViews += k.viewCount;
        acc.totalFavorites += k.favoriteCount;
        return acc;
      },
      {
        totalKos: dashboardData.length,
        totalBookings: 0,
        totalPendingBookings: 0,
        totalOccupiedRooms: 0,
        totalVacantRooms: 0,
        totalRooms: 0,
        totalRevenue: 0,
        totalViews: 0,
        totalFavorites: 0,
      }
    );

    return ok('Seller dashboard retrieved successfully', { kos: dashboardData, stats: aggregate });
  } catch (error) {
    console.error('seller.dashboard.GET error', error);
    return fail('internal_error', 'Internal server error', undefined, { status: 500 });
  }
});
