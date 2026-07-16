import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, Upload, Star, Shield, Truck, CreditCard } from 'lucide-react';
import ImageCapture from '@/components/ImageCapture';

const OrderPage = () => {
  const { linkId, productId } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    quantity: 1,
    payment_method: '',
    payment_proof_url: '',
    comment: ''
  });

  const [capturedImageUrl, setCapturedImageUrl] = useState('');

  const [paymentMethods, setPaymentMethods] = useState({
    wave: { available: false },
    orange_money: { available: false },
    manual: { available: true }
  });

  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  useEffect(() => {
    fetchProduct();
    fetchPaymentMethods();
  }, [linkId, productId]);

  const fetchPaymentMethods = async () => {
    try {
      const apiUrl = window.location.hostname.includes('livelink.store') 
        ? `https://api.livelink.store/api/public/${linkId}/payment-methods`
        : `http://localhost:3001/api/public/${linkId}/payment-methods`;
      
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.data);
      }
    } catch (error) {
      console.error('Erreur récupération méthodes paiement:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const apiUrl = window.location.hostname.includes('livelink.store') 
        ? `https://api.livelink.store/api/public/${linkId}/products/${productId}`
        : `http://localhost:3001/api/public/${linkId}/products/${productId}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Produit non trouvé');
      }
      
      const data = await response.json();
      setProduct(data.product);
      setSeller(data.seller);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentMethodSelect = (method) => {
    setFormData(prev => ({
      ...prev,
      payment_method: method
    }));

    // Si c'est Wave ou Orange Money et que le QR code est disponible, afficher le modal
    if ((method === 'wave' || method === 'orange_money') && paymentMethods[method]?.available) {
      setSelectedPaymentMethod(method);
      setShowQRModal(true);
    }
  };

  const handleQRCodePayment = () => {
    // Le client a scanné le QR code, on peut continuer
    setShowQRModal(false);
    // Ici on pourrait ajouter une logique pour marquer que le paiement est en cours
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customer_name || !formData.customer_phone || !formData.customer_address || !formData.payment_method) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const orderData = {
        ...formData,
        product_id: parseInt(productId),
        quantity: parseInt(formData.quantity)
      };

      const apiUrl = window.location.hostname.includes('livelink.store') 
        ? `https://api.livelink.store/api/public/${linkId}/orders`
        : `http://localhost:3001/api/public/${linkId}/orders`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la commande');
      }

      const result = await response.json();
      navigate(`/${linkId}/confirmation`, { 
        state: { 
          order: result.order,
          product: product,
          seller: seller
        }
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-400 opacity-20"></div>
          </div>
          <p className="text-gray-600 text-lg">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-8xl mb-6 animate-bounce">😕</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Oups !</h1>
          <p className="text-gray-600 text-lg mb-6">{error}</p>
          <Button 
            onClick={() => navigate(`/${linkId}`)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux produits
          </Button>
        </div>
      </div>
    );
  }

  const totalPrice = product ? product.price * formData.quantity : 0;

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      {/* Header moderne */}
      <div className="header sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/${linkId}`)}
            className="mb-4 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux produits
          </Button>
          <div className="text-center">
            <h1 className="header-title mb-2">
              🛒 Passer commande
            </h1>
            <p className="header-desc">
              Boutique de {seller?.name}
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Summary */}
          <Card className="card">
            <CardHeader>
              <CardTitle className="card-title flex items-center text-xl">
                <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
                Résumé du produit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image du produit */}
              {product?.image_url ? (
                <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100 relative group">
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.is_pinned && (
                    <div className="absolute top-3 right-3">
                      <Badge className="badge bg-gradient-to-r from-orange-500 to-pink-500 text-white animate-pulse">
                        <Star className="w-3 h-3 mr-1" />
                        En Live
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                  <div className="text-8xl">📦</div>
                </div>
              )}
              
              {/* Informations produit */}
              <div>
                <h3 className="card-title text-2xl mb-3">
                  {product?.name}
                </h3>
                
                {product?.description && (
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {product.description}
                  </p>
                )}
                
                {/* Détails prix */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Prix unitaire:</span>
                    <span className="font-semibold text-lg">{product?.price.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Quantité:</span>
                    <span className="font-semibold text-lg">{formData.quantity}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-800">Total:</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        {totalPrice.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Garanties */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-xs text-green-700 font-medium">Paiement sécurisé</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Truck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs text-blue-700 font-medium">Livraison rapide</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <CreditCard className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-xs text-purple-700 font-medium">Support client</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Form */}
          <Card className="card">
            <CardHeader>
              <CardTitle className="card-title flex items-center text-xl">
                <Upload className="w-5 h-5 mr-2 text-blue-600" />
                Informations de commande
              </CardTitle>
              <CardDescription>
                Remplissez vos informations pour finaliser la commande
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm animate-pulse">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      {error}
                    </div>
                  </div>
                )}

                {/* Informations personnelles */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Informations personnelles
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="customer_name" className="text-sm font-medium text-gray-700">
                        Nom complet *
                      </Label>
                      <Input
                        id="customer_name"
                        type="text"
                        value={formData.customer_name}
                        onChange={(e) => handleInputChange('customer_name', e.target.value)}
                        placeholder="Votre nom complet"
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="customer_phone" className="text-sm font-medium text-gray-700">
                        Numéro de téléphone *
                      </Label>
                      <Input
                        id="customer_phone"
                        type="tel"
                        value={formData.customer_phone}
                        onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                        placeholder="+221 XX XXX XX XX"
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="customer_address" className="text-sm font-medium text-gray-700">
                        Adresse de livraison *
                      </Label>
                      <Textarea
                        id="customer_address"
                        value={formData.customer_address}
                        onChange={(e) => handleInputChange('customer_address', e.target.value)}
                        placeholder="Votre adresse complète de livraison"
                        rows={3}
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Détails commande */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></div>
                    Détails de la commande
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                        Quantité *
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max={product?.stock_quantity || 999}
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', e.target.value)}
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="payment_method" className="text-sm font-medium text-gray-700">
                        Moyen de paiement *
                      </Label>
                      <div className="mt-1 space-y-2">
                        {/* Wave */}
                        <button
                          type="button"
                          onClick={() => handlePaymentMethodSelect('wave')}
                          className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                            formData.payment_method === 'wave'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-sm">W</span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">Wave</div>
                                <div className="text-sm text-gray-500">Paiement par preuve</div>
                              </div>
                            </div>
                            {formData.payment_method === 'wave' && (
                              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </button>

                        {/* Orange Money */}
                        <button
                          type="button"
                          onClick={() => handlePaymentMethodSelect('orange_money')}
                          className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                            formData.payment_method === 'orange_money'
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-sm">OM</span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">Orange Money</div>
                                <div className="text-sm text-gray-500">Paiement par preuve</div>
                              </div>
                            </div>
                            {formData.payment_method === 'orange_money' && (
                              <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </button>

                        {/* Méthodes traditionnelles */}
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => handlePaymentMethodSelect('free_money')}
                            className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                              formData.payment_method === 'free_money'
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-green-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                                  <span className="text-white font-bold text-sm">F</span>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">Free Money</div>
                                  <div className="text-sm text-gray-500">Paiement par preuve</div>
                                </div>
                              </div>
                              {formData.payment_method === 'free_money' && (
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePaymentMethodSelect('cash')}
                            className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                              formData.payment_method === 'cash'
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                                  <span className="text-white font-bold text-sm">€</span>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">Espèces à la livraison</div>
                                  <div className="text-sm text-gray-500">Paiement à la réception</div>
                                </div>
                              </div>
                              {formData.payment_method === 'cash' && (
                                <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Preuve de paiement (optionnel)
                      </Label>
                      <div className="mt-1">
                        <ImageCapture 
                          onImageCaptured={(imageUrl) => {
                            setCapturedImageUrl(imageUrl);
                            handleInputChange('payment_proof_url', imageUrl);
                          }}
                          onImageRemoved={() => {
                            setCapturedImageUrl('');
                            handleInputChange('payment_proof_url', '');
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Capturez une photo de votre écran de paiement ou choisissez une image depuis votre galerie
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="comment" className="text-sm font-medium text-gray-700">
                        Commentaire (optionnel)
                      </Label>
                      <Textarea
                        id="comment"
                        value={formData.comment}
                        onChange={(e) => handleInputChange('comment', e.target.value)}
                        placeholder="Commentaire ou instructions spéciales"
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="btn-primary py-4 text-lg font-bold"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Traitement de votre commande...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Confirmer la commande
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Effet de particules en arrière-plan */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-300 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-300 rounded-full animate-ping opacity-40"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce opacity-30"></div>
      </div>

      {/* Modal QR Code */}
      {showQRModal && selectedPaymentMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowQRModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Paiement {selectedPaymentMethod === 'wave' ? 'Wave' : 'Orange Money'}
              </h3>
              
              <div className="mb-6">
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <img 
                    src={`http://localhost:3001${paymentMethods[selectedPaymentMethod]?.qr_code_url}`}
                    alt={`QR Code ${selectedPaymentMethod}`}
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  <p className="font-medium mb-2">Instructions :</p>
                  <ol className="text-left space-y-1">
                    <li>1. Scannez le QR code avec votre app {selectedPaymentMethod === 'wave' ? 'Wave' : 'Orange Money'}</li>
                    <li>2. Vérifiez le montant : <span className="font-bold">{totalPrice.toLocaleString()} FCFA</span></li>
                    <li>3. Confirmez le paiement</li>
                    <li>4. Cliquez sur "J'ai payé" ci-dessous</li>
                  </ol>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowQRModal(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleQRCodePayment}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  J'ai payé
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;

