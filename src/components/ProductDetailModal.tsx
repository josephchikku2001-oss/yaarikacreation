import React, { useState } from 'react';
import { X, MessageCircle, Phone, Sparkles, Check, Share2, Heart, Truck, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Product, SizeType } from '../types';
import { createWhatsAppOrderLink, CONTACT_NUMBERS } from '../utils/whatsapp';
import { InquiryStorage } from '../services/storage';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onToast: (msg: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  isWishlisted,
  onToggleWishlist,
  onToast
}) => {
  if (!product) return null;

  const [selectedSize, setSelectedSize] = useState<SizeType>(product.sizes[0] || 'Free Size');
  const [copied, setCopied] = useState(false);

  const handleOrderWhatsApp = (phoneNumber: string, contactLabel: string) => {
    InquiryStorage.logInquiry(product.id, product.title, selectedSize, phoneNumber);
    
    const url = createWhatsAppOrderLink(
      product.title,
      product.price,
      selectedSize,
      phoneNumber
    );

    window.open(url, '_blank', 'noopener,noreferrer');
    onToast(`Opening WhatsApp order with ${contactLabel}`);
  };

  const handleCopyLink = () => {
    const text = `Check out "${product.title}" - ₹${product.price} at Yaarika Collections! WhatsApp Order: +91 9910396693`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    onToast('Inquiry message copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      
      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-[#FDFCF8] overflow-hidden shadow-2xl border-2 border-[#D4AF37] max-h-[90vh] flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 bg-[#4A0E17] text-[#D4AF37] hover:bg-black transition-colors border border-[#D4AF37]/50"
          title="Close Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Column: Image */}
        <div className="md:w-1/2 relative bg-[#F3F0E9] p-4 flex items-center justify-center border-b md:border-b-0 md:border-r border-[#D4AF37]/30">
          <div className="relative w-full aspect-[3/4] overflow-hidden border border-[#D4AF37]/30">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover object-top"
            />
            
            {product.isNewArrival && (
              <span className="absolute top-3 left-3 bg-[#4A0E17] text-[#D4AF37] text-[9px] font-bold px-2.5 py-1 border border-[#D4AF37] uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" /> New Edit
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Details & Order CTA */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto space-y-4">
          
          <div>
            {/* Category & Shipping Badge */}
            <div className="flex items-center justify-between text-[10px] mb-2">
              <span className="font-bold text-[#4A0E17] uppercase tracking-widest">{product.category}</span>
              <span className="text-[#4A0E17] bg-[#D4AF37]/20 font-bold px-2 py-0.5 border border-[#D4AF37]/40 text-[9px] flex items-center gap-1 uppercase tracking-wider">
                <Truck className="w-3 h-3" /> All Kerala Free Shipping
              </span>
            </div>

            {/* Title */}
            <h2 style={{ fontFamily: 'Georgia, serif' }} className="text-2xl font-bold text-[#1A1A1A] mb-2 leading-tight">
              {product.title}
            </h2>

            {/* Price Tag & Stock Badge */}
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <div className="flex items-baseline gap-3">
                <span style={{ fontFamily: 'Georgia, serif' }} className="text-2xl italic font-bold text-[#4A0E17]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {product.inStock ? (
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-1 border border-emerald-300 rounded-md flex items-center gap-1 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  In Stock
                </span>
              ) : (
                <span className="bg-rose-100 text-rose-900 text-[10px] font-extrabold px-2.5 py-1 border border-rose-400 rounded-md flex items-center gap-1 uppercase tracking-wider">
                  <AlertTriangle className="w-3 h-3 text-rose-700" />
                  Out of Stock
                </span>
              )}
            </div>

            {/* Description */}
            <div className="text-xs text-gray-700 leading-relaxed space-y-1.5 mb-4 bg-[#F3F0E9] p-3 border border-[#D4AF37]/30">
              <p><strong>Description:</strong> {product.description}</p>
              {product.fabricDetails && (
                <p><strong>Fabric &amp; Work:</strong> {product.fabricDetails}</p>
              )}
            </div>

            {/* Size Selector */}
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-[#4A0E17] mb-1.5 uppercase tracking-widest">
                Select Size: <span className="text-[#4A0E17]">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-3 py-1 text-xs font-bold uppercase border transition-all ${
                      selectedSize === s
                        ? 'bg-[#4A0E17] text-[#D4AF37] border-[#D4AF37]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#D4AF37]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Action Area: WhatsApp Direct Order Numbers */}
          <div className="space-y-2 pt-2 border-t border-[#D4AF37]/30">
            <p className="text-[10px] font-bold text-[#4A0E17] uppercase tracking-wider flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct WhatsApp Desk:</span>
            </p>

            {/* Button 1: Primary Order Desk */}
            {product.inStock ? (
              <button
                onClick={() => handleOrderWhatsApp(CONTACT_NUMBERS[0].value, CONTACT_NUMBERS[0].display)}
                className="w-full py-2.5 px-4 bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-all rounded-sm hover:opacity-90 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Primary Desk ({CONTACT_NUMBERS[0].display})</span>
                </div>
                <span className="text-[9px] bg-black/20 px-2 py-0.5 font-normal">Order Now</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full py-2.5 px-4 bg-gray-200 text-gray-500 border border-gray-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed rounded-sm"
              >
                <AlertTriangle className="w-4 h-4 text-gray-500" />
                <span>Currently Out of Stock / Sold Out</span>
              </button>
            )}

            {/* Secondary Actions */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={() => onToggleWishlist(product.id)}
                className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider border flex items-center justify-center gap-1.5 transition-colors ${
                  isWishlisted
                    ? 'bg-[#4A0E17] text-[#D4AF37] border-[#D4AF37]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#D4AF37]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
                <span>{isWishlisted ? 'Saved' : 'Wishlist'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex-1 py-2 px-3 bg-white text-gray-700 border border-gray-300 hover:border-[#D4AF37] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Share'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
