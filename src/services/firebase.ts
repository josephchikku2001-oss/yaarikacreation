import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  setLogLevel,
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  Firestore,
  writeBatch
} from 'firebase/firestore';
import { Product, InquiryLog } from '../types';

// Silence verbose connection timeout info logs in sandboxed/offline environments
try {
  setLogLevel('error');
} catch {}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  firestoreDatabaseId?: string;
}

// Built-in Provisioned Firebase configuration for cross-device cloud catalog persistence
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  projectId: "handy-aloe-36shk",
  appId: "1:479067422881:web:fdd52c84b0c6f5fc08b0e0",
  apiKey: "AIzaSyApU6KQW6IVWxY4JrBFMpzMD2qkr9Z3f9s",
  authDomain: "handy-aloe-36shk.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-yaarikacollectio-03251ed0-36f6-46e0-afaa-d5e07e41f99e",
  storageBucket: "handy-aloe-36shk.firebasestorage.app",
  messagingSenderId: "479067422881"
};

const FIREBASE_CONFIG_STORAGE_KEY = 'yaarika_firebase_custom_config_v2';

export function getSavedFirebaseConfig(): FirebaseConfig {
  try {
    const saved = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return {
          ...DEFAULT_FIREBASE_CONFIG,
          ...parsed
        };
      }
    }
  } catch (e) {
    console.warn('Error reading saved Firebase config:', e);
  }

  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config: FirebaseConfig): void {
  try {
    localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
    cachedApp = null;
    cachedAuth = null;
    cachedDb = null;
  } catch (e) {
    console.error('Failed to save Firebase config:', e);
  }
}

export function removeFirebaseConfig(): void {
  try {
    localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
    cachedApp = null;
    cachedAuth = null;
    cachedDb = null;
  } catch (e) {}
}

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (cachedApp) return cachedApp;

  const config = getSavedFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    if (getApps().length > 0) {
      cachedApp = getApp();
    } else {
      cachedApp = initializeApp(config);
    }
    return cachedApp;
  } catch (e) {
    console.warn('Failed to initialize Firebase App:', e);
    return null;
  }
}

export function getFirebaseAuth(): Auth | null {
  if (cachedAuth) return cachedAuth;
  const app = getFirebaseApp();
  if (!app) return null;

  try {
    cachedAuth = getAuth(app);
    return cachedAuth;
  } catch (e) {
    console.warn('Failed to get Firebase Auth:', e);
    return null;
  }
}

export function getFirebaseFirestore(): Firestore | null {
  if (cachedDb) return cachedDb;
  const app = getFirebaseApp();
  if (!app) return null;

  const config = getSavedFirebaseConfig();
  const firestoreSettings = {
    experimentalForceLongPolling: true,
    experimentalAutoDetectLongPolling: false
  };

  try {
    if (config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)') {
      cachedDb = initializeFirestore(app, firestoreSettings, config.firestoreDatabaseId);
    } else {
      cachedDb = initializeFirestore(app, firestoreSettings);
    }
    return cachedDb;
  } catch (e) {
    try {
      if (config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)') {
        cachedDb = getFirestore(app, config.firestoreDatabaseId);
      } else {
        cachedDb = getFirestore(app);
      }
      return cachedDb;
    } catch (err) {
      return null;
    }
  }
}

export function isFirebaseConfigured(): boolean {
  return true; // Active with provisioned cloud database
}

