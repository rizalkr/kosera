#!/usr/bin/env node

/**
 * Migration script to move existing local images to Cloudinary
 * This script migrates photos from local storage to Cloudinary
 * 
 * Usage: node scripts/migrate-to-cloudinary.js
 */

import dotenv from 'dotenv';
import { db, kosPhotos } from '../src/db/index.js';
import { isNull, eq } from 'drizzle-orm';
import { uploadToCloudinary } from '../src/lib/cloudinary.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateLocalImagesToCloudinary() {
  try {
    console.log('🚀 Starting migration of local images to Cloudinary...\n');

    // Get all photos without Cloudinary public ID (local images)
    const localImages = await db
      .select()
      .from(kosPhotos)
      .where(isNull(kosPhotos.cloudinaryPublicId));

    console.log(`📊 Found ${localImages.length} local images to migrate`);

    if (localImages.length === 0) {
      console.log('✅ No local images found. All images are already on Cloudinary!');
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < localImages.length; i++) {
      const image = localImages[i];
      console.log(`\n📤 Processing image ${i + 1}/${localImages.length}: ${image.url}`);

      try {
        // Skip if already a Cloudinary URL
        if (image.url.includes('cloudinary.com')) {
          console.log('   ⏭️  Already a Cloudinary URL, skipping...');
          continue;
        }

        // Check if local file exists
        const localPath = path.join(process.cwd(), 'public', image.url);
        if (!fs.existsSync(localPath)) {
          console.log(`   ⚠️  Local file not found: ${localPath}`);
          errors.push(`Image ${image.id}: Local file not found - ${localPath}`);
          errorCount++;
          continue;
        }

        // Read local file
        const imageBuffer = fs.readFileSync(localPath);
        console.log(`   📁 Read local file (${Math.round(imageBuffer.length / 1024)}KB)`);

        // Upload to Cloudinary
        const kosId = image.kosId;
        const uploadResult = await uploadToCloudinary(
          imageBuffer,
          `kos-photos/kos-${kosId}`, // Organize by kos ID
          {
            width: 1200,
            height: 800,
            crop: 'limit',
            quality: 'auto:good',
            format: 'auto'
          }
        );

        console.log(`   ☁️  Uploaded to Cloudinary: ${uploadResult.public_id}`);

        // Update database record
        await db
          .update(kosPhotos)
          .set({
            url: uploadResult.secure_url,
            cloudinaryPublicId: uploadResult.public_id,
          })
          .where(eq(kosPhotos.id, image.id));

        console.log(`   ✅ Updated database record`);

        // Optional: Remove local file after successful migration
        // Uncomment the next lines if you want to delete local files
        /*
        try {
          fs.unlinkSync(localPath);
          console.log(`   🗑️  Deleted local file`);
        } catch (deleteError) {
          console.log(`   ⚠️  Could not delete local file: ${deleteError.message}`);
        }
        */

        successCount++;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`   ❌ Error processing image ${image.id}:`, error.message);
        errors.push(`Image ${image.id}: ${error.message}`);
        errorCount++;
      }
    }

    // Summary
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${successCount} images`);
    console.log(`   ❌ Failed: ${errorCount} images`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(error => console.log(`   - ${error}`));
    }

    if (successCount > 0) {
      console.log(`\n🎉 Migration completed! ${successCount} images are now stored on Cloudinary.`);
      console.log('💡 Local files are preserved. You can manually delete them after verifying the migration.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Confirm before running
console.log('⚠️  This script will migrate local images to Cloudinary.');
console.log('   Make sure you have:');
console.log('   1. Valid Cloudinary credentials in .env.local');
console.log('   2. A backup of your database');
console.log('   3. Sufficient Cloudinary storage quota\n');

const readline = await import('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Do you want to continue? (yes/no): ', (answer) => {
  rl.close();
  
  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    migrateLocalImagesToCloudinary();
  } else {
    console.log('Migration cancelled.');
    process.exit(0);
  }
});
