import { db, users, posts, kos, reviews, favorites, kosPhotos, bookings } from './index';
import { hashPassword } from '@/lib/auth';

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data in correct order (foreign key dependencies)
    await db.delete(bookings);
    await db.delete(kosPhotos);
    await db.delete(favorites);
    await db.delete(reviews);
    await db.delete(kos);
    await db.delete(posts);
    await db.delete(users);

    console.log('🗑️ Cleared existing data');

    // Create users
    const adminPassword = await hashPassword('admin123');
    const sellerPassword = await hashPassword('seller123'); 
    const renterPassword = await hashPassword('renter123');

    // Create 5 admins
    const adminUsers = [];
    for (let i = 1; i <= 5; i++) {
      const [admin] = await db.insert(users).values({
        name: `Admin User ${i}`,
        username: `admin${i}`,
        contact: `08123456789${i}`,
        role: 'ADMIN',
        password: adminPassword,
      }).returning();
      adminUsers.push(admin);
    }

    // Create 20 sellers
    const sellerUsers = [];
    for (let i = 1; i <= 20; i++) {
      const [seller] = await db.insert(users).values({
        name: `Seller User ${i}`,
        username: `seller${i}`,
        contact: `08234567890${i}`,
        role: 'SELLER',
        password: sellerPassword,
      }).returning();
      sellerUsers.push(seller);
    }

    // Create 100 renters
    const renterUsers = [];
    for (let i = 1; i <= 100; i++) {
      const [renter] = await db.insert(users).values({
        name: `Renter User ${i}`,
        username: `renter${i}`,
        contact: `08345678901${i}`,
        role: 'RENTER',
        password: renterPassword,
      }).returning();
      renterUsers.push(renter);
    }

    console.log('👥 Created users: 5 admins, 20 sellers, 100 renters');

    // Insert 100 posts
    const kosNames = [
      'Kos Putri Mawar', 'Kos Putra Elite', 'Kos Ekonomis', 'Kos Sejahtera', 'Kos Indah',
      'Kos Nyaman', 'Kos Asri', 'Kos Harmoni', 'Kos Bahagia', 'Kos Tentram',
      'Kos Damai', 'Kos Cemerlang', 'Kos Mulia', 'Kos Berkah', 'Kos Sentosa',
      'Kos Indira', 'Kos Cahaya', 'Kos Permata', 'Kos Sari', 'Kos Melati'
    ];
    
    const cities = ['Semarang', 'Jakarta', 'Yogyakarta', 'Bandung', 'Surabaya', 'Malang', 'Solo'];
    const priceRanges = [300000, 400000, 500000, 600000, 750000, 850000, 1000000];
    
    const allPosts = [];
    for (let i = 1; i <= 100; i++) {
      const sellerIndex = ((i - 1) % sellerUsers.length);
      const nameIndex = ((i - 1) % kosNames.length);
      const cityIndex = ((i - 1) % cities.length);
      const priceIndex = ((i - 1) % priceRanges.length);
      
      const [post] = await db.insert(posts).values({
        userId: sellerUsers[sellerIndex].id,
        title: `${kosNames[nameIndex]} ${i} - ${cities[cityIndex]}`,
        description: `Kos dengan fasilitas lengkap di ${cities[cityIndex]}. Lokasi strategis, nyaman dan aman.`,
        price: priceRanges[priceIndex],
        totalPost: 1,
        totalPenjualan: Math.floor(Math.random() * 5),
        isFeatured: i <= 20, // First 20 are featured
        viewCount: Math.floor(Math.random() * 300) + 50,
        favoriteCount: Math.floor(Math.random() * 50) + 5,
        averageRating: (3.5 + Math.random() * 1.5).toFixed(1),
        reviewCount: Math.floor(Math.random() * 20) + 1,
        photoCount: Math.floor(Math.random() * 8) + 3,
      }).returning();
      allPosts.push(post);
    }

    console.log('📝 Created 100 posts');

    // Insert 100 kos details
    const addresses = [
      'Jl. Mawar No.', 'Jl. Anggrek No.', 'Jl. Melati No.', 'Jl. Kenanga No.', 'Jl. Tulip No.',
      'Jl. Dahlia No.', 'Jl. Sakura No.', 'Jl. Flamboyan No.', 'Jl. Bougenville No.', 'Jl. Cempaka No.'
    ];
    
    const areas = ['Tembalang', 'Tlogosari', 'Pleburan', 'Pedurungan', 'Candisari', 'Gajahmungkur', 'Banyumanik'];
    const facilitiesOptions = [
      'AC, WiFi, Kamar Mandi Dalam, Dapur Bersama, Parkir Motor',
      'AC, WiFi, Kamar Mandi Dalam, Lemari, Kasur Queen, TV, Kulkas Mini',
      'WiFi, Kamar Mandi Luar, Dapur Bersama, Parkir Motor',
      'AC, WiFi, Kamar Mandi Dalam, Laundry, Security 24 Jam',
      'WiFi, Kamar Mandi Dalam, Dapur Pribadi, Balkon',
      'AC, WiFi, Kamar Mandi Dalam, Gym, Rooftop Garden'
    ];
    
    const allKos = [];
    for (let i = 0; i < 100; i++) {
      const addressIndex = i % addresses.length;
      const areaIndex = i % areas.length;
      const cityIndex = i % cities.length;
      const facilityIndex = i % facilitiesOptions.length;
      
      // Generate random coordinates around central Indonesia
      const baseLat = -7.0 + (Math.random() - 0.5) * 0.2; // Around -7.0 ± 0.1
      const baseLng = 110.4 + (Math.random() - 0.5) * 0.2; // Around 110.4 ± 0.1
      
      const [kosDetail] = await db.insert(kos).values({
        postId: allPosts[i].id,
        name: allPosts[i].title.split(' - ')[0], // Extract name from title
        address: `${addresses[addressIndex]} ${i + 1}, ${areas[areaIndex]}`,
        city: cities[cityIndex],
        facilities: facilitiesOptions[facilityIndex],
        latitude: parseFloat(baseLat.toFixed(6)),
        longitude: parseFloat(baseLng.toFixed(6)),
      }).returning();
      allKos.push(kosDetail);
    }

    console.log('🏠 Created 100 kos details');

    // Insert sample reviews (multiple reviews for each kos)
    const reviewComments = [
      'Kos sangat bagus, bersih dan nyaman. Pemilik ramah. Highly recommended!',
      'Lokasi strategis, fasilitas oke. Hanya wifi kadang lambat di malam hari.',
      'Kos mewah dengan fasilitas lengkap. Agak mahal tapi worth it.',
      'Sesuai budget mahasiswa, bersih dan aman. Kamar mandi luar agak antri.',
      'Pelayanan baik, lingkungan aman. Cocok untuk mahasiswa.',
      'Fasilitas lengkap, AC dingin, wifi cepat. Recommended!',
      'Tempat strategis dekat kampus, tapi agak bising di malam hari.',
      'Kos bersih, aman, pemilik baik. Harga sesuai fasilitas.',
      'Lumayan bagus, tapi perlu perbaikan di beberapa bagian.',
      'Sangat puas dengan pelayanan dan fasilitas yang disediakan.'
    ];

    const reviewsToInsert = [];
    for (let i = 0; i < allKos.length; i++) {
      // Each kos gets 1-3 reviews
      const numReviews = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numReviews; j++) {
        const renterIndex = Math.floor(Math.random() * renterUsers.length);
        const commentIndex = Math.floor(Math.random() * reviewComments.length);
        reviewsToInsert.push({
          kosId: allKos[i].id,
          userId: renterUsers[renterIndex].id,
          rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
          comment: reviewComments[commentIndex],
        });
      }
    }

    await db.insert(reviews).values(reviewsToInsert);
    console.log(`⭐ Created ${reviewsToInsert.length} sample reviews`);

    // Insert sample favorites
    const favoritesToInsert = [];
    for (let i = 0; i < renterUsers.length; i++) {
      // Each renter favorites 2-5 random kos
      const numFavorites = Math.floor(Math.random() * 4) + 2;
      const selectedKos: number[] = [];
      
      for (let j = 0; j < numFavorites; j++) {
        let kosIndex;
        do {
          kosIndex = Math.floor(Math.random() * allKos.length);
        } while (selectedKos.includes(kosIndex));
        
        selectedKos.push(kosIndex);
        favoritesToInsert.push({
          userId: renterUsers[i].id,
          kosId: allKos[kosIndex].id,
        });
      }
    }

    await db.insert(favorites).values(favoritesToInsert);
    console.log(`❤️ Created ${favoritesToInsert.length} sample favorites`);

    // Insert sample photos
    const photoCaptions = [
      'Kamar utama dengan AC dan lemari',
      'Kamar mandi dalam yang bersih',
      'Ruang bersama dan dapur',
      'Fasilitas lengkap termasuk TV dan kulkas',
      'Kamar ekonomis untuk mahasiswa',
      'Area parkir yang luas',
      'Taman dan area santai',
      'Dapur bersama yang modern',
      'Kamar dengan pemandangan bagus',
      'Balkon pribadi'
    ];

    const photosToInsert = [];
    for (let i = 0; i < allKos.length; i++) {
      // Each kos gets 3-6 photos
      const numPhotos = Math.floor(Math.random() * 4) + 3;
      for (let j = 0; j < numPhotos; j++) {
        const captionIndex = Math.floor(Math.random() * photoCaptions.length);
        photosToInsert.push({
          kosId: allKos[i].id,
          url: `https://example.com/kos${i + 1}-photo${j + 1}.jpg`,
          caption: photoCaptions[captionIndex],
          isPrimary: j === 0, // First photo is primary
        });
      }
    }

    await db.insert(kosPhotos).values(photosToInsert);
    console.log(`📸 Created ${photosToInsert.length} sample photos`);

    // Insert sample bookings with varied scenarios
    const bookingsToInsert = [];
    const totalBookings = 120; // Increased from 50 to 120 for more variety
    
    // Define booking statuses with realistic distribution
    const statusDistribution = [
      { status: 'pending', weight: 0.15 },      // 15% pending (18 bookings)
      { status: 'confirmed', weight: 0.40 },    // 40% confirmed (48 bookings)
      { status: 'completed', weight: 0.35 },    // 35% completed (42 bookings)
      { status: 'cancelled', weight: 0.10 }     // 10% cancelled (12 bookings)
    ];
    
    // Expanded notes for different scenarios
    const notesByStatus = {
      pending: [
        'Menunggu konfirmasi dari pemilik kos',
        'Booking untuk semester depan, mohon kamar yang menghadap timur',
        'Masih menunggu kepastian jadwal kuliah',
        'Booking untuk anak yang akan mulai kuliah',
        'Sedang menunggu proses verifikasi dokumen'
      ],
      confirmed: [
        'Booking sudah dikonfirmasi, siap check-in',
        'Pembayaran DP sudah lunas, menunggu tanggal masuk',
        'Kamar sudah disiapkan untuk penghuni baru',
        'Sudah koordinasi dengan pemilik untuk jadwal masuk',
        'Booking untuk tahun ajaran baru sudah fix'
      ],
      completed: [
        'Masa sewa sudah selesai, terima kasih',
        'Penghuni sudah pindah, kamar dalam kondisi baik',
        'Kontrak sewa sudah berakhir dengan baik',
        'Sewa selesai, deposit sudah dikembalikan',
        'Masa tinggal sudah selesai, sangat puas dengan pelayanan'
      ],
      cancelled: [
        'Dibatalkan karena perubahan rencana kuliah',
        'Cancelled - mendapat kos yang lebih dekat kampus',
        'Dibatalkan karena alasan keluarga',
        'Batal karena tidak cocok dengan fasilitas',
        'Cancelled - ada perubahan jadwal masuk kuliah'
      ]
    };
    
    // Create bookings with realistic time distributions
    for (let i = 0; i < totalBookings; i++) {
      const renterIndex = Math.floor(Math.random() * renterUsers.length);
      const kosIndex = Math.floor(Math.random() * allKos.length);
      
      // Determine status based on weighted distribution
      let status = 'pending';
      let cumulativeWeight = 0;
      const random = Math.random();
      
      for (const { status: s, weight } of statusDistribution) {
        cumulativeWeight += weight;
        if (random <= cumulativeWeight) {
          status = s;
          break;
        }
      }
      
      // Create realistic dates based on status
      let checkInDate: Date;
      let checkOutDate: Date | null = null;
      let duration: number;
      
      const now = new Date();
      
      if (status === 'completed') {
        // Completed bookings: past dates
        const daysAgo = Math.floor(Math.random() * 365) + 30; // 30-395 days ago
        checkInDate = new Date(now);
        checkInDate.setDate(checkInDate.getDate() - daysAgo);
        
        duration = Math.floor(Math.random() * 11) + 1; // 1-12 months
        checkOutDate = new Date(checkInDate);
        checkOutDate.setMonth(checkOutDate.getMonth() + duration);
        
        // Ensure checkout is in the past
        if (checkOutDate > now) {
          checkOutDate = new Date(now);
          checkOutDate.setDate(checkOutDate.getDate() - Math.floor(Math.random() * 30));
        }
      } else if (status === 'cancelled') {
        // Cancelled bookings: mix of past and future dates
        const daysDiff = Math.floor(Math.random() * 180) - 90; // -90 to +90 days
        checkInDate = new Date(now);
        checkInDate.setDate(checkInDate.getDate() + daysDiff);
        
        duration = Math.floor(Math.random() * 11) + 1;
        checkOutDate = new Date(checkInDate);
        checkOutDate.setMonth(checkOutDate.getMonth() + duration);
      } else if (status === 'confirmed') {
        // Confirmed bookings: mostly future dates, some current
        const daysFromNow = Math.floor(Math.random() * 120) + 1; // 1-120 days from now
        checkInDate = new Date(now);
        checkInDate.setDate(checkInDate.getDate() + daysFromNow);
        
        duration = Math.floor(Math.random() * 11) + 1;
        checkOutDate = new Date(checkInDate);
        checkOutDate.setMonth(checkOutDate.getMonth() + duration);
      } else { // pending
        // Pending bookings: future dates
        const daysFromNow = Math.floor(Math.random() * 60) + 7; // 7-67 days from now
        checkInDate = new Date(now);
        checkInDate.setDate(checkInDate.getDate() + daysFromNow);
        
        duration = Math.floor(Math.random() * 11) + 1;
        checkOutDate = new Date(checkInDate);
        checkOutDate.setMonth(checkOutDate.getMonth() + duration);
      }
      
      const kosPrice = allPosts[kosIndex].price;
      const totalPrice = kosPrice * duration;
      
      // Select appropriate notes for status
      const statusNotes = notesByStatus[status as keyof typeof notesByStatus];
      const selectedNote = statusNotes[Math.floor(Math.random() * statusNotes.length)];
      
      bookingsToInsert.push({
        kosId: allKos[kosIndex].id,
        userId: renterUsers[renterIndex].id,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        duration: duration,
        totalPrice: totalPrice,
        status: status,
        notes: selectedNote,
      });
    }

    await db.insert(bookings).values(bookingsToInsert);
    
    // Count bookings by status for summary
    const statusCounts = bookingsToInsert.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`📋 Created ${bookingsToInsert.length} sample bookings:`);
    console.log(`   - Pending: ${statusCounts.pending || 0}`);
    console.log(`   - Confirmed: ${statusCounts.confirmed || 0}`);
    console.log(`   - Completed: ${statusCounts.completed || 0}`);
    console.log(`   - Cancelled: ${statusCounts.cancelled || 0}`);

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Summary:
    - Users: ${adminUsers.length + sellerUsers.length + renterUsers.length} (${adminUsers.length} admins, ${sellerUsers.length} sellers, ${renterUsers.length} renters)
    - Posts: ${allPosts.length}
    - Kos: ${allKos.length}
    - Reviews: ${reviewsToInsert.length}
    - Favorites: ${favoritesToInsert.length}
    - Photos: ${photosToInsert.length}
    - Bookings: ${bookingsToInsert.length} (${statusCounts.pending || 0} pending, ${statusCounts.confirmed || 0} confirmed, ${statusCounts.completed || 0} completed, ${statusCounts.cancelled || 0} cancelled)`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seed();
