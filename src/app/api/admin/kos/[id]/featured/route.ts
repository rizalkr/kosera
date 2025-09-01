import { withAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { db, kos, posts } from '@/db';
import { eq } from 'drizzle-orm';
import { ok, fail } from '@/types/api';
import { z } from 'zod';

interface RouteContext {
  params: {
    id: string;
  };
}

async function toggleFeaturedHandler(request: AuthenticatedRequest, context: RouteContext) {
  try {
    const idSchema = z.coerce.number().int().positive();
    const kosIdParsed = idSchema.safeParse(context.params.id);
    if (!kosIdParsed.success) {
      return fail('invalid_id', 'Invalid kos ID', kosIdParsed.error.format(), { status: 400 });
    }
    const kosId = kosIdParsed.data;

    const body = await request.json().catch(() => ({}));
    const bodySchema = z.object({ isFeatured: z.boolean() });
    const bodyParsed = bodySchema.safeParse(body);
    if (!bodyParsed.success) {
      return fail('validation_error', 'isFeatured must be a boolean', bodyParsed.error.format(), { status: 400 });
    }
    const { isFeatured } = bodyParsed.data;

    // Check if kos exists
    const existingKos = await db
      .select({ id: kos.id, postId: kos.postId })
      .from(kos)
      .where(eq(kos.id, kosId))
      .limit(1);

    if (existingKos.length === 0) {
      return fail('not_found', 'Kos not found', undefined, { status: 404 });
    }

    await db
      .update(posts)
      .set({ isFeatured, updatedAt: new Date() })
      .where(eq(posts.id, existingKos[0].postId));

    return ok(`Kos ${isFeatured ? 'added to' : 'removed from'} featured successfully`, { kosId, isFeatured });
  } catch (error) {
    console.error('Toggle featured error:', error);
    return fail('internal_error', 'Failed to toggle featured status', undefined, { status: 500 });
  }
}

export const PATCH = async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const params = await context.params;
  const handler = withAdmin((req: AuthenticatedRequest) => toggleFeaturedHandler(req, { params }));
  return handler(request as unknown as AuthenticatedRequest);
};

// Replaced any types with explicit zod inferred types where applicable
