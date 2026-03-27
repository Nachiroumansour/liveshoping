import { useState, useEffect } from 'react';
import { X, ShoppingCart, Bell, TrendingUp } from 'lucide-react';

const NotificationToast = ({ notification, onClose, onViewOrder }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => handleClose(), 6000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const handleView = () => {
    if (onViewOrder && notification.data?.order?.id) {
      onViewOrder(notification.data.order.id);
    }
    handleClose();
  };

  const icon = notification.type === 'new_order'
    ? <ShoppingCart className="w-4 h-4" />
    : notification.type === 'order_status_update'
    ? <TrendingUp className="w-4 h-4" />
    : <Bell className="w-4 h-4" />;

  const order = notification.data?.order;

  return (
    <div
      className={`w-full transition-all duration-200 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className="bg-gray-900 dark:bg-white rounded-2xl shadow-xl p-3 flex items-start gap-3">
        {/* Icon */}
        <div className="w-8 h-8 rounded-xl bg-white/10 dark:bg-gray-100 flex items-center justify-center flex-shrink-0 text-white dark:text-gray-900 mt-0.5">
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-white dark:text-gray-900 line-clamp-1">
              {notification.title}
            </p>
            <button onClick={handleClose} className="p-0.5 text-white/40 dark:text-gray-400 hover:text-white/70 dark:hover:text-gray-600 flex-shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {order ? (
            <div className="mt-1">
              <p className="text-xs text-white/60 dark:text-gray-500">
                {order.customer_name} — {order.total_price?.toLocaleString()} FCFA
              </p>
            </div>
          ) : (
            <p className="text-xs text-white/60 dark:text-gray-500 line-clamp-1 mt-0.5">
              {notification.message}
            </p>
          )}

          {notification.type === 'new_order' && (
            <button
              onClick={handleView}
              className="mt-2 text-xs font-medium text-white dark:text-gray-900 bg-white/15 dark:bg-gray-100 hover:bg-white/25 dark:hover:bg-gray-200 px-3 py-1 rounded-lg transition-colors"
            >
              Voir la commande
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
