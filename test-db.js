import { db, users } from './src/db/index.js';

async function testConnection() {
  try {
    console.log('🔍 Testing Drizzle database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    
    // Test basic query
    const result = await db.select().from(users).limit(1);
    console.log('✅ Database connection successful!');
    console.log('📊 Sample users:', result);
    
    // Test raw query
    const version = await db.execute('SELECT version()');
    console.log('�️  Database version:', version.rows[0]);
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error message:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
