import { db } from '@/db';
import { kos, posts, bookings, users } from '@/db/schema';
import { eq, and, count, sum } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';
import { ok, fail } from '@/types/api';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kosId = parseInt(id, 10);
    if (Number.isNaN(kosId)) {
      return fail('invalid_kos_id', 'ID kos tidak valid', undefined, { status: 400 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return fail('unauthorized', 'Token otorisasi diperlukan', undefined, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return fail('invalid_token', 'Token tidak valid', undefined, { status: 401 });
    }

    const user = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
    if (!user.length || user[0].role !== 'SELLER') {
      return fail('forbidden', 'Akses ditolak. Diperlukan role seller.', undefined, { status: 403 });
    }

    const kosResult = await db
      .select({
        id: kos.id,
        postId: kos.postId,
        name: kos.name,
        address: kos.address,
        city: kos.city,
        facilities: kos.facilities,
        latitude: kos.latitude,
        longitude: kos.longitude,
        totalRooms: kos.totalRooms,
        occupiedRoomsDb: kos.occupiedRooms,
        title: posts.title,
        description: posts.description,
        price: posts.price,
        isFeatured: posts.isFeatured,
        viewCount: posts.viewCount,
        favoriteCount: posts.favoriteCount,
        averageRating: posts.averageRating,
        reviewCount: posts.reviewCount,
        photoCount: posts.photoCount,
        totalPost: posts.totalPost,
        totalPenjualan: posts.totalPenjualan,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        userId: posts.userId,
        owner: { id: users.id, name: users.name, username: users.username, contact: users.contact },
      })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(kos.id, kosId))
      .limit(1);

    if (kosResult.length === 0) {
      return fail('kos_not_found', 'Kos tidak ditemukan', undefined, { status: 404 });
    }

    const kosData = kosResult[0];
    if (kosData.userId !== decoded.userId) {
      return fail('forbidden', 'Anda hanya dapat mengakses kos milik Anda sendiri', undefined, { status: 403 });
    }

    const [totalBookingsResult, pendingBookingsResult, confirmedBookingsResult, totalRevenueResult] = await Promise.all([
      db.select({ count: count() }).from(bookings).where(eq(bookings.kosId, kosId)),
      db.select({ count: count() }).from(bookings).where(and(eq(bookings.kosId, kosId), eq(bookings.status, 'pending'))),
      db.select({ count: count() }).from(bookings).where(and(eq(bookings.kosId, kosId), eq(bookings.status, 'confirmed'))),
      db
        .select({ total: sum(bookings.totalPrice) })
        .from(bookings)
        .where(and(eq(bookings.kosId, kosId), eq(bookings.status, 'confirmed'))),
    ]);

    const totalBookings = totalBookingsResult[0]?.count || 0;
    const pendingBookings = pendingBookingsResult[0]?.count || 0;
    const occupiedRooms = confirmedBookingsResult[0]?.count || kosData.occupiedRoomsDb || 0;
    const totalRooms = kosData.totalRooms || kosData.totalPost || 1;
    const vacantRooms = Math.max(0, totalRooms - occupiedRooms);
    const totalRevenue = Number(totalRevenueResult[0]?.total || 0);

    const responseData = {
      ...kosData,
      totalRooms,
      occupiedRooms,
      statistics: {
        totalBookings,
        pendingBookings,
        occupiedRooms,
        vacantRooms,
        totalRooms,
        totalRevenue,
        totalRoomsRentedOut: kosData.totalPenjualan || 0,
      },
    };

    return ok('Detail kos seller berhasil diambil', responseData);
  } catch (error) {
    console.error('Error retrieving seller kos detail:', error);
    return fail('seller_kos_detail_failed', 'Gagal mengambil detail kos seller', undefined, { status: 500 });
  }
}

// TODO: Add caching for frequently accessed seller stats and role-based field filtering.
