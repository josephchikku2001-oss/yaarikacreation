export type CategoryType = 
  | 'All' 
  | 'Traditional Sarees' 
  | 'Co-ord Sets' 
  | 'Churidar Sets' 
  | 'Fusion Wear' 
  | 'New Arrivals';

export type SizeType = 'Free Size' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL';

export interface Product {
  id: string;
  title: string;
  category: CategoryType;
  price: number;
  originalPrice?: number;
  sizes: SizeType[];
  description: string;
  imageUrl: string;
  fabricDetails?: string;
  inStock: boolean;
  featured?: boolean;
  isNewArrival?: boolean;
  createdAt: string;
}

export interface AdminCredentials {
  username: string;
  passwordHash: string; // Stored securely in localStorage
  isSetupComplete: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface InquiryLog {
  id: string;
  productId: string;
  productTitle: string;
  selectedSize: string;
  phoneContact: string;
  timestamp: string;
}

export type ViewMode = 'catalog' | 'admin' | 'wishlist';
