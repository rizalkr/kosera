import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { kos, posts, bookings, users } from '@/db/schema';
import { eq, and, count, sum } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kosId = parseInt(id);

    if (isNaN(kosId)) {
      return NextResponse.json(
        { success: false, error: 'ID kos tidak valid' },
        { status: 400 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token otorisasi diperlukan' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Token tidak valid' },
        { status: 401 }
      );
    }

    // Verify user is a seller
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user.length || user[0].role !== 'SELLER') {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Diperlukan role seller.' },
        { status: 403 }
      );
    }

    // Get kos data and verify ownership
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
        // Post data
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
        // Owner data
        owner: {
          id: users.id,
          name: users.name,
          username: users.username,
          contact: users.contact,
        },
      })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(kos.id, kosId))
      .limit(1);

    if (kosResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kos tidak ditemukan' },
        { status: 404 }
      );
    }

    const kosData = kosResult[0];

    // Check ownership (seller can only access their own kos)
    if (kosData.userId !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Anda hanya dapat mengakses kos milik Anda sendiri' },
        { status: 403 }
      );
    }

    // Get booking statistics for this specific kos
    const [
      totalBookingsResult,
      pendingBookingsResult,
      confirmedBookingsResult,
      totalRevenueResult
    ] = await Promise.all([
      // Total bookings
      db
        .select({ count: count() })
        .from(bookings)
        .where(eq(bookings.kosId, kosId)),

      // Pending bookings
      db
        .select({ count: count() })
        .from(bookings)
        .where(and(
          eq(bookings.kosId, kosId),
          eq(bookings.status, 'pending')
        )),

      // Confirmed bookings (occupied rooms)
      db
        .select({ count: count() })
        .from(bookings)
        .where(and(
          eq(bookings.kosId, kosId),
          eq(bookings.status, 'confirmed')
        )),

      // Total revenue
      db
        .select({ 
          total: sum(bookings.totalPrice) 
        })
        .from(bookings)
        .where(and(
          eq(bookings.kosId, kosId),
          eq(bookings.status, 'confirmed')
        ))
    ]);

    // Calculate statistics
    const totalBookings = totalBookingsResult[0]?.count || 0;
    const pendingBookings = pendingBookingsResult[0]?.count || 0;
    const occupiedRooms = confirmedBookingsResult[0]?.count || 0;
    const totalRevenue = Number(totalRevenueResult[0]?.total || 0);
    const totalRooms = kosData.totalPost || 1; // Use totalPost as total rooms available
    const vacantRooms = Math.max(0, totalRooms - occupiedRooms);

    // Combine data with statistics
    const responseData = {
      ...kosData,
      statistics: {
        totalBookings,
        pendingBookings,
        occupiedRooms,
        vacantRooms,
        totalRooms,
        totalRevenue,
        totalRoomsRentedOut: kosData.totalPenjualan || 0, // Historical data
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Detail kos seller berhasil diambil',
      data: responseData
    });

  } catch (error) {
    console.error('Error retrieving seller kos detail:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil detail kos seller' },
      { status: 500 }
    );
  }
}
