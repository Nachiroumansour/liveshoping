import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft,
  User,
  Package,
  ShoppingBag,
  Coins,
  Calendar,
  Phone,
  Mail,
  Shield,
  UserCheck,
  UserX,
  Plus,
  Minus,
  Eye,
  Edit,
  MoreVertical,
  CreditCard,
  Activity,
  Clock
} from 'lucide-react';
import apiService from '../services/api';

const AdminSellerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    loadSellerDetails();
  }, [id]);

  const loadSellerDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminSellerDetails(id);
      setSeller(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await apiService.updateSeller(seller.id, { is_active: !seller.is_active });
      loadSellerDetails();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const handleUpdateCredits = async (amount, reason) => {
    try {
      await apiService.updateSellerCredits(seller.id, amount, reason);
      loadSellerDetails();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des crédits:', error);
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'superadmin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'seller': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
            <UserX className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vendeur non trouvé</h2>
          <p className="text-gray-500 dark:text-gray-400">Le vendeur que vous recherchez n'existe pas ou a été supprimé.</p>
          <Button onClick={() => navigate('/admin/sellers')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-4 md:p-8 space-y-8 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/admin/sellers')}
            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              {seller.name}
              <Badge variant="outline" className={getStatusColor(seller.is_active)}>
                {seller.is_active ? 'Actif' : 'Suspendu'}
              </Badge>
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {seller.phone_number}
              </span>
              <span>•</span>
              <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                ID: {seller.public_link_id}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowActions(!showActions)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Edit className="w-4 h-4 mr-2" />
            Gérer le compte
          </Button>
        </div>
      </div>

      {/* Actions rapides Panel */}
      {showActions && (
        <div className="animate-in slide-in-from-top-4 duration-200">
          <Card className="border-none shadow-lg bg-white dark:bg-gray-800 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Actions d'administration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={handleToggleStatus}
                  variant={seller.is_active ? "destructive" : "default"}
                  className={`w-full justify-start ${seller.is_active ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200" : "bg-green-600 hover:bg-green-700 text-white"}`}
                >
                  {seller.is_active ? (
                    <>
                      <UserX className="w-4 h-4 mr-2" />
                      Suspendre le compte
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Activer le compte
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => handleUpdateCredits(100, 'Bonus admin')}
                  variant="outline"
                  className="w-full justify-start border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter 100 crédits
                </Button>

                <Button
                  onClick={() => handleUpdateCredits(-50, 'Sanction admin')}
                  variant="outline"
                  className="w-full justify-start border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Retirer 50 crédits
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {/* TODO: Reset password logic */}}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Réinitialiser mot de passe
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne de gauche : Stats & Info */}
        <div className="space-y-6">
          {/* Carte Solde */}
          <Card className="border-none shadow-md bg-gradient-to-br from-blue-600 to-purple-700 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Coins className="w-24 h-24" />
            </div>
            <CardContent className="p-6 relative z-10">
              <p className="text-blue-100 text-sm font-medium mb-1">Solde actuel</p>
              <h3 className="text-4xl font-bold mb-4">{seller.credit_balance?.toLocaleString() || 0} <span className="text-xl font-normal text-blue-200">crédits</span></h3>
              <div className="flex items-center gap-2 text-sm text-blue-100 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                <Activity className="w-4 h-4" />
                <span>Dernière activité: {new Date(seller.updated_at || seller.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Carte Info Profil */}
          <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-600 dark:text-gray-300">
                  {seller.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rôle actuel</p>
                  <Badge variant="outline" className={`mt-1 ${getRoleColor(seller.role)}`}>
                    {seller.role}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Inscription
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(seller.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Produits
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {seller.products?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" /> Commandes
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {seller.orders?.length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne de droite : Contenu détaillé */}
        <div className="lg:col-span-2 space-y-6">
          {/* Onglets (simulés) */}
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-1 overflow-x-auto">
            <button className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600 whitespace-nowrap">
              Historique Transactions
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 whitespace-nowrap">
              Produits ({seller.products?.length || 0})
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 whitespace-nowrap">
              Commandes ({seller.orders?.length || 0})
            </button>
          </div>

          {/* Liste des transactions */}
          <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                Dernières transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {seller.creditTransactions && seller.creditTransactions.length > 0 ? (
                <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-700">
                  {seller.creditTransactions.map((transaction) => (
                    <div key={transaction.id} className="py-3 md:py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors px-2 rounded-lg -mx-2 gap-2 sm:gap-0">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full shrink-0 ${transaction.amount >= 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {transaction.amount >= 0 ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate pr-2">{transaction.description}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">{transaction.type}</p>
                        </div>
                      </div>
                      <div className="text-right pl-11 sm:pl-0">
                        <p className={`font-bold text-sm ${transaction.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {transaction.amount >= 0 ? '+' : ''}{transaction.amount}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Aucune transaction enregistrée</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Aperçu Produits (Limité) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  Derniers Produits
                </CardTitle>
              </CardHeader>
              <CardContent>
                {seller.products && seller.products.length > 0 ? (
                  <div className="space-y-3">
                    {seller.products.slice(0, 3).map((product) => (
                      <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{product.price?.toLocaleString()} FCFA • Stock: {product.stock_quantity}</p>
                        </div>
                      </div>
                    ))}
                    {seller.products.length > 3 && (
                      <Button variant="link" className="w-full text-xs h-auto p-0 text-blue-600">
                        Voir tous les produits
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Aucun produit</p>
                )}
              </CardContent>
            </Card>

            <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-gray-500" />
                  Dernières Commandes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {seller.orders && seller.orders.length > 0 ? (
                  <div className="space-y-3">
                    {seller.orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-2 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">#{order.id}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{order.total_price?.toLocaleString()} FCFA</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{order.status}</Badge>
                      </div>
                    ))}
                     {seller.orders.length > 3 && (
                      <Button variant="link" className="w-full text-xs h-auto p-0 text-blue-600">
                        Voir toutes les commandes
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Aucune commande</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSellerDetailPage; 