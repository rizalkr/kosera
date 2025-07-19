import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kosApi, authApi, favoritesApi, bookingsApi, sellerApi, adminApi, SearchParams, KosData } from '@/lib/api';

// Kos hooks
export const useKosFeatured = () => {
  return useQuery({
    queryKey: ['kos', 'featured'],
    queryFn: kosApi.getFeatured,
  });
};

export const useKosRecommendations = (params: SearchParams = {}) => {
  return useQuery({
    queryKey: ['kos', 'recommendations', params],
    queryFn: () => kosApi.getRecommendations(params),
  });
};

export const useKosSearch = (params: SearchParams = {}) => {
  return useQuery({
    queryKey: ['kos', 'search', params],
    queryFn: () => kosApi.search(params),
    enabled: Object.keys(params).length > 0, // Only run when we have search params
  });
};

export const useKosNearby = (lat?: number, lng?: number, radius = 5) => {
  return useQuery({
    queryKey: ['kos', 'nearby', lat, lng, radius],
    queryFn: () => kosApi.getNearby(lat!, lng!, radius),
    enabled: lat !== undefined && lng !== undefined,
  });
};

export const useKosDetails = (id: number) => {
  return useQuery({
    queryKey: ['kos', 'details', id],
    queryFn: () => kosApi.getDetails(id),
  });
};

export const useKosPhotos = (id: number) => {
  return useQuery({
    queryKey: ['kos', 'photos', id],
    queryFn: () => kosApi.getPhotos(id),
    enabled: !!id, // Only run when we have a valid ID
  });
};

// View tracking mutation
export const useTrackView = () => {
  return useMutation({
    mutationFn: (id: number) => kosApi.trackView(id),
  });
};

// Auth hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      authApi.login(username, password),
    onSuccess: (data) => {
      if (data.success && data.data.token) {
        // Store token in localStorage for the AuthContext to pick up
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user_data', JSON.stringify(data.data.user));
        
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['favorites'] });
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
      }
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (userData: {
      name: string;
      username: string;
      password: string;
      contact: string;
      role?: 'RENTER' | 'SELLER';
    }) => authApi.register(userData),
  });
};

// Favorites hooks
export const useFavorites = () => {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: favoritesApi.getFavorites,
  });
};

export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (kosId: number) => favoritesApi.addFavorite(kosId),
    onSuccess: () => {
      // Invalidate favorites and kos queries
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['kos'] });
    },
  });
};

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (kosId: number) => favoritesApi.removeFavorite(kosId),
    onSuccess: () => {
      // Invalidate favorites and kos queries
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['kos'] });
    },
  });
};

// Bookings hooks
export const useBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: bookingsApi.getBookings,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bookingData: {
      kosId: number;
      checkInDate: string;
      duration: number;
      notes?: string;
    }) => bookingsApi.createBooking(bookingData),
    onSuccess: (data) => {
      console.log('Booking created successfully, invalidating queries...', data);
      // Invalidate bookings queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      // Also invalidate any kos-related queries
      queryClient.invalidateQueries({ queryKey: ['kos'] });
    },
    onError: (error) => {
      console.error('Failed to create booking:', error);
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status: string; notes?: string }) =>
      bookingsApi.updateBooking(id, status, notes),
    onSuccess: () => {
      // Invalidate bookings queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

// Seller hooks
export const useSellerDashboard = () => {
  return useQuery({
    queryKey: ['seller', 'dashboard'],
    queryFn: sellerApi.getDashboard,
  });
};

export const useSellerKosDetail = (kosId: number) => {
  return useQuery({
    queryKey: ['seller', 'kos', 'detail', kosId],
    queryFn: () => sellerApi.getKosDetail(kosId),
  });
};

export const useMyKos = () => {
  return useQuery({
    queryKey: ['kos', 'my'],
    queryFn: kosApi.getMyKos,
  });
};

// Admin hooks
export const useAdminKos = (params: any = {}) => {
  return useQuery({
    queryKey: ['admin', 'kos', params],
    queryFn: () => adminApi.getAllKos(params),
  });
};

export const useToggleFeatured = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ kosId, isFeatured }: { kosId: number; isFeatured: boolean }) =>
      adminApi.toggleFeatured(kosId, isFeatured),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'kos'] });
      queryClient.invalidateQueries({ queryKey: ['kos', 'featured'] });
    },
  });
};

// Combined hook for homepage data
export const useHomepageData = () => {
  const featured = useKosFeatured();
  const recommendations = useKosRecommendations({ limit: 6 });
  
  return {
    featured,
    recommendations,
    isLoading: featured.isLoading || recommendations.isLoading,
    error: featured.error || recommendations.error,
  };
};
