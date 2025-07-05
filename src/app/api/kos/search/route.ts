import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { kos, posts, users } from '@/db/schema';
import { sql, eq, and, or, gte, lte, like, ilike, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Search parameters
    const query = searchParams.get('q') || '';
    const city = searchParams.get('city');
    const facilities = searchParams.get('facilities');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const minRating = searchParams.get('min_rating');
    const sortBy = searchParams.get('sort') || 'quality'; // quality, price_asc, price_desc, rating, newest
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { success: false, error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;

    // Quality score formula
    const qualityScoreFormula = sql<number>`(
      (CAST(${posts.averageRating} AS DECIMAL) * 0.4) +
      (${posts.reviewCount} * 0.2) +
      (${posts.favoriteCount} * 0.2) +
      (${posts.photoCount} * 0.1) +
      (${posts.viewCount} * 0.1)
    )`.as('quality_score');

    // Build search conditions
    const conditions = [];

    // Text search (name, title, description, address)
    if (query.trim()) {
      const searchTerm = `%${query.trim()}%`;
      conditions.push(
        or(
          ilike(kos.name, searchTerm),
          ilike(posts.title, searchTerm),
          ilike(posts.description, searchTerm),
          ilike(kos.address, searchTerm),
          ilike(kos.city, searchTerm)
        )
      );
    }

    // City filter
    if (city) {
      conditions.push(eq(kos.city, city));
    }

    // Facilities filter (comma-separated)
    if (facilities) {
      const facilityList = facilities.split(',').map(f => f.trim());
      const facilityConditions = facilityList.map(facility => 
        like(kos.facilities, `%${facility}%`)
      );
      conditions.push(and(...facilityConditions));
    }

    // Price range filter
    if (minPrice) {
      const minPriceNum = parseInt(minPrice);
      if (!isNaN(minPriceNum) && minPriceNum >= 0) {
        conditions.push(gte(posts.price, minPriceNum));
      }
    }

    if (maxPrice) {
      const maxPriceNum = parseInt(maxPrice);
      if (!isNaN(maxPriceNum) && maxPriceNum >= 0) {
        conditions.push(lte(posts.price, maxPriceNum));
      }
    }

    // Rating filter
    if (minRating) {
      const minRatingNum = parseFloat(minRating);
      if (!isNaN(minRatingNum) && minRatingNum >= 0 && minRatingNum <= 5) {
        // Since averageRating is decimal type in schema, we need to use sql comparison for proper type handling
        conditions.push(sql`${posts.averageRating} >= ${minRatingNum}`);
      }
    }

    // Determine sort order
    let orderBy;
    switch (sortBy) {
      case 'price_asc':
        orderBy = asc(posts.price);
        break;
      case 'price_desc':
        orderBy = desc(posts.price);
        break;
      case 'rating':
        orderBy = desc(posts.averageRating);
        break;
      case 'newest':
        orderBy = desc(posts.createdAt);
        break;
      case 'popular':
        orderBy = desc(posts.viewCount);
        break;
      default: // quality
        orderBy = desc(qualityScoreFormula);
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .where(whereCondition);

    const totalCount = totalCountResult[0].count;

    // Get search results
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
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      message: 'Search completed successfully',
      data: {
        results: searchResults,
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
        filters: {
          query,
          city,
          facilities: facilities ? facilities.split(',') : null,
          minPrice: minPrice ? parseInt(minPrice) : null,
          maxPrice: maxPrice ? parseInt(maxPrice) : null,
          minRating: minRating ? parseFloat(minRating) : null,
          sortBy,
        },
      },
    });

  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
