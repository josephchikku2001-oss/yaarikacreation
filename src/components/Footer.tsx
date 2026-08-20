import React from 'react';
import { Phone, MessageCircle, Truck, Shield, Heart, Sparkles, MapPin, Instagram, Facebook } from 'lucide-react';
import { CONTACT_NUMBERS } from '../utils/whatsapp';
import yaarikaLogo from '../assets/images/regenerated_image_1787041751245.png';

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
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg border border-[#D4AF37] overflow-hidden bg-[#32080F] flex-shrink-0 flex items-center justify-center p-0.5 shadow-sm">
            <img 
              src={yaarikaLogo} 
              alt="Yaarika Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-left">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-[#4A0E17]">
              © {new Date().getFullYear()} Yaarika Collections • Traditional &amp; Fusion Wear
            </p>
            <p className="text-[9px] sm:text-[10px] text-[#4A0E17]/80 mt-0.5">
              WhatsApp Desk: +91 99103 96693 / +91 99955 92722
            </p>
          </div>
        </div>

        {/* Right WhatsApp Helpdesk */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase font-bold text-[#4A0E17]/80 hidden sm:inline">
            Direct Support:
          </span>
          <div className="flex gap-2">
            <a 
              href={`https://wa.me/${CONTACT_NUMBERS[0].value}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3 py-1 bg-[#25D366] text-white rounded-full flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-xs"
              title="Order or Inquire via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
