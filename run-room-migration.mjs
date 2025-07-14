import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runMigration() {
  // Create connection using environment variable or default
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/kosera_db';
  
  console.log('Connecting to database...');
  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    console.log('🔄 Running migration: Add room fields to kos table...');
    
    // Check if columns already exist
    const checkColumns = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'kos' 
      AND column_name IN ('total_rooms', 'occupied_rooms')
    `);
    
    const existingColumns = checkColumns.map(row => row.column_name);
    
    if (!existingColumns.includes('total_rooms')) {
      console.log('➕ Adding total_rooms column...');
      await db.execute(sql`
        ALTER TABLE kos ADD COLUMN total_rooms INTEGER NOT NULL DEFAULT 1
      `);
    } else {
      console.log('✅ total_rooms column already exists');
    }
    
    if (!existingColumns.includes('occupied_rooms')) {
      console.log('➕ Adding occupied_rooms column...');
      await db.execute(sql`
        ALTER TABLE kos ADD COLUMN occupied_rooms INTEGER DEFAULT 0
      `);
    } else {
      console.log('✅ occupied_rooms column already exists');
    }
    
    // Add constraints (ignore if already exist)
    try {
      await db.execute(sql`
        ALTER TABLE kos 
        ADD CONSTRAINT kos_total_rooms_positive 
        CHECK (total_rooms > 0)
      `);
      console.log('✅ Added total_rooms constraint');
    } catch (e) {
      console.log('ℹ️ total_rooms constraint already exists');
    }
    
    try {
      await db.execute(sql`
        ALTER TABLE kos 
        ADD CONSTRAINT kos_occupied_rooms_non_negative 
        CHECK (occupied_rooms >= 0)
      `);
      console.log('✅ Added occupied_rooms non-negative constraint');
    } catch (e) {
      console.log('ℹ️ occupied_rooms non-negative constraint already exists');
    }
    
    try {
      await db.execute(sql`
        ALTER TABLE kos 
        ADD CONSTRAINT kos_occupied_rooms_not_exceed_total 
        CHECK (occupied_rooms <= total_rooms)
      `);
      console.log('✅ Added occupied_rooms not exceed total constraint');
    } catch (e) {
      console.log('ℹ️ occupied_rooms not exceed total constraint already exists');
    }
    
    // Update existing records
    const updateResult = await db.execute(sql`
      UPDATE kos 
      SET total_rooms = COALESCE(total_rooms, 1),
          occupied_rooms = COALESCE(occupied_rooms, 0)
      WHERE total_rooms IS NULL OR occupied_rooms IS NULL
    `);
    
    console.log(`✅ Updated ${updateResult.count || 0} existing records`);
    
    // Verify the migration
    const verification = await db.execute(sql`
      SELECT COUNT(*) as total,
             AVG(total_rooms) as avg_total_rooms,
             AVG(occupied_rooms) as avg_occupied_rooms
      FROM kos
    `);
    
    console.log('📊 Migration verification:');
    console.log(`   Total kos records: ${verification[0].total}`);
    console.log(`   Average total rooms: ${verification[0].avg_total_rooms}`);
    console.log(`   Average occupied rooms: ${verification[0].avg_occupied_rooms}`);
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
