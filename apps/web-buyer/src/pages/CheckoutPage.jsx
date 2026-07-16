import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import {
  ArrowLeft,
  CreditCard,
  User,
  Package,
  ShoppingCart,
  Check,
  Copy,
  MapPin,
  Phone,
  MessageSquare,
  Camera
} from 'lucide-react';
import ImageCapture from '@/components/ImageCapture';
import { getApiUrl, getImageUrl } from '../config/domains';

const CheckoutPage = () => {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    payment_method: '',
    payment_proof_url: '',
    comment: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState({
    wave: { available: false },
    orange_money: { available: false },
    manual: { available: true }
  });
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [copiedPhone, setCopiedPhone] = useState(false);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      const apiUrl = getApiUrl(`/public/${linkId}/payment-methods`);
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.data);
      }
    } catch (error) {
      console.error('Erreur récupération méthodes paiement:', error);
    }
  }, [linkId]);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentMethodSelect = (method) => {
    setFormData(prev => ({ ...prev, payment_method: method }));
    setSelectedPaymentMethod(method);
  };

  const handleQRCodePayment = () => {
    setShowQRModal(false);
  };

  const handleCopyPhone = (phone) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!formData.customer_name || !formData.customer_phone || !formData.payment_method) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      const combinedComment = `${formData.comment || ''}${paymentReference ? (formData.comment ? ' | ' : '') + 'Réf: ' + paymentReference : ''}`;

      const orders = items.map(item => ({
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_address: formData.customer_address,
        payment_method: formData.payment_method,
        payment_proof_url: formData.payment_proof_url,
        comment: combinedComment,
        product_id: item.id,
        quantity: item.quantity
      }));

      const apiUrl = getApiUrl(`/public/${linkId}/orders`);

      const responses = await Promise.all(
        orders.map(order =>
          fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
          })
        )
      );

      const results = await Promise.all(
        responses.map(async (response, index) => {
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erreur commande ${index + 1}: ${errorData.error || 'Erreur inconnue'}`);
          }
          return response.json();
        })
      );

      clearCart();
      navigate(`/${linkId}/confirmation`, {
        state: {
          orders: results.map(r => r.order),
          items: items,
          isMultipleOrders: true
        }
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = formData.customer_name && formData.customer_phone && formData.payment_method;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-6 h-6 text-gray-300" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Panier vide</h2>
          <p className="text-sm text-gray-400 mb-5">Ajoutez des produits pour passer commande</p>
          <button
            onClick={() => navigate(`/${linkId}`)}
            className="bg-gray-900 text-white text-sm font-medium px-6 py-2.5 rounded-xl"
          >
            Retour à la boutique
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center">
          <button
            onClick={() => navigate(`/${linkId}`)}
            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 -ml-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-center text-sm font-semibold text-gray-900">Finaliser la commande</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">

          {error && (
            <div className="bg-red-50 rounded-xl px-4 py-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Résumé commande */}
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Votre commande</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {items.map((item) => (
                <div key={item.id} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">Qté: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 shrink-0">
                    {(item.price * item.quantity).toLocaleString()} F
                  </p>
                </div>
              ))}
            </div>
            <div className="px-5 py-3.5 bg-gray-50/50 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Total</span>
              <span className="text-base font-bold text-gray-900">{total.toLocaleString()} FCFA</span>
            </div>
          </div>

          {/* Informations client */}
          <div className="bg-white rounded-2xl px-5 py-5 space-y-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Vos informations</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">Nom complet *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  placeholder="Votre nom"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">Numéro de téléphone *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                  placeholder="+221 7X XXX XX XX"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">Adresse de livraison</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  value={formData.customer_address}
                  onChange={(e) => handleInputChange('customer_address', e.target.value)}
                  placeholder="Adresse, quartier, repères..."
                  rows={2}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Paiement */}
          <div className="bg-white rounded-2xl px-5 py-5 space-y-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Paiement</h2>

            <div className="space-y-2.5">
              {/* Wave */}
              <button
                type="button"
                onClick={() => handlePaymentMethodSelect('wave')}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                  formData.payment_method === 'wave'
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-100 bg-white'
                }`}
              >
                <div className="w-10 h-10 bg-[#1DC3F0] rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">Wave</p>
                  <p className="text-[11px] text-gray-400">Paiement mobile</p>
                </div>
                {formData.payment_method === 'wave' && (
                  <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </button>

              {/* Orange Money */}
              <button
                type="button"
                onClick={() => handlePaymentMethodSelect('orange_money')}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                  formData.payment_method === 'orange_money'
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-100 bg-white'
                }`}
              >
                <div className="w-10 h-10 bg-[#FF6600] rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-xs">OM</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">Orange Money</p>
                  <p className="text-[11px] text-gray-400">Paiement mobile</p>
                </div>
                {formData.payment_method === 'orange_money' && (
                  <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </button>

              {/* Espèces */}
              <button
                type="button"
                onClick={() => handlePaymentMethodSelect('cash')}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                  formData.payment_method === 'cash'
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-100 bg-white'
                }`}
              >
                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">💵</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">Espèces à la livraison</p>
                  <p className="text-[11px] text-gray-400">Paiement à la réception</p>
                </div>
                {formData.payment_method === 'cash' && (
                  <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </button>
            </div>

            {/* Instructions paiement mobile */}
            {(formData.payment_method === 'wave' || formData.payment_method === 'orange_money') && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Montant à payer</span>
                  <span className="text-sm font-bold text-gray-900">{total.toLocaleString()} FCFA</span>
                </div>

                {paymentMethods?.[formData.payment_method]?.phone ? (
                  <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5">
                    <span className="text-sm font-medium text-gray-900 font-mono">
                      {paymentMethods[formData.payment_method].phone}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyPhone(paymentMethods[formData.payment_method].phone)}
                      className={`text-xs font-medium flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                        copiedPhone ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {copiedPhone ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedPhone ? 'Copié' : 'Copier'}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    Le vendeur n'a pas encore renseigné de numéro pour ce moyen.
                  </p>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Référence de transaction</label>
                  <input
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Référence après paiement"
                    className="w-full px-3.5 py-2.5 bg-white border-0 rounded-lg text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Preuve de paiement</label>
                  <div className="mt-1">
                    <ImageCapture
                      onImageCaptured={(imageUrl) => handleInputChange('payment_proof_url', imageUrl)}
                      onImageRemoved={() => handleInputChange('payment_proof_url', '')}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Commentaire */}
          <div className="bg-white rounded-2xl px-5 py-5 space-y-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Commentaire</h2>
            <div className="relative">
              <MessageSquare className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <textarea
                value={formData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                placeholder="Instructions spéciales (optionnel)"
                rows={2}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
              />
            </div>
          </div>

          {/* Bouton commander */}
          <div className="sticky bottom-0 bg-gradient-to-t from-gray-50 via-gray-50/95 to-transparent pt-4 pb-6 -mx-4 px-4">
            <button
              type="submit"
              disabled={submitting || !isFormValid}
              className={`w-full h-[52px] rounded-2xl text-sm font-semibold transition-all ${
                submitting || !isFormValid
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-900 text-white active:bg-gray-800'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Traitement...
                </span>
              ) : (
                `Commander · ${total.toLocaleString()} FCFA`
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal QR Code */}
      {showQRModal && selectedPaymentMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowQRModal(false)} />
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-6">
            <div className="text-center">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Paiement {selectedPaymentMethod === 'wave' ? 'Wave' : 'Orange Money'}
              </h3>
              <div className="mb-5">
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <img
                    src={getImageUrl(paymentMethods[selectedPaymentMethod]?.qr_code_url)}
                    alt={`QR Code ${selectedPaymentMethod}`}
                    className="w-44 h-44 mx-auto"
                  />
                </div>
                <p className="text-sm text-gray-500 mb-1">Montant : <span className="font-semibold text-gray-900">{total.toLocaleString()} FCFA</span></p>
                <p className="text-xs text-gray-400">Scannez le QR code et confirmez le paiement</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 h-11 rounded-xl text-sm font-medium bg-gray-100 text-gray-600"
                >
                  Annuler
                </button>
                <button
                  onClick={handleQRCodePayment}
                  className="flex-1 h-11 rounded-xl text-sm font-medium bg-gray-900 text-white"
                >
                  J'ai payé
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
