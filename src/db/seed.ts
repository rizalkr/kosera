import { db, users, posts, kos, reviews, favorites, kosPhotos, bookings } from './index';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../lib/auth';

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

    const [adminUser] = await db.insert(users).values({
      name: 'Admin User',
      username: 'admin',
      contact: '081234567890',
      role: 'ADMIN',
      password: adminPassword,
    }).returning();

    const [sellerUser] = await db.insert(users).values({
      name: 'Seller User',
      username: 'seller1',
      contact: '081234567891',
      role: 'SELLER',
      password: sellerPassword,
    }).returning();

    const [renterUser] = await db.insert(users).values({
      name: 'Renter User',
      username: 'renter1',
      contact: '081234567892',
      role: 'RENTER',
      password: renterPassword,
    }).returning();

    console.log('👥 Created users');

    // Insert posts
    const [post1] = await db.insert(posts).values({
      userId: sellerUser.id,
      title: 'Kos Putri Mawar - Strategis dekat Universitas',
      description: 'Kos putri dengan kamar mandi dalam, AC, WiFi gratis. Lokasi strategis dekat universitas dan pusat kota.',
      price: 500000,
      totalPost: 1,
      totalPenjualan: 0,
      isFeatured: true,
      viewCount: 150,
      favoriteCount: 25,
      averageRating: '4.5',
      reviewCount: 12,
      photoCount: 8,
    }).returning();

    const [post2] = await db.insert(posts).values({
      userId: sellerUser.id,
      title: 'Kos Putra Elite - Full Furnished',
      description: 'Kos putra mewah dengan fasilitas lengkap, kamar mandi dalam, AC, lemari, kasur queen size.',
      price: 750000,
      totalPost: 1,
      totalPenjualan: 0,
      isFeatured: false,
      viewCount: 89,
      favoriteCount: 15,
      averageRating: '4.2',
      reviewCount: 8,
      photoCount: 12,
    }).returning();

    const [post3] = await db.insert(posts).values({
      userId: adminUser.id,
      title: 'Kos Ekonomis - Budget Friendly',
      description: 'Kos dengan harga terjangkau, fasilitas standar, cocok untuk mahasiswa.',
      price: 300000,
      totalPost: 1,
      totalPenjualan: 0,
      isFeatured: true,
      viewCount: 203,
      favoriteCount: 40,
      averageRating: '4.0',
      reviewCount: 18,
      photoCount: 5,
    }).returning();

    console.log('📝 Created posts');

    // Insert kos details
    const [kos1] = await db.insert(kos).values({
      postId: post1.id,
      name: 'Kos Putri Mawar',
      address: 'Jl. Mawar No. 12, Tembalang',
      city: 'Semarang',
      facilities: 'AC, WiFi, Kamar Mandi Dalam, Dapur Bersama, Parkir Motor',
      latitude: -7.055,
      longitude: 110.438,
    }).returning();

    const [kos2] = await db.insert(kos).values({
      postId: post2.id,
      name: 'Kos Putra Elite',
      address: 'Jl. Anggrek No. 5, Tlogosari',
      city: 'Semarang',
      facilities: 'AC, WiFi, Kamar Mandi Dalam, Lemari, Kasur Queen, TV, Kulkas Mini',
      latitude: -7.012,
      longitude: 110.462,
    }).returning();

    const [kos3] = await db.insert(kos).values({
      postId: post3.id,
      name: 'Kos Ekonomis Mahasiswa',
      address: 'Jl. Melati No. 20, Pleburan',
      city: 'Semarang',
      facilities: 'WiFi, Kamar Mandi Luar, Dapur Bersama, Parkir Motor',
      latitude: -7.048,
      longitude: 110.434,
    }).returning();

    console.log('🏠 Created kos details');

    // Insert sample reviews
    await db.insert(reviews).values([
      {
        kosId: kos1.id,
        userId: renterUser.id,
        rating: 5,
        comment: 'Kos sangat bagus, bersih dan nyaman. Pemilik ramah. Highly recommended!',
      },
      {
        kosId: kos1.id,
        userId: adminUser.id,
        rating: 4,
        comment: 'Lokasi strategis, fasilitas oke. Hanya wifi kadang lambat di malam hari.',
      },
      {
        kosId: kos2.id,
        userId: renterUser.id,
        rating: 4,
        comment: 'Kos mewah dengan fasilitas lengkap. Agak mahal tapi worth it.',
      },
      {
        kosId: kos3.id,
        userId: renterUser.id,
        rating: 4,
        comment: 'Sesuai budget mahasiswa, bersih dan aman. Kamar mandi luar agak antri.',
      },
    ]);

    console.log('⭐ Created sample reviews');

    // Insert sample favorites
    await db.insert(favorites).values([
      {
        userId: renterUser.id,
        kosId: kos1.id,
      },
      {
        userId: renterUser.id,
        kosId: kos3.id,
      },
      {
        userId: adminUser.id,
        kosId: kos2.id,
      },
    ]);

    console.log('❤️ Created sample favorites');

    // Insert sample photos
    await db.insert(kosPhotos).values([
      // Kos 1 photos
      {
        kosId: kos1.id,
        url: 'https://example.com/kos1-room1.jpg',
        caption: 'Kamar utama dengan AC dan lemari',
        isPrimary: true,
      },
      {
        kosId: kos1.id,
        url: 'https://example.com/kos1-bathroom.jpg',
        caption: 'Kamar mandi dalam yang bersih',
        isPrimary: false,
      },
      {
        kosId: kos1.id,
        url: 'https://example.com/kos1-common.jpg',
        caption: 'Ruang bersama dan dapur',
        isPrimary: false,
      },
      // Kos 2 photos
      {
        kosId: kos2.id,
        url: 'https://example.com/kos2-room1.jpg',
        caption: 'Kamar elite dengan kasur queen size',
        isPrimary: true,
      },
      {
        kosId: kos2.id,
        url: 'https://example.com/kos2-facility.jpg',
        caption: 'Fasilitas lengkap termasuk TV dan kulkas',
        isPrimary: false,
      },
      // Kos 3 photos
      {
        kosId: kos3.id,
        url: 'https://example.com/kos3-room1.jpg',
        caption: 'Kamar ekonomis untuk mahasiswa',
        isPrimary: true,
      },
    ]);

    console.log('📸 Created sample photos');

    // Insert sample bookings
    const checkInDate1 = new Date();
    checkInDate1.setDate(checkInDate1.getDate() + 7); // 1 week from now
    const checkOutDate1 = new Date(checkInDate1);
    checkOutDate1.setMonth(checkOutDate1.getMonth() + 3); // 3 months later

    const checkInDate2 = new Date();
    checkInDate2.setDate(checkInDate2.getDate() + 30); // 1 month from now
    const checkOutDate2 = new Date(checkInDate2);
    checkOutDate2.setMonth(checkOutDate2.getMonth() + 6); // 6 months later

    await db.insert(bookings).values([
      {
        kosId: kos1.id,
        userId: renterUser.id,
        checkInDate: checkInDate1,
        checkOutDate: checkOutDate1,
        duration: 3,
        totalPrice: 1500000, // 500k * 3 months
        status: 'confirmed',
        notes: 'Untuk semester depan, mohon kamar yang menghadap timur',
      },
      {
        kosId: kos2.id,
        userId: renterUser.id,
        checkInDate: checkInDate2,
        checkOutDate: checkOutDate2,
        duration: 6,
        totalPrice: 4500000, // 750k * 6 months
        status: 'pending',
        notes: 'Booking untuk tahun ajaran baru',
      },
    ]);

    console.log('📋 Created sample bookings');

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Summary:
    - Users: 3 (1 admin, 1 seller, 1 renter)
    - Posts: 3
    - Kos: 3
    - Reviews: 4
    - Favorites: 3
    - Photos: 6
    - Bookings: 2`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seed();
