import { NextRequest, NextResponse } from 'next/server';
import { withSellerOrAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { db } from '@/db';
import { kos, posts } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

// GET /api/kos - Get all kos (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // Start with base query
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
        updatedAt: posts.updatedAt
      })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id));

    // Build where conditions
    const conditions = [] as any[]; // explicitly type as any[] to satisfy drizzle types when empty
    
    if (city) {
      conditions.push(eq(kos.city, city));
    }
    
    if (minPrice) {
      conditions.push(gte(posts.price, parseInt(minPrice)));
    }
    
    if (maxPrice) {
      conditions.push(lte(posts.price, parseInt(maxPrice)));
    }

    // Apply conditions if any exist
    const query = conditions.length > 0 
      ? baseQuery.where(and(...conditions))
      : baseQuery;

    const result = await query.execute();

    return NextResponse.json({
      message: 'Kos retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error retrieving kos:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve kos' },
      { status: 500 }
    );
  }
}

// POST /api/kos - Create new kos (SELLER/ADMIN only)
export const POST = withSellerOrAdmin(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const { name, address, city, facilities, title, description, price, totalRooms, occupiedRooms } = body;

    // Validate required fields
    if (!name || !address || !city || !title || !description || !price || !totalRooms) {
      return NextResponse.json(
        { error: 'Missing required fields: name, address, city, title, description, price, totalRooms' },
        { status: 400 }
      );
    }

    // Validate price is positive number
    if (price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    // Validate totalRooms is positive number
    if (totalRooms <= 0) {
      return NextResponse.json(
        { error: 'Total rooms must be a positive number' },
        { status: 400 }
      );
    }

    // Validate occupiedRooms if provided
    if (occupiedRooms !== undefined && occupiedRooms !== null) {
      if (occupiedRooms < 0) {
        return NextResponse.json(
          { error: 'Occupied rooms cannot be negative' },
          { status: 400 }
        );
      }
      if (occupiedRooms > totalRooms) {
        return NextResponse.json(
          { error: 'Occupied rooms cannot exceed total rooms' },
          { status: 400 }
        );
      }
    }

    // Create post first
    const [newPost] = await db
      .insert(posts)
      .values({
        userId: request.user!.userId,
        title,
        description,
        price: parseInt(price),
        totalPost: 1,
        totalPenjualan: 0
      })
      .returning();

    // Create kos entry
    const [newKos] = await db
      .insert(kos)
      .values({
        postId: newPost.id,
        name,
        address,
        city,
        facilities: facilities || null,
        totalRooms: parseInt(totalRooms),
        occupiedRooms: occupiedRooms !== undefined && occupiedRooms !== null ? parseInt(occupiedRooms) : 0
      })
      .returning();

    // Return the complete kos data
    const kosData = {
      id: newKos.id,
      postId: newKos.postId,
      name: newKos.name,
      address: newKos.address,
      city: newKos.city,
      facilities: newKos.facilities,
      totalRooms: newKos.totalRooms,
      occupiedRooms: newKos.occupiedRooms,
      price: newPost.price,
      title: newPost.title,
      description: newPost.description,
      totalPost: newPost.totalPost,
      totalPenjualan: newPost.totalPenjualan,
      createdAt: newPost.createdAt,
      updatedAt: newPost.updatedAt
    };

    return NextResponse.json({
      message: 'Kos created successfully',
      data: kosData
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating kos:', error);
    return NextResponse.json(
      { error: 'Failed to create kos' },
      { status: 500 }
    );
  }
});
