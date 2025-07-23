// Favorites Types
export interface FavoriteKos {
  id: number;
  createdAt: string;
  kos: {
    id: number;
    name: string;
    address: string;
    city: string;
    facilities: string;
    latitude: number | null;
    longitude: number | null;
  };
  post: {
    id: number;
    title: string;
    description: string;
    price: number;
    averageRating: number;
    reviewCount: number;
    viewCount: number;
    photoCount: number;
    isFeatured: boolean;
  };
  owner: {
    id: number;
    name: string;
    username: string;
    contact: string;
  };
}

export interface FavoritesResponse {
  success: boolean;
  message: string;
  data: {
    favorites: FavoriteKos[];
    pagination: {
      page: number;
      limit: number;
      totalFavorites: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}
