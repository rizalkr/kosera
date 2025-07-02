import { config } from 'dotenv';
import { db } from './src/db/index';
import { sql } from 'drizzle-orm';

// Load .env file
config();

async function testDrizzleConnection() {
  try {
    console.log('🔍 Testing Drizzle database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
    console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
    console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT);
    console.log('POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD);
    console.log('POSTGRES_DATABASE:', process.env.POSTGRES_DATABASE);
    
    // Test basic query
    const result = await db.execute(sql`SELECT NOW() as current_time, current_user, current_database()`);
    console.log('✅ Database connection successful!');
    console.log('Current time:', result[0]?.current_time);
    console.log('Current user:', result[0]?.current_user);
    console.log('Current database:', result[0]?.current_database);
    
    // Test version
    const version = await db.execute(sql`SELECT version()`);
    console.log('🗄️ Database version:', version[0]?.version);
    
    // Test tables existence
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📋 Available tables:', tables.map(t => t.table_name));
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Full error:', error);
    
    // Type-safe error handling
    if (error && typeof error === 'object' && 'code' in error) {
      const errorCode = (error as any).code;
      
      if (errorCode === 'ECONNREFUSED') {
        console.error('💡 Tip: Make sure PostgreSQL is running');
      } else if (errorCode === '28P01') {
        console.error('💡 Tip: Check username/password in .env file');
      } else if (errorCode === '3D000') {
        console.error('💡 Tip: Database "kosera" does not exist');
      }
    }
  }
}

testDrizzleConnection();