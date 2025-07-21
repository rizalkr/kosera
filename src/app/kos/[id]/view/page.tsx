'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingModal from '@/components/BookingModal';
import ImageModal from '@/components/ImageModal';
import SafeImage from '@/components/SafeImage';
import { useKosDetails, useTrackView, useAddFavorite, useRemoveFavorite, useFavorites, useKosPhotos } from '@/hooks/useApi';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useKosImages } from '@/hooks/useImageWithFallback';

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    username: string;
  };
}

interface KosPhoto {
  id: number;
  url: string;
  caption?: string;
  isPrimary: boolean;
  createdAt: string;
}

export default function KosDetailPage() {
  const params = useParams();
  const kosId = parseInt(params.id as string);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const viewTracked = useRef(false); // Track if view has been counted

  const { data: kosData, isLoading, error } = useKosDetails(kosId);
  const { data: photosData } = useKosPhotos(kosId);
  const { data: favoritesData } = useFavorites();
  const trackView = useTrackView();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const { checkBookingPermission, checkFavoritePermission, isAuthenticated } = useAuthGuard();

  // Track view when component mounts (only once per session)
  useEffect(() => {
    if (kosId && !isNaN(kosId) && !viewTracked.current) {
      trackView.mutate(kosId);
      viewTracked.current = true; // Mark as tracked
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kosId]); // Only depend on kosId

  // Get photos from database or use fallback
  const kosPhotos: KosPhoto[] = photosData?.success ? photosData.data.photos : [];
  
  // Sort photos to put primary photo first
  const sortedPhotos = kosPhotos.length > 0 
    ? [...kosPhotos].sort((a: KosPhoto, b: KosPhoto) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      })
    : [];
  
  // Use custom hook for safe image handling
  const { images: displayImages } = useKosImages(sortedPhotos);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#A9E4DE] pt-20">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-300 rounded mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !kosData?.success) {
    return (
      <div className="min-h-screen bg-[#A9E4DE] pt-20">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Kos Tidak Ditemukan</h1>
            <p className="text-gray-600 mb-6">Maaf, kos yang Anda cari tidak dapat ditemukan.</p>
            <Link 
              href="/" 
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const kos = kosData.data;
  const isFavorited = (favoritesData?.success && favoritesData?.data?.favorites?.some((fav: { kos: { id: number } }) => fav.kos.id === kosId)) || false;

  const handleFavoriteToggle = () => {
    if (checkFavoritePermission()) {
      if (isFavorited) {
        removeFavorite.mutate(kosId);
      } else {
        addFavorite.mutate(kosId);
      }
    }
  };

  const handleBooking = () => {
    if (checkBookingPermission()) {
      setShowBookingModal(true);
    }
  };

  const handleBookingCreated = () => {
    // This callback is now mainly for any additional logic
    // The redirect is handled by the modal itself
    console.log('Booking created successfully from detail page');
  };

  const handleImageClick = (index: number) => {
    setActiveImageIndex(index);
    setShowImageModal(true);
  };

  const handleImageModalChange = (index: number) => {
    setActiveImageIndex(index);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#A9E4DE] pt-20">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Beranda</Link>
            <span>›</span>
            <Link href="/list" className="hover:text-blue-600">Daftar Kos</Link>
            <span>›</span>
            <span className="text-gray-800">{kos.name}</span>
          </div>
        </nav>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="p-8 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{kos.name}</h1>
                <p className="text-gray-600 text-lg mb-2">{kos.address}, {kos.city}</p>
                <div className="flex items-center gap-4 mb-4">
                  {kos.reviews?.statistics?.averageRating > 0 && (
                    <div className="flex items-center gap-1">
                      {renderStars(Math.round(parseFloat(kos.reviews.statistics.averageRating)))}
                      <span className="text-gray-600 ml-2">
                        {parseFloat(kos.reviews.statistics.averageRating).toFixed(1)} ({kos.reviews.statistics.totalReviews} ulasan)
                      </span>
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    {kos.viewCount} dilihat
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleFavoriteToggle}
                  className={`p-3 rounded-full transition-all ${
                    isFavorited 
                      ? 'bg-red-100 text-red-500' 
                      : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500'
                  }`}
                >
                  <svg className="w-6 h-6" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    Rp {kos.price.toLocaleString()}<span className="text-lg text-gray-500">/bulan</span>
                  </div>
                  <button
                    onClick={handleBooking}
                    className="mt-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    {isAuthenticated ? 'Booking Sekarang' : 'Login untuk Booking'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="px-8 pb-6 mb-20">
            <div className="grid grid-cols-4 gap-3 h-64">
              <div className="col-span-2 row-span-2">
                <SafeImage
                  src={displayImages[activeImageIndex]}
                  alt={kos.name}
                  width={400}
                  height={256}
                  style={{ width: '100%', height: 'auto' }}
                  className="object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(activeImageIndex)}
                  fallbackSrc="/images/rooms/room1.jpg"
                />
              </div>
              {displayImages.slice(1, 4).map((image: string, index: number) => (
                <div key={index} className="relative h-32">
                  <SafeImage
                    src={image}
                    alt={`${kos.name} - ${index + 2}`}
                    width={200}
                    height={128}
                    style={{ width: '100%', height: '100%' }}
                    className="object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleImageClick(index + 1)}
                    fallbackSrc={`/images/rooms/room${(index % 4) + 1}.jpg`}
                  />
                  {index === 2 && displayImages.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg cursor-pointer hover:bg-opacity-60 transition-all"
                         onClick={() => handleImageClick(index + 1)}>
                      <span className="text-white font-semibold text-xs">+{displayImages.length - 4} foto</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>

          {/* Content */}
          <div className="px-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">Deskripsi</h2>
                  <p className="text-gray-600 leading-relaxed">{kos.description}</p>
                </section>

                {/* Facilities */}
                {kos.facilities && (
                  <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Fasilitas</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {kos.facilities.split(',').map((facility: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-gray-600">
                          <span className="text-green-500">✓</span>
                          <span>{facility.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Reviews */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Ulasan ({kos.reviews?.statistics?.totalReviews || 0})
                    </h2>
                    {kos.reviews?.statistics?.averageRating > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(Math.round(parseFloat(kos.reviews.statistics.averageRating)))}</div>
                        <span className="text-gray-600">{parseFloat(kos.reviews.statistics.averageRating).toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {kos.reviews?.data?.length > 0 ? (
                    <div className="space-y-4">
                      {kos.reviews.data.map((review: Review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-semibold text-gray-800">{review.user.name}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex">{renderStars(review.rating)}</div>
                                <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600">{review.comment}</p>
                        </div>
                      ))}
                      {kos.reviews.pagination.hasNext && (
                        <button className="text-blue-600 hover:underline font-medium">
                          Lihat semua ulasan →
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">💬</div>
                      <p>Belum ada ulasan untuk kos ini</p>
                    </div>
                  )}
                </section>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Owner Info */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Informasi Pemilik</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Nama:</span>
                      <span className="text-gray-600">{kos.owner?.name || 'Tidak tersedia'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Kontak:</span>
                      <span className="text-gray-600">{kos.owner?.contact || 'Tidak tersedia'}</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Hubungi Pemilik
                  </button>
                </div>

                {/* Location */}
                {kos.latitude && kos.longitude && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-800 mb-3">Lokasi</h3>
                    <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">Peta akan ditampilkan di sini</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{kos.address}, {kos.city}</p>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Statistik</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dilihat:</span>
                      <span className="font-medium text-gray-500">{kos.viewCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Favorit:</span>
                      <span className="font-medium text-gray-500">{kos.favoriteCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ulasan:</span>
                      <span className="font-medium text-gray-500">{kos.reviews?.statistics?.totalReviews || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Booking Modal */}
      <BookingModal
        kos={kos}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onBookingCreated={handleBookingCreated}
      />

      {/* Image Modal */}
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        images={displayImages}
        currentIndex={activeImageIndex}
        onImageChange={handleImageModalChange}
        kosName={kos.name}
      />
    </div>
  );
}
