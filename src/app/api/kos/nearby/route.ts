import { db } from '@/db';
import { kos, posts, users } from '@/db/schema';
import { sql, eq, and, isNotNull } from 'drizzle-orm';
import { z } from 'zod';
import { ok, fail } from '@/types/api';

const querySchema = z.object({
  lat: z.string().or(z.string().transform(v => v)).optional(),
  latitude: z.string().optional(),
  lng: z.string().optional(),
  longitude: z.string().optional(),
  radius: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

interface NearbyOwner { id: number; name: string; username: string; contact: string }
interface NearbyKos {
  id: number; postId: number; name: string; address: string; city: string; facilities: string | null; latitude: number | null; longitude: number | null; distance: number;
  title: string; description: string; price: number; isFeatured: boolean; viewCount: number; favoriteCount: number; averageRating: string; reviewCount: number; photoCount: number; qualityScore: number;
  owner: NearbyOwner;
}

/**
 * GET /api/kos/nearby
 * Returns kos within radius (km) of provided lat/lng with distance & quality score.
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const raw = Object.fromEntries(searchParams.entries());
    const parsed = querySchema.safeParse(raw);
    if (!parsed.success) return fail('validation_error', 'Invalid query parameters', parsed.error.flatten(), { status: 400 });

    const latParam = parsed.data.lat || parsed.data.latitude;
    const lngParam = parsed.data.lng || parsed.data.longitude;
    if (!latParam || !lngParam) return fail('missing_coordinates', 'Latitude and longitude are required', undefined, { status: 400 });

    const latitude = parseFloat(latParam);
    const longitude = parseFloat(lngParam);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) return fail('invalid_coordinates', 'Coordinates must be numbers', undefined, { status: 400 });
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return fail('invalid_coordinates', 'Latitude must be between -90 and 90 and longitude between -180 and 180', undefined, { status: 400 });

    const radiusParam = parsed.data.radius;
    const limitParam = parsed.data.limit;
    const radius = radiusParam ? parseFloat(radiusParam) : 5;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    if (radiusParam && (Number.isNaN(radius) || radius <= 0 || radius > 100)) return fail('invalid_radius', 'Radius must be between 0 and 100 km', undefined, { status: 400 });
    if (limitParam && (Number.isNaN(limit) || limit < 1 || limit > 50)) return fail('invalid_limit', 'Limit must be between 1 and 50', undefined, { status: 400 });

    const distanceFormula = sql<number>`
      (6371 * acos(
        cos(radians(${latitude})) * 
        cos(radians(${kos.latitude})) * 
        cos(radians(${kos.longitude}) - radians(${longitude})) + 
        sin(radians(${latitude})) * 
        sin(radians(${kos.latitude}))
      ))
    `.as('distance');

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
        owner: { id: users.id, name: users.name, username: users.username, contact: users.contact },
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
      .orderBy(distanceFormula)
      .limit(limit);

    return ok('Nearby kos retrieved successfully', {
      items: nearbyKos as unknown as NearbyKos[],
      searchCenter: { latitude, longitude, radius },
      count: nearbyKos.length,
    });
  } catch (error) {
    console.error('nearby.GET error', error);
    return fail('internal_error', 'Failed to retrieve nearby kos', undefined, { status: 500 });
  }
}
