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

// PRODUCT CATALOG MANAGEMENT SERVICES
export const ProductStorage = {
  getProducts(): Product[] {
    try {
      const data = localStorage.getItem(KEYS.PRODUCTS);
      if (!data) {
        // Seed initial default products
        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
        return INITIAL_PRODUCTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error loading products from storage:', e);
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products to storage:', e);
    }
  },

  addProduct(newProduct: Omit<Product, 'id' | 'createdAt'>): Product {
    const currentProducts = this.getProducts();
    const createdProduct: Product = {
      ...newProduct,
      id: `product-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };

    const updated = [createdProduct, ...currentProducts];
    this.saveProducts(updated);
    return createdProduct;
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
