import React, { useState } from 'react';
import { Heart, MessageCircle, Eye, Tag, Sparkles, AlertCircle } from 'lucide-react';
import { Product, SizeType } from '../types';
import { createWhatsAppOrderLink, CONTACT_NUMBERS } from '../utils/whatsapp';
import { InquiryStorage } from '../services/storage';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onToast: (msg: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onToast
}) => {
  // Default selected size is first size available
  const [selectedSize, setSelectedSize] = useState<SizeType>(product.sizes[0] || 'Free Size');

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleWhatsAppOrder = (phone: string = CONTACT_NUMBERS[0].value) => {
    if (!product.inStock) {
      onToast('This product is currently out of stock.');
      return;
    }

    // Log inquiry for admin analytics
    InquiryStorage.logInquiry(product.id, product.title, selectedSize, phone);
    
    const url = createWhatsAppOrderLink(
      product.title,
      product.price,
      selectedSize,
      phone
    );

    window.open(url, '_blank', 'noopener,noreferrer');
    onToast(`Opening WhatsApp order for ${product.title} (${selectedSize})`);
  };

  return (
    <div className={`group bg-[#FDFCF8] p-3 border transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md ${
      product.inStock ? 'border-[#D4AF37]/20 hover:border-[#D4AF37]/60' : 'border-rose-200 bg-rose-50/20'
    }`}>
      
      {/* Top Aspect Ratio Frame */}
      <div className="aspect-[3/4] bg-[#F3F0E9] border border-[#D4AF37]/20 relative mb-3 overflow-hidden">
        
        {/* Main Product Image */}
        <img
          src={product.imageUrl}
          alt={product.title}
          className={`w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 cursor-pointer ${
            !product.inStock ? 'opacity-80 grayscale-[20%]' : ''
          }`}
          loading="lazy"
          onClick={() => onQuickView(product)}
        />

        {/* Out of Stock Overlay Ribbon / Badge */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center p-2 z-10 pointer-events-none">
            <span className="bg-rose-900/90 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1.5 border border-rose-300/60 shadow-lg flex items-center gap-1.5 rounded-sm">
              <AlertCircle className="w-3.5 h-3.5 text-rose-300" />
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Top Right Badge */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
          {!product.inStock ? (
            <span className="bg-rose-800 text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider border border-rose-400">
              SOLD OUT
            </span>
          ) : (
            <>
              {product.isNewArrival && (
                <span className="bg-[#4A0E17] text-[#D4AF37] text-[9px] px-2 py-1 font-bold tracking-widest uppercase border border-[#D4AF37]/30">
                  NEW
                </span>
              )}
              {discountPercent > 0 && (
                <span className="bg-[#D4AF37] text-[#4A0E17] text-[9px] font-bold px-2 py-0.5 uppercase">
                  {discountPercent}% OFF
                </span>
              )}
            </>
          )}
        </div>

        {/* Wishlist Icon Button */}
        <button
          onClick={() => onToggleWishlist(product.id)}
          className={`absolute top-3 left-3 p-1.5 backdrop-blur-md transition-transform active:scale-95 z-20 border ${
            isWishlisted
              ? 'bg-[#4A0E17] text-[#D4AF37] border-[#D4AF37]'
              : 'bg-white/90 text-gray-700 border-gray-200 hover:text-[#4A0E17]'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button on Hover */}
        <button
          onClick={() => onQuickView(product)}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#4A0E17] text-[#D4AF37] text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-[#D4AF37]/50 z-20"
        >
          Quick View
        </button>
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1">
            <h4 
              onClick={() => onQuickView(product)}
              className="text-xs font-bold uppercase tracking-wide truncate cursor-pointer hover:text-[#4A0E17] transition-colors flex-1"
              title={product.title}
            >
              {product.title}
            </h4>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <p style={{ fontFamily: 'Georgia, serif' }} className="text-[#4A0E17] text-sm italic font-bold">
              ₹{product.price.toLocaleString('en-IN')}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] text-gray-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Sizes Pill selector */}
          <div className="mt-2 pt-2 border-t border-[#D4AF37]/20">
            <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">
              Sizes: <span className="font-bold text-[#4A0E17]">{selectedSize}</span>
            </p>
            <div className="flex flex-wrap gap-1">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`text-[9px] px-1.5 py-0.5 uppercase font-bold border transition-colors ${
                    selectedSize === s
                      ? 'bg-[#4A0E17] text-[#D4AF37] border-[#D4AF37]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#D4AF37]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order on WhatsApp CTA or Out of Stock */}
        <button
          onClick={() => handleWhatsAppOrder(CONTACT_NUMBERS[0].value)}
          disabled={!product.inStock}
          className={`mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold uppercase rounded-sm transition-all ${
            product.inStock
              ? 'bg-[#25D366] text-white hover:opacity-90 shadow-sm'
              : 'bg-gray-200 text-gray-500 border border-gray-300 cursor-not-allowed'
          }`}
        >
          {product.inStock ? (
            <>
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>Order on WhatsApp</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-gray-500" />
              <span>Out of Stock</span>
            </>
          )}
        </button>

      </div>

    </div>
  );
};
