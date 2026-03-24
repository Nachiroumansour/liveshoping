import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { getBackendUrl } from '../config/domains';

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
        // Récupère tous les produits du vendeur
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

  // Calcul des statistiques (seulement commandes payées et livrées)
  const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'delivered');
  const totalCA = paidOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
  const nbCmds = paidOrders.length;
  
  // Commandes aujourd'hui (payées et livrées)
  const today = new Date();
  const todayOrders = paidOrders.filter(o => {
    const orderDate = new Date(o.created_at);
    return orderDate.toDateString() === today.toDateString();
  });
  const todayCA = todayOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
  
  // Commandes cette semaine (payées et livrées)
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekOrders = paidOrders.filter(o => {
    const orderDate = new Date(o.created_at);
    return orderDate >= weekStart;
  });
  const weekCA = weekOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
  
  // Meilleur produit (par nombre de commandes payées et livrées)
  const productStats = {};
  paidOrders.forEach(order => {
    // Vérifier si la commande a des produits associés
    if (order.products && order.products.length > 0) {
      order.products.forEach(product => {
        const productName = product.name || 'Produit inconnu';
        if (!productStats[productName]) {
          productStats[productName] = { count: 0, revenue: 0 };
        }
        productStats[productName].count += product.quantity || 1;
        productStats[productName].revenue += (product.price || 0) * (product.quantity || 1);
      });
    } else {
      // Fallback pour les anciennes commandes
      const productName = order.product?.name || 'Produit inconnu';
      if (!productStats[productName]) {
        productStats[productName] = { count: 0, revenue: 0 };
      }
      productStats[productName].count++;
      productStats[productName].revenue += order.total_price || 0;
    }
  });
  
  const bestProduct = Object.entries(productStats)
    .sort(([,a], [,b]) => b.count - a.count)[0];

  const handleDownloadReport = () => {
    window.open(`${getBackendUrl()}/api/lives/${live.id}/report`, '_blank');
  };

  const handleDeleteLive = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette session ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      setLoading(true);
      await api.deleteLive(live.id);
      alert('Session supprimée avec succès !');
      onClose();
    } catch (error) {
      alert('Erreur lors de la suppression de la session.');
      console.error('Erreur suppression live:', error);
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
      // Rafraîchir la liste des produits associés
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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-purple-600 text-xl">&times;</button>
        <h2 className="text-xl sm:text-2xl font-bold text-purple-700 dark:text-purple-400 mb-2 pr-8">Détail de la session : {live.title}</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">{new Date(live.date).toLocaleString()}</div>
        {loading ? <div>Chargement...</div> : (
          <>
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <h3 className="font-semibold dark:text-white">Produits de la session</h3>
                <div className="flex gap-2">
                  <button onClick={() => setShowAssoc(!showAssoc)}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded text-sm font-medium border border-purple-200">
                    {showAssoc ? 'Annuler' : 'Associer des produits'}
                  </button>
                  <button onClick={handleDeleteLive}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm font-medium border border-red-200">
                    Supprimer la session
                  </button>
                </div>
              </div>
              <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300">
                {products.map(p => <li key={p.id} className="break-words">{p.name}</li>)}
                {products.length === 0 && <li className="text-gray-400 dark:text-gray-500">Aucun produit associé</li>}
              </ul>
              {showAssoc && (
                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-100 dark:border-purple-800">
                  <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">Sélectionner les produits à associer</h4>
                  {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {allProducts.length === 0 && <span className="text-gray-400 dark:text-gray-500 text-sm">Aucun produit disponible</span>}
                    {allProducts.map(prod => (
                      <label key={prod.id} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={selectedProducts.includes(prod.id)} onChange={() => handleProductSelect(prod.id)}
                          className="accent-purple-600 w-4 h-4" />
                        <span className="break-words dark:text-white">{prod.name}</span>
                      </label>
                    ))}
                  </div>
                  <button onClick={handleSaveProducts} disabled={saving}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50 w-full sm:w-auto">
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              )}
            </div>
            
            {/* Statistiques */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4 text-purple-700 dark:text-purple-400">📊 Statistiques de la Session</h3>
              
              {paidOrders.length === 0 ? (
                <div className="text-gray-400 dark:text-gray-500 text-center py-8">Aucune commande payée pour cette session.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Statistiques générales */}
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100 ">
                    <h4 className="font-semibold text-purple-700 mb-3 ">📈 Aperçu Général</h4>
                    <div className="space-y-2 text-sm ">
                      <div className="flex justify-between ">
                        <span>Total commandes :</span>
                        <span className="font-semibold text-purple-600 ">{nbCmds}</span>
                      </div>
                      <div className="flex justify-between ">
                        <span>Chiffre d'affaires :</span>
                        <span className="font-semibold text-green-600 ">{totalCA.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Statistiques temporelles */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100 ">
                    <h4 className="font-semibold text-green-700 mb-3 ">⏰ Aujourd'hui</h4>
                    <div className="space-y-2 text-sm ">
                      <div className="flex justify-between ">
                        <span>Commandes :</span>
                        <span className="font-semibold text-green-600 ">{todayOrders.length}</span>
                      </div>
                      <div className="flex justify-between ">
                        <span>CA :</span>
                        <span className="font-semibold text-green-600 ">{todayCA.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Statistiques hebdomadaires */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100 ">
                    <h4 className="font-semibold text-blue-700 mb-3 ">📅 Cette Semaine</h4>
                    <div className="space-y-2 text-sm ">
                      <div className="flex justify-between ">
                        <span>Commandes :</span>
                        <span className="font-semibold text-blue-600 ">{weekOrders.length}</span>
                      </div>
                      <div className="flex justify-between ">
                        <span>CA :</span>
                        <span className="font-semibold text-blue-600 ">{weekCA.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Meilleur produit */}
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-100 ">
                    <h4 className="font-semibold text-orange-700 mb-3 ">🏆 Meilleur Produit</h4>
                    <div className="space-y-2 text-sm ">
                      <div className="flex justify-between ">
                        <span>Produit :</span>
                        <span className="font-semibold text-orange-600 ">{bestProduct ? bestProduct[0] : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between ">
                        <span>Ventes :</span>
                        <span className="font-semibold text-orange-600 ">{bestProduct ? bestProduct[1].count : 0}</span>
                      </div>
                      <div className="flex justify-between ">
                        <span>CA :</span>
                        <span className="font-semibold text-orange-600 ">{bestProduct ? bestProduct[1].revenue.toLocaleString() : 0} FCFA</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-purple-700 dark:text-purple-300">
                <span className="font-semibold">Total commandes :</span> {orders.length} | 
                <span className="font-semibold ml-2">Commandes payées :</span> {nbCmds} | 
                <span className="font-semibold ml-2">Chiffre d'affaires :</span> {totalCA.toLocaleString()} FCFA
              </div>
              <button onClick={handleDownloadReport}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium w-full sm:w-auto">
                📄 Télécharger le rapport
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 