// Helper to convert Firestore Document to strongly-typed normalized Product
function parseFirestoreDocToProduct(id: string, data: any): Product {
  const price = typeof data.price === 'number' ? data.price : parseFloat(data.price) || 1499;
  const origPrice = data.originalPrice !== undefined && data.originalPrice !== null 
    ? (typeof data.originalPrice === 'number' ? data.originalPrice : parseFloat(data.originalPrice)) 
    : undefined;
  const stockCount = data.stockCount !== undefined && data.stockCount !== null
    ? (typeof data.stockCount === 'number' ? data.stockCount : parseInt(data.stockCount))
    : undefined;

  // Preserve multiple images array (up to 5)
  let imagesList: string[] = [];
  if (Array.isArray(data.images) && data.images.length > 0) {
    imagesList = data.images.filter((img: any) => typeof img === 'string' && img.trim().length > 0);
  } else if (data.imageUrl) {
    imagesList = [data.imageUrl];
  }

  const primaryImage = imagesList[0] || data.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800';

  return {
    id,
    title: data.title || 'Yaarika Ethnic Ensemble',
    category: data.category || 'Traditional Sarees',
    price,
    originalPrice: isNaN(origPrice as number) ? undefined : origPrice,
    inStock: data.inStock !== undefined ? Boolean(data.inStock) : true,
    stockCount: isNaN(stockCount as number) ? undefined : stockCount,
    sizeStock: data.sizeStock && typeof data.sizeStock === 'object' ? data.sizeStock : {},
    isNewArrival: Boolean(data.isNewArrival),
    sizes: Array.isArray(data.sizes) && data.sizes.length > 0 ? data.sizes : ['Free Size'],
    imageUrl: primaryImage,
    images: imagesList,
    description: data.description || '',
    fabricDetails: data.fabricDetails || '',
    createdAt: data.createdAt || new Date().toISOString(),
    featured: Boolean(data.featured)
  };
}

// FIRESTORE PRODUCT SERVICE FOR SEAMLESS MULTI-DEVICE SYNC
export const FirestoreProductService = {
  // Fetch all products from Firestore with safe timeout
  async fetchProducts(): Promise<Product[]> {
    const db = getFirebaseFirestore();
    if (!db) {
      throw new Error('Firestore is not configured');
    }

    try {
      const colRef = collection(db, 'products');

      const queryOperation = (async () => {
        let snapshot;
        try {
          const q = query(colRef, orderBy('createdAt', 'desc'));
          snapshot = await getDocs(q);
        } catch (orderErr) {
          snapshot = await getDocs(colRef);
        }

        const products: Product[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          products.push(parseFirestoreDocToProduct(docSnap.id, data));
        });

        // Sort client-side by date if available
        products.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });

        return products;
      })();

      // 4-second timeout prevents 10-second backend hang in sandboxed or quota-limited environments
      const timeoutPromise = new Promise<Product[]>((_, reject) => {
        setTimeout(() => reject(new Error('Firestore connection timeout, using offline cache')), 4000);
      });

      return await Promise.race([queryOperation, timeoutPromise]);
    } catch (e: any) {
      // Return gracefully rejected promise for fallback
      throw e;
    }
  },

  // Save/Add a single product to Firestore
  async saveProduct(product: Product): Promise<void> {
    const db = getFirebaseFirestore();
    if (!db) {
      throw new Error('Firestore is not configured');
    }

    try {
      const docRef = doc(db, 'products', product.id);
      const savePromise = setDoc(docRef, {
        id: product.id,
        title: product.title,
        category: product.category,
        price: product.price,
        originalPrice: product.originalPrice || null,
        inStock: product.inStock,
        stockCount: product.stockCount !== undefined ? product.stockCount : null,
        sizeStock: product.sizeStock || {},
        isNewArrival: Boolean(product.isNewArrival),
        sizes: product.sizes || ['Free Size'],
        imageUrl: product.imageUrl,
        images: product.images || (product.imageUrl ? [product.imageUrl] : []),
        description: product.description || '',
        fabricDetails: product.fabricDetails || '',
        featured: Boolean(product.featured),
        createdAt: product.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('Firestore save timed out')), 5000);
      });

      await Promise.race([savePromise, timeoutPromise]);
    } catch (e) {
      console.warn('Could not sync product directly to cloud Firestore:', e);
      throw e;
    }
  },

  // Delete a product from Firestore
  async deleteProduct(productId: string): Promise<void> {
    const db = getFirebaseFirestore();
    if (!db) {
      throw new Error('Firestore is not configured');
    }

    try {
      const docRef = doc(db, 'products', productId);
      const deletePromise = deleteDoc(docRef);
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('Firestore delete timed out')), 5000);
      });
      await Promise.race([deletePromise, timeoutPromise]);
    } catch (e) {
      console.warn('Could not sync product deletion directly to cloud Firestore:', e);
      throw e;
    }
  },

  // Bulk sync full catalog to Firestore
  async syncAllToFirestore(products: Product[]): Promise<number> {
    const db = getFirebaseFirestore();
    if (!db) {
      throw new Error('Firestore is not configured');
    }

    let syncedCount = 0;
    // Batch in chunks of 250
    for (let i = 0; i < products.length; i += 250) {
      const chunk = products.slice(i, i + 250);
      const batch = writeBatch(db);

      for (const p of chunk) {
        const docRef = doc(db, 'products', p.id);
        batch.set(docRef, {
          id: p.id,
          title: p.title,
          category: p.category,
          price: p.price,
          originalPrice: p.originalPrice || null,
          inStock: p.inStock,
          stockCount: p.stockCount !== undefined ? p.stockCount : null,
          sizeStock: p.sizeStock || {},
          isNewArrival: Boolean(p.isNewArrival),
          sizes: p.sizes || ['Free Size'],
          imageUrl: p.imageUrl,
          images: p.images || (p.imageUrl ? [p.imageUrl] : []),
          description: p.description || '',
          fabricDetails: p.fabricDetails || '',
          featured: Boolean(p.featured),
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
        syncedCount++;
      }

      await batch.commit();
    }

    return syncedCount;
  },

  // Real-time listener for multi-device instant updates
  subscribeToProducts(onUpdate: (products: Product[]) => void, onError?: (err: Error) => void): (() => void) {
    const db = getFirebaseFirestore();
    if (!db) {
      return () => {};
    }

    try {
      const colRef = collection(db, 'products');
      let isUnsubscribed = false;
      
      const unsubscribe = onSnapshot(colRef, (snapshot) => {
        if (isUnsubscribed) return;
        const products: Product[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          products.push(parseFirestoreDocToProduct(docSnap.id, data));
        });

        // Sort descending by creation date
        products.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });

        onUpdate(products);
      }, (err) => {
        // Stop retrying stream if quota is exhausted or connection refused to avoid repeated 10s timeout warnings
        isUnsubscribed = true;
        try {
          unsubscribe();
        } catch {}
        if (onError) onError(err);
      });

      return () => {
        isUnsubscribed = true;
        try {
          unsubscribe();
        } catch {}
      };
    } catch (e) {
      return () => {};
    }
  },

  // Log WhatsApp Inquiry to Firestore
  async logInquiry(inquiry: InquiryLog): Promise<void> {
    const db = getFirebaseFirestore();
    if (!db) return;

    try {
      const docRef = doc(db, 'inquiries', inquiry.id);
      await setDoc(docRef, inquiry, { merge: true });
    } catch (e) {
      console.warn('Could not log inquiry to Firestore:', e);
    }
  }
};

