import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { kos, posts, users } from '@/db/schema';
import { sql, eq, and, isNotNull } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get('lat') || searchParams.get('latitude');
    const lngParam = searchParams.get('lng') || searchParams.get('longitude');
    const radiusParam = searchParams.get('radius');
    const limitParam = searchParams.get('limit');

    // Validate required parameters
    if (!latParam || !lngParam) {
      return NextResponse.json(
        { success: false, error: 'Valid latitude and longitude parameters are required' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(latParam);
    const longitude = parseFloat(lngParam);
    const radius = radiusParam ? parseFloat(radiusParam) : 5; // default 5km
    const limit = limitParam ? parseInt(limitParam) : 10;

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { success: false, error: 'Valid latitude and longitude parameters are required' },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { success: false, error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180' },
        { status: 400 }
      );
    }

    if (radiusParam && (isNaN(radius) || radius <= 0 || radius > 100)) {
      return NextResponse.json(
        { success: false, error: 'Radius must be between 0 and 100 km' },
        { status: 400 }
      );
    }

    if (limitParam && (isNaN(limit) || limit < 1 || limit > 50)) {
      return NextResponse.json(
        { success: false, error: 'Limit must be between 1 and 50' },
        { status: 400 }
      );
    }

    // Calculate distance using Haversine formula
    const distanceFormula = sql<number>`
      (6371 * acos(
        cos(radians(${latitude})) * 
        cos(radians(${kos.latitude})) * 
        cos(radians(${kos.longitude}) - radians(${longitude})) + 
        sin(radians(${latitude})) * 
        sin(radians(${kos.latitude}))
      ))
    `.as('distance');

    // Quality score formula
    const qualityScoreFormula = sql<number>`(
      (CAST(${posts.averageRating} AS DECIMAL) * 0.4) +
      (${posts.reviewCount} * 0.2) +
      (${posts.favoriteCount} * 0.2) +
      (${posts.photoCount} * 0.1) +
      (${posts.viewCount} * 0.1)
    )`.as('quality_score');

    const nearbyKos = await db
      .select({
        id: kos.id,
        postId: kos.postId,
        name: kos.name,
        address: kos.address,
        city: kos.city,
        facilities: kos.facilities,
        latitude: kos.latitude,
        longitude: kos.longitude,
        distance: distanceFormula,
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
      .where(
        and(
          isNotNull(kos.latitude),
          isNotNull(kos.longitude),
          sql`(6371 * acos(
            cos(radians(${latitude})) * 
            cos(radians(${kos.latitude})) * 
            cos(radians(${kos.longitude}) - radians(${longitude})) + 
            sin(radians(${latitude})) * 
            sin(radians(${kos.latitude}))
          )) <= ${radius}`
        )
      )
      .orderBy(distanceFormula) // Order by distance (closest first)
      .limit(limit);

    return NextResponse.json({
      success: true,
      message: 'Nearby kos retrieved successfully',
      data: nearbyKos,
      searchCenter: {
        latitude,
        longitude,
        radius,
      },
      count: nearbyKos.length,
    });

  } catch (error) {
    console.error('Error retrieving nearby kos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve nearby kos' },
      { status: 500 }
    );
  }
}
