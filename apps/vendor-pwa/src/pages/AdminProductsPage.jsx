import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Package, 
  Search, 
  Filter,
  Eye,
  Trash2,
  AlertTriangle,
  User,
  DollarSign,
  Calendar,
  Shield,
  X,
  Tag,
  Layers,
  Box,
  CheckCircle
} from 'lucide-react';
import apiService from '../services/api';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeller, setFilterSeller] = useState('all');
  const [sellers, setSellers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    loadProducts();
    loadSellers();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminProducts();
      console.log('Produits reçus:', response.data);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSellers = async () => {
    try {
      const response = await apiService.getAdminSellers();
      setSellers(response.data.sellers);
    } catch (error) {
      console.error('Erreur lors du chargement des vendeurs:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const product = products.find(p => p.id === productId);
    const productName = product?.name || `Produit ${productId}`;
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${productName}" ?`)) {
      try {
        console.log('🗑️ Suppression du produit:', productId);
        await apiService.deleteAdminProduct(productId);
        console.log('✅ Produit supprimé avec succès');
        loadProducts(); // Recharger la liste
      } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du produit');
      }
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeller = filterSeller === 'all' || product.seller_id?.toString() === filterSeller;
    
    return matchesSearch && matchesSeller;
  });

  const stats = {
    total: products.length,
    active: products.filter(p => p.is_active !== false).length,
    inactive: products.filter(p => p.is_active === false).length,
    totalValue: products.reduce((sum, p) => sum + ((parseInt(p.price) || 0) * (parseInt(p.stock_quantity) || 0)), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-4 md:p-8 space-y-8 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Modération des Produits
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gérez et modérez le catalogue de produits de la plateforme.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {products.length} Produits
              </span>
           </div>
           <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {stats.totalValue.toLocaleString()} FCFA (Valeur)
              </span>
           </div>
        </div>
      </div>

      {/* Statistiques Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="text-green-100 text-xs md:text-sm font-medium mb-1 truncate">Total Produits</p>
                <h3 className="text-2xl md:text-3xl font-bold">{stats.total}</h3>
              </div>
              <div className="p-1.5 md:p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0 ml-2">
                <Package className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
            </div>
            <div className="mt-2 md:mt-4 flex items-center text-green-100 text-xs md:text-sm">
              <Box className="w-3 h-3 md:w-4 md:h-4 mr-1 shrink-0" />
              <span className="truncate">Catalogue global</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-gray-800 border-l-4 border-l-blue-500">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium mb-1 truncate">Actifs</p>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{stats.active}</h3>
              </div>
              <div className="p-1.5 md:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg shrink-0 ml-2">
                <CheckCircle className="w-4 h-4 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-2 md:mt-4 w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(stats.active / stats.total) * 100}%` }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-gray-800 border-l-4 border-l-red-500">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium mb-1 truncate">Inactifs</p>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{stats.inactive}</h3>
              </div>
              <div className="p-1.5 md:p-2 bg-red-50 dark:bg-red-900/20 rounded-lg shrink-0 ml-2">
                <AlertTriangle className="w-4 h-4 md:w-6 md:h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-2 md:mt-4 w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full rounded-full" style={{ width: `${(stats.inactive / stats.total) * 100}%` }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-gray-800 border-l-4 border-l-purple-500">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium mb-1 truncate">Valeur Stock</p>
                <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white truncate">{stats.totalValue.toLocaleString()} <span className="text-[10px] md:text-sm font-normal text-gray-500">FCFA</span></h3>
              </div>
              <div className="p-1.5 md:p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg shrink-0 ml-2">
                <DollarSign className="w-4 h-4 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-2 md:mt-4 flex items-center text-purple-600 text-xs md:text-sm font-medium">
              <Layers className="w-3 h-3 md:w-4 md:h-4 mr-1 shrink-0" />
              <span className="truncate">Estimation totale</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et Recherche */}
      <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative min-w-[200px]">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterSeller}
                  onChange={(e) => setFilterSeller(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer"
                >
                  <option value="all">Tous les vendeurs</option>
                  {sellers.map(seller => (
                    <option key={seller.id} value={seller.id.toString()}>
                      {seller.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button onClick={loadProducts} variant="outline" className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <Filter className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des produits */}
      <div className="space-y-4">
        {filteredProducts.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700 bg-transparent shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">Aucun produit trouvé</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
                Aucun produit ne correspond à vos critères de recherche. Essayez de modifier les filtres.
              </p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => {
                  setSearchTerm('');
                  setFilterSeller('all');
                }}
              >
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col md:block"
              >
                <div className="p-3 md:p-5 flex-1 flex flex-col md:block">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 flex-1">
                    {/* Product Info */}
                    <div className="flex flex-col md:flex-row items-start gap-3 md:gap-4 flex-1 min-w-0">
                      <div className="relative w-full md:w-16 aspect-square md:h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 group-hover:scale-105 transition-transform duration-200">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl md:text-xl ${product.image_url ? 'hidden' : 'flex'}`}>
                          {product.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-center justify-between md:justify-start gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm md:text-lg truncate max-w-[120px] md:max-w-none">{product.name}</h3>
                          <Badge variant={product.is_active !== false ? "default" : "destructive"} className={`text-[10px] md:text-xs px-1.5 py-0 h-5 ${product.is_active !== false ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200" : "bg-red-100 text-red-800 hover:bg-red-200 border-red-200"}`}>
                            {product.is_active !== false ? 'Actif' : 'Inactif'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 hidden md:block">{product.description}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 md:mt-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1 truncate max-w-full">
                            <User className="w-3 h-3" /> <span className="hidden md:inline">Vendeur:</span> <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{product.seller?.name || product.Seller?.name || 'N/A'}</span>
                          </span>
                          <span className="hidden sm:inline text-gray-300">•</span>
                          <span className="flex items-center gap-1">
                            <Box className="w-3 h-3" /> <span className="hidden md:inline">Stock:</span> <span className="font-medium text-gray-700 dark:text-gray-300">{product.stock_quantity || 0}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 md:gap-8 w-full md:w-auto border-t md:border-t-0 border-gray-100 dark:border-gray-700 pt-2 md:pt-0 mt-auto md:mt-0">
                      <div className="flex flex-col items-start md:items-end">
                        <span className="text-base md:text-2xl font-bold text-gray-900 dark:text-white">
                          {product.price?.toLocaleString()} <span className="text-[10px] md:text-sm font-normal text-gray-500">FCFA</span>
                        </span>
                        <span className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1 hidden md:flex">
                          <Calendar className="w-3 h-3" />
                          Ajouté le {new Date(product.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex gap-1 md:gap-2">
                        <Button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowProductModal(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="h-7 md:h-9 text-xs md:text-sm border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 px-2 md:px-4"
                        >
                          <Eye className="w-3.5 h-3.5 md:w-4 md:h-4 md:mr-2" />
                          <span className="hidden md:inline">Détails</span>
                        </Button>
                        <Button
                          onClick={() => handleDeleteProduct(product.id)}
                          variant="destructive"
                          size="icon"
                          className="h-7 w-7 md:h-9 md:w-9 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-100 shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Categories */}
                  {product.categories && product.categories.length > 0 && (
                    <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-gray-50 dark:border-gray-700/50 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar hidden md:flex">
                      <Tag className="w-3 h-3 text-gray-400 shrink-0" />
                      {product.categories.map((category, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-600 shrink-0">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Détails Produit */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
            <div className="sticky top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center z-10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Détails du Produit
              </h3>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowProductModal(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Image et informations principales */}
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Image du produit */}
                <div className="relative w-full sm:w-40 h-40 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 shadow-sm border border-gray-100 dark:border-gray-600">
                  {selectedProduct.image_url ? (
                    <img 
                      src={selectedProduct.image_url} 
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-4xl ${selectedProduct.image_url ? 'hidden' : 'flex'}`}>
                    {selectedProduct.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedProduct.name}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{selectedProduct.description}</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant={selectedProduct.is_active !== false ? "default" : "destructive"} className="px-3 py-1">
                      {selectedProduct.is_active !== false ? 'Actif' : 'Inactif'}
                    </Badge>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {selectedProduct.price?.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Informations détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl border border-gray-100 dark:border-gray-700">
                  <h5 className="font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <Box className="w-4 h-4 text-blue-500" />
                    Informations Générales
                  </h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-500 dark:text-gray-400">ID Produit</span>
                      <span className="font-medium text-gray-900 dark:text-white font-mono text-xs">{selectedProduct.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-500 dark:text-gray-400">Vendeur</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">{selectedProduct.seller?.name || selectedProduct.Seller?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-500 dark:text-gray-400">Stock disponible</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedProduct.stock_quantity || 0} unités</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-500 dark:text-gray-400">Date création</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedProduct.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl border border-gray-100 dark:border-gray-700">
                  <h5 className="font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-500" />
                    Statistiques & Catégories
                  </h5>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Valeur du stock</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {((selectedProduct.price || 0) * (selectedProduct.stock_quantity || 0)).toLocaleString()} FCFA
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Catégories</span>
                      {selectedProduct.categories && selectedProduct.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedProduct.categories.map((category, index) => (
                            <Badge key={index} variant="outline" className="bg-white dark:bg-gray-800">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Aucune catégorie</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowProductModal(false)}
              >
                Fermer
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteProduct(selectedProduct.id);
                  setShowProductModal(false);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer le produit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage; 