// FIREBASE AUTH SERVICE
export const FirebaseAuthService = {
  async signIn(email: string, pass: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const auth = getFirebaseAuth();
    if (!auth) {
      return { success: false, error: 'Firebase is not initialized.' };
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      return { success: true, user: cred.user };
    } catch (e: any) {
      console.error('Firebase Auth sign in error:', e);
      let errorMsg = 'Failed to sign in. Please check your credentials.';
      if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        errorMsg = 'Invalid admin email or password.';
      } else if (e.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address format.';
      } else if (e.code === 'auth/too-many-requests') {
        errorMsg = 'Access temporarily disabled due to too many failed attempts. Please try again later.';
      } else if (e.message) {
        errorMsg = e.message;
      }
      return { success: false, error: errorMsg };
    }
  },

  async signUpAdmin(email: string, pass: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const auth = getFirebaseAuth();
    if (!auth) {
      return { success: false, error: 'Firebase is not initialized.' };
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      return { success: true, user: cred.user };
    } catch (e: any) {
      console.error('Firebase Auth signup error:', e);
      return { success: false, error: e.message || 'Failed to create admin account.' };
    }
  },

  async signOut(): Promise<void> {
    const auth = getFirebaseAuth();
    if (auth) {
      await firebaseSignOut(auth);
    }
  },

  onAuthChange(callback: (user: User | null) => void): (() => void) {
    const auth = getFirebaseAuth();
    if (!auth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser(): User | null {
    const auth = getFirebaseAuth();
    return auth ? auth.currentUser : null;
  }
};
