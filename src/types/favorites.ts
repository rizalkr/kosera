import { PaginatedResponse } from "./common";
import { PublicKosData } from "./kos";

// Favorites Types
export interface FavoriteKos {
  id: number;
  createdAt: string;
  kos: PublicKosData;
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
    pagination: PaginatedResponse<FavoriteKos>;
  };
}
