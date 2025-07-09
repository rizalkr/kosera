import { db } from './index';
import { kosPhotos, kos } from './schema';
import { eq } from 'drizzle-orm';

async function seedKosPhotos() {
  console.log('🖼️  Seeding kos photos...');

  try {
    // Get all existing kos
    const allKos = await db.select().from(kos);
    
    if (allKos.length === 0) {
      console.log('No kos found. Please seed kos data first.');
      return;
    }

    console.log(`Found ${allKos.length} kos to add photos to.`);

    // Sample photo URLs
    const samplePhotos = [
      '/images/rooms/room1.jpg',
      '/images/rooms/room2.jpg', 
      '/images/rooms/room3.jpg',
      '/images/rooms/room4.jpg',
      '/images/rooms/room5.jpg',
      '/images/rooms/room6.jpg',
      '/images/rooms/room7.jpg',
    ];

    for (const kosItem of allKos) {
      // Check if photos already exist for this kos
      const existingPhotos = await db
        .select()
        .from(kosPhotos)
        .where(eq(kosPhotos.kosId, kosItem.id));

      if (existingPhotos.length > 0) {
        console.log(`Kos ${kosItem.id} already has photos, skipping...`);
        continue;
      }

      // Add 3-4 random photos for each kos
      const numPhotos = Math.floor(Math.random() * 2) + 3; // 3 or 4 photos
      const selectedPhotos = samplePhotos
        .sort(() => 0.5 - Math.random())
        .slice(0, numPhotos);

      for (let i = 0; i < selectedPhotos.length; i++) {
        const photoUrl = selectedPhotos[i];
        const isPrimary = i === 0; // First photo is primary

        await db.insert(kosPhotos).values({
          kosId: kosItem.id,
          url: photoUrl,
          caption: `Foto ${kosItem.name} ${i + 1}`,
          isPrimary: isPrimary,
        });
      }

      console.log(`✅ Added ${selectedPhotos.length} photos for kos ${kosItem.id} (${kosItem.name})`);
    }

    console.log('🎉 Kos photos seeding completed!');

  } catch (error) {
    console.error('❌ Error seeding kos photos:', error);
  }
}

async function clearKosPhotos() {
  console.log('🗑️  Clearing existing kos photos...');
  
  try {
    await db.delete(kosPhotos);
    console.log('✅ All kos photos cleared.');
  } catch (error) {
    console.error('❌ Error clearing kos photos:', error);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--clear')) {
    await clearKosPhotos();
  }
  
  await seedKosPhotos();
  
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main();
}

export { seedKosPhotos, clearKosPhotos };
