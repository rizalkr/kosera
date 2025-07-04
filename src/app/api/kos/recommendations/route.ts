import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { kos, posts, users } from '@/db/schema';
import { desc, sql, eq, and, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 10;
    const city = searchParams.get('city');
    const minPriceParam = searchParams.get('min_price');
    const maxPriceParam = searchParams.get('max_price');

    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { success: false, error: 'Invalid page parameter. Page must be >= 1' },
        { status: 400 }
      );
    }

    if (limitParam && (isNaN(limit) || limit < 1 || limit > 50)) {
      return NextResponse.json(
        { success: false, error: 'Invalid limit parameter. Limit must be between 1-50' },
        { status: 400 }
      );
    }

    // Validate price parameters
    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    if (minPriceParam) {
      minPrice = parseInt(minPriceParam);
      if (isNaN(minPrice) || minPrice < 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid min_price parameter' },
          { status: 400 }
        );
      }
    }

    if (maxPriceParam) {
      maxPrice = parseInt(maxPriceParam);
      if (isNaN(maxPrice) || maxPrice < 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid max_price parameter' },
          { status: 400 }
        );
      }
    }

    if (minPrice && maxPrice && minPrice >= maxPrice) {
      return NextResponse.json(
        { success: false, error: 'min_price must be less than max_price' },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;

    // Calculate quality score using the formula:
    // (average_rating * 0.4) + (review_count * 0.2) + (favorite_count * 0.2) + (photo_count * 0.1) + (view_count * 0.1)
    const qualityScoreFormula = sql<number>`(
      (CAST(${posts.averageRating} AS DECIMAL) * 0.4) +
      (${posts.reviewCount} * 0.2) +
      (${posts.favoriteCount} * 0.2) +
      (${posts.photoCount} * 0.1) +
      (${posts.viewCount} * 0.1)
    )`.as('quality_score');

    // Build where conditions
    const conditions = [];
    if (city) {
      conditions.push(eq(kos.city, city));
    }
    if (minPrice !== undefined) {
      conditions.push(gte(posts.price, minPrice));
    }
    if (maxPrice !== undefined) {
      conditions.push(lte(posts.price, maxPrice));
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .where(whereCondition);

    const totalCount = totalCountResult[0].count;

    // Get paginated results ordered by quality score
    const recommendations = await db
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
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        // Quality score
        qualityScore: qualityScoreFormula,
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
      .where(whereCondition)
      .orderBy(desc(qualityScoreFormula))
      .limit(limit)
      .offset(offset);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      message: 'Recommendations retrieved successfully',
      data: {
        recommendations,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? page + 1 : null,
          prevPage: hasPrevPage ? page - 1 : null,
        },
      },
    });
  } catch (error) {
    console.error('Error retrieving recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve recommendations' },
      { status: 500 }
    );
  }
}
