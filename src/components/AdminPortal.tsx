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
  BarChart3,
  MessageCircle,
  Eye,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileJson,
  Database,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  HardDrive
} from 'lucide-react';
import { Product, CategoryType, SizeType, InquiryLog } from '../types';
import { AdminStorage, ProductStorage, InquiryStorage, MAX_CATALOG_LIMIT } from '../services/storage';

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
  // Setup & Auth States
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(AdminStorage.isSetupComplete());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Form inputs for Registration / Login
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Active Tab inside Admin Dashboard: 'products' | 'add' | 'bulk' | 'settings' | 'inquiries'
  const [activeTab, setActiveTab] = useState<'products' | 'add' | 'bulk' | 'settings' | 'inquiries'>('products');

  // Product List in Admin View
  const [products, setProducts] = useState<Product[]>(ProductStorage.getProducts());
  const [productSearch, setProductSearch] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<'all' | 'instock' | 'outofstock'>('all');

  // Admin Table Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Bulk Manager State
  const [bulkInputText, setBulkInputText] = useState<string>('');
  const [bulkFormat, setBulkFormat] = useState<'csv' | 'json'>('csv');
  const [bulkStatus, setBulkStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isProcessingBulk, setIsProcessingBulk] = useState<boolean>(false);

  // Delete Confirmation Modal State
  const [deleteProductCandidate, setDeleteProductCandidate] = useState<Product | null>(null);

  // Product Add / Edit Form State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<CategoryType>('Traditional Sarees');
  const [formPrice, setFormPrice] = useState<string>('');
  const [formOriginalPrice, setFormOriginalPrice] = useState<string>('');
  const [formSizes, setFormSizes] = useState<SizeType[]>(['Free Size']);
  const [formDescription, setFormDescription] = useState<string>('');
  const [formFabric, setFormFabric] = useState<string>('');
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [formInStock, setFormInStock] = useState<boolean>(true);
  const [formFeatured, setFormFeatured] = useState<boolean>(false);
  const [formIsNewArrival, setFormIsNewArrival] = useState<boolean>(false);

  // Password Management State inside Settings
  const [currentPassInput, setCurrentPassInput] = useState<string>('');
  const [newPassInput, setNewPassInput] = useState<string>('');
  const [confirmNewPassInput, setConfirmNewPassInput] = useState<string>('');
  const [passChangeMessage, setPassChangeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Inquiries State
  const [inquiries, setInquiries] = useState<InquiryLog[]>(InquiryStorage.getInquiries());

  const availableCategories: CategoryType[] = [
    'Traditional Sarees',
    'Co-ord Sets',
    'Churidar Sets',
    'Fusion Wear',
    'New Arrivals'
  ];

  const availableSizesList: SizeType[] = ['Free Size', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

  // Sync state on load
  useEffect(() => {
    setIsSetupComplete(AdminStorage.isSetupComplete());
    setProducts(ProductStorage.getProducts());
  }, []);

  // First-Time Registration Handler
  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!usernameInput.trim() || !passwordInput.trim()) {
      setAuthError('Please fill in both Username and Password.');
      return;
    }

    if (passwordInput !== confirmPasswordInput) {
      setAuthError('Passwords do not match. Please check again.');
      return;
    }

    setAuthLoading(true);
    const res = await AdminStorage.registerFirstAdmin(usernameInput, passwordInput);
    setAuthLoading(false);

    if (res.success) {
      setIsSetupComplete(true);
      setIsAuthenticated(true);
      onToast('Admin Account Created Successfully! Welcome to Yaarika Dashboard.');
    } else {
      setAuthError(res.message);
    }
  };

  // Subsequent Login Handler
  const handleLoginAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!usernameInput.trim() || !passwordInput.trim()) {
      setAuthError('Please enter your Username and Password.');
      return;
    }

    setAuthLoading(true);
    const res = await AdminStorage.login(usernameInput, passwordInput);
    setAuthLoading(false);

    if (res.success) {
      setIsAuthenticated(true);
      onToast('Logged in as Admin successfully.');
    } else {
      setAuthError(res.message);
    }
  };

  // Password Change Handler inside Dashboard Settings
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

  // Image Upload File to Base64 Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        onToast('Image size should be under 2MB for fast local persistence.');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImageUrl(reader.result as string);
        onToast('Image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Add / Save Product Handler
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      onToast('Please enter a Product Title.');
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      onToast('Please enter a valid price in ₹ INR.');
      return;
    }

    if (!formImageUrl.trim()) {
      onToast('Please provide an Image URL or upload an image file.');
      return;
    }

    if (formSizes.length === 0) {
      onToast('Please select at least one available size.');
      return;
    }

    const productPayload = {
      title: formTitle.trim(),
      category: formCategory,
      price: priceNum,
      originalPrice: formOriginalPrice ? parseFloat(formOriginalPrice) : undefined,
      sizes: formSizes,
      description: formDescription.trim() || `${formTitle} by Yaarika Collections`,
      fabricDetails: formFabric.trim(),
      imageUrl: formImageUrl.trim(),
      inStock: formInStock,
      featured: formFeatured,
      isNewArrival: formIsNewArrival
    };

    if (editingProductId) {
      ProductStorage.updateProduct({
        ...productPayload,
        id: editingProductId,
        createdAt: new Date().toISOString()
      });
      onToast(`Updated product "${formTitle}" successfully!`);
    } else {
      ProductStorage.addProduct(productPayload);
      onToast(`Added new product "${formTitle}" to catalog!`);
    }

    // Refresh products state & reset form
    const updated = ProductStorage.getProducts();
    setProducts(updated);
    onRefreshProducts();
    resetForm();
    setActiveTab('products');
  };

  const handleEditProductClick = (p: Product) => {
    setEditingProductId(p.id);
    setFormTitle(p.title);
    setFormCategory(p.category);
    setFormPrice(p.price.toString());
    setFormOriginalPrice(p.originalPrice ? p.originalPrice.toString() : '');
    setFormSizes(p.sizes);
    setFormDescription(p.description);
    setFormFabric(p.fabricDetails || '');
    setFormImageUrl(p.imageUrl);
    setFormInStock(p.inStock);
    setFormFeatured(p.featured || false);
    setFormIsNewArrival(p.isNewArrival || false);
    setActiveTab('add');
  };

  const resetForm = () => {
    setEditingProductId(null);
    setFormTitle('');
    setFormCategory('Traditional Sarees');
    setFormPrice('');
    setFormOriginalPrice('');
    setFormSizes(['Free Size']);
    setFormDescription('');
    setFormFabric('');
    setFormImageUrl('');
    setFormInStock(true);
    setFormFeatured(false);
    setFormIsNewArrival(false);
  };

  const confirmDeleteProduct = () => {
    if (deleteProductCandidate) {
      ProductStorage.deleteProduct(deleteProductCandidate.id);
      const updated = ProductStorage.getProducts();
      setProducts(updated);
      onRefreshProducts();
      onToast(`Deleted "${deleteProductCandidate.title}" from catalog.`);
      setDeleteProductCandidate(null);
    }
  };

  const handleResetCatalogToDefault = () => {
    if (window.confirm('Are you sure you want to reset all products to the default Yaarika Collections catalog? Any custom added items will be replaced.')) {
      const defaults = ProductStorage.resetToDefault();
      setProducts(defaults);
      onRefreshProducts();
      onToast('Catalog reset to default Yaarika Collections products!');
    }
  };

  const toggleSizeInForm = (size: SizeType) => {
    if (formSizes.includes(size)) {
      if (formSizes.length > 1) {
        setFormSizes(formSizes.filter(s => s !== size));
      }
    } else {
      setFormSizes([...formSizes, size]);
    }
  };

  const handleToggleStock = (p: Product) => {
    const updated = ProductStorage.toggleStockStatus(p.id);
    setProducts(updated);
    onRefreshProducts();
    const isNowInStock = !p.inStock;
    onToast(`"${p.title}" is now marked as ${isNowInStock ? 'IN STOCK' : 'OUT OF STOCK'}`);
  };

  // Bulk Management Handlers
  const handleExportCSV = () => {
    try {
      const csv = ProductStorage.exportCatalogCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `yaarika_catalog_${products.length}_products_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onToast(`Exported ${products.length} products to CSV!`);
    } catch (e) {
      onToast('Failed to export CSV: ' + (e as Error).message);
    }
  };

  const handleExportJSON = () => {
    try {
      const json = ProductStorage.exportCatalogJSON();
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `yaarika_catalog_${products.length}_products_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onToast(`Exported ${products.length} products to JSON backup!`);
    } catch (e) {
      onToast('Failed to export JSON: ' + (e as Error).message);
    }
  };

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
            message: `Successfully imported ${res.count.toLocaleString()} products! Total Catalog: ${fresh.length.toLocaleString()} / ${MAX_CATALOG_LIMIT.toLocaleString()}`
          });
          setBulkInputText('');
          onToast(`Imported ${res.count} products successfully!`);
        } else {
          setBulkStatus({
            type: 'error',
            message: res.error || 'Import failed. Please check the data format.'
          });
        }
      } catch (err) {
        setBulkStatus({
          type: 'error',
          message: (err as Error).message || 'Unexpected import error.'
        });
      } finally {
        setIsProcessingBulk(false);
      }
    }, 100);
  };

  const handleBulkFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setBulkInputText(text);
        if (file.name.endsWith('.json')) {
          setBulkFormat('json');
        } else {
          setBulkFormat('csv');
        }
        setBulkStatus({
          type: 'info',
          message: `Loaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB). Click "Start Import" to process.`
        });
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateSampleBatch = (count: number) => {
    if (products.length >= MAX_CATALOG_LIMIT) {
      alert(`Maximum capacity of ${MAX_CATALOG_LIMIT.toLocaleString()} products reached!`);
      return;
    }

    setIsProcessingBulk(true);
    setTimeout(() => {
      const res = ProductStorage.generateDemoBatch(count);
      const fresh = ProductStorage.getProducts();
      setProducts(fresh);
      onRefreshProducts();
      setIsProcessingBulk(false);
      setBulkStatus({
        type: 'success',
        message: `Generated ${res.added.toLocaleString()} realistic boutique products. Total now: ${res.total.toLocaleString()} / ${MAX_CATALOG_LIMIT.toLocaleString()}`
      });
      onToast(`Generated +${res.added} boutique items!`);
    }, 50);
  };

  const handleClearAllCatalog = () => {
    if (window.confirm('DANGER: Are you sure you want to completely clear all products from the catalog? This cannot be undone.')) {
      ProductStorage.clearAllProducts();
      setProducts([]);
      onRefreshProducts();
      onToast('Catalog cleared.');
    }
  };

  // Filtered products list
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase());

    if (stockFilter === 'instock' && !p.inStock) return false;
    if (stockFilter === 'outofstock' && p.inStock) return false;

    return matchesSearch;
  });

  // Reset page to 1 when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [productSearch, stockFilter, pageSize]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedProducts = filteredProducts.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const inStockCount = products.filter(p => p.inStock).length;
  const outOfStockCount = products.filter(p => !p.inStock).length;
  const capacityPercent = Math.min(100, Math.round((products.length / MAX_CATALOG_LIMIT) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      
      <div className="w-full max-w-5xl bg-[#FFFDF9] rounded-3xl shadow-2xl border-2 border-[#D4AF37]/50 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Admin Header Bar */}
        <div className="bg-[#32080F] text-[#FAF6F0] p-4 sm:p-5 border-b border-[#D4AF37]/30 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gold-gradient-bg p-0.5 shadow-md">
              <div className="w-full h-full bg-[#4A0E17] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </div>
            <div>
              <h2 className="font-cinzel text-lg sm:text-xl font-bold gold-gradient-text">
                YAARIKA ADMIN PORTAL
              </h2>
              <p className="text-[11px] text-[#F3E5AB]/80">
                {!isSetupComplete
                  ? 'First-Time Admin Account Setup'
                  : isAuthenticated
                  ? 'Catalog & Storefront Operations Dashboard'
                  : 'Restricted Admin Authorization'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={() => setIsAuthenticated(false)}
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
              Back to Home
            </button>
          </div>
        </div>

        {/* BODY CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAF6F0]">

          {/* STATE 1: FIRST-TIME SETUP (REGISTRATION) */}
          {!isSetupComplete && !isAuthenticated && (
            <div className="max-w-md mx-auto my-6 bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-[#D4AF37]/40 text-center space-y-6">
              
              <div className="w-16 h-16 rounded-full bg-[#4A0E17] text-[#D4AF37] flex items-center justify-center mx-auto border-2 border-[#D4AF37] shadow-lg">
                <KeyRound className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-cinzel text-xl font-bold text-[#4A0E17]">
                  First-Time Admin Registration
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Welcome to Yaarika Collections! No master admin account exists yet. Create your credentials below. 
                  <br />
                  <strong className="text-[#4A0E17] underline">CRITICAL NOTE:</strong> Only ONE admin registration is permitted. Once saved, registration will be permanently disabled.
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-medium flex items-center gap-2 text-left">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterAdmin} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Master Admin Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="e.g. yaarika_admin"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E17]"
                    />
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Admin Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter strong password"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E17]"
                    />
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Confirm Admin Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E17]"
                    />
                    <CheckCircle2 className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 rounded-xl gold-gradient-btn font-bold text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
                >
                  {authLoading ? 'Creating Account...' : 'Create Master Admin Account'}
                </button>
              </form>

            </div>
          )}


          {/* STATE 2: SUBSEQUENT VISITS (LOGIN FORM ONLY) */}
          {isSetupComplete && !isAuthenticated && (
            <div className="max-w-md mx-auto my-8 bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-[#D4AF37]/40 text-center space-y-6">
              
              <div className="w-16 h-16 rounded-full bg-[#4A0E17] text-[#D4AF37] flex items-center justify-center mx-auto border-2 border-[#D4AF37] shadow-lg">
                <Lock className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-cinzel text-xl font-bold text-[#4A0E17]">
                  Admin Portal Authorization
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Please enter your admin credentials to access product management.
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-medium flex items-center gap-2 text-left">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLoginAdmin} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Enter admin username"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E17]"
                    />
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
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
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A0E17]"
                    />
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 rounded-xl gold-gradient-btn font-bold text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
                >
                  {authLoading ? 'Verifying...' : 'Login to Admin Dashboard'}
                </button>
              </form>

              <p className="text-[11px] text-gray-400 italic">
                🔒 Protected System. Registration disabled after initial setup.
              </p>

            </div>
          )}


          {/* STATE 3: AUTHENTICATED ADMIN DASHBOARD */}
          {isAuthenticated && (
            <div className="space-y-6">
              
              {/* Navigation Tabs Bar */}
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
                  <span>Bulk Tools (5,000 Capacity)</span>
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
                  <span>WhatsApp Inquiries Log</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                    activeTab === 'settings'
                      ? 'bg-[#4A0E17] text-[#D4AF37] border border-[#D4AF37] shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>Password & Security</span>
                </button>
              </div>

              {/* TAB 1: VIEW & MANAGE ALL PRODUCTS */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  
                  {/* Capacity Bar & Stats Header */}
                  <div className="bg-gradient-to-r from-[#4A0E17]/10 via-amber-50 to-[#4A0E17]/10 border border-[#D4AF37]/40 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="w-8 h-8 rounded-lg bg-[#4A0E17] text-[#D4AF37] flex items-center justify-center shrink-0 shadow-sm">
                        <HardDrive className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#4A0E17]">Catalog Capacity:</span>
                          <span className="text-xs font-extrabold text-gray-900">{products.length.toLocaleString()} / {MAX_CATALOG_LIMIT.toLocaleString()} products</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                            IndexedDB 5K Ready
                          </span>
                        </div>
                        <div className="w-48 sm:w-64 bg-gray-200 h-2 rounded-full overflow-hidden mt-1.5 border border-gray-300">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 via-[#D4AF37] to-[#4A0E17] transition-all duration-500 rounded-full"
                            style={{ width: `${Math.max(2, (products.length / MAX_CATALOG_LIMIT) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={handleExportCSV}
                        className="px-3 py-1.5 rounded-xl bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        title="Export current catalog as CSV"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Export CSV</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('bulk')}
                        className="px-3 py-1.5 rounded-xl bg-[#4A0E17] text-[#D4AF37] hover:bg-[#32080F] border border-[#D4AF37] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        title="Bulk Upload or Batch Generate"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Bulk Upload / 5K Tools</span>
                      </button>
                    </div>
                  </div>

                  {/* Search and Quick Filters */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                      <div className="relative w-full sm:w-64">
                        <input
                          type="text"
                          placeholder="Search title or category..."
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
                          All ({products.length.toLocaleString()})
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
                          In Stock ({inStockCount.toLocaleString()})
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
                          Out of Stock ({outOfStockCount.toLocaleString()})
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <button
                        onClick={handleResetCatalogToDefault}
                        className="px-3 py-2 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        title="Reset Catalog to default items"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reset Default Catalog</span>
                      </button>

                      <button
                        onClick={() => { resetForm(); setActiveTab('add'); }}
                        className="px-4 py-2 rounded-xl gold-gradient-btn text-xs font-bold flex items-center gap-1.5 shadow"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Product</span>
                      </button>
                    </div>
                  </div>

                  {/* Product Grid / Table */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#32080F] text-[#FAF6F0] text-xs font-bold uppercase tracking-wider">
                            <th className="p-3.5">Product</th>
                            <th className="p-3.5">Category</th>
                            <th className="p-3.5">Price</th>
                            <th className="p-3.5">Sizes</th>
                            <th className="p-3.5">Stock Status (Click to Toggle)</th>
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
                            paginatedProducts.map((p) => (
                              <tr key={p.id} className="hover:bg-amber-50/40 transition-colors">
                                <td className="p-3 flex items-center gap-3">
                                  <img
                                    src={p.imageUrl}
                                    alt={p.title}
                                    className="w-12 h-14 object-cover rounded-lg border border-gray-200 bg-gray-100"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800';
                                    }}
                                  />
                                  <div>
                                    <div className="font-bold text-gray-900">{p.title}</div>
                                    <div className="text-[10px] text-gray-500 line-clamp-1 max-w-xs">{p.description}</div>
                                  </div>
                                </td>
                                <td className="p-3 font-semibold text-[#A67C1E]">
                                  {p.category}
                                </td>
                                <td className="p-3 font-bold text-[#4A0E17]">
                                  ₹{p.price.toLocaleString()}
                                </td>
                                <td className="p-3">
                                  <div className="flex flex-wrap gap-1">
                                    {p.sizes.map(s => (
                                      <span key={s} className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <button
                                    onClick={() => handleToggleStock(p)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border flex items-center gap-1.5 transition-all shadow-sm ${
                                      p.inStock
                                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                                        : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-300'
                                    }`}
                                    title="Click to toggle product stock availability"
                                  >
                                    <span className={`w-2 h-2 rounded-full ${p.inStock ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'}`}></span>
                                    <span>{p.inStock ? 'In Stock' : 'Out of Stock'}</span>
                                  </button>
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleEditProductClick(p)}
                                      className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                                      title="Edit Product"
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
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Table Pagination Controls */}
                    {filteredProducts.length > 0 && (
                      <div className="p-3.5 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 text-gray-600">
                          <span>
                            Showing <strong className="text-gray-900">{((safeCurrentPage - 1) * pageSize) + 1}</strong> to{' '}
                            <strong className="text-gray-900">{Math.min(safeCurrentPage * pageSize, filteredProducts.length).toLocaleString()}</strong> of{' '}
                            <strong className="text-gray-900">{filteredProducts.length.toLocaleString()}</strong> items
                          </span>

                          <div className="flex items-center gap-1.5 pl-3 border-l border-gray-300">
                            <span className="text-[11px] text-gray-500">Per page:</span>
                            <select
                              value={pageSize}
                              onChange={(e) => setPageSize(Number(e.target.value))}
                              className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#4A0E17]"
                            >
                              <option value={10}>10</option>
                              <option value={25}>25</option>
                              <option value={50}>50</option>
                              <option value={100}>100</option>
                            </select>
                          </div>
                        </div>

                        {/* Page Navigation Buttons */}
                        {totalPages > 1 && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setCurrentPage(1)}
                              disabled={safeCurrentPage === 1}
                              className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
                              title="First Page"
                            >
                              <ChevronsLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={safeCurrentPage === 1}
                              className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
                              title="Previous Page"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>

                            <span className="px-3 py-1 bg-white border border-gray-300 rounded-lg font-bold text-gray-800">
                              Page {safeCurrentPage} of {totalPages}
                            </span>

                            <button
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={safeCurrentPage === totalPages}
                              className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
                              title="Next Page"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setCurrentPage(totalPages)}
                              disabled={safeCurrentPage === totalPages}
                              className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
                              title="Last Page"
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

              {/* TAB 3: BULK 5,000 PRODUCTS MANAGEMENT */}
              {activeTab === 'bulk' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  
                  {/* Capacity Overview Card */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl gold-gradient-bg p-0.5 shadow-md">
                          <div className="w-full h-full bg-[#4A0E17] rounded-[14px] flex items-center justify-center">
                            <Database className="w-6 h-6 text-[#D4AF37]" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-cinzel text-lg font-bold text-[#4A0E17]">
                            5,000 Products High-Volume Catalog Engine
                          </h3>
                          <p className="text-xs text-gray-600">
                            IndexedDB persistent database active with automated high-speed caching.
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-[#4A0E17]">
                          {products.length.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500 font-bold"> / {MAX_CATALOG_LIMIT.toLocaleString()} items</span>
                        <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                          {(MAX_CATALOG_LIMIT - products.length).toLocaleString()} slots available
                        </p>
                      </div>
                    </div>

                    {/* Visual Meter */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-gray-700">
                        <span>Database Utilization</span>
                        <span>{((products.length / MAX_CATALOG_LIMIT) * 100).toFixed(1)}% Full</span>
                      </div>
                      <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-gray-200 shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 via-[#D4AF37] to-[#4A0E17] rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(1, (products.length / MAX_CATALOG_LIMIT) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Quick Demo Generation */}
                    <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>Quick Scale Test (Generate Sample Boutique Items)</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Instantly populate high-resolution Kerala Sarees, Co-ord Sets, and Churidars with prices and descriptions to test handling up to 5,000 items:
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          onClick={() => handleGenerateSampleBatch(50)}
                          disabled={isProcessingBulk || products.length >= MAX_CATALOG_LIMIT}
                          className="px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-xs transition-colors disabled:opacity-50"
                        >
                          + Generate 50 Items
                        </button>
                        <button
                          onClick={() => handleGenerateSampleBatch(200)}
                          disabled={isProcessingBulk || products.length >= MAX_CATALOG_LIMIT}
                          className="px-3 py-1.5 rounded-lg bg-amber-300 hover:bg-amber-400 text-amber-950 font-bold text-xs transition-colors disabled:opacity-50"
                        >
                          + Generate 200 Items
                        </button>
                        <button
                          onClick={() => handleGenerateSampleBatch(500)}
                          disabled={isProcessingBulk || products.length >= MAX_CATALOG_LIMIT}
                          className="px-3 py-1.5 rounded-lg bg-[#4A0E17] text-[#D4AF37] hover:bg-[#32080F] font-bold text-xs transition-colors disabled:opacity-50"
                        >
                          + Generate 500 Items
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Export & Import Tools */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                          <span>Bulk CSV / JSON Data Exchange</span>
                        </h4>
                        <p className="text-xs text-gray-500">
                          Export complete catalog backups or import hundreds of products in seconds.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleExportCSV}
                          className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export CSV</span>
                        </button>
                        <button
                          onClick={handleExportJSON}
                          className="px-3 py-2 rounded-xl bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <FileJson className="w-3.5 h-3.5" />
                          <span>Export JSON Backup</span>
                        </button>
                      </div>
                    </div>

                    {/* Import Controls */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-700">Import Format:</span>
                          <button
                            onClick={() => setBulkFormat('csv')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              bulkFormat === 'csv'
                                ? 'bg-[#4A0E17] text-[#D4AF37] shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            CSV (Excel Compatible)
                          </button>
                          <button
                            onClick={() => setBulkFormat('json')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              bulkFormat === 'json'
                                ? 'bg-[#4A0E17] text-[#D4AF37] shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            JSON Array
                          </button>
                        </div>

                        <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center gap-1.5 transition-colors">
                          <Upload className="w-3.5 h-3.5 text-gray-600" />
                          <span>Upload File (.csv / .json)</span>
                          <input
                            type="file"
                            accept=".csv,.json,text/csv,application/json"
                            onChange={handleBulkFileSelected}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {bulkFormat === 'csv' && (
                        <p className="text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-200 font-mono">
                          CSV Header Format: <code className="text-[#4A0E17] font-bold">ID, Title, Category, Price, OriginalPrice, InStock, IsNewArrival, Sizes, ImageUrl, Description</code>
                        </p>
                      )}

                      {/* Text Input Area */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Paste {bulkFormat.toUpperCase()} Data Here:
                        </label>
                        <textarea
                          rows={6}
                          placeholder={
                            bulkFormat === 'csv'
                              ? 'ID,Title,Category,Price,OriginalPrice,InStock,IsNewArrival,Sizes,ImageUrl,Description\nprod-1,"Royal Kasavu Saree","Traditional Sarees",1850,2400,TRUE,TRUE,"Free Size|L","https://...","Exquisite tissue silk..."'
                              : '[{\n  "title": "Royal Kasavu Saree",\n  "category": "Traditional Sarees",\n  "price": 1850,\n  "originalPrice": 2400,\n  "inStock": true,\n  "sizes": ["Free Size"],\n  "imageUrl": "https://...",\n  "description": "Exquisite tissue silk..."\n}]'
                          }
                          value={bulkInputText}
                          onChange={(e) => setBulkInputText(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#4A0E17] focus:outline-none"
                        />
                      </div>

                      {/* Status Feedback */}
                      {bulkStatus && (
                        <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                          bulkStatus.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : bulkStatus.type === 'error'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}>
                          {bulkStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          {bulkStatus.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                          <span>{bulkStatus.message}</span>
                        </div>
                      )}

                      {/* Import Action Buttons */}
                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => setBulkInputText('')}
                          className="text-xs text-gray-500 hover:text-gray-800 underline"
                        >
                          Clear Text
                        </button>

                        <button
                          onClick={handleProcessBulkImport}
                          disabled={isProcessingBulk || !bulkInputText.trim()}
                          className="px-6 py-2.5 rounded-xl gold-gradient-btn font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow hover:shadow-md transition-all disabled:opacity-50"
                        >
                          {isProcessingBulk ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Processing Import...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              <span>Start Bulk Import</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone: Clear Catalog */}
                  <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>Catalog Maintenance</span>
                      </h4>
                      <p className="text-[11px] text-rose-800">
                        Reset catalog to defaults or wipe all products if rebuilding from scratch.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleResetCatalogToDefault}
                        className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-800 text-xs font-bold hover:bg-gray-100 transition-colors"
                      >
                        Reset Defaults
                      </button>
                      <button
                        onClick={handleClearAllCatalog}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
                      >
                        Clear All Catalog
                      </button>
                    </div>
                  </div>

                </div>
              )}


              {/* TAB 2: ADD / EDIT PRODUCT FORM */}
              {activeTab === 'add' && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-w-3xl mx-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
                    <h3 className="font-cinzel text-lg font-bold text-[#4A0E17] flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                      <span>{editingProductId ? 'Edit Product Details' : 'Add New Product to Catalog'}</span>
                    </h3>
                    <button
                      onClick={() => { resetForm(); setActiveTab('products'); }}
                      className="text-xs text-gray-500 hover:text-gray-800 underline"
                    >
                      Cancel & Back
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Title */}
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
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4A0E17] focus:outline-none"
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
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4A0E17] focus:outline-none"
                        >
                          {availableCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Price (₹) */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Price in ₹ INR *
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 1400"
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4A0E17] focus:outline-none"
                        />
                      </div>

                      {/* Original Price */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Original MRP (Optional Strikethrough)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 1800"
                          value={formOriginalPrice}
                          onChange={(e) => setFormOriginalPrice(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4A0E17] focus:outline-none"
                        />
                      </div>

                      {/* Available Sizes */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Available Sizes (Click to toggle)
                        </label>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {availableSizesList.map(s => {
                            const isSelected = formSizes.includes(s);
                            return (
                              <button
                                type="button"
                                key={s}
                                onClick={() => toggleSizeInForm(s)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                                  isSelected
                                    ? 'bg-[#4A0E17] text-[#D4AF37] border-[#D4AF37]'
                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                }`}
                              >
                                {s} {isSelected && '✓'}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Product Description
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Details about craftsmanship, weave, embellishments..."
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4A0E17] focus:outline-none"
                        />
                      </div>

                      {/* Fabric Details */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Fabric & Work Notes
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Kerala Tissue Cotton with Golden Zari Pallu"
                          value={formFabric}
                          onChange={(e) => setFormFabric(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4A0E17] focus:outline-none"
                        />
                      </div>

                      {/* Image Source (URL or File Upload) */}
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Product Image * (URL or Upload Image File)
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
                            <span>Upload Local Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {formImageUrl && (
                          <div className="pt-2 flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
                            <img
                              src={formImageUrl}
                              alt="Preview"
                              className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                            />
                            <div className="text-xs text-gray-600">
                              <span className="font-bold text-emerald-700">Image Loaded!</span>
                              <p className="text-[10px] text-gray-400 line-clamp-1">{formImageUrl}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Stock Availability Selector */}
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
                                Displays prominent "Out of Stock" badge &amp; disables ordering
                              </p>
                            </div>
                            {!formInStock && <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />}
                          </button>
                        </div>
                      </div>

                      {/* Additional Badges Toggle */}
                      <div className="md:col-span-2 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                          <input
                            type="checkbox"
                            checked={formIsNewArrival}
                            onChange={(e) => setFormIsNewArrival(e.target.checked)}
                            className="w-4 h-4 text-[#4A0E17] rounded border-gray-300 focus:ring-[#4A0E17]"
                          />
                          <span>Mark as "New Arrival" Edit</span>
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
                        className="px-6 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold uppercase tracking-wider shadow-md"
                      >
                        {editingProductId ? 'Update Product' : 'Save New Product'}
                      </button>
                    </div>

                  </form>
                </div>
              )}


              {/* TAB 3: INQUIRIES LOG */}
              {activeTab === 'inquiries' && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <h3 className="font-cinzel text-base font-bold text-[#4A0E17] flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-emerald-600" />
                      <span>WhatsApp Customer Order Inquiries History</span>
                    </h3>
                    <span className="text-xs text-gray-500 font-medium">
                      Total Inquiries Logged: {inquiries.length}
                    </span>
                  </div>

                  {inquiries.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-xs italic">
                      No customer WhatsApp inquiries recorded yet. Inquiries automatically log when customers click "Order on WhatsApp"!
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-gray-100 text-gray-700 uppercase font-bold border-b border-gray-200">
                            <th className="p-3">Timestamp</th>
                            <th className="p-3">Product Title</th>
                            <th className="p-3">Selected Size</th>
                            <th className="p-3">Target WhatsApp Desk</th>
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


              {/* TAB 4: PASSWORD MANAGEMENT & SECURITY */}
              {activeTab === 'settings' && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-w-md mx-auto space-y-5">
                  <div className="border-b border-gray-200 pb-3">
                    <h3 className="font-cinzel text-base font-bold text-[#4A0E17] flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-amber-600" />
                      <span>Change Admin Password</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Update your security credentials for future dashboard logins.
                    </p>
                  </div>

                  {passChangeMessage && (
                    <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      passChangeMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {passChangeMessage.type === 'success' ? (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{passChangeMessage.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        required
                        value={currentPassInput}
                        onChange={(e) => setCurrentPassInput(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4A0E17] focus:outline-none"
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
                        placeholder="Enter new password"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4A0E17] focus:outline-none"
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
                        placeholder="Re-enter new password"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4A0E17] focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl gold-gradient-btn text-xs font-bold uppercase tracking-wider shadow-md"
                    >
                      Update Password
                    </button>
                  </form>

                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* DELETE CONFIRMATION PROMPT MODAL */}
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
                Are you sure you want to permanently delete <strong>"{deleteProductCandidate.title}"</strong> from the catalog?
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
