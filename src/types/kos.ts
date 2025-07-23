// Kos Photo Types
export interface KosPhoto {
  id: number;
  url: string;
  isPrimary: boolean;
  kosId: number;
}

export interface KosPhotoData {
  id: number;
  url: string;
  isPrimary: boolean;
  kosId: number;
  createdAt: string;
  updatedAt: string;
}

export interface KosPhotosResponse {
  success: boolean;
  data: {
    photos: KosPhotoData[];
  };
  message?: string;
}

// Kos Data Types
export interface KosData {
  id: number;
  name: string;
  description: string;
  price: number;
  address: string;
  city: string;
  facilities: string;
  totalRooms: number;
  occupiedRooms: number;
  averageRating: number;
  reviewCount: number;
  photos: KosPhoto[];
  owner: {
    id: number;
    username: string;
    fullName: string;
    contact: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Seller-specific Kos Data (extends KosData with seller fields)
export interface SellerKosData extends KosData {
  isActive?: boolean;
  verified?: boolean;
  status?: string;
}

// Kos Form Data Types
export interface KosFormData {
  name: string;
  description: string;
  price: number;
  address: string;
  city: string;
  facilities: string;
  totalRooms: number;
  occupiedRooms?: number;
  latitude?: number;
  longitude?: number;
}
