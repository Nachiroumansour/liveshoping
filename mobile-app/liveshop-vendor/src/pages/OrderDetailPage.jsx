import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, MessageCircle, Star, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getBackendUrl } from '../config/domains';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Helper pour construire les URLs d'images
  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${getBackendUrl()}${url}`;
  };

  useEffect(() => {
    const fetchOrder = async () => {
      console.log('📦 [ORDER-DETAIL] Chargement commande:', orderId, 'token:', token ? 'présent' : 'manquant');
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${getBackendUrl()}/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('📦 [ORDER-DETAIL] Réponse statut:', res.status);
        const data = await res.json();
        console.log('📦 [ORDER-DETAIL] Données:', data);
        if (res.ok) {
          setOrder(data.order);
        } else {
          setError(data.error || 'Erreur lors du chargement de la commande');
        }
      } catch (err) {
        console.error('❌ [ORDER-DETAIL] Erreur:', err);
        setError('Erreur réseau');
      } finally {
        setLoading(false);
      }
    };
    
    console.log('📦 [ORDER-DETAIL] useEffect déclenché, orderId:', orderId, 'token:', token ? 'OK' : 'MANQUANT');
    if (orderId && token) {
      fetchOrder();
    } else {
      console.warn('⚠️ [ORDER-DETAIL] Pas de orderId ou token, skip fetch');
      setLoading(false);
    }
  }, [orderId, token]);

  if (loading) {
    return <div className="p-8 text-center ">Chargement...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500 ">{error}</div>;
  }
  if (!order) {
    return <div className="p-8 text-center ">Commande introuvable</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 ">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 ">
        <ArrowLeft className="w-4 h-4 " /> Retour
      </Button>
      <Card>
        <CardContent className="p-6 ">
          <h2 className="text-xl font-bold mb-2 ">Commande #{order.id}</h2>
          <div className="mb-4 text-sm text-gray-500 ">Créée le {new Date(order.created_at).toLocaleString()}</div>
          <div className="mb-4 ">
            <span className="font-semibold ">Statut :</span> <span className="capitalize ">{order.status}</span>
          </div>
          <div className="mb-4 ">
            <span className="font-semibold ">Client :</span> {order.customer_name}<br/>
            <span className="font-semibold ">Téléphone :</span> {order.customer_phone}<br/>
            <span className="font-semibold ">Adresse :</span> {order.customer_address}
          </div>

          {/* Contact client */}
          {order.customer_phone && (
            <div className="mb-4 flex gap-2">
              <a
                href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href={`tel:${order.customer_phone}`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                <Phone className="w-4 h-4" />
                Appeler
              </a>
            </div>
          )}
          <div className="mb-4 ">
            <span className="font-semibold ">Produit :</span> {order.product?.name}<br/>
            <span className="font-semibold ">Quantité :</span> {order.quantity}<br/>
            <span className="font-semibold ">Total :</span> {order.total_price.toLocaleString()} FCFA
          </div>
          <div className="mb-4 ">
            <span className="font-semibold ">Méthode de paiement :</span> {order.payment_method}
          </div>
          {/* Commentaire de la commande */}
          {order.comment && (
            <div className="mb-4 ">
              <span className="font-semibold ">Commentaire :</span> {order.comment}
            </div>
          )}

          {/* Commentaire client (après commande) */}
          {order.comment_data && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-800 dark:text-blue-200">Commentaire Client</span>
              </div>
              
              <div className="mb-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {order.comment_data.customer_name}
                </span>
                {order.comment_data.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < order.comment_data.rating 
                            ? 'text-yellow-500 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">
                      {order.comment_data.rating}/5
                    </span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                "{order.comment_data.content}"
              </p>
              
              <div className="text-xs text-gray-500 mt-2">
                Posté le {new Date(order.comment_data.created_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
          )}
          
          {/* Preuve de paiement */}
          {order.payment_proof_url && (
            <div className="mb-4 ">
              <span className="font-semibold ">Preuve de paiement :</span>
              <div className="mt-2">
                <img 
                  src={getImageUrl(order.payment_proof_url)}
                  alt="Preuve de paiement"
                  className="w-full max-w-md rounded-lg border-2 border-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="hidden text-sm text-gray-500 mt-1">
                  Image non disponible
                </div>
                <a 
                  href={getImageUrl(order.payment_proof_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm mt-1 inline-block"
                >
                  Voir l'image en plein écran
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetailPage; 