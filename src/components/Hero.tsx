import React from 'react';
import { Sparkles, ShoppingBag, Truck, MessageCircle, ShieldCheck } from 'lucide-react';
import { CONTACT_NUMBERS } from '../utils/whatsapp';

interface HeroProps {
  onShopClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopClick }) => {
  return (
    <div className="relative bg-[#1A1A1A] overflow-hidden border-b-2 border-[#D4AF37]/30 text-white py-12 md:py-16">
      
      {/* Royal Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#4A0E17]/95 via-[#4A0E17]/70 to-transparent z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-8 space-y-4">

            <h2 style={{ fontFamily: 'Georgia, serif' }} className="text-3xl sm:text-4xl md:text-5xl text-white leading-tight font-normal">
              Traditional Kerala Sarees &amp; Designer Wear
            </h2>

            <p className="text-white/80 text-xs sm:text-sm font-light leading-relaxed max-w-xl">
              Exquisite Kasavu craftsmanship meets contemporary fusion aesthetics for the modern woman. Discover handcrafted Tissue Sarees, Kanchi Cotton weaves, Churidar sets, and premium Co-ords with <strong>All Kerala Free Shipping</strong>.
            </p>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={onShopClick}
                className="border border-[#D4AF37] text-[#D4AF37] px-8 py-3 text-xs uppercase tracking-widest font-bold hover:bg-[#D4AF37] hover:text-[#4A0E17] transition-all shadow-md"
              >
                Explore Collection
              </button>

              <a
                href={`https://wa.me/${CONTACT_NUMBERS[0].value}?text=${encodeURIComponent("Hello Yaarika Collections, I would like to explore your Saree & Co-ord collection.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-emerald-600 transition-all flex items-center gap-2 rounded-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order on WhatsApp</span>
              </a>
            </div>

            {/* Quick Badges */}
            <div className="pt-6 grid grid-cols-3 gap-4 max-w-lg border-t border-[#D4AF37]/30 text-left">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">All Kerala</p>
                <p className="text-[9px] uppercase text-white/70">Free Shipping</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">100% Authentic</p>
                <p className="text-[9px] uppercase text-white/70">Handloom Quality</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">Inclusive Sizes</p>
                <p className="text-[9px] uppercase text-white/70">Free Size to 3XL</p>
              </div>
            </div>

          </div>

          {/* Featured Image Frame */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="w-full max-w-xs aspect-[3/4] bg-[#F3F0E9] border-2 border-[#D4AF37]/40 p-2 shadow-2xl relative group">
              <div className="w-full h-full relative overflow-hidden bg-[#2A2A2A]">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800"
                  alt="Yaarika Collections Royal Edit"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#4A0E17]/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <span className="bg-[#4A0E17] text-[#D4AF37] text-[9px] font-bold px-2 py-0.5 border border-[#D4AF37]/40 uppercase tracking-widest">
                    Heritage Wear
                  </span>
                  <p style={{ fontFamily: 'Georgia, serif' }} className="text-sm font-bold text-white mt-1 italic">
                    Classic Gold Kasavu
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
