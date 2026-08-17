import { Product, AdminCredentials, InquiryLog } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const KEYS = {
  ADMIN: 'yaarika_admin_credentials_v1',
  PRODUCTS: 'yaarika_products_v1',
  WISHLIST: 'yaarika_wishlist_v1',
  INQUIRIES: 'yaarika_inquiries_v1'
};

// Simple cryptographic hash function using SHA-256 for browser
async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ADMIN AUTHENTICATION SERVICES
export const AdminStorage = {
  // Check if admin setup has been completed
  isSetupComplete(): boolean {
    try {
      const data = localStorage.getItem(KEYS.ADMIN);
      if (!data) return false;
      const parsed: AdminCredentials = JSON.parse(data);
      return parsed.isSetupComplete === true;
    } catch (e) {
      console.error('Error checking admin setup status:', e);
      return false;
    }
  },

  // First time setup - strictly ALLOW ONLY ONE registration
  async registerFirstAdmin(username: string, password: string): Promise<{ success: boolean; message: string }> {
    if (this.isSetupComplete()) {
      return { 
        success: false, 
        message: 'Admin setup has already been completed! Only one admin account is allowed.' 
      };
    }

    if (!username.trim() || !password.trim()) {
      return { success: false, message: 'Username and password cannot be empty.' };
    }

    if (password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    try {
      const hashedPassword = await hashPassword(password.trim());
      const credentials: AdminCredentials = {
        username: username.trim().toLowerCase(),
        passwordHash: hashedPassword,
        isSetupComplete: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      localStorage.setItem(KEYS.ADMIN, JSON.stringify(credentials));
      return { success: true, message: 'Admin account created successfully!' };
    } catch (e) {
      console.error('Failed to create admin credentials:', e);
      return { success: false, message: 'An error occurred while saving admin credentials.' };
    }
  },

  // Authenticate Admin Login
  async login(username: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const data = localStorage.getItem(KEYS.ADMIN);
      if (!data) {
        return { success: false, message: 'No admin account found. Please complete initial setup.' };
      }

      const stored: AdminCredentials = JSON.parse(data);
      if (!stored.isSetupComplete) {
        return { success: false, message: 'Admin setup incomplete.' };
      }

      if (username.trim().toLowerCase() !== stored.username) {
        return { success: false, message: 'Invalid Username or Password.' };
      }

      const inputHash = await hashPassword(password.trim());
      if (inputHash !== stored.passwordHash) {
        return { success: false, message: 'Invalid Username or Password.' };
      }

      // Update last login
      stored.lastLoginAt = new Date().toISOString();
      localStorage.setItem(KEYS.ADMIN, JSON.stringify(stored));

      return { success: true, message: 'Welcome back, Admin!' };
    } catch (e) {
      console.error('Login verification failed:', e);
      return { success: false, message: 'Authentication error occurred.' };
    }
  },

  // Change Admin Password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const data = localStorage.getItem(KEYS.ADMIN);
      if (!data) {
        return { success: false, message: 'Admin account not found.' };
      }

      const stored: AdminCredentials = JSON.parse(data);
      const currentHash = await hashPassword(currentPassword.trim());

      if (currentHash !== stored.passwordHash) {
        return { success: false, message: 'Current password is incorrect.' };
      }

      if (!newPassword.trim() || newPassword.length < 4) {
        return { success: false, message: 'New password must be at least 4 characters.' };
      }

      const newHash = await hashPassword(newPassword.trim());
      stored.passwordHash = newHash;
      localStorage.setItem(KEYS.ADMIN, JSON.stringify(stored));

      return { success: true, message: 'Password updated successfully!' };
    } catch (e) {
      console.error('Failed to change password:', e);
      return { success: false, message: 'Error updating password.' };
    }
  },

  // Get Admin Profile details
  getAdminProfile(): { username: string; createdAt?: string; lastLoginAt?: string } | null {
    try {
      const data = localStorage.getItem(KEYS.ADMIN);
      if (!data) return null;
      const parsed: AdminCredentials = JSON.parse(data);
      return {
        username: parsed.username,
        createdAt: parsed.createdAt,
        lastLoginAt: parsed.lastLoginAt
      };
    } catch {
      return null;
    }
  }
};

