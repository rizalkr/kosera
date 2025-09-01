import { withAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { db, users } from '@/db';
import { eq, sql, count, isNull } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { ok, fail } from '@/types/api';

type UserRole = 'ADMIN' | 'SELLER' | 'RENTER';

interface GetUsersQuery {
  page: number;
  limit: number;
  search: string;
  role: string;
  showDeleted: boolean;
}

const createUserSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(3),
  contact: z.string().min(3),
  role: z.enum(['ADMIN', 'SELLER', 'RENTER']),
  password: z.string().min(6),
});

interface PublicUser {
  id: number;
  name: string;
  username: string;
  contact: string;
  role: UserRole;
  createdAt: Date;
  deletedAt: Date | null;
  createdBy: number | null;
  deletedBy: number | null;
  creatorInfo: BasicUser | null;
  deleterInfo: BasicUser | null;
}

interface BasicUser {
  id: number;
  name: string;
  username: string;
  contact: string;
}

function parseQuery(url: string): GetUsersQuery {
  const { searchParams } = new URL(url);
  return {
    page: Math.max(1, parseInt(searchParams.get('page') || '1', 10)),
    limit: Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10))),
    search: searchParams.get('search') || '',
    role: searchParams.get('role') || '',
    showDeleted: searchParams.get('showDeleted') === 'true',
  };
}

async function getAllUsersHandler(request: AuthenticatedRequest) {
  try {
    const { page, limit, search, role, showDeleted } = parseQuery(request.url);
    const offset = (page - 1) * limit;

    const whereConditions: unknown[] = [];

    // Show only active users by default, or only deleted users if showDeleted=true
    if (showDeleted) {
      whereConditions.push(sql`${users.deletedAt} IS NOT NULL`);
    } else {
      whereConditions.push(isNull(users.deletedAt));
    }

    if (search) {
      whereConditions.push(
        sql`(${users.name} ILIKE ${'%' + search + '%'} OR ${users.username} ILIKE ${'%' + search + '%'} OR ${users.contact} ILIKE ${'%' + search + '%'})`
      );
    }

    if (role && role !== 'all') {
      whereConditions.push(eq(users.role, role as UserRole));
    }

    // Combine conditions with AND if multiple
    let whereCondition: ReturnType<typeof sql> | undefined;
    if (whereConditions.length === 1) {
      whereCondition = whereConditions[0] as ReturnType<typeof sql>;
    } else if (whereConditions.length > 1) {
      whereCondition = whereConditions.reduce((acc, cond) => sql`${acc} AND ${cond}`) as ReturnType<typeof sql>;
    }

    // Total count
    const totalResult = await db
      .select({ count: count() })
      .from(users)
      .where(whereCondition);

    const total = Number(totalResult[0]?.count || 0);

    const userRows = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        contact: users.contact,
        role: users.role,
        createdAt: users.createdAt,
        deletedAt: users.deletedAt,
        createdBy: users.createdBy,
        deletedBy: users.deletedBy,
      })
      .from(users)
      .where(whereCondition)
      .limit(limit)
      .offset(offset)
      .orderBy(users.createdAt);

    // Resolve creator/deleter info in parallel
    const enriched: PublicUser[] = await Promise.all(
      userRows.map(async (u) => {
        const [creatorInfoRow, deleterInfoRow] = await Promise.all([
          u.createdBy
            ? db
                .select({ id: users.id, name: users.name, username: users.username, contact: users.contact })
                .from(users)
                .where(eq(users.id, u.createdBy))
                .limit(1)
            : Promise.resolve([]),
          u.deletedBy
            ? db
                .select({ id: users.id, name: users.name, username: users.username, contact: users.contact })
                .from(users)
                .where(eq(users.id, u.deletedBy))
                .limit(1)
            : Promise.resolve([]),
        ]);

        const creatorInfo: BasicUser | null = creatorInfoRow[0] ? { ...creatorInfoRow[0] } : null;
        const deleterInfo: BasicUser | null = deleterInfoRow[0] ? { ...deleterInfoRow[0] } : null;

        return { ...u, creatorInfo, deleterInfo };
      })
    );

    return ok('Users retrieved successfully', {
      users: enriched.map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        contact: u.contact,
        role: u.role,
        createdAt: u.createdAt,
        deletedAt: u.deletedAt,
        createdBy: u.createdBy,
        deletedBy: u.deletedBy,
        creatorInfo: u.creatorInfo,
        deleterInfo: u.deleterInfo,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      filters: { search, role, showDeleted },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return fail('Internal server error');
  }
}

async function createUserHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return fail('Validation error', 'Invalid input', parsed.error.flatten(), { status: 400 });
    }

    const { name, username, contact, role, password } = parsed.data;
    const currentUserId = request.user?.userId || null;

    // Check existing (exclude soft deleted)
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`${users.username} = ${username} AND ${users.deletedAt} IS NULL`)
      .limit(1);

    if (existingUser.length > 0) {
      return fail('Username already exists', undefined, undefined, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        username,
        contact,
        role: role as UserRole,
        password: hashedPassword,
        createdBy: currentUserId,
      })
      .returning({
        id: users.id,
        name: users.name,
        username: users.username,
        contact: users.contact,
        role: users.role,
        createdAt: users.createdAt,
        createdBy: users.createdBy,
      });

    return ok('User created successfully', { user: newUser });
  } catch (error) {
    console.error('Create user error:', error);
    return fail('Internal server error');
  }
}

export const GET = withAdmin(getAllUsersHandler);
export const POST = withAdmin(createUserHandler);

