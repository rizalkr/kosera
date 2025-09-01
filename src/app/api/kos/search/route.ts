import { NextRequest } from 'next/server';
import { db } from '@/db';
import { kos, posts, users } from '@/db/schema';
import { sql, eq, and, or, gte, lte, like, ilike, desc, asc, type SQLWrapper } from 'drizzle-orm';
import { ok, fail } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const city = searchParams.get('city');
    const facilities = searchParams.get('facilities');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const minRating = searchParams.get('min_rating');
    const sortBy = searchParams.get('sort') || 'quality';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    if (page < 1 || limit < 1 || limit > 50) {
      return fail('invalid_pagination', 'Invalid pagination parameters', undefined, { status: 400 });
    }

    const offset = (page - 1) * limit;

    const qualityScoreFormula = sql<number>`(
      (CAST(${posts.averageRating} AS DECIMAL) * 0.4) +
      (${posts.reviewCount} * 0.2) +
      (${posts.favoriteCount} * 0.2) +
      (${posts.photoCount} * 0.1) +
      (${posts.viewCount} * 0.1)
    )`.as('quality_score');

    const conditions: SQLWrapper[] = [];

    if (query.trim()) {
      const searchTerm = `%${query.trim()}%`;
      const textCondition = or(
        ilike(kos.name, searchTerm),
        ilike(posts.title, searchTerm),
        ilike(posts.description, searchTerm),
        ilike(kos.address, searchTerm),
        ilike(kos.city, searchTerm)
      ) as unknown as SQLWrapper;
      conditions.push(textCondition);
    }

    if (city) conditions.push(eq(kos.city, city));

    if (facilities) {
      const facilityList = facilities.split(',').map((f) => f.trim());
      const facilityConditions = facilityList.map((facility) => like(kos.facilities, `%${facility}%`)) as unknown as [SQLWrapper, ...SQLWrapper[]];
      if (facilityConditions.length > 0) conditions.push(and(...facilityConditions) as unknown as SQLWrapper);
    }

    if (minPrice) {
      const minPriceNum = parseInt(minPrice, 10);
      if (!Number.isNaN(minPriceNum) && minPriceNum >= 0) conditions.push(gte(posts.price, minPriceNum));
    }

    if (maxPrice) {
      const maxPriceNum = parseInt(maxPrice, 10);
      if (!Number.isNaN(maxPriceNum) && maxPriceNum >= 0) conditions.push(lte(posts.price, maxPriceNum));
    }

    if (minRating) {
      const minRatingNum = parseFloat(minRating);
      if (!Number.isNaN(minRatingNum) && minRatingNum >= 0 && minRatingNum <= 5) {
        conditions.push(sql`${posts.averageRating} >= ${minRatingNum}`);
      }
    }

    let orderBy;
    switch (sortBy) {
      case 'price_asc':
        orderBy = asc(posts.price); break;
      case 'price_desc':
        orderBy = desc(posts.price); break;
      case 'rating':
        orderBy = desc(posts.averageRating); break;
      case 'newest':
        orderBy = desc(posts.createdAt); break;
      case 'popular':
        orderBy = desc(posts.viewCount); break;
      default:
        orderBy = desc(qualityScoreFormula);
    }

    const whereCondition = conditions.length > 0 ? and(...conditions as [SQLWrapper, ...SQLWrapper[]]) : undefined;

    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .where(whereCondition);

    const total = Number(totalCountResult[0].count || 0);

    const searchResults = await db
      .select({
        id: kos.id,
        postId: kos.postId,
        name: kos.name,
        address: kos.address,
        city: kos.city,
        facilities: kos.facilities,
        latitude: kos.latitude,
        longitude: kos.longitude,
        title: posts.title,
        description: posts.description,
        price: posts.price,
        isFeatured: posts.isFeatured,
        viewCount: posts.viewCount,
        favoriteCount: posts.favoriteCount,
        averageRating: posts.averageRating,
        reviewCount: posts.reviewCount,
        photoCount: posts.photoCount,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        qualityScore: qualityScoreFormula,
        owner: { id: users.id, name: users.name, username: users.username, contact: users.contact },
      })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .innerJoin(users, eq(posts.userId, users.id))
      .where(whereCondition)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const totalPages = Math.ceil(total / limit) || 1;

    return ok('Search completed successfully', {
      results: searchResults,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        query,
        city,
        facilities: facilities ? facilities.split(',') : null,
        minPrice: minPrice ? parseInt(minPrice, 10) : null,
        maxPrice: maxPrice ? parseInt(maxPrice, 10) : null,
        minRating: minRating ? parseFloat(minRating) : null,
        sortBy,
      },
    });
  } catch (error) {
    console.error('kos.search.GET error', error);
    return fail('internal_error', 'Failed to perform search', undefined, { status: 500 });
  }
}
