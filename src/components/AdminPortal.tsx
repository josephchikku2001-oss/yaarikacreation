import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  User, 
  KeyRound, 
  Plus, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  LogOut, 
  Check, 
  AlertTriangle, 
  Image as ImageIcon, 
  Upload, 
  Sparkles, 
  Layers, 
  Search, 
  MessageCircle, 
  CheckCircle2, 
  Download, 
  Database, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Flame, 
  Cloud, 
  Settings, 
  Mail, 
  HardDrive,
  Eye,
  Boxes,
  Package,
  Minus,
  AlertCircle
} from 'lucide-react';
import { Product, CategoryType, SizeType, InquiryLog } from '../types';
import { AdminStorage, ProductStorage, InquiryStorage } from '../services/storage';
import { 
  FirebaseAuthService, 
  FirestoreProductService, 
  isFirebaseConfigured, 
  getSavedFirebaseConfig, 
  saveFirebaseConfig, 
  FirebaseConfig 
} from '../services/firebase';
import { 
  isProductInStock, 
  getSizeStockCount, 
  isSizeInStock, 
  getProductTotalStock 
} from '../utils/inventory';

interface AdminPortalProps {
  onClose: () => void;
  onToast: (msg: string) => void;
  onRefreshProducts: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onClose,
  onToast,
  onRefreshProducts
}) => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUserEmail, setAdminUserEmail] = useState<string>('');
  const [authMode, setAuthMode] = useState<'firebase' | 'master'>('firebase');
  
  // Login form inputs
  const [emailInput, setEmailInput] = useState<string>('');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [isFirebaseAccountCreation, setIsFirebaseAccountCreation] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'products' | 'add' | 'bulk' | 'inquiries' | 'settings'>('products');

  // Product List
  const [products, setProducts] = useState<Product[]>(ProductStorage.getProducts());
  const [productSearch, setProductSearch] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<'all' | 'instock' | 'outofstock' | 'lowstock'>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Firestore Sync State
  const [isSyncingFirestore, setIsSyncingFirestore] = useState<boolean>(false);
  const [firestoreStatusMessage, setFirestoreStatusMessage] = useState<string>('');
  const [firebaseActive, setFirebaseActive] = useState<boolean>(isFirebaseConfigured());

  // Delete Modal State
  const [deleteProductCandidate, setDeleteProductCandidate] = useState<Product | null>(null);

  // Add / Edit Product Form State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<CategoryType>('Traditional Sarees');
  const [formPrice, setFormPrice] = useState<string>(''); // Offer / Selling price
  const [formOriginalPrice, setFormOriginalPrice] = useState<string>(''); // Original MRP
  const [formSizes, setFormSizes] = useState<SizeType[]>(['M', 'L', 'XL', 'XXL']);
  const [formSizeStock, setFormSizeStock] = useState<Partial<Record<SizeType, string>>>({
    M: '5',
    L: '5',
    XL: '5',
    XXL: '5'
  });
  const [formDescription, setFormDescription] = useState<string>('');
  const [formFabric, setFormFabric] = useState<string>('');
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [formInStock, setFormInStock] = useState<boolean>(true);
  const [formFeatured, setFormFeatured] = useState<boolean>(false);
  const [formIsNewArrival, setFormIsNewArrival] = useState<boolean>(false);

  // Firebase Config Form inside Settings Tab
  const [fbApiKey, setFbApiKey] = useState<string>('');
  const [fbAuthDomain, setFbAuthDomain] = useState<string>('');
  const [fbProjectId, setFbProjectId] = useState<string>('');
  const [fbAppId, setFbAppId] = useState<string>('');
  const [fbConfigStatus, setFbConfigStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Password Change in Settings
  const [currentPassInput, setCurrentPassInput] = useState<string>('');
  const [newPassInput, setNewPassInput] = useState<string>('');
  const [confirmNewPassInput, setConfirmNewPassInput] = useState<string>('');
  const [passChangeMessage, setPassChangeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Inquiries
  const [inquiries] = useState<InquiryLog[]>(InquiryStorage.getInquiries());

  // Bulk Manager State
  const [bulkInputText, setBulkInputText] = useState<string>('');
  const [bulkFormat, setBulkFormat] = useState<'csv' | 'json'>('csv');
  const [bulkStatus, setBulkStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isProcessingBulk, setIsProcessingBulk] = useState<boolean>(false);

  const availableCategories: CategoryType[] = [
    'Traditional Sarees',
    'Co-ord Sets',
    'Churidar Sets',
    'Fusion Wear',
    'New Arrivals'
  ];

  // Specific size list emphasizing M, L, XL, XXL
  const quickSizesList: SizeType[] = ['M', 'L', 'XL', 'XXL'];
  const allSizesList: SizeType[] = ['Free Size', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

  // Check Firebase Auth & Local Auth on mount
  useEffect(() => {
    setProducts(ProductStorage.getProducts());
    setFirebaseActive(isFirebaseConfigured());

    const savedConfig = getSavedFirebaseConfig();
    if (savedConfig) {
      setFbApiKey(savedConfig.apiKey || '');
      setFbAuthDomain(savedConfig.authDomain || '');
      setFbProjectId(savedConfig.projectId || '');
      setFbAppId(savedConfig.appId || '');
    }

    // Check if Firebase Auth is already active
    const unsubscribe = FirebaseAuthService.onAuthChange((user) => {
      if (user && user.email) {
        setIsAuthenticated(true);
        setAdminUserEmail(user.email);
        setAuthMode('firebase');
      }
    });

    return () => unsubscribe();
  }, []);

  // Firebase Email & Password Login Handler
  const handleFirebaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthError('Please enter both Email and Password.');
      setAuthLoading(false);
      return;
    }

    if (isFirebaseAccountCreation) {
      if (passwordInput !== confirmPasswordInput) {
        setAuthError('Passwords do not match.');
        setAuthLoading(false);
        return;
      }

      const res = await FirebaseAuthService.signUpAdmin(emailInput, passwordInput);
      setAuthLoading(false);

      if (res.success && res.user) {
        setIsAuthenticated(true);
        setAdminUserEmail(res.user.email || emailInput);
        onToast(`Admin account registered & logged in as ${res.user.email}!`);
      } else {
        setAuthError(res.error || 'Failed to create Firebase admin account.');
      }
    } else {
      const res = await FirebaseAuthService.signIn(emailInput, passwordInput);
      setAuthLoading(false);

      if (res.success && res.user) {
        setIsAuthenticated(true);
        setAdminUserEmail(res.user.email || emailInput);
        onToast(`Logged in successfully as ${res.user.email}`);
      } else {
        setAuthError(res.error || 'Invalid Admin Email or Password.');
      }
    }
  };

  // Master Admin Login / Setup Fallback
  const handleMasterLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    if (!usernameInput.trim() || !passwordInput.trim()) {
      setAuthError('Please enter your Username and Password.');
      setAuthLoading(false);
      return;
    }

    if (!AdminStorage.isSetupComplete()) {
      if (passwordInput !== confirmPasswordInput) {
        setAuthError('Passwords do not match.');
        setAuthLoading(false);
        return;
      }
      const res = await AdminStorage.registerFirstAdmin(usernameInput, passwordInput);
      setAuthLoading(false);
      if (res.success) {
        setIsAuthenticated(true);
        setAdminUserEmail(usernameInput);
        onToast('Master Admin Account Created Successfully!');
      } else {
        setAuthError(res.message);
      }
    } else {
      const res = await AdminStorage.login(usernameInput, passwordInput);
      setAuthLoading(false);
      if (res.success) {
        setIsAuthenticated(true);
        setAdminUserEmail(usernameInput);
        onToast('Logged in as Master Admin.');
      } else {
        setAuthError(res.message);
      }
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    await FirebaseAuthService.signOut();
    setIsAuthenticated(false);
    setAdminUserEmail('');
    onToast('Logged out from Admin Portal.');
  };

  // Sync All Products to Firestore
  const handleSyncAllToFirestore = async () => {
    setIsSyncingFirestore(true);
    setFirestoreStatusMessage('');
    try {
      const current = ProductStorage.getProducts();
      const count = await FirestoreProductService.syncAllToFirestore(current);
      setFirestoreStatusMessage(`✅ Successfully saved ${count} products to Firebase Firestore!`);
      onToast(`Saved ${count} products to Firebase Firestore Database!`);
    } catch (err: any) {
      console.error(err);
      setFirestoreStatusMessage(`❌ Firestore Sync Error: ${err.message || 'Check Firebase Configuration'}`);
      onToast('Firestore sync failed. Please check Firebase credentials.');
    } finally {
      setIsSyncingFirestore(false);
    }
  };

  // Fetch Latest from Firestore
  const handleFetchFromFirestore = async () => {
    setIsSyncingFirestore(true);
    try {
      const remoteProducts = await FirestoreProductService.fetchProducts();
      if (remoteProducts.length > 0) {
        ProductStorage.saveProducts(remoteProducts);
        setProducts(remoteProducts);
        onRefreshProducts();
        onToast(`Loaded ${remoteProducts.length} products from Firebase Firestore!`);
      } else {
        onToast('No products found in Firestore collection.');
      }
    } catch (err: any) {
      onToast(`Error fetching from Firestore: ${err.message || 'Check configuration'}`);
    } finally {
      setIsSyncingFirestore(false);
    }
  };

  // Save/Update Firebase Configuration
  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbApiKey.trim() || !fbProjectId.trim()) {
      setFbConfigStatus({ type: 'error', msg: 'API Key and Project ID are required.' });
      return;
    }

    const config: FirebaseConfig = {
      apiKey: fbApiKey.trim(),
      authDomain: fbAuthDomain.trim() || `${fbProjectId.trim()}.firebaseapp.com`,
      projectId: fbProjectId.trim(),
      appId: fbAppId.trim() || '1:123456789:web:abcdef'
    };

    saveFirebaseConfig(config);
    setFirebaseActive(true);
    setFbConfigStatus({ type: 'success', msg: 'Firebase configuration saved and activated successfully!' });
    onToast('Firebase configuration activated!');
  };

  // Toggle Size selection in form
  const toggleSizeInForm = (size: SizeType) => {
    if (formSizes.includes(size)) {
      if (formSizes.length > 1) {
        setFormSizes(formSizes.filter(s => s !== size));
        const updated = { ...formSizeStock };
        delete updated[size];
        setFormSizeStock(updated);
      } else {
        onToast('At least one size must remain selected.');
      }
    } else {
      setFormSizes([...formSizes, size]);
      setFormSizeStock(prev => ({ ...prev, [size]: prev[size] !== undefined ? prev[size] : '5' }));
    }
  };

  // Quick helper to select standard M, L, XL, XXL set
  const handleSelectStandardSizes = () => {
    setFormSizes(['M', 'L', 'XL', 'XXL']);
    setFormSizeStock(prev => ({
      ...prev,
      M: prev.M || '5',
      L: prev.L || '5',
      XL: prev.XL || '5',
      XXL: prev.XXL || '5'
    }));
    onToast('Selected standard sizes: M, L, XL, XXL');
  };

  // Update stock count for a specific size in form
  const handleSizeStockChange = (size: SizeType, value: string) => {
    const numeric = parseInt(value) || 0;
    const clamped = Math.max(0, numeric);
    const updated = { ...formSizeStock, [size]: value === '' ? '' : clamped.toString() };
    setFormSizeStock(updated);

    // Calculate sum of stock across all active sizes
    const total = formSizes.reduce((acc, s) => {
      const count = parseInt(updated[s] !== undefined ? updated[s]! : '0') || 0;
      return acc + count;
    }, 0);

    if (total === 0) {
      setFormInStock(false);
    } else if (!formInStock && total > 0) {
      setFormInStock(true);
    }
  };

  // Increment or decrement stock for a specific size
  const handleStepSizeStock = (size: SizeType, delta: number) => {
    const current = parseInt(formSizeStock[size] || '0') || 0;
    const nextVal = Math.max(0, current + delta);
    handleSizeStockChange(size, nextVal.toString());
  };

  // Set all sizes to a uniform stock count
  const handleSetAllSizesStock = (qty: number) => {
    const updated: Partial<Record<SizeType, string>> = {};
    formSizes.forEach(s => {
      updated[s] = qty.toString();
    });
    setFormSizeStock(updated);
    setFormInStock(qty > 0);
    onToast(`Set all selected sizes to ${qty} units.`);
  };

  // Inline Quick Adjust Product Stock from Live Catalog Table
  const handleInlineStockAdjust = (product: Product, size: SizeType, delta: number) => {
    const currentSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['Free Size' as const];
    const currentStock = product.sizeStock ? { ...product.sizeStock } : {};
    
    // Ensure all sizes have initialized count
    currentSizes.forEach(s => {
      if (currentStock[s] === undefined) {
        currentStock[s] = product.inStock ? 5 : 0;
      }
    });

    const currSizeCount = currentStock[size] !== undefined ? currentStock[size]! : (product.inStock ? 5 : 0);
    const newSizeCount = Math.max(0, currSizeCount + delta);
    currentStock[size] = newSizeCount;

    const totalStock = Object.values(currentStock).reduce((acc, c) => acc + (Number(c) || 0), 0);
    const isInStock = totalStock > 0;

    const updatedProduct: Product = {
      ...product,
      sizeStock: currentStock,
      stockCount: totalStock,
      inStock: isInStock
    };

    ProductStorage.updateProduct(updatedProduct);
    const fresh = ProductStorage.getProducts();
    setProducts(fresh);
    onRefreshProducts();
    onToast(`Updated ${product.title} (${size}) stock to ${newSizeCount} units.`);
  };

  // Image Upload File to Data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        onToast('Image size should be under 2MB for fast browser loading.');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImageUrl(reader.result as string);
        onToast('Product image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Save / Edit Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      onToast('Please enter a Product Title.');
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      onToast('Please enter a valid Offer / Selling Price in ₹ INR.');
      return;
    }

    if (!formImageUrl.trim()) {
      onToast('Please provide an Image URL or upload an image file.');
      return;
    }

    if (formSizes.length === 0) {
      onToast('Please select at least one available size (e.g. M, L, XL, XXL).');
      return;
    }

    const origPriceNum = formOriginalPrice ? parseFloat(formOriginalPrice) : undefined;

    // Build sizeStock mapping
    const finalSizeStock: Partial<Record<SizeType, number>> = {};
    let calculatedTotalUnits = 0;

    formSizes.forEach(s => {
      const raw = formSizeStock[s];
      let count = raw !== undefined && raw !== '' ? Math.max(0, parseInt(raw) || 0) : (formInStock ? 5 : 0);
      if (!formInStock) {
        count = 0;
      }
      finalSizeStock[s] = count;
      calculatedTotalUnits += count;
    });

    const isActuallyInStock = formInStock && calculatedTotalUnits > 0;

    const productPayload = {
      title: formTitle.trim(),
      category: formCategory,
      price: priceNum,
      originalPrice: origPriceNum,
      sizes: formSizes,
      stockCount: calculatedTotalUnits,
      sizeStock: finalSizeStock,
      description: formDescription.trim() || `${formTitle.trim()} from Yaarika Collections.`,
      fabricDetails: formFabric.trim(),
      imageUrl: formImageUrl.trim(),
      inStock: isActuallyInStock,
      featured: formFeatured,
      isNewArrival: formIsNewArrival
    };

    if (editingProductId) {
      const updatedProduct: Product = {
        ...productPayload,
        id: editingProductId,
        createdAt: new Date().toISOString()
      };
      ProductStorage.updateProduct(updatedProduct);
      onToast(`Updated product "${formTitle}" with stock counts in catalog & Firestore!`);
    } else {
      ProductStorage.addProduct(productPayload);
      onToast(`Added new product "${formTitle}" with inventory stock to catalog & Firestore!`);
    }

    // Refresh products
    const fresh = ProductStorage.getProducts();
    setProducts(fresh);
    onRefreshProducts();
    resetForm();
    setActiveTab('products');
  };

  // Populate Edit Form
  const handleEditProductClick = (p: Product) => {
    setEditingProductId(p.id);
    setFormTitle(p.title);
    setFormCategory(p.category);
    setFormPrice(p.price.toString());
    setFormOriginalPrice(p.originalPrice ? p.originalPrice.toString() : '');
    
    const sizes = p.sizes && p.sizes.length > 0 ? p.sizes : ['M', 'L', 'XL', 'XXL'];
    setFormSizes(sizes);

    const sizeStockMap: Partial<Record<SizeType, string>> = {};
    sizes.forEach(s => {
      if (p.sizeStock && p.sizeStock[s] !== undefined) {
        sizeStockMap[s] = p.sizeStock[s]!.toString();
      } else if (p.stockCount !== undefined) {
        sizeStockMap[s] = p.stockCount.toString();
      } else {
        sizeStockMap[s] = p.inStock ? '5' : '0';
      }
    });
    setFormSizeStock(sizeStockMap);

    setFormDescription(p.description);
    setFormFabric(p.fabricDetails || '');
    setFormImageUrl(p.imageUrl);
    setFormInStock(p.inStock);
    setFormFeatured(p.featured || false);
    setFormIsNewArrival(p.isNewArrival || false);
    setActiveTab('add');
  };

  // Reset form
  const resetForm = () => {
    setEditingProductId(null);
    setFormTitle('');
    setFormCategory('Traditional Sarees');
    setFormPrice('');
    setFormOriginalPrice('');
    setFormSizes(['M', 'L', 'XL', 'XXL']);
    setFormSizeStock({
      M: '5',
      L: '5',
      XL: '5',
      XXL: '5'
    });
    setFormDescription('');
    setFormFabric('');
    setFormImageUrl('');
    setFormInStock(true);
    setFormFeatured(false);
    setFormIsNewArrival(false);
  };

  // Delete Product
  const confirmDeleteProduct = () => {
    if (deleteProductCandidate) {
      ProductStorage.deleteProduct(deleteProductCandidate.id);
      const updated = ProductStorage.getProducts();
      setProducts(updated);
      onRefreshProducts();
      onToast(`Deleted "${deleteProductCandidate.title}" from catalog & Firestore.`);
      setDeleteProductCandidate(null);
    }
  };

  // Toggle Stock in product list
  const handleToggleStock = (p: Product) => {
    const updated = ProductStorage.toggleStockStatus(p.id);
    setProducts(updated);
    onRefreshProducts();
    onToast(`"${p.title}" is now marked as ${!p.inStock ? 'IN STOCK' : 'OUT OF STOCK'}`);
  };

  // Export CSV
  const handleExportCSV = () => {
    try {
      const csv = ProductStorage.exportCatalogCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `yaarika_catalog_${products.length}_products.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onToast(`Exported ${products.length} products to CSV!`);
    } catch (e: any) {
      onToast('Failed to export CSV: ' + e.message);
    }
  };

  // Process Bulk Import
  const handleProcessBulkImport = () => {
    if (!bulkInputText.trim()) {
      setBulkStatus({ type: 'error', message: 'Please paste or enter CSV/JSON data first.' });
      return;
    }

    setIsProcessingBulk(true);
    setBulkStatus(null);

    setTimeout(() => {
      try {
        let res: { success: boolean; count: number; error?: string };
        if (bulkFormat === 'csv') {
          res = ProductStorage.importCatalogCSV(bulkInputText);
        } else {
          res = ProductStorage.importCatalogJSON(bulkInputText);
        }

        if (res.success) {
          const fresh = ProductStorage.getProducts();
          setProducts(fresh);
          onRefreshProducts();
          setBulkStatus({
            type: 'success',
            message: `Successfully imported ${res.count.toLocaleString()} products! Total Catalog: ${fresh.length.toLocaleString()} products.`
          });
          setBulkInputText('');
          onToast(`Imported ${res.count} products successfully!`);
        } else {
          setBulkStatus({
            type: 'error',
            message: res.error || 'Import failed. Please check the data format.'
          });
        }
      } catch (err: any) {
        setBulkStatus({
          type: 'error',
          message: err.message || 'Unexpected import error.'
        });
      } finally {
        setIsProcessingBulk(false);
      }
    }, 100);
  };

  // Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassChangeMessage(null);

    if (!currentPassInput.trim() || !newPassInput.trim()) {
      setPassChangeMessage({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }

    if (newPassInput !== confirmNewPassInput) {
      setPassChangeMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    const res = await AdminStorage.changePassword(currentPassInput, newPassInput);
    if (res.success) {
      setPassChangeMessage({ type: 'success', text: res.message });
      setCurrentPassInput('');
      setNewPassInput('');
      setConfirmNewPassInput('');
      onToast('Admin Password Changed Successfully!');
    } else {
      setPassChangeMessage({ type: 'error', text: res.message });
    }
  };

  // Filtered products list
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase());

    const totalUnits = getProductTotalStock(p);

    if (stockFilter === 'instock' && (!p.inStock || totalUnits <= 0)) return false;
    if (stockFilter === 'outofstock' && p.inStock && totalUnits > 0) return false;
    if (stockFilter === 'lowstock' && (!p.inStock || totalUnits <= 0 || totalUnits > 3)) return false;

    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedProducts = filteredProducts.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const inStockCount = products.filter(p => p.inStock && getProductTotalStock(p) > 0).length;
  const outOfStockCount = products.filter(p => !p.inStock || getProductTotalStock(p) === 0).length;
  const lowStockCount = products.filter(p => p.inStock && getProductTotalStock(p) > 0 && getProductTotalStock(p) <= 3).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      
      <div className="w-full max-w-5xl bg-[#FFFDF9] rounded-3xl shadow-2xl border-2 border-[#D4AF37]/50 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="bg-[#32080F] text-[#FAF6F0] p-4 sm:p-5 border-b border-[#D4AF37]/30 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gold-gradient-bg p-0.5 shadow-md">
              <div className="w-full h-full bg-[#4A0E17] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cinzel text-lg sm:text-xl font-bold gold-gradient-text">
                  YAARIKA ADMIN PORTAL
                </h2>
                {firebaseActive && (
                  <span className="hidden sm:inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <Flame className="w-3 h-3 text-amber-400" />
                    Firebase Connected
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#F3E5AB]/80">
                {isAuthenticated
                  ? `Logged in: ${adminUserEmail || 'Admin'}`
                  : 'Firebase Authentication & Firestore Product Manager'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-[#4A0E17] text-rose-300 hover:bg-rose-950 border border-rose-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Logout Admin Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg gold-gradient-btn text-xs font-bold shadow transition-all"
            >
              Back to Store
            </button>
          </div>
        </div>

        {/* BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAF6F0]">

          {/* AUTH SCREEN: LOGIN WITH FIREBASE EMAIL & PASSWORD */}
          {!isAuthenticated && (
            <div className="max-w-md mx-auto my-6 bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-[#D4AF37]/40 space-y-6">
              
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-[#4A0E17] text-[#D4AF37] flex items-center justify-center mx-auto border-2 border-[#D4AF37] shadow-lg">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="font-cinzel text-xl font-bold text-[#4A0E17]">
                  Admin Authentication
                </h3>
                <p className="text-xs text-gray-600">
                  Log in with your Admin Email and Password to manage products and Firebase Firestore database.
                </p>
              </div>

              {/* Auth Mode Tabs: Firebase Auth vs Master Account */}
              <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setAuthMode('firebase'); setAuthError(''); }}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    authMode === 'firebase'
                      ? 'bg-[#4A0E17] text-[#D4AF37] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Firebase Auth</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthMode('master'); setAuthError(''); }}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    authMode === 'master'
                      ? 'bg-[#4A0E17] text-[#D4AF37] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Master Admin</span>
                </button>
              </div>

              {authError && (
                <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{authError}</span>
                </div>
              )}

              {/* FIREBASE EMAIL & PASSWORD LOGIN FORM */}
              {authMode === 'firebase' && (
                <form onSubmit={handleFirebaseLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Admin Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="admin@yaarika.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E17]"
                      />
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E17]"
                      />
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {isFirebaseAccountCreation && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          value={confirmPasswordInput}
                          onChange={(e) => setConfirmPasswordInput(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E17]"
                        />
                        <CheckCircle2 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 rounded-xl gold-gradient-btn font-bold text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
                  >
                    {authLoading
                      ? 'Authenticating with Firebase...'
                      : isFirebaseAccountCreation
                      ? 'Register Admin Account in Firebase'
                      : 'Login with Firebase Email & Password'}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFirebaseAccountCreation(!isFirebaseAccountCreation);
                        setAuthError('');
                      }}
                      className="text-xs text-[#4A0E17] hover:underline font-semibold"
                    >
                      {isFirebaseAccountCreation
                        ? 'Already have an Admin account? Log in'
                        : 'First time setup? Create new Admin account'}
                    </button>
                  </div>
                </form>
              )}

              {/* MASTER USERNAME & PASSWORD FORM */}
              {authMode === 'master' && (
                <form onSubmit={handleMasterLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Admin Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="admin_yaarika"
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E17]"
                      />
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E17]"
                      />
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {!AdminStorage.isSetupComplete() && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          value={confirmPasswordInput}
                          onChange={(e) => setConfirmPasswordInput(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E17]"
                        />
                        <CheckCircle2 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 rounded-xl gold-gradient-btn font-bold text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
                  >
                    {authLoading ? 'Verifying...' : 'Login with Master Credentials'}
                  </button>
                </form>
              )}

            </div>
          )}

          {/* AUTHENTICATED DASHBOARD */}
          {isAuthenticated && (
            <div className="space-y-6">

              {/* FIRESTORE CLOUD SYNC BAR */}
              <div className="bg-gradient-to-r from-[#4A0E17]/15 via-amber-500/10 to-[#4A0E17]/15 border border-[#D4AF37]/40 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="w-10 h-10 rounded-xl bg-[#4A0E17] text-[#D4AF37] flex items-center justify-center shrink-0 shadow-md">
                    <Flame className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-extrabold text-[#4A0E17]">Firebase Firestore:</span>
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Cloud Sync Enabled
                      </span>
                      <span className="text-xs text-gray-600 font-medium">
                        ({products.length.toLocaleString()} Products in Catalog)
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Changes are automatically saved to Firebase Firestore &amp; preserved across all updates.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
                  <button
                    onClick={handleFetchFromFirestore}
                    disabled={isSyncingFirestore}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    title="Pull latest product catalog from Firebase Firestore"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSyncingFirestore ? 'animate-spin' : ''}`} />
                    <span>Fetch from Firestore</span>
                  </button>

                  <button
                    onClick={handleSyncAllToFirestore}
                    disabled={isSyncingFirestore}
                    className="px-4 py-1.5 rounded-xl bg-[#4A0E17] text-[#D4AF37] hover:bg-[#32080F] border border-[#D4AF37] text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                    title="Upload entire catalog to Firebase Firestore database"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isSyncingFirestore ? 'Syncing...' : 'Save All to Firestore'}</span>
                  </button>
                </div>
              </div>

              {firestoreStatusMessage && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 animate-fade-in">
                  {firestoreStatusMessage}
                </div>
              )}

              {/* TABS NAVIGATION */}
              <div className="flex items-center gap-2 border-b border-[#D4AF37]/30 pb-3 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => { resetForm(); setActiveTab('products'); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                    activeTab === 'products'
                      ? 'bg-[#4A0E17] text-[#D4AF37] border border-[#D4AF37] shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Live Catalog ({products.length.toLocaleString()})</span>
                </button>

                <button
                  onClick={() => setActiveTab('add')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                    activeTab === 'add'
                      ? 'bg-[#4A0E17] text-[#D4AF37] border border-[#D4AF37] shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>{editingProductId ? 'Edit Product' : 'Add New Product'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('bulk')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                    activeTab === 'bulk'
                      ? 'bg-[#4A0E17] text-[#D4AF37] border border-[#D4AF37] shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Database className="w-4 h-4 text-amber-600" />
                  <span>Bulk Tools &amp; Import</span>
                </button>

                <button
                  onClick={() => setActiveTab('inquiries')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                    activeTab === 'inquiries'
                      ? 'bg-[#4A0E17] text-[#D4AF37] border border-[#D4AF37] shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Inquiries ({inquiries.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                    activeTab === 'settings'
                      ? 'bg-[#4A0E17] text-[#D4AF37] border border-[#D4AF37] shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Settings className="w-4 h-4 text-amber-600" />
                  <span>Firebase &amp; Security</span>
                </button>
              </div>

              {/* TAB 1: VIEW & MANAGE ALL PRODUCTS */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  
                  {/* Search and Filters */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                      <div className="relative w-full sm:w-64">
                        <input
                          type="text"
                          placeholder="Search product title..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#4A0E17]"
                        />
                        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                      </div>

                      {/* Stock Filter Pills */}
                      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                        <button
                          onClick={() => setStockFilter('all')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            stockFilter === 'all'
                              ? 'bg-[#4A0E17] text-[#D4AF37] shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          All ({products.length})
                        </button>

                        <button
                          onClick={() => setStockFilter('instock')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                            stockFilter === 'instock'
                              ? 'bg-emerald-700 text-white shadow-sm'
                              : 'text-emerald-800 hover:bg-emerald-50'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          In Stock ({inStockCount})
                        </button>

                        <button
                          onClick={() => setStockFilter('lowstock')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                            stockFilter === 'lowstock'
                              ? 'bg-amber-700 text-white shadow-sm'
                              : 'text-amber-800 hover:bg-amber-50'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          Low Stock ({lowStockCount})
                        </button>

                        <button
                          onClick={() => setStockFilter('outofstock')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                            stockFilter === 'outofstock'
                              ? 'bg-rose-700 text-white shadow-sm'
                              : 'text-rose-800 hover:bg-rose-50'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                          Out of Stock ({outOfStockCount})
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <button
                        onClick={handleExportCSV}
                        className="px-3 py-2 rounded-xl bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        title="Export current catalog to CSV"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Export CSV</span>
                      </button>

                      <button
                        onClick={() => { resetForm(); setActiveTab('add'); }}
                        className="px-4 py-2 rounded-xl gold-gradient-btn text-xs font-bold flex items-center gap-1.5 shadow"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add New Product</span>
                      </button>
                    </div>
                  </div>

                  {/* Product Table */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#32080F] text-[#FAF6F0] text-xs font-bold uppercase tracking-wider">
                            <th className="p-3.5">Product</th>
                            <th className="p-3.5">Category</th>
                            <th className="p-3.5">Offer Price / MRP</th>
                            <th className="p-3.5">Size &amp; Stock Count</th>
                            <th className="p-3.5">Inventory Status</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs">
                          {paginatedProducts.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                                No products found matching your active filter.
                              </td>
                            </tr>
                          ) : (
                            paginatedProducts.map((p) => {
                              const totalUnits = getProductTotalStock(p);
                              const isStocked = isProductInStock(p);
                              const isLow = isStocked && totalUnits <= 3;
                              const sizesList = p.sizes && p.sizes.length > 0 ? p.sizes : ['Free Size' as const];

                              return (
                                <tr key={p.id} className="hover:bg-amber-50/40 transition-colors">
                                  <td className="p-3 flex items-center gap-3">
                                    <img
                                      src={p.imageUrl}
                                      alt={p.title}
                                      className="w-12 h-14 object-cover rounded-lg border border-gray-200 bg-gray-100 shrink-0"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800';
                                      }}
                                    />
                                    <div>
                                      <div className="font-bold text-gray-900">{p.title}</div>
                                      <div className="text-[10px] text-gray-500 line-clamp-1 max-w-xs">{p.description}</div>
                                      {p.isNewArrival && (
                                        <span className="inline-block mt-0.5 text-[9px] bg-[#4A0E17] text-[#D4AF37] px-1.5 py-0.2 rounded font-bold uppercase">
                                          New Arrival
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-3 font-semibold text-[#A67C1E]">
                                    {p.category}
                                  </td>
                                  <td className="p-3">
                                    <div className="font-bold text-[#4A0E17]">
                                      ₹{p.price.toLocaleString()}
                                    </div>
                                    {p.originalPrice && (
                                      <div className="text-[10px] text-gray-400 line-through">
                                        ₹{p.originalPrice.toLocaleString()}
                                      </div>
                                    )}
                                  </td>
                                  <td className="p-3">
                                    <div className="flex flex-col gap-1.5">
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        {sizesList.map(s => {
                                          const count = getSizeStockCount(p, s);
                                          const isZero = count === 0;
                                          return (
                                            <div 
                                              key={s} 
                                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                                isZero
                                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                                  : count <= 2
                                                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                                                  : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                              }`}
                                            >
                                              <span>{s}:</span>
                                              <span className="font-mono">{count}</span>
                                              <div className="flex items-center ml-0.5 border-l pl-0.5 gap-0.5">
                                                <button
                                                  type="button"
                                                  onClick={() => handleInlineStockAdjust(p, s, -1)}
                                                  disabled={count === 0}
                                                  className="hover:text-red-700 disabled:opacity-30"
                                                  title={`Decrease ${s} stock`}
                                                >
                                                  -
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => handleInlineStockAdjust(p, s, 1)}
                                                  className="hover:text-emerald-700"
                                                  title={`Increase ${s} stock`}
                                                >
                                                  +
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                      <div className="text-[10px] text-gray-500 font-medium">
                                        Total: <strong className={totalUnits === 0 ? 'text-rose-600' : 'text-gray-900'}>{totalUnits} units</strong>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex flex-col items-start gap-1">
                                      <button
                                        onClick={() => handleToggleStock(p)}
                                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border flex items-center gap-1.5 transition-all shadow-sm ${
                                          isStocked
                                            ? isLow
                                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                                            : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-300'
                                        }`}
                                        title="Click to toggle product stock status"
                                      >
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                          isStocked 
                                            ? isLow ? 'bg-amber-500' : 'bg-emerald-600 animate-pulse' 
                                            : 'bg-rose-600'
                                        }`}></span>
                                        <span>{isStocked ? (isLow ? `Low (${totalUnits})` : `In Stock (${totalUnits})`) : 'Out of Stock'}</span>
                                      </button>
                                    </div>
                                  </td>
                                  <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => handleEditProductClick(p)}
                                        className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                                        title="Edit Product Details"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>

                                      <button
                                        onClick={() => setDeleteProductCandidate(p)}
                                        className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                                        title="Delete Product"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {filteredProducts.length > 0 && (
                      <div className="p-3.5 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                        <span className="text-gray-600">
                          Showing <strong className="text-gray-900">{((safeCurrentPage - 1) * pageSize) + 1}</strong> to{' '}
                          <strong className="text-gray-900">{Math.min(safeCurrentPage * pageSize, filteredProducts.length)}</strong> of{' '}
                          <strong className="text-gray-900">{filteredProducts.length}</strong> items
                        </span>

                        {totalPages > 1 && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setCurrentPage(1)}
                              disabled={safeCurrentPage === 1}
                              className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-30 hover:bg-gray-100"
                            >
                              <ChevronsLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={safeCurrentPage === 1}
                              className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-30 hover:bg-gray-100"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>

                            <span className="px-3 py-1 bg-white border border-gray-300 rounded-lg font-bold text-gray-800">
                              Page {safeCurrentPage} of {totalPages}
                            </span>

                            <button
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={safeCurrentPage === totalPages}
                              className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-30 hover:bg-gray-100"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setCurrentPage(totalPages)}
                              disabled={safeCurrentPage === totalPages}
                              className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-30 hover:bg-gray-100"
                            >
                              <ChevronsRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 2: ADD / EDIT PRODUCT FORM */}
              {activeTab === 'add' && (
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm max-w-3xl mx-auto space-y-6">
                  
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <div>
                      <h3 className="font-cinzel text-lg font-bold text-[#4A0E17] flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                        <span>{editingProductId ? 'Edit Product Details' : 'Add New Product to Catalog'}</span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Product data will be saved directly to Firebase Firestore Database &amp; Local Storage.
                      </p>
                    </div>

                    <button
                      onClick={() => { resetForm(); setActiveTab('products'); }}
                      className="text-xs text-gray-500 hover:text-gray-800 underline"
                    >
                      Cancel &amp; Back
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Product Title */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Product Title *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Lotus Print Striped Tissue Saree"
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4A0E17] focus:outline-none"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Category *
                        </label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value as CategoryType)}
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4A0E17] focus:outline-none font-medium"
                        >
                          {availableCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Offer Price / Selling Price */}
                      <div>
                        <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                          Offer Price (Selling Price ₹) *
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 1400"
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          className="w-full px-3 py-2.5 bg-emerald-50/50 border border-emerald-300 rounded-xl text-sm font-bold text-[#4A0E17] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      {/* Original Price (MRP) */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Original Price (MRP ₹ with Strikethrough)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 1800"
                          value={formOriginalPrice}
                          onChange={(e) => setFormOriginalPrice(e.target.value)}
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4A0E17] focus:outline-none"
                        />
                      </div>

                      {/* Available Sizes (M, L, XL, XXL) */}
                      <div className="md:col-span-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Available Sizes * (Click to toggle)
                          </label>
                          <button
                            type="button"
                            onClick={handleSelectStandardSizes}
                            className="text-[11px] text-[#4A0E17] font-bold hover:underline"
                          >
                            + Quick Select (M, L, XL, XXL)
                          </button>
                        </div>

                        {/* Quick M, L, XL, XXL chips */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {allSizesList.map(s => {
                            const isSelected = formSizes.includes(s);
                            const isPopular = ['M', 'L', 'XL', 'XXL'].includes(s);
                            return (
                              <button
                                type="button"
                                key={s}
                                onClick={() => toggleSizeInForm(s)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-[#4A0E17] text-[#D4AF37] border-[#D4AF37] shadow-sm'
                                    : isPopular
                                    ? 'bg-amber-50 text-amber-900 border-amber-200 hover:border-amber-400'
                                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <span>{s}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[11px] text-gray-500">
                          Selected sizes: <strong className="text-gray-900">{formSizes.join(', ')}</strong>
                        </p>
                      </div>

                      {/* Stock Count for each size / product */}
                      <div className="md:col-span-2 bg-amber-50/50 border border-amber-200/80 p-4 rounded-2xl space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A0E17] uppercase tracking-wider">
                              <Boxes className="w-4 h-4 text-[#D4AF37]" />
                              <span>Stock Count per Size (Inventory Management) *</span>
                            </div>
                            <p className="text-[11px] text-gray-600">
                              Set inventory quantity for each selected size. When stock hits 0, it displays 'Out of Stock' and disables WhatsApp ordering.
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleSetAllSizesStock(5)}
                              className="px-2 py-1 rounded-lg bg-white border border-amber-300 text-[10px] font-bold text-amber-900 hover:bg-amber-100"
                            >
                              Set All to 5
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetAllSizesStock(10)}
                              className="px-2 py-1 rounded-lg bg-white border border-amber-300 text-[10px] font-bold text-amber-900 hover:bg-amber-100"
                            >
                              Set All to 10
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetAllSizesStock(0)}
                              className="px-2 py-1 rounded-lg bg-rose-50 border border-rose-300 text-[10px] font-bold text-rose-800 hover:bg-rose-100"
                            >
                              Mark All 0 (Sold Out)
                            </button>
                          </div>
                        </div>

                        {/* Size Stock Input Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                          {formSizes.map(s => {
                            const val = formSizeStock[s] !== undefined ? formSizeStock[s]! : '5';
                            const numVal = parseInt(val) || 0;
                            const isOutOfStock = numVal === 0;

                            return (
                              <div key={s} className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-xs text-gray-900">Size {s}</span>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                    isOutOfStock 
                                      ? 'bg-rose-100 text-rose-800' 
                                      : numVal <= 2 
                                      ? 'bg-amber-100 text-amber-800' 
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {isOutOfStock ? 'Out of Stock' : `${numVal} in stock`}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleStepSizeStock(s, -1)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    value={val}
                                    onChange={(e) => handleSizeStockChange(s, e.target.value)}
                                    placeholder="0"
                                    className="w-full text-center py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-[#4A0E17] focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleStepSizeStock(s, 1)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Calculated Total */}
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-200/50">
                          <span className="text-gray-600">
                            Total Inventory for this Product:
                          </span>
                          <span className="font-extrabold text-gray-900">
                            {formSizes.reduce((acc, s) => acc + (parseInt(formSizeStock[s] || '0') || 0), 0)} Units
                          </span>
                        </div>
                      </div>

                      {/* Product Image */}
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Product Image * (URL or Upload Local Image)
                        </label>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            placeholder="Paste image URL..."
                            value={formImageUrl}
                            onChange={(e) => setFormImageUrl(e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4A0E17] focus:outline-none"
                          />

                          <label className="cursor-pointer px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0">
                            <Upload className="w-4 h-4 text-gray-700" />
                            <span>Upload Image File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {formImageUrl && (
                          <div className="pt-2 flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                            <img
                              src={formImageUrl}
                              alt="Preview"
                              className="w-16 h-20 object-cover rounded-lg border border-gray-300"
                            />
                            <div className="text-xs text-gray-600">
                              <span className="font-bold text-emerald-700">Image Loaded!</span>
                              <p className="text-[10px] text-gray-400 line-clamp-1 max-w-md">{formImageUrl}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Fabric Details */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Fabric &amp; Work Notes
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Kerala Tissue Cotton with Golden Zari Pallu"
                          value={formFabric}
                          onChange={(e) => setFormFabric(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4A0E17] focus:outline-none"
                        />
                      </div>

                      {/* Description */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Product Description
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Details about craftsmanship, weave, draping..."
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4A0E17] focus:outline-none"
                        />
                      </div>

                      {/* Stock Status Selection */}
                      <div className="md:col-span-2 space-y-2 pt-2 border-t border-gray-100">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Inventory Stock Status *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setFormInStock(true)}
                            className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                              formInStock
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20'
                                : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                In Stock (Available)
                              </div>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                Customers can order this product on WhatsApp
                              </p>
                            </div>
                            {formInStock && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => setFormInStock(false)}
                            className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                              !formInStock
                                ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-sm ring-2 ring-rose-500/20'
                                : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                                Out of Stock (Sold Out)
                              </div>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                Displays prominent "Out of Stock" badge
                              </p>
                            </div>
                            {!formInStock && <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />}
                          </button>
                        </div>
                      </div>

                      {/* New Arrival Tag */}
                      <div className="md:col-span-2 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                          <input
                            type="checkbox"
                            checked={formIsNewArrival}
                            onChange={(e) => setFormIsNewArrival(e.target.checked)}
                            className="w-4 h-4 text-[#4A0E17] rounded border-gray-300 focus:ring-[#4A0E17]"
                          />
                          <span>Mark as "New Arrival" Collection</span>
                        </label>
                      </div>

                    </div>

                    <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => { resetForm(); setActiveTab('products'); }}
                        className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-2"
                      >
                        <Flame className="w-4 h-4 text-[#4A0E17]" />
                        <span>{editingProductId ? 'Update in Firestore' : 'Save to Firestore Database'}</span>
                      </button>
                    </div>

                  </form>

                </div>
              )}

              {/* TAB 3: BULK IMPORT TOOLS */}
              {activeTab === 'bulk' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="font-cinzel text-lg font-bold text-[#4A0E17] flex items-center gap-2">
                      <Database className="w-5 h-5 text-amber-600" />
                      <span>Bulk Product Import (CSV &amp; JSON)</span>
                    </h3>
                    <p className="text-xs text-gray-600">
                      Import multiple products at once into your catalog and sync directly to Firebase Firestore.
                    </p>

                    {bulkStatus && (
                      <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                        bulkStatus.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : bulkStatus.type === 'error'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}>
                        <span>{bulkStatus.message}</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-xs font-bold text-gray-700">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="bulkFormat"
                            checked={bulkFormat === 'csv'}
                            onChange={() => setBulkFormat('csv')}
                          />
                          <span>CSV Format</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="bulkFormat"
                            checked={bulkFormat === 'json'}
                            onChange={() => setBulkFormat('json')}
                          />
                          <span>JSON Format</span>
                        </label>
                      </div>

                      <textarea
                        rows={8}
                        value={bulkInputText}
                        onChange={(e) => setBulkInputText(e.target.value)}
                        placeholder={
                          bulkFormat === 'csv'
                            ? 'Title,Category,Price,OriginalPrice,InStock,IsNewArrival,Sizes,ImageUrl,Description\nRoyal Kasavu Saree,Traditional Sarees,1899,2499,TRUE,TRUE,Free Size|M|L,https://...,Festive wear'
                            : '[\n  {\n    "title": "Kasavu Saree",\n    "category": "Traditional Sarees",\n    "price": 1899,\n    "sizes": ["M", "L", "XL"],\n    "imageUrl": "https://..."\n  }\n]'
                        }
                        className="w-full p-3 font-mono text-xs bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A0E17] focus:outline-none"
                      />

                      <button
                        onClick={handleProcessBulkImport}
                        disabled={isProcessingBulk}
                        className="px-6 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold uppercase tracking-wider shadow-md"
                      >
                        {isProcessingBulk ? 'Processing Import...' : 'Start Bulk Import'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: WHATSAPP INQUIRIES LOG */}
              {activeTab === 'inquiries' && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <h3 className="font-cinzel text-base font-bold text-[#4A0E17] flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-emerald-600" />
                      <span>WhatsApp Customer Order Inquiries</span>
                    </h3>
                    <span className="text-xs text-gray-500 font-medium">
                      Total Inquiries: {inquiries.length}
                    </span>
                  </div>

                  {inquiries.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-xs italic">
                      No customer inquiries logged yet. Inquiries automatically record when customers click "Order on WhatsApp"!
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-gray-100 text-gray-700 uppercase font-bold border-b border-gray-200">
                            <th className="p-3">Timestamp</th>
                            <th className="p-3">Product Title</th>
                            <th className="p-3">Selected Size</th>
                            <th className="p-3">WhatsApp Number</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {inquiries.map(inq => (
                            <tr key={inq.id} className="hover:bg-amber-50/50">
                              <td className="p-3 text-gray-500">
                                {new Date(inq.timestamp).toLocaleString()}
                              </td>
                              <td className="p-3 font-bold text-gray-900">
                                {inq.productTitle}
                              </td>
                              <td className="p-3">
                                <span className="bg-[#4A0E17] text-[#D4AF37] px-2 py-0.5 rounded text-[10px] font-bold">
                                  {inq.selectedSize}
                                </span>
                              </td>
                              <td className="p-3 text-emerald-700 font-bold">
                                +{inq.phoneContact}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: FIREBASE CONFIG & SECURITY SETTINGS */}
              {activeTab === 'settings' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  
                  {/* Firebase Firestore Cloud Configuration */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <div className="border-b border-gray-200 pb-3">
                      <h3 className="font-cinzel text-base font-bold text-[#4A0E17] flex items-center gap-2">
                        <Flame className="w-5 h-5 text-amber-500" />
                        <span>Firebase Project Settings</span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Connect your live Firebase Authentication and Firestore database.
                      </p>
                    </div>

                    {fbConfigStatus && (
                      <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                        fbConfigStatus.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        <span>{fbConfigStatus.msg}</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveFirebaseConfig} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Firebase API Key *
                        </label>
                        <input
                          type="text"
                          required
                          value={fbApiKey}
                          onChange={(e) => setFbApiKey(e.target.value)}
                          placeholder="AIzaSy..."
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#4A0E17] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Firebase Project ID *
                        </label>
                        <input
                          type="text"
                          required
                          value={fbProjectId}
                          onChange={(e) => setFbProjectId(e.target.value)}
                          placeholder="yaarika-store-app"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#4A0E17] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Auth Domain
                        </label>
                        <input
                          type="text"
                          value={fbAuthDomain}
                          onChange={(e) => setFbAuthDomain(e.target.value)}
                          placeholder="yaarika-store-app.firebaseapp.com"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#4A0E17] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Firebase App ID
                        </label>
                        <input
                          type="text"
                          value={fbAppId}
                          onChange={(e) => setFbAppId(e.target.value)}
                          placeholder="1:123456789:web:abcdef"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#4A0E17] focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl gold-gradient-btn text-xs font-bold uppercase tracking-wider shadow-md"
                      >
                        Save &amp; Activate Firebase Config
                      </button>
                    </form>
                  </div>

                  {/* Password & Master Admin Security */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <div className="border-b border-gray-200 pb-3">
                      <h3 className="font-cinzel text-base font-bold text-[#4A0E17] flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-amber-600" />
                        <span>Change Master Password</span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Update fallback security password for master admin login.
                      </p>
                    </div>

                    {passChangeMessage && (
                      <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                        passChangeMessage.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        <span>{passChangeMessage.text}</span>
                      </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          required
                          value={currentPassInput}
                          onChange={(e) => setCurrentPassInput(e.target.value)}
                          placeholder="Current password"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#4A0E17] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={newPassInput}
                          onChange={(e) => setNewPassInput(e.target.value)}
                          placeholder="New password"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#4A0E17] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmNewPassInput}
                          onChange={(e) => setConfirmNewPassInput(e.target.value)}
                          placeholder="Confirm new password"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#4A0E17] focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl gold-gradient-btn text-xs font-bold uppercase tracking-wider shadow-md"
                      >
                        Update Master Password
                      </button>
                    </form>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteProductCandidate && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full border border-gray-300 shadow-2xl text-center space-y-4 animate-scale-up">
            <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-bold text-base text-gray-900">
                Confirm Product Deletion
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                Are you sure you want to permanently delete <strong>"{deleteProductCandidate.title}"</strong> from the catalog and Firebase Firestore database?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteProductCandidate(null)}
                className="flex-1 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
              >
                Cancel
              </button>

              <button
                onClick={confirmDeleteProduct}
                className="flex-1 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
