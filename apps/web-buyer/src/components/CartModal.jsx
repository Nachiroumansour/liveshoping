import React from 'react';
import { useCart } from '../contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  Package,
  ArrowRight,
  CreditCard
} from 'lucide-react';

const CartModal = ({ isOpen, onClose, onCheckout }) => {
  const { items, total, totalItems, updateQuantity, removeFromCart, clearCart } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full h-[90vh] sm:h-auto sm:max-w-md sm:max-h-[80vh] rounded-t-3xl sm:rounded-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Votre Panier</h2>
              <p className="text-sm text-gray-500">{totalItems} article{totalItems > 1 ? 's' : ''}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Contenu du panier */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Panier vide</h3>
              <p className="text-gray-500 text-sm">Ajoutez des produits pour commencer</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <Card key={item.id} className="border-0 shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {/* Image du produit */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Informations du produit */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                          {item.name}
                        </h4>
                        <p className="text-blue-600 font-semibold text-sm">
                          {item.price.toLocaleString()} FCFA
                        </p>
                      </div>

                      {/* Contrôles de quantité */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 p-0 rounded-full"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 p-0 rounded-full"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>

                        {/* Bouton supprimer */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer avec total et actions */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-4 space-y-3">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-blue-600">
                {total.toLocaleString()} FCFA
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={clearCart}
                className="flex-1 text-gray-600 border-gray-200 hover:bg-gray-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Vider le panier
              </Button>
              
              <Button
                onClick={onCheckout}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Passer la commande
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;


