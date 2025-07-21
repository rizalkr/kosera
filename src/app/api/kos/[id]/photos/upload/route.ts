import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { db } from '@/db';
import { kosPhotos, kos, posts } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

// POST /api/kos/[id]/photos/upload - Upload photo files
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const kosId = parseInt(id);

    if (isNaN(kosId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid kos ID' },
        { status: 400 }
      );
    }

    // Check if kos exists and user owns it
    const kosData = await db
      .select({
        id: kos.id,
        postId: kos.postId,
        userId: posts.userId,
      })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .where(eq(kos.id, kosId))
      .limit(1);

    if (kosData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kos not found' },
        { status: 404 }
      );
    }

    // Check ownership (user must own the kos or be admin)
    if (kosData[0].userId !== payload.userId && payload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: You can only upload photos to your own kos' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('photos') as File[];
    const isPrimary = formData.get('isPrimary') === 'true';

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadedPhotos = [];

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'images', 'rooms');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // Directory might already exist
    }

    // If setting as primary, unset other primary photos first
    if (isPrimary) {
      await db
        .update(kosPhotos)
        .set({ isPrimary: false })
        .where(eq(kosPhotos.kosId, kosId));
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file || !file.name) continue;

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        continue; // Skip invalid files
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        continue; // Skip large files
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 1000);
      const extension = file.name.split('.').pop()?.toLowerCase();
      const filename = `kos-${kosId}-${timestamp}-${randomNum}.${extension}`;
      
      try {
        // Convert file to buffer and write to disk
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filepath = join(uploadDir, filename);
        
        await writeFile(filepath, buffer);

        // Save to database
        const photoUrl = `/images/rooms/${filename}`;
        const [newPhoto] = await db.insert(kosPhotos).values({
          kosId,
          url: photoUrl,
          isPrimary: isPrimary && i === 0, // Only first photo can be primary if specified
          caption: file.name.split('.')[0] // Use filename without extension as caption
        }).returning();

        uploadedPhotos.push(newPhoto);

      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        continue; // Skip this file and continue with others
      }
    }

    if (uploadedPhotos.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid files were uploaded' },
        { status: 400 }
      );
    }

    // Update photo count in posts
    await db
      .update(posts)
      .set({
        photoCount: sql`${posts.photoCount} + ${uploadedPhotos.length}`,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, kosData[0].postId));

    return NextResponse.json({ 
      success: true,
      message: `${uploadedPhotos.length} photo(s) uploaded successfully`,
      data: { photos: uploadedPhotos }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload photos' }, 
      { status: 500 }
    );
  }
}
