import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { kosPhotos, kos, posts } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { parseFormData, validateImageFile } from '@/lib/upload';
import { uploadToCloudinary } from '@/lib/cloudinary';

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

    // Parse form data
    const { files } = await parseFormData(request);
    const isPrimary = request.nextUrl.searchParams.get('isPrimary') === 'true';

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadedPhotos = [];

    // If setting as primary, unset other primary photos first
    if (isPrimary) {
      await db
        .update(kosPhotos)
        .set({ isPrimary: false })
        .where(eq(kosPhotos.kosId, kosId));
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file || !file.originalname) continue;

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        console.warn(`Skipping file ${file.originalname}: ${validation.error}`);
        continue; // Skip invalid files
      }

      try {
        // Upload to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(
          file.buffer,
          `kos-photos/kos-${kosId}`, // Organize by kos ID in Cloudinary
          {
            width: 1200,
            height: 800,
            crop: 'limit', // Don't upscale, just limit max dimensions
            quality: 'auto:good',
            fetch_format: 'auto'
          }
        );

        // Save to database with Cloudinary URL
        const [newPhoto] = await db.insert(kosPhotos).values({
          kosId,
          url: cloudinaryResult.secure_url,
          cloudinaryPublicId: cloudinaryResult.public_id,
          isPrimary: isPrimary && i === 0, // Only first photo can be primary if specified
          caption: file.originalname.split('.')[0] // Use filename without extension as caption
        }).returning();

        uploadedPhotos.push({
          ...newPhoto,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
          fileSize: cloudinaryResult.bytes,
          format: cloudinaryResult.format
        });

      } catch (fileError) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
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
