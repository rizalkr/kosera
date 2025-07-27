import { useKosPhotos } from '../useApi';
import { KosPhotoData } from '@/types/kos';

/**
 * Custom hook untuk mendapatkan image primary dari kos
 * Jika tidak ada foto di database, akan return fallback image
 */
export function useKosImage(kosId: number) {
  const { data: photosData, isLoading } = useKosPhotos(kosId);
  
  const kosPhotos = photosData?.success ? photosData.data.photos : [];
  
  // Cari foto primary, jika tidak ada ambil foto pertama
  const primaryPhoto = kosPhotos.find((photo: KosPhotoData) => photo.isPrimary);
  const firstPhoto = kosPhotos[0];
  
  // Return URL foto atau fallback
  const imageUrl = primaryPhoto?.url || firstPhoto?.url || '/images/rooms/room1.jpg';
  
  return {
    imageUrl,
    isLoading,
    hasPhotos: kosPhotos.length > 0
  };
}

/**
 * Hook untuk mendapatkan semua foto kos dalam format array string URLs
 */
export function useKosImages(kosId: number) {
  const { data: photosData, isLoading } = useKosPhotos(kosId);
  
  const kosPhotos = photosData?.success ? photosData.data.photos : [];
  
  // Sort photos - primary first, then by creation date
  const sortedPhotos = kosPhotos.length > 0 
    ? [...kosPhotos].sort((a: KosPhotoData, b: KosPhotoData) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      })
    : [];
  
  // Convert to URL array with fallback
  const imageUrls = sortedPhotos.length > 0 
    ? sortedPhotos.map((photo: KosPhotoData) => photo.url)
    : [
        '/images/rooms/room1.jpg',
        '/images/rooms/room2.jpg',
        '/images/rooms/room3.jpg',
        '/images/rooms/room4.jpg',
      ];
  
  return {
    imageUrls,
    isLoading,
    hasPhotos: kosPhotos.length > 0,
    photoCount: kosPhotos.length
  };
}
