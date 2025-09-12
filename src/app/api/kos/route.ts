import { withSellerOrAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { db } from '@/db';
import { kos, posts } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { ok, fail } from '@/types/api';
import { z } from 'zod';

function parseKosQuery(url: string) {
  const { searchParams } = new URL(url);
  const city = searchParams.get('city') || undefined;
  const minPriceRaw = searchParams.get('minPrice');
  const maxPriceRaw = searchParams.get('maxPrice');
  const minPrice = minPriceRaw ? parseInt(minPriceRaw, 10) : undefined;
  const maxPrice = maxPriceRaw ? parseInt(maxPriceRaw, 10) : undefined;
  return { city, minPrice, maxPrice };
}

// GET /api/kos - public list
export async function GET(request: Request) {
  try {
    const { city, minPrice, maxPrice } = parseKosQuery(request.url);

    const baseQuery = db
      .select({
        id: kos.id,
        postId: kos.postId,
        name: kos.name,
        address: kos.address,
        city: kos.city,
        facilities: kos.facilities,
        totalRooms: kos.totalRooms,
        occupiedRooms: kos.occupiedRooms,
        price: posts.price,
        title: posts.title,
        description: posts.description,
        totalPost: posts.totalPost,
        totalPenjualan: posts.totalPenjualan,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
      })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id));

    const conditions: SQL[] = [];
    if (city) conditions.push(eq(kos.city, city));
    if (typeof minPrice === 'number' && !Number.isNaN(minPrice)) conditions.push(gte(posts.price, minPrice));
    if (typeof maxPrice === 'number' && !Number.isNaN(maxPrice)) conditions.push(lte(posts.price, maxPrice));

    const query = conditions.length > 0 ? baseQuery.where(and(...conditions as [SQL, ...SQL[]])) : baseQuery;
    const result = await query;

    return ok('Kos retrieved successfully', {
      kos: result,
      filters: { city, minPrice: minPrice ?? null, maxPrice: maxPrice ?? null },
      count: result.length,
    });
  } catch (error) {
    console.error('kos.list.GET error', error);
    return fail('internal_error', 'Failed to retrieve kos', undefined, { status: 500 });
  }
}

const createKosSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  facilities: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().positive(),
  totalRooms: z.coerce.number().int().positive(),
  occupiedRooms: z.coerce.number().int().min(0).optional(),
});

export const POST = withSellerOrAdmin(async (request: AuthenticatedRequest) => {
  try {
    const json = await request.json().catch(() => null);
    if (!json) return fail('invalid_json', 'Invalid JSON body', undefined, { status: 400 });

    const parsed = createKosSchema.safeParse(json);
    if (!parsed.success) {
      return fail('validation_error', 'Invalid input', parsed.error.flatten(), { status: 400 });
    }
    const { name, address, city, facilities, title, description, price, totalRooms, occupiedRooms } = parsed.data;

    if (occupiedRooms !== undefined && occupiedRooms > totalRooms) {
      return fail('invalid_rooms', 'occupiedRooms cannot exceed totalRooms', undefined, { status: 400 });
    }

    const facilitiesValue: string | null = facilities == null
      ? null
      : Array.isArray(facilities)
        ? facilities.join(',')
        : facilities;

    const [newPost] = await db
      .insert(posts)
      .values({
        userId: request.user!.userId,
        title,
        description,
        price,
        totalPost: 1,
        totalPenjualan: 0,
      })
      .returning();

    const [newKos] = await db
      .insert(kos)
      .values({
        postId: newPost.id,
        name,
        address,
        city,
        facilities: facilitiesValue,
        totalRooms,
        occupiedRooms: occupiedRooms ?? 0,
      })
      .returning();

    return ok('Kos created successfully', {
      kos: {
        id: newKos.id,
        postId: newKos.postId,
        name: newKos.name,
        address: newKos.address,
        city: newKos.city,
        facilities: newKos.facilities ? newKos.facilities.split(',').map((f) => f.trim()).filter(Boolean) : [],
        totalRooms: newKos.totalRooms,
        occupiedRooms: newKos.occupiedRooms,
        price: newPost.price,
        title: newPost.title,
        description: newPost.description,
        totalPost: newPost.totalPost,
        totalPenjualan: newPost.totalPenjualan,
        createdAt: newPost.createdAt,
        updatedAt: newPost.updatedAt,
      },
    });
  } catch (error) {
    console.error('kos.create.POST error', error);
    return fail('internal_error', 'Failed to create kos', undefined, { status: 500 });
  }
});
