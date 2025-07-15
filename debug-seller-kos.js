// Debug script untuk memeriksa data yang dikembalikan API seller kos detail
// Jalankan di browser console ketika berada di halaman seller kos detail

console.log('=== DEBUG SELLER KOS DETAIL ===');

// Function untuk debug API call
async function debugSellerKosAPI(kosId) {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      console.error('❌ Token tidak ditemukan. Pastikan Anda sudah login sebagai seller.');
      return;
    }
    
    console.log('🔑 Token found:', token.substring(0, 20) + '...');
    
    const response = await fetch(`/api/seller/kos/${kosId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    console.log('📡 API Response Status:', response.status);
    console.log('📊 API Response Data:', data);
    
    if (data.success && data.data) {
      const kosData = data.data;
      console.log('\n=== KOS DATA BREAKDOWN ===');
      console.log('🏠 Nama Kos:', kosData.name);
      console.log('💰 Harga:', kosData.price);
      console.log('📍 Lokasi:', `${kosData.address}, ${kosData.city}`);
      console.log('👁️ View Count:', kosData.viewCount);
      
      if (kosData.statistics) {
        console.log('\n=== STATISTICS BREAKDOWN ===');
        console.log('📋 Total Bookings:', kosData.statistics.totalBookings);
        console.log('⏳ Pending Bookings:', kosData.statistics.pendingBookings);
        console.log('🛏️ Occupied Rooms:', kosData.statistics.occupiedRooms);
        console.log('🆓 Vacant Rooms:', kosData.statistics.vacantRooms);
        console.log('🏠 Total Rooms:', kosData.statistics.totalRooms);
        console.log('💵 Total Revenue:', kosData.statistics.totalRevenue);
        console.log('📈 Total Rooms Rented Out:', kosData.statistics.totalRoomsRentedOut);
        
        const occupancyRate = kosData.statistics.totalRooms > 0 
          ? Math.round((kosData.statistics.occupiedRooms / kosData.statistics.totalRooms) * 100)
          : 0;
        console.log('📊 Occupancy Rate:', occupancyRate + '%');
      } else {
        console.log('⚠️ Statistics data tidak ditemukan!');
      }
    } else {
      console.error('❌ API Error:', data.error || 'Unknown error');
    }
    
  } catch (error) {
    console.error('💥 Network Error:', error);
  }
}

// Function untuk debug user authentication
function debugUserAuth() {
  const token = localStorage.getItem('auth_token');
  const userData = localStorage.getItem('user_data');
  
  console.log('\n=== USER AUTH DEBUG ===');
  console.log('🔑 Has Token:', !!token);
  console.log('👤 Has User Data:', !!userData);
  
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('👤 User Role:', user.role);
      console.log('👤 Username:', user.username);
      console.log('🆔 User ID:', user.id);
    } catch (e) {
      console.error('❌ Invalid user data format');
    }
  }
}

// Auto-run debug untuk kos ID yang sedang dilihat
function autoDebug() {
  const pathParts = window.location.pathname.split('/');
  const kosIdIndex = pathParts.indexOf('kos') + 1;
  
  if (kosIdIndex > 0 && kosIdIndex < pathParts.length) {
    const kosId = pathParts[kosIdIndex];
    console.log('🔍 Auto-debugging for Kos ID:', kosId);
    
    debugUserAuth();
    debugSellerKosAPI(kosId);
  } else {
    console.log('ℹ️ Tidak dapat mendeteksi Kos ID dari URL');
    console.log('💡 Gunakan: debugSellerKosAPI(KOSID) secara manual');
  }
}

// Tambahkan helper functions ke window untuk akses mudah
window.debugSellerKosAPI = debugSellerKosAPI;
window.debugUserAuth = debugUserAuth;

// Run auto debug
autoDebug();

console.log('\n=== MANUAL DEBUG COMMANDS ===');
console.log('🔧 debugSellerKosAPI(kosId) - Debug specific kos');
console.log('👤 debugUserAuth() - Debug user authentication');
console.log('💡 Example: debugSellerKosAPI(1)');
