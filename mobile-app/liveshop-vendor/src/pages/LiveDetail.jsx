import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { getBackendUrl } from '../config/domains';
import { X, Download, Trash2, Plus, Package, ShoppingBag, TrendingUp, Loader2, FileText } from 'lucide-react';

export default function LiveDetail({ live, onClose }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [showAssoc, setShowAssoc] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const prods = await api.getProductsOfLive(live.id);
        setProducts(Array.isArray(prods) ? prods : (prods.products || []));
        setSelectedProducts((Array.isArray(prods) ? prods : (prods.products || [])).map(p => p.id));
        const ords = await api.getOrdersOfLive(live.id);
        setOrders(Array.isArray(ords) ? ords : (ords.orders || []));
        const allProds = await api.getProducts();
        setAllProducts(Array.isArray(allProds) ? allProds : (allProds.products || []));
      } catch {
        setProducts([]);
        setOrders([]);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [live.id]);

  // Stats — only paid/delivered orders
  const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'delivered');
  const totalCA = paidOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
  const nbCmds = paidOrders.length;

  const handleDownloadReport = async () => {
    try {
      const token = localStorage.getItem('liveshop_token');
      const response = await fetch(`${getBackendUrl()}/api/lives/${live.id}/report`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur téléchargement');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-${live.title || 'session'}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur téléchargement rapport:', err);
      alert('Erreur lors du téléchargement du rapport');
    }
  };

  const handleDeleteLive = async () => {
    if (!window.confirm('Supprimer cette session ? Cette action est irréversible.')) return;
    try {
      setLoading(true);
      await api.deleteLive(live.id);
      onClose();
    } catch (error) {
      alert('Erreur lors de la suppression.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleSaveProducts = async () => {
    setSaving(true);
    setError('');
    try {
      await api.associateProductsToLive(live.id, selectedProducts);
      const prods = await api.getProductsOfLive(live.id);
      setProducts(Array.isArray(prods) ? prods : (prods.products || []));
      setShowAssoc(false);
    } catch {
      setError("Erreur lors de l'association des produits.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="bg-white dark:bg-gray-800 sm:rounded-2xl rounded-t-2xl w-full sm:max-w-lg max-h-[80vh] mb-16 sm:mb-0 overflow-y-auto relative">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between z-10">
          <div className="min-w-0 flex-1 mr-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-white truncate">{live.title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{new Date(live.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDownloadReport}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
              title="Télécharger le rapport"
            >
              <Download className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
          </div>
        ) : (
          <div className="px-5 py-4 space-y-5">

            {/* Stats résumé — 3 chiffres clés */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                <ShoppingBag className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900 dark:text-white">{nbCmds}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Commandes</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                <TrendingUp className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900 dark:text-white">{totalCA.toLocaleString()}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">FCFA</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                <Package className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900 dark:text-white">{products.length}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Produits</div>
              </div>
            </div>

            {/* Produits de la session */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Produits</h3>
                <button
                  onClick={() => setShowAssoc(!showAssoc)}
                  className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAssoc ? 'Annuler' : 'Associer'}
                </button>
              </div>

              {products.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">Aucun produit associé</p>
              ) : (
                <div className="space-y-1.5">
                  {products.map(p => (
                    <div key={p.id} className="flex items-center gap-2.5 py-2 px-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <Package className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{p.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {showAssoc && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                  {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {allProducts.length === 0 && <p className="text-gray-400 text-xs">Aucun produit disponible</p>}
                    {allProducts.map(prod => (
                      <label key={prod.id} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-white dark:hover:bg-gray-600/30 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(prod.id)}
                          onChange={() => handleProductSelect(prod.id)}
                          className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{prod.name}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={handleSaveProducts}
                    disabled={saving}
                    className="mt-3 w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium py-2 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 pb-2">
              <button
                onClick={handleDownloadReport}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold py-3.5 rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Télécharger le rapport
              </button>
              <button
                onClick={handleDeleteLive}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-red-500 text-sm font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer la session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
