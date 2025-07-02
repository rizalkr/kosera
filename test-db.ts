import { config } from 'dotenv';
import { Pool } from 'pg';

// Load .env file
config();

async function testSimpleConnection() {
  console.log('🔍 Testing simple PostgreSQL connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    database: process.env.POSTGRES_DATABASE || 'kosera',
  });

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW(), current_user, current_database()');
    console.log('✅ Connection successful!');
    console.log('Current time:', result.rows[0].now);
    console.log('Current user:', result.rows[0].current_user);
    console.log('Current database:', result.rows[0].current_database);
    client.release();
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await pool.end();
  }
}

testSimpleConnection();