// Test authentication untuk seller2
// Jalankan di browser console: node test-seller-auth.js

async function testSellerAuth() {
  try {
    console.log('🧪 Testing seller authentication...');
    
    // Step 1: Login sebagai seller2
    console.log('Step 1: Login sebagai seller2...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'seller2',
        password: 'seller123'
      })
    });

    const loginResult = await loginResponse.json();
    console.log('Login response status:', loginResponse.status);
    console.log('Login result:', loginResult);

    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginResult);
      return;
    }

    const token = loginResult.data.token;
    const user = loginResult.data.user;
    
    console.log('✅ Login successful');
    console.log('Token:', token);
    console.log('User:', user);

    // Step 2: Test API kos dengan token
    console.log('\nStep 2: Test API /api/kos with token...');
    const testKosData = {
      title: 'Test Kos dari Script',
      description: 'Kos untuk testing authentication',
      price: 500000,
      name: 'Kos Test',
      address: 'Jl. Test No. 123',
      city: 'Jakarta',
      facilities: 'WiFi, AC, Kamar Mandi Dalam'
    };

    const createResponse = await fetch('http://localhost:3000/api/kos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testKosData)
    });

    const createResult = await createResponse.json();
    console.log('Create kos response status:', createResponse.status);
    console.log('Create kos result:', createResult);

    if (createResponse.ok) {
      console.log('✅ Create kos successful!');
    } else {
      console.log('❌ Create kos failed:', createResult);
    }

    // Step 3: Test verify token
    console.log('\nStep 3: Test verify token...');
    const verifyResponse = await fetch('http://localhost:3000/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const verifyResult = await verifyResponse.json();
    console.log('Verify response status:', verifyResponse.status);
    console.log('Verify result:', verifyResult);

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run test
testSellerAuth();
