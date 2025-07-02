import { config } from 'dotenv';

// Load .env file
config();

const API_BASE = 'http://localhost:3000/api';

async function testAuthAPI() {
  console.log('🔐 Testing Authentication API...');
  
  try {
    // Test 1: Login dengan admin
    console.log('\n1. Testing Admin Login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123',
      }),
    });
    
    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginResponse.status);
      const error = await loginResponse.text();
      console.error('Error:', error);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful!');
    console.log('User:', loginData.user);
    console.log('Token received:', loginData.token ? 'Yes' : 'No');
    
    const token = loginData.token;
    
    // Test 2: Verify token
    console.log('\n2. Testing Token Verification...');
    const verifyResponse = await fetch(`${API_BASE}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('✅ Token verification successful!');
      console.log('Verified user:', verifyData.user);
    } else {
      console.error('❌ Token verification failed');
    }
    
    // Test 3: Access protected profile endpoint
    console.log('\n3. Testing Protected Profile Endpoint...');
    const profileResponse = await fetch(`${API_BASE}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Profile access successful!');
      console.log('Profile:', profileData.user);
    } else {
      console.error('❌ Profile access failed');
    }
    
    // Test 4: Access admin-only endpoint
    console.log('\n4. Testing Admin-Only Endpoint...');
    const adminResponse = await fetch(`${API_BASE}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('✅ Admin endpoint access successful!');
      console.log(`Users found: ${adminData.users.length}`);
    } else {
      console.error('❌ Admin endpoint access failed');
    }
    
    // Test 5: Register new user
    console.log('\n5. Testing User Registration...');
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        username: 'testuser',
        contact: 'test@example.com',
        password: 'test123',
        role: 'RENTER',
      }),
    });
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ Registration successful!');
      console.log('New user:', registerData.user);
    } else {
      const error = await registerResponse.json();
      console.error('❌ Registration failed:', error.error);
    }
    
  } catch (error) {
    const err = error as any;
    console.error('❌ API test failed:', err.message);
    console.error('💡 Make sure Next.js dev server is running: npm run dev');
  }
}

testAuthAPI();
