import React from 'react';
import { Truck, Shield } from 'lucide-react';
import yaarikaLogo from '../assets/images/regenerated_image_1787041751245.png';

interface FooterProps {
  onOpenAdmin: () => void;
  isAdminSetupComplete: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, isAdminSetupComplete }) => {
  return (
    <footer className="bg-[#F3F0E9] border-t border-[#D4AF37]/30 py-6 px-6 sm:px-10 text-[#4A0E17]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Left Trust Highlights */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6">
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

        {/* Center/Right Copyright with Logo */}
        <div className="flex items-center gap-3 text-center sm:text-right">
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
              Handcrafted in Kerala • All Rights Reserved
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};

