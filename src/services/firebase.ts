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
  setLogLevel,
  collection, 
  doc, 
  getDocs, 
  getDocFromServer,
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  Firestore,
  writeBatch
} from 'firebase/firestore';
import { Product, InquiryLog } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

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
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = firebaseConfig;

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
  } catch (e) {
    console.error('Failed to save Firebase config:', e);
  }
}

export function removeFirebaseConfig(): void {
  try {
    localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
  } catch (e) {}
}

// Global initialized instances
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth: Auth = getAuth(app);

export function getFirebaseApp(): FirebaseApp {
  return app;
}

export function getFirebaseAuth(): Auth {
  return auth;
}

export function getFirebaseFirestore(): Firestore {
  return db;
}

export function isFirebaseConfigured(): boolean {
  return true;
}

// Validate connection to Firestore on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or network connection.");
    }
    return false;
  }
}

// Test connection on boot
testConnection();

// Standard Error Handling conforming to Firebase Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
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
  // Fetch all products from Firestore
  async fetchProducts(): Promise<Product[]> {
    try {
      const colRef = collection(db, 'products');
      let snapshot;
      try {
        const q = query(colRef, orderBy('createdAt', 'desc'));
        snapshot = await getDocs(q);
      } catch {
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
    } catch (e: any) {
      if (e?.message?.includes('insufficient permissions')) {
        handleFirestoreError(e, OperationType.LIST, 'products');
      }
      throw e;
    }
  },

  // Save/Add a single product to Firestore
  async saveProduct(product: Product): Promise<void> {
    try {
      const docRef = doc(db, 'products', product.id);
      await setDoc(docRef, {
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
    } catch (e: any) {
      if (e?.message?.includes('insufficient permissions')) {
        handleFirestoreError(e, OperationType.WRITE, `products/${product.id}`);
      }
      throw e;
    }
  },

  // Delete a product from Firestore
  async deleteProduct(productId: string): Promise<void> {
    try {
      const docRef = doc(db, 'products', productId);
      await deleteDoc(docRef);
    } catch (e: any) {
      if (e?.message?.includes('insufficient permissions')) {
        handleFirestoreError(e, OperationType.DELETE, `products/${productId}`);
      }
      throw e;
    }
  },

  // Bulk sync full catalog to Firestore
  async syncAllToFirestore(products: Product[]): Promise<number> {
    try {
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
    } catch (e: any) {
      if (e?.message?.includes('insufficient permissions')) {
        handleFirestoreError(e, OperationType.WRITE, 'products');
      }
      throw e;
    }
  },

  // Real-time listener for multi-device instant updates
  subscribeToProducts(onUpdate: (products: Product[]) => void, onError?: (err: Error) => void): (() => void) {
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
        isUnsubscribed = true;
        try {
          unsubscribe();
        } catch {}
        if ((err as any)?.message?.includes('insufficient permissions')) {
          try {
            handleFirestoreError(err, OperationType.LIST, 'products');
          } catch {}
        }
        if (onError) onError(err);
      });

      return () => {
        isUnsubscribed = true;
        try {
          unsubscribe();
        } catch {}
      };
    } catch {
      return () => {};
    }
  },

  // Log WhatsApp Inquiry to Firestore
  async logInquiry(inquiry: InquiryLog): Promise<void> {
    try {
      const docRef = doc(db, 'inquiries', inquiry.id);
      await setDoc(docRef, inquiry, { merge: true });
    } catch (e: any) {
      if (e?.message?.includes('insufficient permissions')) {
        handleFirestoreError(e, OperationType.WRITE, `inquiries/${inquiry.id}`);
      }
      console.warn('Could not log inquiry to Firestore:', e);
    }
  }
};

// FIREBASE AUTH SERVICE
export const FirebaseAuthService = {
  async signIn(email: string, pass: string): Promise<{ success: boolean; user?: User; error?: string }> {
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
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      return { success: true, user: cred.user };
    } catch (e: any) {
      console.error('Firebase Auth signup error:', e);
      return { success: false, error: e.message || 'Failed to create admin account.' };
    }
  },

  async signOut(): Promise<void> {
    if (auth) {
      await firebaseSignOut(auth);
    }
  },

  onAuthChange(callback: (user: User | null) => void): (() => void) {
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser(): User | null {
    return auth.currentUser;
  }
};
