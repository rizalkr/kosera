import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { kos, posts, bookings, users } from '@/db/schema';
import { eq, and, count, sum } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token otorisasi diperlukan' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
    }

    // Verify user is a seller
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user.length || user[0].role !== 'SELLER') {
      return NextResponse.json({ error: 'Akses ditolak. Diperlukan role seller.' }, { status: 403 });
    }

    // Get all kos owned by the seller with aggregated statistics
    const sellerKos = await db
      .select({
        id: kos.id,
        postId: kos.postId,
        name: kos.name,
        address: kos.address,
        city: kos.city,
        facilities: kos.facilities,
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
      .where(eq(posts.userId, decoded.userId));

    // Get booking statistics for each kos
    const kosIds = sellerKos.map(k => k.id);
    
    const bookingStats = await Promise.all(
      kosIds.map(async (kosId) => {
        // Total bookings for this kos
        const totalBookings = await db
          .select({ count: count() })
          .from(bookings)
          .where(eq(bookings.kosId, kosId));

        // Pending bookings
        const pendingBookings = await db
          .select({ count: count() })
          .from(bookings)
          .where(and(
            eq(bookings.kosId, kosId),
            eq(bookings.status, 'pending')
          ));

        // Confirmed bookings (occupied rooms)
        const confirmedBookings = await db
          .select({ count: count() })
          .from(bookings)
          .where(and(
            eq(bookings.kosId, kosId),
            eq(bookings.status, 'confirmed')
          ));

        // Total revenue from this kos
        const totalRevenue = await db
          .select({ 
            total: sum(bookings.totalPrice) 
          })
          .from(bookings)
          .where(and(
            eq(bookings.kosId, kosId),
            eq(bookings.status, 'confirmed')
          ));

        return {
          kosId,
          totalBookings: totalBookings[0].count || 0,
          pendingBookings: pendingBookings[0].count || 0,
          occupiedRooms: confirmedBookings[0].count || 0,
          totalRevenue: Number(totalRevenue[0].total || 0),
        };
      })
    );

    // Combine kos data with booking statistics
    const dashboardData = sellerKos.map(kosItem => {
      const stats = bookingStats.find(s => s.kosId === kosItem.id);
      const totalRooms = kosItem.totalPost || 1; // Use totalPost as total rooms available
      const occupiedRooms = stats?.occupiedRooms || 0;
      const vacantRooms = Math.max(0, totalRooms - occupiedRooms);

      return {
        ...kosItem,
        statistics: {
          totalBookings: stats?.totalBookings || 0,
          pendingBookings: stats?.pendingBookings || 0,
          occupiedRooms,
          vacantRooms,
          totalRooms,
          totalRevenue: stats?.totalRevenue || 0,
          totalRoomsRentedOut: kosItem.totalPenjualan || 0, // Historical data
        }
      };
    });

    // Calculate overall statistics
    const overallStats = {
      totalKos: sellerKos.length,
      totalBookings: bookingStats.reduce((sum, stat) => sum + stat.totalBookings, 0),
      totalPendingBookings: bookingStats.reduce((sum, stat) => sum + stat.pendingBookings, 0),
      totalOccupiedRooms: bookingStats.reduce((sum, stat) => sum + stat.occupiedRooms, 0),
      totalVacantRooms: dashboardData.reduce((sum, kos) => sum + kos.statistics.vacantRooms, 0),
      totalRooms: dashboardData.reduce((sum, kos) => sum + kos.statistics.totalRooms, 0),
      totalRevenue: bookingStats.reduce((sum, stat) => sum + stat.totalRevenue, 0),
      totalViews: sellerKos.reduce((sum, kos) => sum + kos.viewCount, 0),
      totalFavorites: sellerKos.reduce((sum, kos) => sum + kos.favoriteCount, 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        kos: dashboardData,
        overallStats,
      }
    });

  } catch (error) {
    console.error('Seller dashboard API error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server internal' },
      { status: 500 }
    );
  }
}
