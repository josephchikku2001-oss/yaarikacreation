import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'yaarika-sample-01',
    title: 'Royal Kasavu Handloom Saree with Zari Weave',
    category: 'Traditional Sarees',
    price: 2499,
    originalPrice: 3499,
    inStock: true,
    stockCount: 10,
    sizeStock: { 'Free Size': 10 },
    sizes: ['Free Size'],
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'],
    description: 'Exquisite traditional Kerala Kasavu handloom saree featuring intricate golden zari border and rich pallu. Designed for elegance and festive grace.',
    fabricDetails: 'Pure Cotton Handloom with Gold Zari',
    isNewArrival: true,
    featured: true,
    createdAt: new Date().toISOString()
  }
];
