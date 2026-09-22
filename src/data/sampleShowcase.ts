import { Product } from '../types';

export const SAMPLE_SHOWCASE_PRODUCTS: Array<Omit<Product, 'id' | 'createdAt'>> = [
  {
    title: 'Authentic Kerala Kasavu Handloom Saree with Pure Zari Border',
    description: 'Traditional Kerala Kasavu handloom saree woven with fine golden tissue zari border. An exquisite ensemble perfect for festivals, temple occasions, and weddings.',
    category: 'Traditional Sarees',
    price: 2499,
    originalPrice: 3299,
    sizes: ['Free Size'],
    sizeStock: { 'Free Size': 10 },
    inStock: true,
    featured: true,
    isNewArrival: true,
    fabricDetails: 'Pure Handloom Cotton with Gold Tissue Zari',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    title: 'Pastel Floral Hand-Embroidered Co-ord Set',
    description: 'Modern two-piece silhouette tailored in breathable rayon-cotton blend featuring delicate collar neckline and relaxed wide-leg trousers.',
    category: 'Co-ord Sets',
    price: 1899,
    originalPrice: 2499,
    sizes: ['M', 'L', 'XL', 'XXL'],
    sizeStock: { M: 5, L: 8, XL: 6, XXL: 4 },
    inStock: true,
    featured: true,
    isNewArrival: true,
    fabricDetails: 'Breathable Modal Rayon with Hand Thread Detailing',
    imageUrl: 'https://images.unsplash.com/photo-1596783049554-4a4153a778c1?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1596783049554-4a4153a778c1?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    title: 'Festive Georgette Anarkali Churidar Set with Dupatta',
    description: 'Graceful three-piece festive churidar set with intricate thread embellishments, fitted bottom, and a scalloped organza dupatta.',
    category: 'Churidar Sets',
    price: 2699,
    originalPrice: 3499,
    sizes: ['M', 'L', 'XL'],
    sizeStock: { M: 4, L: 5, XL: 3 },
    inStock: true,
    featured: false,
    isNewArrival: true,
    fabricDetails: 'Premium Flowy Georgette with Embroidered Organza Dupatta',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    title: 'Royal Kanchipuram Soft Silk Wedding Saree',
    description: 'Regal bridal silk saree featuring grand golden pallu with traditional peacock and floral motifs in opulent jewel tones.',
    category: 'Traditional Sarees',
    price: 4999,
    originalPrice: 6500,
    sizes: ['Free Size'],
    sizeStock: { 'Free Size': 5 },
    inStock: true,
    featured: true,
    isNewArrival: false,
    fabricDetails: 'Pure Soft Kanchipuram Weave with Rich Zari Pallu',
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    title: 'Indo-Western Asymmetric Kurti & Trousers Set',
    description: 'Contemporary high-low tunic paired with tailored straight-fit cigarette pants for a chic day-to-evening aesthetic.',
    category: 'Fusion Wear',
    price: 2199,
    originalPrice: 2899,
    sizes: ['S', 'M', 'L', 'XL'],
    sizeStock: { S: 3, M: 6, L: 6, XL: 2 },
    inStock: true,
    featured: false,
    isNewArrival: true,
    fabricDetails: 'Handloom Cotton Silk Fusion',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800'
    ]
  }
];
