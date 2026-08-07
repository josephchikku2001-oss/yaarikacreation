import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AdminPortal } from './components/AdminPortal';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { CategoryType, Product, ViewMode } from './types';
import { ProductStorage, WishlistStorage, AdminStorage } from './services/storage';
import { Sparkles, Heart, Filter, MessageCircle, ArrowRight, ShieldCheck, Check, SearchX, AlertTriangle, RotateCcw, Search } from 'lucide-react';
import { CONTACT_NUMBERS } from './utils/whatsapp';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('catalog');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAdminSetupComplete, setIsAdminSetupComplete] = useState<boolean>(false);

  // Initial Data Load
  useEffect(() => {
    const loadedProducts = ProductStorage.getProducts();
    setProducts(loadedProducts);
    setWishlist(WishlistStorage.getWishlist());
    setIsAdminSetupComplete(AdminStorage.isSetupComplete());
  }, []);

  const refreshProducts = () => {
    const fresh = ProductStorage.getProducts();
    setProducts(fresh);
    setIsAdminSetupComplete(AdminStorage.isSetupComplete());
  };

  const handleToggleWishlist = (productId: string) => {
    const updated = WishlistStorage.toggleWishlist(productId);
    setWishlist(updated);
    if (updated.includes(productId)) {
      setToastMessage('Added item to your Wishlist ❤️');
    } else {
      setToastMessage('Removed item from Wishlist');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Filtered Products Calculation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category Filter
      if (activeCategory === 'New Arrivals') {
        if (!p.isNewArrival) return false;
      } else if (activeCategory !== 'All' && p.category !== activeCategory) {
        return false;
      }

      // Wishlist Mode Filter
      if (viewMode === 'wishlist' && !wishlist.includes(p.id)) {
        return false;
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchSizes = p.sizes.some(s => s.toLowerCase().includes(q));
        const matchFabric = p.fabricDetails?.toLowerCase().includes(q);
        if (!matchTitle && !matchCat && !matchDesc && !matchSizes && !matchFabric) {
          return false;
        }
      }

      return true;
    });
  }, [products, activeCategory, searchQuery, wishlist, viewMode]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF8] text-[#1A1A1A]">
      
      {/* HEADER NAVBAR */}
      <Header
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          if (viewMode !== 'catalog') setViewMode('catalog');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        wishlistCount={wishlist.length}
        viewMode={viewMode}
        onSetViewMode={(mode) => {
          setViewMode(mode);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isAdminSetupComplete={isAdminSetupComplete}
        totalResultsCount={filteredProducts.length}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1">
        
        {/* HERO BANNER (Only on Catalog Mode & No Active Search) */}
        {viewMode === 'catalog' && !searchQuery && (
          <Hero 
            onShopClick={() => {
              const el = document.getElementById('catalog-grid');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} 
          />
        )}

        {/* CATALOG / WISHLIST CONTAINER */}
        <div id="catalog-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          
          {/* Section Heading & Category Filters */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-6">
              <h3 style={{ fontFamily: 'Georgia, serif' }} className="text-2xl italic font-bold text-[#1A1A1A]">
                {viewMode === 'wishlist'
                  ? 'Wishlist Collection'
                  : activeCategory === 'All'
                  ? 'Featured Ensembles'
                  : `${activeCategory} Collection`}
              </h3>
              <div className="h-[1px] flex-1 bg-[#D4AF37]/30 mx-4 sm:mx-8 mb-2"></div>
              {viewMode === 'catalog' && (
                <button
                  onClick={() => setActiveCategory('All')}
                  className="text-[10px] uppercase tracking-widest text-[#4A0E17] font-bold hover:text-[#D4AF37] transition-colors whitespace-nowrap"
                >
                  View All Products
                </button>
              )}
            </div>

            {/* Quick Category Tabs */}
            {viewMode === 'catalog' && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {(['All', 'Traditional Sarees', 'Co-ord Sets', 'Churidar Sets', 'Fusion Wear', 'New Arrivals'] as CategoryType[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 text-[10px] uppercase tracking-widest font-bold transition-all whitespace-nowrap border ${
                      activeCategory === cat
                        ? 'bg-[#4A0E17] text-[#D4AF37] border-[#D4AF37]'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#D4AF37]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Search Notification */}
          {searchQuery && (
            <div className={`mb-6 p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-all shadow-sm ${
              filteredProducts.length === 0
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-[#4A0E17]/10 border-[#D4AF37]/30 text-[#32080F]'
            }`}>
              <div className="flex items-center gap-2">
                <Search className={`w-4 h-4 shrink-0 ${filteredProducts.length === 0 ? 'text-rose-600' : 'text-[#4A0E17]'}`} />
                <span>
                  Search results for: <strong className="underline font-bold">"{searchQuery}"</strong>
                </span>
                {filteredProducts.length === 0 ? (
                  <span className="bg-rose-700 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ml-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-200" />
                    Invalid Search
                  </span>
                ) : (
                  <span className="bg-[#4A0E17] text-[#D4AF37] text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found
                  </span>
                )}
              </div>
              <button 
                onClick={() => setSearchQuery('')}
                className="text-[#4A0E17] font-bold underline hover:text-[#D4AF37] self-end sm:self-auto flex items-center gap-1 text-xs"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* PRODUCTS GRID */}
          {filteredProducts.length === 0 ? (
            <div className={`text-center py-12 px-6 sm:px-8 rounded-3xl border p-8 space-y-4 max-w-lg mx-auto shadow-md transition-all ${
              searchQuery ? 'bg-rose-50/40 border-2 border-rose-200' : 'bg-white border-dashed border-[#D4AF37]/40'
            }`}>
              
              {searchQuery ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto border-2 border-rose-300 shadow-inner">
                    <SearchX className="w-8 h-8 text-rose-700" />
                  </div>

                  <div className="inline-block bg-rose-800 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-rose-400 shadow-sm">
                    ⚠️ Invalid Search Query
                  </div>

                  <h3 style={{ fontFamily: 'Georgia, serif' }} className="text-xl sm:text-2xl italic font-bold text-rose-950">
                    No Products Found for "{searchQuery}"
                  </h3>

                  <p className="text-xs text-rose-900 leading-relaxed max-w-md mx-auto font-medium">
                    നിങ്ങൾ തിരഞ്ഞ <strong>"{searchQuery}"</strong> എന്ന വാക്കിന് യോജിച്ച ഉൽപ്പന്നങ്ങളൊന്നും കാറ്റലോഗിൽ കണ്ടെത്തിയില്ല. ദയവായി അക്ഷരത്തെറ്റുകൾ പരിശോധിക്കുക അല്ലെങ്കിൽ താഴെ നൽകിയിരിക്കുന്ന കീവേഡുകൾ ഉപയോഗിക്കുക.
                  </p>

                  <div className="pt-2 border-t border-rose-200/60 text-left">
                    <p className="text-[11px] font-bold text-gray-700 mb-2 text-center uppercase tracking-wider">
                      Popular Search Suggestions:
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {['Saree', 'Co-ord', 'Churidar', 'Cotton', 'Silk', 'Kanchipuram'].map((suggest) => (
                        <button
                          key={suggest}
                          onClick={() => setSearchQuery(suggest)}
                          className="px-2.5 py-1 bg-white hover:bg-[#4A0E17] hover:text-[#D4AF37] text-gray-800 text-[11px] font-semibold rounded-md border border-gray-300 transition-all shadow-xs"
                        >
                          {suggest}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={() => {
                        setViewMode('catalog');
                        setActiveCategory('All');
                        setSearchQuery('');
                      }}
                      className="px-6 py-2.5 rounded-xl bg-[#4A0E17] text-[#D4AF37] border border-[#D4AF37] hover:bg-[#32080F] text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 mx-auto"
                    >
                      <RotateCcw className="w-4 h-4 text-[#D4AF37]" />
                      <span>Clear Search &amp; Show All Products</span>
                    </button>
                  </div>
                </>
              ) : viewMode === 'wishlist' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-[#FAF6F0] text-[#D4AF37] flex items-center justify-center mx-auto border border-[#D4AF37]">
                    <Heart className="w-8 h-8" />
                  </div>
                  <h3 className="font-cinzel text-lg font-bold text-[#32080F]">Your Wishlist is Empty</h3>
                  <p className="text-xs text-gray-600">
                    Explore our traditional Kerala Sarees, Co-ord sets, and Churidar collections to save items here!
                  </p>
                  <button
                    onClick={() => {
                      setViewMode('catalog');
                      setActiveCategory('All');
                      setSearchQuery('');
                    }}
                    className="px-6 py-2.5 rounded-full gold-gradient-btn text-xs font-bold uppercase tracking-wider"
                  >
                    Browse All Products
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-[#FAF6F0] text-[#D4AF37] flex items-center justify-center mx-auto border border-[#D4AF37]">
                    <Filter className="w-8 h-8" />
                  </div>
                  <h3 className="font-cinzel text-lg font-bold text-[#32080F]">No Products in this Category</h3>
                  <p className="text-xs text-gray-600">
                    Try selecting a different category or view all products.
                  </p>
                  <button
                    onClick={() => {
                      setViewMode('catalog');
                      setActiveCategory('All');
                      setSearchQuery('');
                    }}
                    className="px-6 py-2.5 rounded-full gold-gradient-btn text-xs font-bold uppercase tracking-wider"
                  >
                    View All Categories
                  </button>
                </>
              )}

            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlist.includes(product.id)}
                  onToggleWishlist={handleToggleWishlist}
                  onQuickView={(p) => setSelectedProduct(p)}
                  onToast={showToast}
                />
              ))}
            </div>
          )}

        </div>

      </main>

      {/* FOOTER */}
      <Footer
        onOpenAdmin={() => {
          setViewMode('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isAdminSetupComplete={isAdminSetupComplete}
      />

      {/* QUICK VIEW / DETAIL MODAL */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isWishlisted={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onToast={showToast}
      />

      {/* ADMIN PORTAL OVERLAY */}
      {viewMode === 'admin' && (
        <AdminPortal
          onClose={() => setViewMode('catalog')}
          onToast={showToast}
          onRefreshProducts={refreshProducts}
        />
      )}

      {/* TOAST NOTIFICATION */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

    </div>
  );
}
