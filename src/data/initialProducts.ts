import { Product } from '../types';

import ajrakhMaroonCoord from '../assets/images/ajrakh_maroon_coord_1787561846795.jpg';
import cottonSetmundMaroon from '../assets/images/cotton_setmund_maroon_1787561656351.jpg';
import offwhiteFlaredChuridar from '../assets/images/offwhite_flared_churidar_1787561550781.jpg';
import romanSilkChuridar from '../assets/images/roman_silk_churidar_1787561534662.jpg';
import tissueDhavaniWine from '../assets/images/tissue_dhavani_wine_1787561812613.jpg';

// Curated 5 signature products for Yaarika Collections catalog
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-saree-01',
    title: 'Heritage Maroon Kasavu Set Mundu',
    category: 'Traditional Sarees',
    price: 1549,
    originalPrice: 2050,
    inStock: true,
    stockCount: 18,
    sizeStock: { 'Free Size': 18 },
    sizes: ['Free Size'],
    imageUrl: cottonSetmundMaroon,
    images: [cottonSetmundMaroon],
    description: 'Authentic Kerala Handloom Kasavu Set Mundu woven with pure fine zari border and delicate maroon selvedge, perfect for temple visits and traditional Kerala celebrations.',
    fabricDetails: '100% Pure Balaramapuram Handloom Cotton with Gold Zari',
    isNewArrival: true,
    featured: true,
    createdAt: '2026-03-01T10:00:00.000Z'
  },
  {
    id: 'prod-saree-02',
    title: 'Wine Golden Tissue Dhavani Half Saree Ensemble',
    category: 'Traditional Sarees',
    price: 3499,
    originalPrice: 4499,
    inStock: true,
    stockCount: 8,
    sizeStock: { 'Free Size': 8 },
    sizes: ['Free Size'],
    imageUrl: tissueDhavaniWine,
    images: [tissueDhavaniWine],
    description: 'Regal Kerala Dhavani set crafted in shimmering gold tissue with rich wine borders, matching embroidered blouse fabric, and majestic drape.',
    fabricDetails: 'Pure Tissue Kasavu & Heavy Zari Brocade',
    isNewArrival: true,
    featured: true,
    createdAt: '2026-03-01T10:05:00.000Z'
  },
  {
    id: 'prod-churidar-01',
    title: 'Regal Roman Silk Handcrafted Churidar',
    category: 'Churidar Sets',
    price: 2799,
    originalPrice: 3599,
    inStock: true,
    stockCount: 11,
    sizeStock: { 'M': 3, 'L': 4, 'XL': 3, 'XXL': 1 },
    sizes: ['M', 'L', 'XL', 'XXL'],
    imageUrl: romanSilkChuridar,
    images: [romanSilkChuridar],
    description: 'Luxe Roman Silk straight kurti with royal handcrafted neckline, matching cigarette pants, and organza cutwork dupatta.',
    fabricDetails: 'Pure Roman Silk Kurti with Organza Dupatta',
    isNewArrival: true,
    featured: true,
    createdAt: '2026-03-01T11:00:00.000Z'
  },
  {
    id: 'prod-churidar-02',
    title: 'Kasavu Cream Flared Anarkali Churidar',
    category: 'Churidar Sets',
    price: 2699,
    originalPrice: 3499,
    inStock: true,
    stockCount: 8,
    sizeStock: { 'M': 2, 'L': 3, 'XL': 3 },
    sizes: ['M', 'L', 'XL'],
    imageUrl: offwhiteFlaredChuridar,
    images: [offwhiteFlaredChuridar],
    description: 'Graceful floor-length Kasavu cream flared Anarkali paired with authentic gold zari highlights, churidar bottom, and tissue dupatta.',
    fabricDetails: 'Handloom Cotton Tissue with Gold Zari',
    isNewArrival: true,
    featured: true,
    createdAt: '2026-03-01T11:05:00.000Z'
  },
  {
    id: 'prod-coord-01',
    title: 'Ajrakh Maroon Handblock Co-ord Set',
    category: 'Co-ord Sets',
    price: 1899,
    originalPrice: 2499,
    inStock: true,
    stockCount: 16,
    sizeStock: { 'S': 3, 'M': 5, 'L': 5, 'XL': 3 },
    sizes: ['S', 'M', 'L', 'XL'],
    imageUrl: ajrakhMaroonCoord,
    images: [ajrakhMaroonCoord],
    description: 'Artisanal authentic Ajrakh handblock printed tailored co-ord set with collared tunic top and straight-cut trousers.',
    fabricDetails: '100% Breathable Handblock Cotton',
    isNewArrival: true,
    featured: true,
    createdAt: '2026-03-01T12:00:00.000Z'
  }
];
