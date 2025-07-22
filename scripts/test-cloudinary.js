#!/usr/bin/env node

/**
 * Test script for Cloudinary integration
 * This script tests the upload and delete functionality
 * 
 * Usage: npm run cloudinary:test
 */

import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 */
const uploadToCloudinary = async (file, folder = 'test-uploads') => {
  try {
    const result = await cloudinary.uploader.upload(
      typeof file === 'string' ? file : `data:image/jpeg;base64,${file.toString('base64')}`,
      {
        resource_type: 'image',
        folder: folder,
        quality: 'auto',
        fetch_format: 'auto',
      }
    );

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Delete image from Cloudinary
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

async function testCloudinaryIntegration() {
  try {
    console.log('🧪 Testing Cloudinary Integration...\n');

    // Check if environment variables are set
    const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    console.log('✅ Environment variables configured');

    // Create a test image buffer (1x1 pixel PNG)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const testImageBuffer = Buffer.from(testImageBase64, 'base64');

    console.log('📤 Testing image upload...');

    // Test upload
    const uploadResult = await uploadToCloudinary(
      testImageBuffer,
      'test-uploads',
      {
        width: 100,
        height: 100,
        crop: 'limit',
        quality: 'auto',
        format: 'auto'
      }
    );

    console.log('✅ Upload successful!');
    console.log(`   - Public ID: ${uploadResult.public_id}`);
    console.log(`   - URL: ${uploadResult.secure_url}`);
    console.log(`   - Size: ${uploadResult.width}x${uploadResult.height}`);
    console.log(`   - Format: ${uploadResult.format}`);
    console.log(`   - Bytes: ${uploadResult.bytes}`);

    // Wait a moment
    console.log('\n⏳ Waiting 2 seconds before deletion...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('🗑️  Testing image deletion...');

    // Test delete
    const deleteResult = await deleteFromCloudinary(uploadResult.public_id);

    if (deleteResult) {
      console.log('✅ Deletion successful!');
    } else {
      console.log('❌ Deletion failed');
    }

    console.log('\n🎉 All tests passed! Cloudinary integration is working correctly.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.message.includes('Invalid API Key')) {
      console.log('\n💡 Tips:');
      console.log('   - Check your Cloudinary credentials in .env.local');
      console.log('   - Make sure CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are correct');
      console.log('   - Verify your Cloudinary account is active');
    }
    
    process.exit(1);
  }
}

// Run the test
testCloudinaryIntegration();
