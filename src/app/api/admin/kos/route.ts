import { withAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { db, kos, posts, users } from '@/db';
import { eq, like, and, or, sql, count, desc, asc, isNull } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { ok, fail } from '@/types/api';

async function getAdminKosHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || '';
    const status = searchParams.get('status') || ''; // active, inactive, all
    const ownerType = searchParams.get('ownerType') || ''; // seller, admin, all
    const sortBy = searchParams.get('sortBy') || 'newest'; // newest, oldest, price_asc, price_desc, popular
    const showDeleted = searchParams.get('showDeleted') === 'true';
    
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions: SQL[] = [];

    // Show only active kos by default, or only deleted kos if showDeleted=true
    if (showDeleted) {
      conditions.push(sql`${kos.deletedAt} IS NOT NULL`);
    } else {
      conditions.push(isNull(kos.deletedAt));
    }

    // Search in name, title, description, address, city
    if (search) {
      const searchConditions: SQL[] = [
        like(kos.name, `%${search}%`),
        like(posts.title, `%${search}%`),
        like(posts.description, `%${search}%`),
        like(kos.address, `%${search}%`),
        like(kos.city, `%${search}%`),
      ];
      let searchOr: SQL = searchConditions[0];
      for (let i = 1; i < searchConditions.length; i++) {
        searchOr = or(searchOr, searchConditions[i]) as SQL;
      }
      conditions.push(searchOr);
    }

    // Filter by city
    if (city && city !== 'all') {
      conditions.push(eq(kos.city, city));
    }

    // Filter by owner type
    if (ownerType && ownerType !== 'all') {
      if (ownerType === 'seller') {
        conditions.push(eq(users.role, 'SELLER'));
      } else if (ownerType === 'admin') {
        conditions.push(eq(users.role, 'ADMIN'));
      }
    }

    // Determine sorting
    let orderBy;
    switch (sortBy) {
      case 'oldest':
        orderBy = asc(posts.createdAt);
        break;
      case 'price_asc':
        orderBy = asc(posts.price);
        break;
      case 'price_desc':
        orderBy = desc(posts.price);
        break;
      case 'popular':
        orderBy = desc(posts.viewCount);
        break;
      case 'newest':
      default:
        orderBy = desc(posts.createdAt);
        break;
    }

    const whereCondition: SQL | undefined = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .innerJoin(users, eq(posts.userId, users.id))
      .where(whereCondition);

    const total = totalResult[0]?.count || 0;

    // Get kos data with full details
    const kosResults = await db
      .select({
        id: kos.id,
        postId: kos.postId,
        name: kos.name,
        address: kos.address,
        city: kos.city,
        facilities: kos.facilities,
        totalRooms: kos.totalRooms,
        occupiedRooms: kos.occupiedRooms,
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
        // Owner data
        owner: {
          id: users.id,
          name: users.name,
          username: users.username,
          contact: users.contact,
          role: users.role,
        },
      })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .innerJoin(users, eq(posts.userId, users.id))
      .where(whereCondition)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return ok('Admin kos data retrieved successfully', {
      kos: kosResults,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      filters: {
        search,
        city,
        status,
        ownerType,
        sortBy,
        showDeleted,
      },
    });
  } catch (error) {
    console.error('Admin get kos error:', error);
    return fail('Internal server error');
  }
}

export const GET = withAdmin(getAdminKosHandler);
