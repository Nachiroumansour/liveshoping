import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, Shield, Truck, CreditCard, Check, User, Package, Copy } from 'lucide-react';
import ImageCapture from '@/components/ImageCapture';
import { getApiUrl, getImageUrl } from '../config/domains';

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

  const [paymentMethods, setPaymentMethods] = useState({
    wave: { available: false },
    orange_money: { available: false },
    manual: { available: true }
  });

  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentReference, setPaymentReference] = useState('');

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

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const apiUrl = getApiUrl(`/public/${linkId}/products/${productId}`);
      
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
  }, [linkId, productId]);

  useEffect(() => {
    fetchProduct();
    fetchPaymentMethods();
  }, [fetchProduct, fetchPaymentMethods]);

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
      setSelectedPaymentMethod(method);
  };

  const handleQRCodePayment = () => {
    setShowQRModal(false);
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
      
      const combinedComment = `${formData.comment || ''}${paymentReference ? (formData.comment ? ' | ' : '') + 'Réf: ' + paymentReference : ''}`;
      
      const orderData = {
        ...formData,
        comment: combinedComment,
        product_id: parseInt(productId),
        quantity: parseInt(formData.quantity)
      };

      const apiUrl = getApiUrl(`/public/${linkId}/orders`);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header mobile */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/${linkId}`)}
              className="p-2 hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="text-center flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Finaliser la commande</h1>
              <p className="text-sm text-gray-500">{seller?.name}</p>
            </div>
            <div className="w-9"></div> {/* Spacer pour centrer */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire principal - Design comme checkout */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      {error}
                    </div>
                  </div>
                )}

              {/* Vos informations */}
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <User className="w-5 h-5 mr-2 text-gray-600" />
                    Vos informations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                        <div className="space-y-2">
                    <Label htmlFor="customer_name" className="text-sm font-medium text-gray-700">
                            Nom complet *
                          </Label>
                          <Input
                            id="customer_name"
                            type="text"
                            value={formData.customer_name}
                            onChange={(e) => handleInputChange('customer_name', e.target.value)}
                            placeholder="Votre nom complet"
                      className="w-full"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                    <Label htmlFor="customer_phone" className="text-sm font-medium text-gray-700">
                            Numéro de téléphone *
                          </Label>
                          <Input
                            id="customer_phone"
                            type="tel"
                            value={formData.customer_phone}
                            onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                      placeholder="+221 7X XXX XX XX"
                      className="w-full"
                            required
                          />
                    <p className="text-xs text-gray-500">Format attendu : +221 7X XXX XX XX</p>
                      </div>

                      <div className="space-y-2">
                    <Label htmlFor="customer_address" className="text-sm font-medium text-gray-700">
                      Adresse de livraison
                        </Label>
                        <Textarea
                          id="customer_address"
                          value={formData.customer_address}
                          onChange={(e) => handleInputChange('customer_address', e.target.value)}
                      placeholder="Instructions spéciales, adresse de livraison, etc."
                      rows={3}
                      className="w-full resize-none"
                        />
                      </div>
                </CardContent>
              </Card>

              {/* Moyens de paiement */}
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                    Moyen de paiement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                        {/* Wave */}
                        <button
                          type="button"
                          onClick={() => handlePaymentMethodSelect('wave')}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            formData.payment_method === 'wave'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white font-bold">W</span>
                              </div>
                              <div>
                            <div className="font-medium text-gray-900">Wave</div>
                                <div className="text-sm text-gray-500">Paiement par preuve</div>
                              </div>
                            </div>
                            {formData.payment_method === 'wave' && (
                          <Check className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                        </button>

                        {/* Orange Money */}
                        <button
                          type="button"
                          onClick={() => handlePaymentMethodSelect('orange_money')}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            formData.payment_method === 'orange_money'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white font-bold">OM</span>
                              </div>
                              <div>
                            <div className="font-medium text-gray-900">Orange Money</div>
                                <div className="text-sm text-gray-500">Paiement par preuve</div>
                              </div>
                            </div>
                            {formData.payment_method === 'orange_money' && (
                          <Check className="w-5 h-5 text-orange-600" />
                            )}
                          </div>
                        </button>

                        {/* Espèces */}
                        <button
                          type="button"
                          onClick={() => handlePaymentMethodSelect('cash')}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            formData.payment_method === 'cash'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white font-bold">€</span>
                              </div>
                              <div>
                            <div className="font-medium text-gray-900">Espèces à la livraison</div>
                                <div className="text-sm text-gray-500">Paiement à la réception</div>
                              </div>
                            </div>
                            {formData.payment_method === 'cash' && (
                          <Check className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                        </button>
                      </div>

                      {/* Instructions pour paiement mobiles (Wave/OM) */}
                      {(formData.payment_method === 'wave' || formData.payment_method === 'orange_money') && (
                        <div className="mt-2 space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">Montant à payer</div>
                            <div className="text-base font-semibold text-gray-900">{totalPrice.toLocaleString()} FCFA</div>
                          </div>

                          {paymentMethods?.[formData.payment_method]?.phone ? (
                            <div className="flex items-center justify-between rounded-md bg-white border border-blue-200 px-3 py-2">
                              <div className="text-sm font-medium text-gray-900">
                                {paymentMethods[formData.payment_method].phone}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(paymentMethods[formData.payment_method].phone)}
                                className="h-8 px-2"
                              >
                                <Copy className="w-3 h-3 mr-1" /> Copier
                              </Button>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-600">
                              Le vendeur n'a pas encore renseigné de numéro public pour ce moyen. Suivez les instructions ci-dessous ou choisissez un autre moyen.
                            </div>
                          )}

                          <div>
                            <Label htmlFor="payment_ref" className="text-sm font-medium text-gray-700">Référence de transaction (optionnel)</Label>
                            <Input
                              id="payment_ref"
                              value={paymentReference}
                              onChange={(e) => setPaymentReference(e.target.value)}
                              placeholder="Saisissez la référence après paiement"
                              className="mt-1"
                            />
                          </div>

                          <p className="text-xs text-gray-600">Après avoir payé, appuyez sur « Commander » pour envoyer la commande avec votre référence.</p>
                          {/* Preuve de paiement (optionnel) */}
                          <div className="pt-2">
                            <Label className="text-sm font-medium text-gray-700">Preuve de paiement (optionnel)</Label>
                          <div className="mt-2">
                            <ImageCapture 
                              onImageCaptured={(imageUrl) => {
                                handleInputChange('payment_proof_url', imageUrl);
                              }}
                              onImageRemoved={() => {
                                handleInputChange('payment_proof_url', '');
                              }}
                            />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Commentaire */}
                      <div>
                        <Label htmlFor="comment" className="text-sm font-medium text-gray-700">
                          Commentaire (optionnel)
                        </Label>
                        <Textarea
                          id="comment"
                          value={formData.comment}
                          onChange={(e) => handleInputChange('comment', e.target.value)}
                          placeholder="Instructions spéciales ou commentaires"
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                </CardContent>
              </Card>

              {/* Bouton de soumission */}
                      <Button
                        type="submit"
                disabled={submitting || !formData.customer_name || !formData.customer_phone || !formData.payment_method}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                            Traitement...
                          </>
                        ) : (
                  `Commander • ${totalPrice.toLocaleString()} FCFA`
                        )}
                      </Button>
                </form>
          </div>

          {/* Résumé de commande - Design comme checkout */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Package className="w-5 h-5 mr-2 text-gray-600" />
                  Résumé de la commande
                  </CardTitle>
                </CardHeader>
              <CardContent className="space-y-4">
                {/* Produit */}
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {product?.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{product?.name}</h3>
                    <p className="text-sm text-gray-500">{product?.price.toLocaleString()} FCFA</p>
                    <p className="text-sm text-gray-500">Quantité: {formData.quantity}</p>
                  </div>
                    </div>

                {/* Total */}
                <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900">{totalPrice.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
          </div>
        </div>
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
                    src={getImageUrl(paymentMethods[selectedPaymentMethod]?.qr_code_url)}
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
