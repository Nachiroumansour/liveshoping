import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Phone } from 'lucide-react';

const ConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { linkId } = useParams();

  const { order, orders, items, isMultipleOrders } = location.state || {};

  if (!order && !orders) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-base font-semibold text-gray-900 mb-2">Page non accessible</p>
          <p className="text-sm text-gray-400 mb-5">Passez une commande pour voir cette page.</p>
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

  const totalAmount = isMultipleOrders
    ? orders.reduce((sum, o) => sum + o.total_price, 0)
    : order.total_price;

  const orderCount = isMultipleOrders ? orders.length : 1;
  const firstOrder = isMultipleOrders ? orders[0] : order;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm text-center">

          {/* Success icon */}
          <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Commande envoyée
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            {orderCount > 1
              ? `${orderCount} articles · ${totalAmount.toLocaleString()} FCFA`
              : `${totalAmount.toLocaleString()} FCFA`
            }
          </p>

          {/* What happens next */}
          <div className="bg-gray-50 rounded-2xl p-5 text-left mb-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Et maintenant ?</p>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-[10px] font-bold">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Le vendeur confirme</p>
                  <p className="text-xs text-gray-400 mt-0.5">Il vérifie la disponibilité de votre commande</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-[10px] font-bold">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Il vous contacte</p>
                  <p className="text-xs text-gray-400 mt-0.5">Par téléphone pour organiser la livraison</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-[10px] font-bold">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Vous recevez votre commande</p>
                  <p className="text-xs text-gray-400 mt-0.5">À l'adresse que vous avez indiquée</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tip */}
          <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 text-left mb-8">
            <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500">
              Gardez votre téléphone à portée de main, le vendeur vous contactera bientôt.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2.5">
            <button
              onClick={() => navigate(`/${linkId}`)}
              className="w-full h-12 bg-gray-900 text-white rounded-2xl text-sm font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Continuer mes achats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
