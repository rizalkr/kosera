import { db } from '@/db';
import { kos, posts, users } from '@/db/schema';
import { desc, sql, eq, and, gte, lte, type SQL } from 'drizzle-orm';
import { z } from 'zod';
import { ok, fail } from '@/types/api';

// Query schema validation
const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  city: z.string().min(1).optional(),
  min_price: z.string().regex(/^\d+$/, 'min_price must be a positive integer').optional(),
  max_price: z.string().regex(/^\d+$/, 'max_price must be a positive integer').optional(),
});

interface RecommendationOwner { id: number; name: string; username: string; contact: string }
interface RecommendationItem {
  id: number; postId: number; name: string; address: string; city: string; facilities: string | null; latitude: number | null; longitude: number | null;
  title: string; description: string; price: number; isFeatured: boolean; viewCount: number; favoriteCount: number;
  averageRating: string; reviewCount: number; photoCount: number; createdAt: Date; updatedAt: Date; qualityScore: number;
  owner: RecommendationOwner;
}
interface RecommendationsData {
  recommendations: RecommendationItem[];
  pagination: { currentPage: number; totalPages: number; totalCount: number; limit: number; hasNextPage: boolean; hasPrevPage: boolean; nextPage: number | null; prevPage: number | null };
}

/**
 * GET /api/kos/recommendations
 * Returns recommended kos ordered by composite quality score with optional filters.
 */
export async function GET(request: Request): Promise<Response> { // standardized Fetch API Request
  try {
    const { searchParams } = new URL(request.url);
    const raw = Object.fromEntries(searchParams.entries());
    const parsed = querySchema.safeParse(raw);
    if (!parsed.success) return fail('validation_error', 'Invalid query parameters', parsed.error.flatten(), { status: 400 });

    const page = parsed.data.page ? parseInt(parsed.data.page, 10) : 1;
    const limit = parsed.data.limit ? parseInt(parsed.data.limit, 10) : 10;
    const city = parsed.data.city;
    const minPriceParam = parsed.data.min_price;
    const maxPriceParam = parsed.data.max_price;

    if (page < 1) return fail('invalid_pagination', 'Page must be >= 1', undefined, { status: 400 });
    if (limit < 1 || limit > 50) return fail('invalid_pagination', 'Limit must be between 1-50', undefined, { status: 400 });

    let minPrice: number | undefined; let maxPrice: number | undefined;
    if (minPriceParam !== undefined) {
      minPrice = parseInt(minPriceParam, 10);
      if (Number.isNaN(minPrice)) return fail('invalid_query', 'min_price invalid', undefined, { status: 400 });
    }
    if (maxPriceParam !== undefined) {
      maxPrice = parseInt(maxPriceParam, 10);
      if (Number.isNaN(maxPrice)) return fail('invalid_query', 'max_price invalid', undefined, { status: 400 });
    }
    if (minPrice !== undefined && maxPrice !== undefined && minPrice >= maxPrice) return fail('invalid_range', 'min_price must be less than max_price', undefined, { status: 400 });

    const offset = (page - 1) * limit;

    const qualityScoreFormula = sql<number>`(
      (CAST(${posts.averageRating} AS DECIMAL) * 0.4) +
      (${posts.reviewCount} * 0.2) +
      (${posts.favoriteCount} * 0.2) +
      (${posts.photoCount} * 0.1) +
      (${posts.viewCount} * 0.1)
    )`.as('quality_score');

    const conditions: SQL<unknown>[] = [];
    if (city) conditions.push(eq(kos.city, city));
    if (minPrice !== undefined) conditions.push(gte(posts.price, minPrice));
    if (maxPrice !== undefined) conditions.push(lte(posts.price, maxPrice));

    let whereCondition: SQL<unknown> | undefined;
    if (conditions.length === 1) whereCondition = conditions[0];
    else if (conditions.length > 1) whereCondition = and(...conditions);

    // total count (branch to avoid reassigning builder generics)
    const countQuery = whereCondition
      ? db.select({ count: sql<number>`count(*)` }).from(kos).innerJoin(posts, eq(kos.postId, posts.id)).where(whereCondition)
      : db.select({ count: sql<number>`count(*)` }).from(kos).innerJoin(posts, eq(kos.postId, posts.id));
    const totalCountResult = await countQuery;
    const totalCount = totalCountResult[0]?.count || 0;

    // base selection shape
    const selection = {
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
    };

    const dataQuery = whereCondition
      ? db.select(selection).from(kos).innerJoin(posts, eq(kos.postId, posts.id)).innerJoin(users, eq(posts.userId, users.id)).where(whereCondition)
      : db.select(selection).from(kos).innerJoin(posts, eq(kos.postId, posts.id)).innerJoin(users, eq(posts.userId, users.id));

    const recommendationsRaw = await dataQuery.orderBy(desc(qualityScoreFormula)).limit(limit).offset(offset);

    // Cast structured recommendations (runtime shape matches selection)
    const recommendations = recommendationsRaw as unknown as RecommendationItem[]; // decimal -> string acknowledged

    const totalPages = limit ? Math.ceil(totalCount / limit) : 1;
    const data: RecommendationsData = {
      recommendations,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    };
    return ok('Recommendations retrieved successfully', data);
  } catch (error) {
    console.error('recommendations.GET error', error);
    return fail('internal_error', 'Failed to retrieve recommendations', undefined, { status: 500 });
  }
}
