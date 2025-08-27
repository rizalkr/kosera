'use client';

import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import BookingModal from '@/components/modals/BookingModal';
import ImageModal from '@/components/modals/ImageModal';
import { Breadcrumbs } from '@/components/features/kos/detail/molecules/Breadcrumbs';
import { ImageGallery } from '@/components/features/kos/detail/molecules/ImageGallery';
import { FacilitiesList } from '@/components/features/kos/detail/molecules/FacilitiesList';
import { ReviewsSection } from '@/components/features/kos/detail/organisms/ReviewsSection';
import { SidebarPanel } from '@/components/features/kos/detail/organisms/SidebarPanel';
import { RatingStars } from '@/components/features/kos/detail/atoms/RatingStars';
import { FavoriteButton } from '@/components/features/kos/detail/atoms/FavoriteButton';
import { PriceTag } from '@/components/features/kos/detail/atoms/PriceTag';
import { useKosDetailView } from '@/hooks/kos/useKosDetailView';
import Link from 'next/link';
import type { PublicKosData } from '@/types/kos';

// Temporary type until Zod schema for detail response is added
interface Review { id: number; rating: number; comment: string; createdAt: string; user: { id: number; name: string; username: string }; }

export const KosDetailPage = () => {
  const {
    kos, // kosId removed (unused)
    isLoading,
    error,
    isFavorited,
    isAuthenticated,
    displayImages,
    activeImageIndex,
    showBookingModal,
    showImageModal,
    handlers,
  } = useKosDetailView();

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

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

  if (error || !kos) {
    return (
      <div className="min-h-screen bg-[#A9E4DE] pt-20">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">X</div>
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

  const reviewsData = kos.reviews?.data || [];
  const reviewStats = kos.reviews?.statistics;
  const reviewPagination = kos.reviews?.pagination;

  const averageRatingNumber = typeof reviewStats?.averageRating === 'string' ? parseFloat(reviewStats.averageRating) : undefined;

  return (
    <div className="min-h-screen bg-[#A9E4DE] pt-20">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs kosName={kos.name} />

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{kos.name}</h1>
                <p className="text-gray-600 text-lg mb-2">{kos.address}, {kos.city}</p>
                <div className="flex items-center gap-4 mb-4">
                  {averageRatingNumber !== undefined && averageRatingNumber > 0 && reviewStats?.totalReviews !== undefined && (
                    <div className="flex items-center gap-1">
                      <RatingStars rating={Math.round(averageRatingNumber)} />
                      <span className="text-gray-600 ml-2">
                        {averageRatingNumber.toFixed(1)} ({reviewStats.totalReviews} ulasan)
                      </span>
                    </div>
                  )}
                  <div className="text-sm text-gray-500">{kos.viewCount} dilihat</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FavoriteButton isFavorited={isFavorited} onClick={handlers.onToggleFavorite} />
                <div className="text-right">
                  <PriceTag price={kos.price} />
                  <button
                    onClick={handlers.onOpenBooking}
                    className="mt-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    {isAuthenticated ? 'Booking Sekarang' : 'Login untuk Booking'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <ImageGallery images={displayImages} activeIndex={activeImageIndex} onImageClick={handlers.onImageClick} kosName={kos.name} />

          <div className="px-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <section>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">Deskripsi</h2>
                  <p className="text-gray-600 leading-relaxed">{kos.description}</p>
                </section>
                <FacilitiesList facilities={kos.facilities ?? undefined} />
                <ReviewsSection
                  totalReviews={reviewStats?.totalReviews || 0}
                  averageRating={reviewStats?.averageRating}
                  reviews={reviewsData as Review[]}
                  hasNext={reviewPagination?.hasNext || false}
                  formatDate={formatDate}
                />
              </div>
              <SidebarPanel
                owner={kos.owner}
                latitude={kos.latitude ?? undefined}
                longitude={kos.longitude ?? undefined}
                address={kos.address}
                city={kos.city}
                viewCount={kos.viewCount}
                favoriteCount={kos.favoriteCount}
                reviewCount={reviewStats?.totalReviews || 0}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      {/* Build a PublicKosData object for BookingModal without unsafe direct cast */}
      {(() => {
        const bookingKos: PublicKosData = {
          id: kos.id,
          name: kos.name,
          description: kos.description,
          price: kos.price,
          address: kos.address,
          city: kos.city,
          facilities: kos.facilities ?? '',
          totalRooms: (kos as Partial<PublicKosData>).totalRooms ?? 0,
          occupiedRooms: (kos as Partial<PublicKosData>).occupiedRooms ?? 0,
          latitude: kos.latitude ?? undefined,
          longitude: kos.longitude ?? undefined,
          owner: {
            id: kos.owner?.id ?? 0,
            username: kos.owner?.username ?? 'unknown',
            fullName: (kos.owner && 'fullName' in kos.owner ? (kos.owner as { fullName?: string }).fullName : undefined) || kos.owner?.name || kos.owner?.username || 'Unknown',
            contact: kos.owner?.contact || '',
          },
          averageRating: (reviewStats?.averageRating ?? '0').toString(),
          reviewCount: reviewStats?.totalReviews ?? 0,
          photos: [],
          createdAt: 'createdAt' in kos ? (kos as { createdAt: string }).createdAt : new Date().toISOString(),
          updatedAt: 'updatedAt' in kos ? (kos as { updatedAt: string }).updatedAt : new Date().toISOString(),
        };
        return (
          <BookingModal
            kos={bookingKos}
            isOpen={showBookingModal}
            onClose={handlers.onCloseBooking}
            onBookingCreated={handlers.onBookingCreated}
          />
        );
      })()}
      <ImageModal
        isOpen={showImageModal}
        onClose={handlers.onCloseImageModal}
        images={displayImages}
        currentIndex={activeImageIndex}
        onImageChange={handlers.onImageModalChange}
        kosName={kos.name}
      />
    </div>
  );
};

// Provide required default export for Next.js App Router page
export default KosDetailPage;
