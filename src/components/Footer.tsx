import React from 'react';
import { Phone, MessageCircle, Truck, Shield, Heart, Sparkles, MapPin, Instagram, Facebook } from 'lucide-react';
import { CONTACT_NUMBERS } from '../utils/whatsapp';
import yaarikaLogo from '../assets/images/official_ya_3d_embossed_logo_1786124560431.jpg';

interface FooterProps {
  onOpenAdmin: () => void;
  isAdminSetupComplete: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, isAdminSetupComplete }) => {
  return (
    <footer className="bg-[#F3F0E9] border-t border-[#D4AF37]/30 py-6 px-6 sm:px-10 text-[#4A0E17]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Trust Highlights */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-[#4A0E17] flex items-center justify-center text-[#4A0E17]">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold leading-none uppercase tracking-wider">ALL KERALA</p>
              <p className="text-[8px] uppercase text-[#4A0E17]/70 mt-0.5">Free Shipping</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-[#4A0E17] flex items-center justify-center text-[#4A0E17]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold leading-none uppercase tracking-wider">100% AUTHENTIC</p>
              <p className="text-[8px] uppercase text-[#4A0E17]/70 mt-0.5">Handloom Quality</p>
            </div>
          </div>
        </div>

        {/* Center Copyright with Logo */}
        <div className="flex items-center gap-3 text-center">
          <img 
            src={yaarikaLogo} 
            alt="Yaarika Logo" 
            className="w-9 h-9 rounded-md border border-[#4A0E17] object-contain bg-[#4A0E17] flex-shrink-0 p-0.5"
            referrerPolicy="no-referrer"
          />
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#4A0E17]">
              © {new Date().getFullYear()} Yaarika Collections • Traditional &amp; Fusion Wear
            </p>
            <p className="text-[9px] text-[#4A0E17]/70 mt-0.5">
              WhatsApp Desk: +91 99103 96693 / +91 99955 92722
            </p>
          </div>
        </div>

        {/* Right Admin Link */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenAdmin}
            className="text-[10px] uppercase font-bold text-[#4A0E17] hover:text-[#D4AF37] transition-colors underline decoration-[#4A0E17]/40"
          >
            Admin
          </button>
          <div className="h-4 w-[1px] bg-[#4A0E17]/20"></div>
          <div className="flex gap-2">
            <a 
              href={`https://wa.me/${CONTACT_NUMBERS[0].value}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="w-6 h-6 bg-[#25D366] rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity"
              title="Order via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
