import { db, users, posts, kos } from './index';
import { eq } from 'drizzle-orm';

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await db.delete(kos);
    await db.delete(posts);
    await db.delete(users);

    console.log('🗑️  Cleared existing data');

    // Insert users
    const [adminUser] = await db.insert(users).values({
      name: 'Admin Kosera',
      username: 'admin',
      contact: 'admin@kosera.com',
      role: 'ADMIN',
      password: 'hashed_password_admin', // In production, use proper hashing
    }).returning();

    const [sellerUser] = await db.insert(users).values({
      name: 'Pemilik Kos Mawar',
      username: 'seller1',
      contact: 'seller1@gmail.com',
      role: 'SELLER',
      password: 'hashed_password_seller1',
    }).returning();

    const [renterUser] = await db.insert(users).values({
      name: 'John Doe',
      username: 'renter1',
      contact: 'john@gmail.com',
      role: 'RENTER',
      password: 'hashed_password_renter1',
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
    }).returning();

    const [post2] = await db.insert(posts).values({
      userId: sellerUser.id,
      title: 'Kos Putra Elite - Full Furnished',
      description: 'Kos putra mewah dengan fasilitas lengkap, kamar mandi dalam, AC, lemari, kasur queen size.',
      price: 750000,
      totalPost: 1,
      totalPenjualan: 0,
    }).returning();

    const [post3] = await db.insert(posts).values({
      userId: adminUser.id,
      title: 'Kos Ekonomis - Budget Friendly',
      description: 'Kos dengan harga terjangkau, fasilitas standar, cocok untuk mahasiswa.',
      price: 300000,
      totalPost: 1,
      totalPenjualan: 0,
    }).returning();

    console.log('📝 Created posts');

    // Insert kos details
    await db.insert(kos).values([
      {
        postId: post1.id,
        name: 'Kos Putri Mawar',
        address: 'Jl. Mawar No. 12, Tembalang',
        city: 'Semarang',
        facilities: 'AC, WiFi, Kamar Mandi Dalam, Dapur Bersama, Parkir Motor',
      },
      {
        postId: post2.id,
        name: 'Kos Putra Elite',
        address: 'Jl. Anggrek No. 5, Tlogosari',
        city: 'Semarang',
        facilities: 'AC, WiFi, Kamar Mandi Dalam, Lemari, Kasur Queen, TV, Kulkas Mini',
      },
      {
        postId: post3.id,
        name: 'Kos Ekonomis Mahasiswa',
        address: 'Jl. Melati No. 20, Pleburan',
        city: 'Semarang',
        facilities: 'WiFi, Kamar Mandi Luar, Dapur Bersama, Parkir Motor',
      },
    ]);

    console.log('🏠 Created kos details');

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Summary:
    - Users: 3 (1 admin, 1 seller, 1 renter)
    - Posts: 3
    - Kos: 3`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seed();
