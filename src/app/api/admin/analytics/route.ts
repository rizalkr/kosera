import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { db } from '@/db';
import { kos, posts, users } from '@/db/schema';
import { sql, eq, desc, count } from 'drizzle-orm';
import { ok, fail } from '@/types/api';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    if (request.user?.role !== 'ADMIN') {
      return fail('forbidden', 'Access denied. Admin role required.', undefined, { status: 403 });
    }

    const [totalKosStats, topPerformingKos, cityDistribution, priceStatistics, featuredStats, recentActivity] = await Promise.all([
      db
        .select({
          totalKos: count(),
          totalViews: sql<number>`COALESCE(sum(${posts.viewCount}), 0)`,
          totalFavorites: sql<number>`COALESCE(sum(${posts.favoriteCount}), 0)`,
          averageRating: sql<number>`COALESCE(avg(${posts.averageRating}), 0)`,
          totalReviews: sql<number>`COALESCE(sum(${posts.reviewCount}), 0)`,
        })
        .from(kos)
        .innerJoin(posts, eq(kos.postId, posts.id)),
      db
        .select({
          id: kos.id,
            name: kos.name,
            city: kos.city,
            title: posts.title,
            price: posts.price,
            viewCount: posts.viewCount,
            favoriteCount: posts.favoriteCount,
            averageRating: posts.averageRating,
            reviewCount: posts.reviewCount,
            qualityScore: sql<number>`(
            (CAST(${posts.averageRating} AS DECIMAL) * 0.4) +
            (${posts.reviewCount} * 0.2) +
            (${posts.favoriteCount} * 0.2) +
            (${posts.photoCount} * 0.1) +
            (${posts.viewCount} * 0.1)
          )`,
            owner: { name: users.name, username: users.username },
        })
        .from(kos)
        .innerJoin(posts, eq(kos.postId, posts.id))
        .innerJoin(users, eq(posts.userId, users.id))
        .orderBy(
          desc(
            sql`(
          (CAST(${posts.averageRating} AS DECIMAL) * 0.4) +
          (${posts.reviewCount} * 0.2) +
          (${posts.favoriteCount} * 0.2) +
          (${posts.photoCount} * 0.1) +
          (${posts.viewCount} * 0.1)
        )`
          )
        )
        .limit(10),
      db
        .select({
          city: kos.city,
          kosCount: count(),
          averagePrice: sql<number>`avg(${posts.price})`,
          totalViews: sql<number>`sum(${posts.viewCount})`,
        })
        .from(kos)
        .innerJoin(posts, eq(kos.postId, posts.id))
        .groupBy(kos.city)
        .orderBy(desc(count())),
      db
        .select({
          minPrice: sql<number>`min(${posts.price})`,
          maxPrice: sql<number>`max(${posts.price})`,
          averagePrice: sql<number>`avg(${posts.price})`,
          medianPrice: sql<number>`percentile_cont(0.5) within group (order by ${posts.price})`,
        })
        .from(posts)
        .innerJoin(kos, eq(posts.id, kos.postId)),
      db
        .select({
          totalFeatured: count(),
          averageFeaturedViews: sql<number>`COALESCE(avg(${posts.viewCount}), 0)`,
          averageFeaturedRating: sql<number>`COALESCE(avg(${posts.averageRating}), 0)`,
        })
        .from(posts)
        .innerJoin(kos, eq(posts.id, kos.postId))
        .where(eq(posts.isFeatured, true)),
      db
        .select({
          kosName: kos.name,
          city: kos.city,
          viewCount: posts.viewCount,
          favoriteCount: posts.favoriteCount,
          updatedAt: posts.updatedAt,
        })
        .from(kos)
        .innerJoin(posts, eq(kos.postId, posts.id))
        .where(sql`${posts.updatedAt} >= NOW() - INTERVAL '7 days'`)
        .orderBy(desc(posts.updatedAt))
        .limit(20),
    ]);

    return ok('Analytics data retrieved successfully', {
      overview: totalKosStats[0],
      topPerforming: topPerformingKos,
      cityDistribution,
      priceStatistics: priceStatistics[0],
      featuredStatistics: featuredStats[0] || {
        totalFeatured: 0,
        averageFeaturedViews: 0,
        averageFeaturedRating: 0,
      },
      recentActivity,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error retrieving analytics:', error);
    return fail('internal_error', 'Failed to retrieve analytics data', undefined, { status: 500 });
  }
});
