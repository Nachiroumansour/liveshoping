import React from 'react';
import { useCart } from '../contexts/CartContext';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  Share2,
  MessageCircle,
  Menu,
  X
} from 'lucide-react';

const MobileHeader = ({
  seller,
  onShare,
  onToggleMenu,
  isMenuOpen,
  realtimeStatus,
  onToggleCart
}) => {
  const { totalItems } = useCart();

  return (
    <>
      {/* Spacer pour compenser le header fixe */}
      <div className="h-[60px]"></div>

      {/* Header fixe */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100">
        <div className="px-4 py-3 safe-area-top">
          <div className="flex items-center justify-between">
            {/* Logo et nom */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {seller?.logo_url ? (
                <img
                  src={seller.logo_url.startsWith('http') ? seller.logo_url : `${import.meta.env.VITE_BACKEND_URL || 'https://api.livelink.store'}${seller.logo_url}`}
                  alt={seller.name}
                  className="w-9 h-9 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div className={`w-9 h-9 bg-gray-900 rounded-xl items-center justify-center flex-shrink-0 ${seller?.logo_url ? 'hidden' : 'flex'}`}>
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-semibold text-gray-900 truncate text-sm">
                  {seller?.name || 'Boutique'}
                </h1>
                <p className="text-[10px] text-gray-400 truncate">{seller?.description || 'Commande en direct'}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Indicateur temps réel */}
              <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                realtimeStatus === 'active' ? 'bg-green-500' :
                realtimeStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                'bg-gray-300'
              }`} />

              <button
                onClick={onShare}
                className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <Share2 className="w-[18px] h-[18px]" />
              </button>

              <button
                onClick={onToggleCart}
                className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 relative"
              >
                <ShoppingCart className="w-[18px] h-[18px]" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-gray-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              <button
                onClick={() => window.location.href = `/${window.location.pathname.split('/')[1]}/comments`}
                className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <MessageCircle className="w-[18px] h-[18px]" />
              </button>

              <button
                onClick={onToggleMenu}
                className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                {isMenuOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileHeader;
