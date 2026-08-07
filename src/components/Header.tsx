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

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6 text-[11px] uppercase tracking-widest font-bold">
            {categories.slice(0, 4).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                  if (viewMode !== 'catalog') onSetViewMode('catalog');
                }}
                className={`transition-colors py-1 ${
                  activeCategory === cat && viewMode === 'catalog'
                    ? 'border-b-2 border-[#D4AF37] text-white font-extrabold'
                    : 'text-[#D4AF37]/80 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Centered Brand Title with Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group" 
            onClick={() => onSetViewMode('catalog')}
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-lg overflow-hidden border-2 border-[#D4AF37] shadow-md group-hover:scale-105 transition-transform bg-[#4A0E17] flex-shrink-0 flex items-center justify-center p-0.5">
              <img 
                src={yaarikaLogo} 
                alt="Yaarika Collections Logo" 
                className="w-full h-full object-contain border border-[#050505]"
                style={{ borderColor: '#050505' }}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-left">
              <h1 style={{ fontFamily: 'Georgia, serif' }} className="text-2xl sm:text-3xl italic font-bold tracking-tight text-[#D4AF37] leading-none">
                Yaarika
              </h1>
              <p className="text-[9px] uppercase tracking-[0.3em] mt-0.5 text-white/80 font-semibold">
                Collections
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4">
            
            {/* Search Input Bar */}
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="SEARCH..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`bg-transparent border-b text-[11px] pl-2 pr-6 py-1 text-white focus:outline-none w-28 sm:w-40 placeholder:text-[#D4AF37]/50 tracking-wider uppercase transition-colors ${
                  searchQuery && totalResultsCount === 0 
                    ? 'border-rose-400 text-rose-200 focus:border-rose-300' 
                    : 'border-[#D4AF37]/60 focus:border-[#D4AF37]'
                }`}
              />
              {searchQuery ? (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-1 top-1.5 text-[#D4AF37] hover:text-white p-0.5"
                  title="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Search className="w-3.5 h-3.5 absolute right-1 top-2 text-[#D4AF37]" />
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => onSetViewMode('wishlist')}
              className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                viewMode === 'wishlist'
                  ? 'bg-[#D4AF37] text-[#4A0E17] border-[#D4AF37]'
                  : 'border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#4A0E17]'
              }`}
              title="Saved Wishlist"
            >
              <Heart className={`w-3.5 h-3.5 ${wishlistCount > 0 ? 'fill-current text-rose-500' : ''}`} />
              <span className="hidden sm:inline">Saved</span>
              {wishlistCount > 0 && (
                <span className="bg-[#4A0E17] text-[#D4AF37] text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-[#D4AF37]/50">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shop New Arrivals CTA */}
            <button
              onClick={() => {
                onSelectCategory('New Arrivals');
                onSetViewMode('catalog');
              }}
              className="bg-[#D4AF37] text-[#4A0E17] px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all hidden sm:block shadow-md"
            >
              New Arrivals
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-[#D4AF37] hover:text-white"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="sm:hidden mt-3">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="SEARCH CATALOG..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full bg-black/20 border-b text-white placeholder:text-[#D4AF37]/50 text-xs pl-3 pr-8 py-1.5 focus:outline-none uppercase tracking-wider transition-colors ${
                searchQuery && totalResultsCount === 0
                  ? 'border-rose-400 text-rose-200'
                  : 'border-[#D4AF37]/60 focus:border-[#D4AF37]'
              }`}
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1.5 text-[#D4AF37] hover:text-white p-0.5"
                title="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <Search className="w-3.5 h-3.5 absolute right-2 top-2 text-[#D4AF37]" />
            )}
          </div>
        </div>

        {/* Category bar for mobile or extra items */}
        <div className="flex lg:hidden items-center gap-3 mt-3 pt-2 border-t border-[#D4AF37]/20 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                onSelectCategory(cat);
                if (viewMode !== 'catalog') onSetViewMode('catalog');
              }}
              className={`text-[10px] uppercase font-bold tracking-wider whitespace-nowrap pb-1 border-b ${
                activeCategory === cat && viewMode === 'catalog'
                  ? 'border-[#D4AF37] text-white'
                  : 'border-transparent text-[#D4AF37]/70 hover:text-white'
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