// PRODUCT CATALOG MANAGEMENT SERVICES (Supports up to 5,000+ Products with IndexedDB & Local Cache)
export const MAX_CATALOG_LIMIT = 5000;

// IndexedDB Helper for high-volume storage (up to 5000+ items without localStorage quota issues)
const IDB_CONFIG = {
  DB_NAME: 'yaarika_boutique_db_v2',
  STORE_NAME: 'catalog_products',
  VERSION: 1
};

let memoryProductsCache: Product[] | null = null;

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(IDB_CONFIG.DB_NAME, IDB_CONFIG.VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_CONFIG.STORE_NAME)) {
        db.createObjectStore(IDB_CONFIG.STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Background sync to IndexedDB
async function persistToIndexedDB(products: Product[]): Promise<void> {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(IDB_CONFIG.STORE_NAME, 'readwrite');
    const store = tx.objectStore(IDB_CONFIG.STORE_NAME);
    
    // Clear and re-populate
    await new Promise<void>((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => reject(clearReq.error);
    });

    for (const p of products) {
      store.put(p);
    }
  } catch (err) {
    console.warn('IndexedDB persistence sync warning:', err);
  }
}

// Initialize and preload from storage
function loadInitialCatalog(): Product[] {
  try {
    const data = localStorage.getItem(KEYS.PRODUCTS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('LocalStorage catalog read warning, using defaults:', e);
  }

  // Seed default initial products
  try {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  } catch {
    // ignore
  }
  return INITIAL_PRODUCTS;
}

export const ProductStorage = {
  MAX_LIMIT: MAX_CATALOG_LIMIT,

  getProducts(): Product[] {
    if (!memoryProductsCache) {
      memoryProductsCache = loadInitialCatalog();
      // Try background fetch from IndexedDB if more items exist
      openIndexedDB().then(db => {
        const tx = db.transaction(IDB_CONFIG.STORE_NAME, 'readonly');
        const store = tx.objectStore(IDB_CONFIG.STORE_NAME);
        const getAllReq = store.getAll();
        getAllReq.onsuccess = () => {
          if (Array.isArray(getAllReq.result) && getAllReq.result.length > (memoryProductsCache?.length || 0)) {
            memoryProductsCache = getAllReq.result;
          }
        };
      }).catch(() => {});
    }
    return memoryProductsCache;
  },

  saveProducts(products: Product[]): void {
    // Cap at 5000 max
    const capped = products.slice(0, MAX_CATALOG_LIMIT);
    memoryProductsCache = capped;

    // Try saving to localStorage (with chunk safety)
    try {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(capped));
    } catch (e) {
      console.warn('LocalStorage quota warning. Saving light snapshot in localStorage and full catalog in IndexedDB.', e);
      try {
        // Store first 150 in localStorage as fallback
        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(capped.slice(0, 150)));
      } catch {}
    }

    // Persist full 5,000 capacity in IndexedDB
    persistToIndexedDB(capped);
  },

  addProduct(newProduct: Omit<Product, 'id' | 'createdAt'>): Product {
    const currentProducts = this.getProducts();
    if (currentProducts.length >= MAX_CATALOG_LIMIT) {
      throw new Error(`Catalog limit of ${MAX_CATALOG_LIMIT.toLocaleString()} products reached. Please remove old items or update existing ones.`);
    }

    const createdProduct: Product = {
      ...newProduct,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };

    const updated = [createdProduct, ...currentProducts];
    this.saveProducts(updated);
    return createdProduct;
  },

  bulkAddProducts(newItems: Array<Omit<Product, 'id' | 'createdAt'>>): { added: number; total: number; capacityReached: boolean } {
    const currentProducts = this.getProducts();
    const availableSlots = Math.max(0, MAX_CATALOG_LIMIT - currentProducts.length);
    const toAdd = newItems.slice(0, availableSlots);

    const createdList: Product[] = toAdd.map((item, idx) => ({
      ...item,
      id: `prod-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    }));

    const updated = [...createdList, ...currentProducts];
    this.saveProducts(updated);

    return {
      added: createdList.length,
      total: updated.length,
      capacityReached: updated.length >= MAX_CATALOG_LIMIT
    };
  },

  updateProduct(updatedProduct: Product): void {
    const currentProducts = this.getProducts();
    const updated = currentProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    this.saveProducts(updated);
  },

  toggleStockStatus(id: string): Product[] {
    const currentProducts = this.getProducts();
    const updated = currentProducts.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p);
    this.saveProducts(updated);
    return updated;
  },

  deleteProduct(id: string): void {
    const currentProducts = this.getProducts();
    const updated = currentProducts.filter(p => p.id !== id);
    this.saveProducts(updated);
  },

  resetToDefault(): Product[] {
    this.saveProducts(INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  },

  clearAllProducts(): void {
    this.saveProducts([]);
  },

  // Export full catalog as JSON string
  exportCatalogJSON(): string {
    const products = this.getProducts();
    return JSON.stringify(products, null, 2);
  },

  // Export catalog as CSV
  exportCatalogCSV(): string {
    const products = this.getProducts();
    const headers = ['ID', 'Title', 'Category', 'Price', 'OriginalPrice', 'InStock', 'IsNewArrival', 'Sizes', 'ImageUrl', 'Description'];
    const rows = products.map(p => [
      `"${p.id}"`,
      `"${(p.title || '').replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.price,
      p.originalPrice || '',
      p.inStock ? 'TRUE' : 'FALSE',
      p.isNewArrival ? 'TRUE' : 'FALSE',
      `"${p.sizes.join('|')}"`,
      `"${(p.imageUrl || '').replace(/"/g, '""')}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  // Import products from CSV text
  importCatalogCSV(csvText: string): { success: boolean; count: number; error?: string } {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length <= 1) {
        return { success: false, count: 0, error: 'CSV file is empty or missing data rows.' };
      }

      const itemsToImport: Array<Omit<Product, 'id' | 'createdAt'>> = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV splitter handling quotes
        const cols: string[] = [];
        let inQuotes = false;
        let current = '';
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            cols.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        cols.push(current.trim());

        // Parse fields
        // Order: ID(0), Title(1), Category(2), Price(3), OriginalPrice(4), InStock(5), IsNewArrival(6), Sizes(7), ImageUrl(8), Description(9)
        const clean = (val: string) => (val || '').replace(/^"|"$/g, '').replace(/""/g, '"').trim();

        const title = clean(cols[1] || cols[0]);
        if (!title) continue;

        const category = (clean(cols[2]) || 'Fusion Wear') as Product['category'];
        const price = parseFloat(clean(cols[3])) || 1499;
        const originalPrice = parseFloat(clean(cols[4])) || (price + 500);
        const inStock = clean(cols[5]).toUpperCase() !== 'FALSE';
        const isNewArrival = clean(cols[6]).toUpperCase() === 'TRUE';
        const rawSizes = clean(cols[7]);
        const sizes = rawSizes ? rawSizes.split('|').map(s => s.trim() as Product['sizes'][number]) : ['Free Size' as const];
        const imageUrl = clean(cols[8]) || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800';
        const description = clean(cols[9]) || `${title} from Yaarika Collections.`;

        itemsToImport.push({
          title,
          category,
          price,
          originalPrice,
          inStock,
          isNewArrival,
          sizes: sizes.length > 0 ? sizes : ['Free Size'],
          imageUrl,
          description
        });
      }

      if (itemsToImport.length === 0) {
        return { success: false, count: 0, error: 'No valid product rows found in CSV.' };
      }

      const res = this.bulkAddProducts(itemsToImport);
      return { success: true, count: res.added };
    } catch (e) {
      return { success: false, count: 0, error: (e as Error).message || 'Failed to parse CSV.' };
    }
  },

  // Import products from JSON text
  importCatalogJSON(jsonText: string): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return { success: false, count: 0, error: 'JSON must be an array of products.' };
      }

      const itemsToImport: Array<Omit<Product, 'id' | 'createdAt'>> = parsed.map(item => ({
        title: String(item.title || 'Untitled Yaarika Piece'),
        category: (item.category || 'Fusion Wear'),
        price: Number(item.price) || 1299,
        originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
        inStock: item.inStock !== false,
        isNewArrival: Boolean(item.isNewArrival),
        sizes: Array.isArray(item.sizes) && item.sizes.length > 0 ? item.sizes : ['Free Size'],
        imageUrl: String(item.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'),
        description: String(item.description || 'Exclusive boutique wear.')
      }));

      const res = this.bulkAddProducts(itemsToImport);
      return { success: true, count: res.added };
    } catch (e) {
      return { success: false, count: 0, error: (e as Error).message || 'Invalid JSON format.' };
    }
  },

  // Generate batch realistic sample products for testing scale up to 5,000 items
  generateDemoBatch(count: number): { added: number; total: number } {
    const categories: Product['category'][] = [
      'Traditional Sarees',
      'Co-ord Sets',
      'Churidar Sets',
      'Fusion Wear',
      'New Arrivals'
    ];

    const sampleImages = [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&q=80&w=800'
    ];

    const fabricTypes = ['Pure Kasavu Gold Tissue', 'Kanchipuram Silk', 'Chanderi Zari', 'Linen Cotton', 'Georgette Embroidered', 'Handloom Cotton', 'Organza Floral'];
    const titles = ['Royal Heirloom', 'Festive Edit', 'Elegance Drape', 'Temple Border', 'Modern Fusion', 'Pastel Blossom', 'Golden Weave', 'Palazzo Ensemble'];

    const items: Array<Omit<Product, 'id' | 'createdAt'>> = [];
    const baseNumber = this.getProducts().length + 1;

    for (let i = 0; i < count; i++) {
      const idx = baseNumber + i;
      const cat = categories[idx % categories.length];
      const fabric = fabricTypes[idx % fabricTypes.length];
      const name = titles[idx % titles.length];
      const price = 899 + ((idx * 170) % 6500);
      const originalPrice = price + 400 + ((idx * 120) % 2000);
      const img = sampleImages[idx % sampleImages.length];

      items.push({
        title: `${name} ${fabric} #${idx}`,
        category: cat,
        price,
        originalPrice,
        inStock: i % 7 !== 0, // 85% in stock
        isNewArrival: i % 4 === 0,
        sizes: ['S', 'M', 'L', 'XL', 'Free Size'],
        imageUrl: img,
        description: `Premium ${fabric} crafted with exquisite craftsmanship. Perfect for weddings, Onam festivities, and festive celebrations. All Kerala Free Shipping included.`
      });
    }

    const res = this.bulkAddProducts(items);
    return { added: res.added, total: res.total };
  }
};

// WISHLIST SERVICES
export const WishlistStorage = {
  getWishlist(): string[] {
    try {
      const data = localStorage.getItem(KEYS.WISHLIST);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleWishlist(productId: string): string[] {
    const current = this.getWishlist();
    let updated: string[];
    if (current.includes(productId)) {
      updated = current.filter(id => id !== productId);
    } else {
      updated = [...current, productId];
    }
    localStorage.setItem(KEYS.WISHLIST, JSON.stringify(updated));
    return updated;
  }
};

// INQUIRY ANALYTICS LOGS
export const InquiryStorage = {
  logInquiry(productId: string, productTitle: string, selectedSize: string, phoneContact: string): void {
    try {
      const existing = this.getInquiries();
      const newLog: InquiryLog = {
        id: `inquiry-${Date.now()}`,
        productId,
        productTitle,
        selectedSize,
        phoneContact,
        timestamp: new Date().toISOString()
      };
      const updated = [newLog, ...existing].slice(0, 100); // keep last 100
      localStorage.setItem(KEYS.INQUIRIES, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to log inquiry:', e);
    }
  },

  getInquiries(): InquiryLog[] {
    try {
      const data = localStorage.getItem(KEYS.INQUIRIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
};
