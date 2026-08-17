import React from 'react';
import { Sparkles, ShoppingBag, Truck, MessageCircle, ShieldCheck } from 'lucide-react';
import { CONTACT_NUMBERS } from '../utils/whatsapp';

interface HeroProps {
  onShopClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopClick }) => {
  return (
    <div className="relative bg-[#FAF7F2] overflow-hidden border-b border-[#E6DEC8] py-10 md:py-14 shadow-xs">
      
      {/* Subtle Warm Glow Accents */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF9] via-[#FAF7F2] to-[#F5EFE6] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 relative z-20 text-center">
        <div className="space-y-4 max-w-3xl mx-auto">

          {/* Heading */}
          <h2 style={{ fontFamily: 'Georgia, serif' }} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#4A0E17] leading-tight font-medium tracking-tight">
            Traditional Kerala Sarees &amp; Designer Wear
          </h2>

          {/* Subtitle / Description */}
          <p className="text-[#5C5248] text-xs sm:text-sm font-normal leading-relaxed max-w-2xl mx-auto">
            Exquisite Kasavu craftsmanship meets contemporary fusion aesthetics for the modern woman. Discover handcrafted Tissue Sarees, Kanchi Cotton weaves, Churidar sets, and premium Co-ords with <strong className="text-[#4A0E17] font-semibold">All Kerala Free Shipping</strong>.
          </p>

          {/* Action Buttons */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onShopClick}
              className="bg-[#4A0E17] text-[#D4AF37] hover:bg-[#32080F] hover:text-white px-7 sm:px-8 py-3 text-xs uppercase tracking-widest font-bold transition-all shadow-md rounded-xs border border-[#4A0E17]"
            >
              Explore Collection
            </button>

            <a
              href={`https://wa.me/${CONTACT_NUMBERS[0].value}?text=${encodeURIComponent("Hello Yaarika Collections, I would like to explore your Saree & Co-ord collection.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] text-white hover:bg-emerald-600 px-6 sm:px-7 py-3 text-xs uppercase tracking-widest font-bold transition-all flex items-center gap-2 rounded-xs shadow-md"
            >
              <MessageCircle className="w-4 h-4 fill-white/20" />
              <span>Order on WhatsApp</span>
            </a>
          </div>

          {/* Quick Badges */}
          <div className="pt-6 grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto border-t border-[#D4AF37]/35 text-center">
            <div className="px-1">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#4A0E17]">All Kerala</p>
              <p className="text-[10px] uppercase text-[#7A6E65] font-medium mt-0.5">Free Shipping</p>
            </div>
            <div className="px-1 border-x border-[#D4AF37]/25">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#4A0E17]">100% Authentic</p>
              <p className="text-[10px] uppercase text-[#7A6E65] font-medium mt-0.5">Handloom Quality</p>
            </div>
            <div className="px-1">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#4A0E17]">Inclusive Sizes</p>
              <p className="text-[10px] uppercase text-[#7A6E65] font-medium mt-0.5">Free Size to 3XL</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
