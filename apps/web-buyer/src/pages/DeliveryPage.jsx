import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Phone, MapPin, Package, User, Calendar, DollarSign } from 'lucide-react';
import { getApiUrl } from '../config/domains';

const DeliveryPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const apiUrl = getApiUrl(`/public/orders/${orderId}/delivery-info`);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error('Commande non trouvée');
        }
        
        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des détails de livraison...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Erreur</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📦</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Commande non trouvée</h1>
          <p className="text-gray-600">Cette commande n'existe pas ou a été supprimée.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'paid': return 'Payée';
      case 'delivered': return 'Livrée';
      default: return status;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'wave': return 'Wave';
      case 'orange_money': return 'Orange Money';
      case 'free_money': return 'Free Money';
      case 'cash': return 'Espèces à la livraison';
      case 'bank_transfer': return 'Virement bancaire';
      default: return method;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Détails de Livraison
          </h1>
          <p className="text-gray-600">
            Commande #{order.id} - {formatDate(order.created_at)}
          </p>
        </div>

        {/* Statut */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Statut</span>
              <Badge className={getStatusColor(order.status)}>
                {getStatusText(order.status)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Informations client */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{order.customer_name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{order.customer_phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{order.customer_address}</span>
            </div>
          </CardContent>
        </Card>

        {/* Détails du produit */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produit commandé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              {order.product?.image_url && (
                <img 
                  src={order.product.image_url} 
                  alt={order.product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{order.product?.name || 'Produit inconnu'}</h3>
                <p className="text-gray-600">Quantité: {order.quantity}</p>
                <p className="text-gray-600">
                  Prix unitaire: {order.product?.price || 0} FCFA
                </p>
                <div className="mt-2">
                  <span className="text-lg font-bold text-purple-600">
                    Total: {order.total_price} FCFA
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations de livraison */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Informations de livraison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Méthode de paiement:</span>
              <span className="font-medium">{getPaymentMethodText(order.payment_method)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Date de commande:</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Contact vendeur */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact vendeur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{order.seller?.name || 'Vendeur'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{order.seller?.phone_number || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button 
            className="flex-1"
            onClick={() => window.print()}
          >
            🖨️ Imprimer
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => window.history.back()}
          >
            ← Retour
          </Button>
        </div>

        {/* Note pour impression */}
        <div className="mt-6 text-center text-sm text-gray-500 print:hidden">
          <p>💡 Cette page peut être imprimée pour garder une copie physique</p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPage; 