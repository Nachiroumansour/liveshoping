import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Coins, 
  Search, 
  Filter,
  Eye,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  User,
  Activity,
  X,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Settings
} from 'lucide-react';
import apiService from '../services/api';

const AdminCreditsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSeller, setFilterSeller] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showAddCredits, setShowAddCredits] = useState(false);
  const [selectedSellerForCredits, setSelectedSellerForCredits] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');

  useEffect(() => {
    loadTransactions();
    loadSellers();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      console.log('Chargement des transactions...');
      const response = await apiService.getAdminTransactions();
      console.log('Réponse transactions:', response);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSellers = async () => {
    try {
      console.log('Chargement des vendeurs...');
      const response = await apiService.getAdminSellers();
      console.log('Réponse vendeurs:', response);
      setSellers(response.data.sellers);
    } catch (error) {
      console.error('Erreur lors du chargement des vendeurs:', error);
    }
  };

  const handleAddCredits = async () => {
    if (!selectedSellerForCredits || !creditAmount || !creditReason) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      await apiService.updateSellerCredits(
        selectedSellerForCredits, 
        parseInt(creditAmount), 
        creditReason
      );
      setShowAddCredits(false);
      setSelectedSellerForCredits('');
      setCreditAmount('');
      setCreditReason('');
      loadTransactions();
      loadSellers();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de crédits:', error);
    }
  };

  const handleRemoveCredits = async () => {
    if (!selectedSellerForCredits || !creditAmount || !creditReason) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      await apiService.updateSellerCredits(
        selectedSellerForCredits, 
        -parseInt(creditAmount), 
        creditReason
      );
      setShowAddCredits(false);
      setSelectedSellerForCredits('');
      setCreditAmount('');
      setCreditReason('');
      loadTransactions();
      loadSellers();
    } catch (error) {
      console.error('Erreur lors du retrait de crédits:', error);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'purchase': return 'bg-green-100 text-green-800 border-green-200';
      case 'consumption': return 'bg-red-100 text-red-800 border-red-200';
      case 'bonus': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'refund': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'purchase': return <Plus className="w-3 h-3" />;
      case 'consumption': return <Minus className="w-3 h-3" />;
      case 'bonus': return <TrendingUp className="w-3 h-3" />;
      case 'refund': return <TrendingDown className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'purchase': return 'Achat';
      case 'consumption': return 'Consommation';
      case 'bonus': return 'Bonus';
      case 'refund': return 'Remboursement';
      default: return type;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.Seller?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesSeller = filterSeller === 'all' || transaction.seller_id?.toString() === filterSeller;
    
    return matchesSearch && matchesType && matchesSeller;
  });

  const stats = {
    total: transactions.length,
    purchases: transactions.filter(t => t.type === 'purchase').length,
    consumptions: transactions.filter(t => t.type === 'consumption').length,
    bonuses: transactions.filter(t => t.type === 'bonus').length,
    totalCreditsAdded: transactions
      .filter(t => ['purchase', 'bonus', 'refund'].includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0),
    totalCreditsConsumed: transactions
      .filter(t => t.type === 'consumption')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-4 md:p-8 space-y-8 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Gestion des Crédits
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
            Administration globale du système de crédits et transactions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
           <div className="bg-white dark:bg-gray-800 px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <Activity className="w-4 h-4 text-yellow-500" />
              <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                {stats.total} Transactions
              </span>
           </div>
           <Button 
              onClick={() => window.location.href = '/admin/credits/settings'} 
              variant="outline"
              size="sm"
              className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 shadow-md h-9"
            >
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </Button>
           <Button 
              onClick={() => setShowAddCredits(true)} 
              size="sm"
              className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-md shadow-yellow-500/20 h-9"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Gérer
            </Button>
        </div>
      </div>

      {/* Statistiques Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="text-yellow-100 text-xs md:text-sm font-medium mb-1 truncate">Crédits Ajoutés</p>
                <h3 className="text-xl md:text-3xl font-bold truncate">{stats.totalCreditsAdded.toLocaleString()}</h3>
              </div>
              <div className="p-1.5 md:p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0 ml-2">
                <ArrowUpRight className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
            </div>
            <div className="mt-2 md:mt-4 flex items-center text-yellow-100 text-[10px] md:text-sm">
              <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span className="truncate">Total entrées</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-gray-800 border-l-4 border-l-red-500">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium mb-1 truncate">Crédits Consommés</p>
                <h3 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">{stats.totalCreditsConsumed.toLocaleString()}</h3>
              </div>
              <div className="p-1.5 md:p-2 bg-red-50 dark:bg-red-900/20 rounded-lg shrink-0 ml-2">
                <ArrowDownLeft className="w-4 h-4 md:w-6 md:h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-2 md:mt-4 w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full rounded-full" style={{ width: '75%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-gray-800 border-l-4 border-l-green-500">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium mb-1 truncate">Achats</p>
                <h3 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">{stats.purchases}</h3>
              </div>
              <div className="p-1.5 md:p-2 bg-green-50 dark:bg-green-900/20 rounded-lg shrink-0 ml-2">
                <CreditCard className="w-4 h-4 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-2 md:mt-4 flex items-center text-green-600 text-[10px] md:text-sm font-medium">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span className="truncate">Transactions</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-gray-800 border-l-4 border-l-blue-500">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium mb-1 truncate">Bonus Distribués</p>
                <h3 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">{stats.bonuses}</h3>
              </div>
              <div className="p-1.5 md:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg shrink-0 ml-2">
                <Coins className="w-4 h-4 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-2 md:mt-4 flex items-center text-blue-600 text-[10px] md:text-sm font-medium">
              <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span className="truncate">Récompenses</span>
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
                placeholder="Rechercher une transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-yellow-500"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative min-w-[180px]">
                <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none appearance-none cursor-pointer"
                >
                  <option value="all">Tous les types</option>
                  <option value="purchase">Achats</option>
                  <option value="consumption">Consommations</option>
                  <option value="bonus">Bonus</option>
                  <option value="refund">Remboursements</option>
                </select>
              </div>

              <div className="relative min-w-[180px]">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterSeller}
                  onChange={(e) => setFilterSeller(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none appearance-none cursor-pointer"
                >
                  <option value="all">Tous les vendeurs</option>
                  {sellers.map(seller => (
                    <option key={seller.id} value={seller.id.toString()}>
                      {seller.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button onClick={loadTransactions} variant="outline" className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <Filter className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des transactions */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700 bg-transparent shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Coins className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">Aucune transaction trouvée</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
                Aucune transaction ne correspond à vos critères de recherche.
              </p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterSeller('all');
                }}
              >
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="p-3 md:p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    {/* Transaction Info */}
                    <div className="flex items-start gap-3 md:gap-4 flex-1">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm md:text-lg shrink-0 shadow-sm">
                        {transaction.type.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm md:text-lg truncate">
                            {transaction.seller?.name || transaction.Seller?.name || 'N/A'}
                          </h3>
                          <Badge variant="outline" className={`${getTypeColor(transaction.type)} text-[10px] md:text-xs px-1.5 py-0.5`}>
                            <span className="flex items-center gap-1">
                              {getTypeIcon(transaction.type)}
                              {getTypeText(transaction.type)}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5 md:mt-1 line-clamp-1">{transaction.description}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 md:mt-2 text-[10px] md:text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> 
                            {new Date(transaction.created_at).toLocaleDateString()} à {new Date(transaction.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Amount & Actions */}
                    <div className="flex flex-row items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 border-gray-50 dark:border-gray-700 pt-3 md:pt-0 mt-1 md:mt-0 pl-14 md:pl-0">
                      <div className="flex flex-col items-start md:items-end">
                        <span className={`text-lg md:text-2xl font-bold ${transaction.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1">
                          Solde: {transaction.balance_before?.toLocaleString()} → {transaction.balance_after?.toLocaleString()}
                        </span>
                      </div>
                      
                      <Button
                        onClick={() => setSelectedTransaction(transaction)}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs md:text-sm border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        Détails
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Détails Transaction */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
            <div className="sticky top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center z-10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Détails de la Transaction
              </h3>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setSelectedTransaction(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* En-tête de la transaction */}
              <div className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md">
                  {selectedTransaction.type.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {getTypeText(selectedTransaction.type)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedTransaction.seller?.name || selectedTransaction.Seller?.name || 'N/A'}
                  </p>
                  <div className="mt-1">
                    <Badge variant="outline" className={getTypeColor(selectedTransaction.type)}>
                      <span className="flex items-center gap-1">
                        {getTypeIcon(selectedTransaction.type)}
                        {getTypeText(selectedTransaction.type)}
                      </span>
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Informations détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Montant</label>
                    <p className={`text-2xl font-bold ${selectedTransaction.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {selectedTransaction.amount >= 0 ? '+' : ''}{selectedTransaction.amount.toLocaleString()} crédits
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                      {selectedTransaction.description || 'Aucune description'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type d'action</label>
                    <p className="text-gray-900 dark:text-white font-mono text-sm bg-gray-50 dark:bg-gray-700/30 p-2 rounded border border-gray-100 dark:border-gray-700 inline-block">
                      {selectedTransaction.action_type || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-gray-500" />
                      Évolution du solde
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Avant</span>
                        <span className="font-mono font-medium text-gray-900 dark:text-white">{selectedTransaction.balance_before?.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-px bg-gray-200 dark:bg-gray-600"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Après</span>
                        <span className="font-mono font-bold text-gray-900 dark:text-white">{selectedTransaction.balance_after?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                    <Badge className={selectedTransaction.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
                      {selectedTransaction.status === 'completed' ? 'Terminé' : selectedTransaction.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Informations temporelles */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex flex-wrap gap-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedTransaction.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  {new Date(selectedTransaction.created_at).toLocaleTimeString('fr-FR')}
                </div>
              </div>

              {/* Métadonnées si disponibles */}
              {selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Informations supplémentaires</label>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {JSON.stringify(selectedTransaction.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedTransaction(null)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout/Retrait de crédits */}
      {showAddCredits && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-yellow-500" />
                Gestion des crédits
              </h3>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowAddCredits(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vendeur</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={selectedSellerForCredits}
                    onChange={(e) => setSelectedSellerForCredits(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Sélectionner un vendeur</option>
                    {sellers.map(seller => (
                      <option key={seller.id} value={seller.id}>
                        {seller.name} ({seller.credit_balance} crédits)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Montant</label>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    placeholder="Nombre de crédits"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Raison</label>
                <Input
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  placeholder="Raison de l'opération (ex: Bonus mensuel)"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button 
                  onClick={handleAddCredits}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
                <Button 
                  onClick={handleRemoveCredits}
                  variant="destructive"
                  className="flex-1"
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Retirer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCreditsPage; 