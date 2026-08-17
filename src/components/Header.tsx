import React, { useState } from 'react';
import { Search, Heart, Shield, Phone, Sparkles, Menu, X, ShoppingBag } from 'lucide-react';
import { CategoryType, ViewMode } from '../types';
import { CONTACT_NUMBERS } from '../utils/whatsapp';
import yaarikaLogo from '../assets/images/official_ya_3d_embossed_logo_1786124560431.jpg';

interface HeaderProps {
  activeCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  wishlistCount: number;
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  isAdminSetupComplete: boolean;
  totalResultsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  wishlistCount,
  viewMode,
  onSetViewMode,
  isAdminSetupComplete,
  totalResultsCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories: CategoryType[] = [
    'All',
    'Traditional Sarees',
    'Co-ord Sets',
    'Churidar Sets',
    'Fusion Wear',
    'New Arrivals'
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#4A0E17] text-[#D4AF37] border-b-2 border-[#D4AF37] shadow-lg">
      {/* Top Mini Bar */}
      <div className="bg-black/20 text-[#D4AF37] px-4 sm:px-8 py-1.5 flex justify-between items-center text-[10px] uppercase tracking-widest font-semibold border-b border-[#D4AF37]/20">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
          Pan Kerala Free Shipping
        </span>
        <div className="flex items-center gap-4">
          <a 
            href={`https://wa.me/${CONTACT_NUMBERS[0].value}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <Phone className="w-3 h-3" />
            <span>WhatsApp: +91 99103 96693</span>
          </a>
        </div>
      </div>

      {/* Main Brand & Actions Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-3 pb-2 sm:pt-4 sm:pb-3">
        <div className="relative flex items-center justify-between">
          
          {/* Left Action / Spacer (on desktop) */}
          <div className="flex items-center gap-2 lg:w-48">
            <button
              onClick={() => {
                onSelectCategory('New Arrivals');
                onSetViewMode('catalog');
              }}
              className="bg-[#D4AF37] text-[#4A0E17] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all hidden sm:flex items-center gap-1.5 shadow-md rounded-sm"
            >
              <Sparkles className="w-3 h-3" />
              <span>New Arrivals</span>
            </button>
          </div>

          {/* Centered Brand Title with Monogram Logo */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 cursor-pointer select-none group mx-auto text-center" 
            onClick={() => onSetViewMode('catalog')}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 border-[#D4AF37] shadow-lg group-hover:scale-105 transition-transform bg-[#32080F] flex-shrink-0 flex items-center justify-center p-0.5">
              <img 
                src={yaarikaLogo} 
                alt="Yaarika Collections Logo" 
                className="w-full h-full object-contain rounded-lg border border-[#050505]"
                style={{ borderColor: '#050505' }}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 style={{ fontFamily: 'Georgia, serif' }} className="text-2xl sm:text-3xl lg:text-4xl italic font-extrabold tracking-tight text-[#D4AF37] leading-none drop-shadow-sm">
                Yaarika
              </h1>
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] mt-1 text-white/90 font-bold">
                Collections
              </p>
            </div>
          </div>

          {/* Right Header Actions (Wishlist & Mobile Toggle) */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 lg:w-48">
            {/* Wishlist Button */}
            <button
              onClick={() => onSetViewMode('wishlist')}
              className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all rounded-sm shadow-sm ${
                viewMode === 'wishlist'
                  ? 'bg-[#D4AF37] text-[#4A0E17] border-[#D4AF37]'
                  : 'border-[#D4AF37]/50 bg-black/20 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#4A0E17]'
              }`}
              title="Saved Wishlist"
            >
              <Heart className={`w-3.5 h-3.5 ${wishlistCount > 0 ? 'fill-current text-rose-500' : ''}`} />
              <span className="hidden sm:inline">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="bg-[#4A0E17] text-[#D4AF37] text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-[#D4AF37]/50">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-[#D4AF37] hover:text-white rounded-md hover:bg-black/20"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Centered White-Themed Search Bar directly below Yaarika Collections */}
        <div className="mt-3 sm:mt-4 max-w-xl mx-auto w-full px-2 sm:px-0">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const el = document.getElementById('catalog-grid');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="relative w-full"
          >
            <div className={`flex items-center bg-white rounded-full border-2 p-1 transition-all shadow-md ${
              searchQuery && totalResultsCount === 0
                ? 'border-rose-400 ring-2 ring-rose-400/20'
                : 'border-[#D4AF37] focus-within:ring-2 focus-within:ring-[#D4AF37]/40 focus-within:border-[#4A0E17]'
            }`}>
              <div className="pl-3 sm:pl-3.5 text-[#4A0E17] flex items-center justify-center">
                <Search className="w-4 h-4 text-[#4A0E17]" />
              </div>
              <input
                type="text"
                placeholder="Search Sarees, Co-ords, Churidars, Kurtis..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-white text-gray-900 placeholder:text-gray-400 text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-1.5 sm:py-2 focus:outline-none tracking-normal"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="px-2 text-gray-400 hover:text-[#4A0E17] transition-colors p-1"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {/* Yellow Color Search Button at the End of Search Bar */}
              <button
                type="submit"
                onClick={() => {
                  const el = document.getElementById('catalog-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-[#FACC15] hover:bg-[#EAB308] text-[#32080F] font-extrabold text-xs sm:text-sm px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5 shadow transition-all transform active:scale-95 shrink-0 border border-amber-300 hover:shadow-md cursor-pointer"
                title="Search Products"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span className="font-bold tracking-wide">Search</span>
              </button>
            </div>

            {/* Search feedback tag if searching */}
            {searchQuery && totalResultsCount === 0 && (
              <p className="text-[11px] text-rose-200 mt-1 text-center font-semibold drop-shadow-sm">
                No matching items found. Try a different keyword.
              </p>
            )}
          </form>
        </div>

        {/* Desktop & Tablet Categories Nav Bar */}
        <div className="hidden sm:flex items-center justify-center gap-6 sm:gap-8 mt-4 pt-2.5 border-t border-[#D4AF37]/20 text-[11px] uppercase tracking-widest font-bold">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                onSelectCategory(cat);
                if (viewMode !== 'catalog') onSetViewMode('catalog');
              }}
              className={`transition-all py-1 border-b-2 ${
                activeCategory === cat && viewMode === 'catalog'
                  ? 'border-[#D4AF37] text-white font-extrabold shadow-sm scale-105'
                  : 'border-transparent text-[#D4AF37]/80 hover:text-white hover:border-[#D4AF37]/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Mobile Horizontal Category Pills */}
        <div className="flex sm:hidden items-center gap-2 mt-3 pt-2 border-t border-[#D4AF37]/20 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                onSelectCategory(cat);
                if (viewMode !== 'catalog') onSetViewMode('catalog');
              }}
              className={`text-[10px] uppercase font-bold tracking-wider whitespace-nowrap px-2.5 py-1 rounded-full border transition-all ${
                activeCategory === cat && viewMode === 'catalog'
                  ? 'bg-[#D4AF37] text-[#4A0E17] border-[#D4AF37]'
                  : 'bg-black/20 text-[#D4AF37]/80 border-[#D4AF37]/30 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#32080F] border-t border-[#D4AF37]/30 px-6 py-4 space-y-3">
          <div className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-2">Categories</div>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                  onSetViewMode('catalog');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider text-left border ${
                  activeCategory === cat && viewMode === 'catalog'
                    ? 'bg-[#D4AF37] text-[#4A0E17] border-[#D4AF37]'
                    : 'bg-[#4A0E17] text-[#D4AF37] border-[#D4AF37]/30 hover:bg-[#6A1824]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-[#D4AF37]/20 flex flex-col gap-2">
            <a
              href={`https://wa.me/${CONTACT_NUMBERS[0].value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 bg-[#25D366] text-white text-[11px] font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2 rounded-sm"
            >
              <Phone className="w-4 h-4" /> Order on WhatsApp (+91 99103 96693)
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
