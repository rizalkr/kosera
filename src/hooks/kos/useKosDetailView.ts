import { useParams } from 'next/navigation';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useKosDetails, useTrackView, useAddFavorite, useRemoveFavorite, useFavorites, useKosPhotos } from '@/hooks/useApi';
import { useAuthGuard } from '@/hooks/auth/useAuthGuard';
import { useKosImages } from '@/hooks/image/useImageWithFallback';

export interface UseKosDetailViewResult {
  kosId: number;
  kos: any; // TODO replace with typed schema once added
  isLoading: boolean;
  error: unknown;
  isFavorited: boolean;
  isAuthenticated: boolean;
  displayImages: string[];
  activeImageIndex: number;
  showBookingModal: boolean;
  showImageModal: boolean;
  handlers: {
    onToggleFavorite: () => void;
    onOpenBooking: () => void;
    onBookingCreated: () => void;
    onImageClick: (index: number) => void;
    onImageModalChange: (index: number) => void;
    onCloseBooking: () => void;
    onCloseImageModal: () => void;
  };
}

export const useKosDetailView = (): UseKosDetailViewResult => {
  const params = useParams();
  const kosId = parseInt(params.id as string);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const viewTracked = useRef(false);

  const { data: kosData, isLoading, error } = useKosDetails(kosId);
  const { data: photosData } = useKosPhotos(kosId);
  const { data: favoritesData } = useFavorites();
  const trackView = useTrackView();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const { checkBookingPermission, checkFavoritePermission, isAuthenticated } = useAuthGuard();

  useEffect(() => {
    if (kosId && !isNaN(kosId) && !viewTracked.current) {
      trackView.mutate(kosId);
      viewTracked.current = true;
    }
  }, [kosId, trackView]);

  const kosPhotos = photosData?.success ? photosData.data.photos : [];
  const sortedPhotos = kosPhotos.length > 0
    ? [...kosPhotos].sort((a: any, b: any) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      })
    : [];
  const { images: displayImages } = useKosImages(sortedPhotos);

  const kos = kosData?.success ? kosData.data : undefined;
  const isFavorited = useMemo(() => (
    (favoritesData?.success && favoritesData?.data?.favorites?.some((fav: { kos: { id: number } }) => fav.kos.id === kosId)) || false
  ), [favoritesData, kosId]);

  const onToggleFavorite = useCallback(() => {
    if (checkFavoritePermission()) {
      if (isFavorited) {
        removeFavorite.mutate(kosId);
      } else {
        addFavorite.mutate(kosId);
      }
    }
  }, [checkFavoritePermission, isFavorited, kosId, addFavorite, removeFavorite]);

  const onOpenBooking = useCallback(() => {
    if (checkBookingPermission()) setShowBookingModal(true);
  }, [checkBookingPermission]);

  const onBookingCreated = useCallback(() => {
    // Additional side-effects after booking
    console.log('Booking created successfully from detail page');
  }, []);

  const onImageClick = useCallback((index: number) => {
    setActiveImageIndex(index);
    setShowImageModal(true);
  }, []);

  const onImageModalChange = useCallback((index: number) => setActiveImageIndex(index), []);
  const onCloseBooking = useCallback(() => setShowBookingModal(false), []);
  const onCloseImageModal = useCallback(() => setShowImageModal(false), []);

  return {
    kosId,
    kos,
    isLoading,
    error,
    isFavorited,
    isAuthenticated,
    displayImages,
    activeImageIndex,
    showBookingModal,
    showImageModal,
    handlers: {
      onToggleFavorite,
      onOpenBooking,
      onBookingCreated,
      onImageClick,
      onImageModalChange,
      onCloseBooking,
      onCloseImageModal,
    },
  };
};
