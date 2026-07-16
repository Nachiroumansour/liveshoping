import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  Coins, 
  CreditCard, 
  History, 
  TrendingUp, 
  Plus, 
  Minus, 
  ShoppingCart,
  Package,
  Wallet,
  Gift,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import apiService from '../services/api';

const CreditsPage = () => {
  const [credits, setCredits] = useState(null);
  const [packages, setPackages] = useState({});
  const [paymentMethods, setPaymentMethods] = useState({});
  const [actionCosts, setActionCosts] = useState({});
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchaseDialog, setPurchaseDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadCreditsData();
  }, []);

  const loadCreditsData = async () => {
    try {
      setLoading(true);
      const [creditsData, packagesData, historyData, statsData] = await Promise.all([
        apiService.getCredits(),
        apiService.getCreditPackages(),
        apiService.getCreditHistory(20),
        apiService.getCreditStats()
      ]);

      setCredits(creditsData.data);
      setPackages(packagesData.data.packages);
      setActionCosts(packagesData.data.actionCosts);
      
      // Filter payment methods to only show enabled ones
      const allPaymentMethods = packagesData.data.paymentMethods || {};
      const enabledMethods = Object.entries(allPaymentMethods)
        .filter(([key, value]) => value.enabled === true)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      setPaymentMethods(enabledMethods);
      
      setHistory(historyData.data.transactions);
      setStats(statsData.data);
    } catch (error) {
      console.error('Erreur lors du chargement des crédits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage || !paymentMethod) {
      alert('Veuillez sélectionner un package et une méthode de paiement');
      return;
    }

    try {
      setPurchasing(true);
      const result = await apiService.purchaseCredits(selectedPackage, paymentMethod);
      alert(`Achat réussi ! ${result.data.purchasedCredits} crédits ajoutés.`);
      setPurchaseDialog(false);
      setSelectedPackage('');
      setPaymentMethod('');
      loadCreditsData(); // Recharger les données
    } catch (error) {
      alert(`Erreur lors de l'achat: ${error.message}`);
    } finally {
      setPurchasing(false);
    }
  };

  const getActionIcon = (actionType) => {
    const icons = {
      ADD_PRODUCT: <Plus className="w-4 h-4 " />,
      PROCESS_ORDER: <ShoppingCart className="w-4 h-4 " />,
      PIN_PRODUCT: <Package className="w-4 h-4 " />,
      GENERATE_CUSTOMER_CARD: <CreditCard className="w-4 h-4 " />
    };
    return icons[actionType] || <Coins className="w-4 h-4 " />;
  };

  const getActionColor = (actionType) => {
    const colors = {
      ADD_PRODUCT: 'bg-blue-100 text-blue-800',
      PROCESS_ORDER: 'bg-green-100 text-green-800',
      PIN_PRODUCT: 'bg-purple-100 text-purple-800',
      GENERATE_CUSTOMER_CARD: 'bg-orange-100 text-orange-800'
    };
    return colors[actionType] || 'bg-gray-100 text-gray-800';
  };

  const getTransactionIcon = (type) => {
    const icons = {
      purchase: <CreditCard className="w-4 h-4 text-green-600 " />,
      consumption: <Minus className="w-4 h-4 text-red-600 " />,
      bonus: <Gift className="w-4 h-4 text-blue-600 " />,
      refund: <CheckCircle className="w-4 h-4 text-green-600 " />
    };
    return icons[type] || <Coins className="w-4 h-4 " />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 ">
        <div className="flex items-center justify-center h-64 ">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 "></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-20 sm:pb-6 space-y-6">
      {/* Header moderne avec gradient */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
          <Coins className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Gestion des Crédits
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Gérez votre solde et vos transactions</p>
      </div>

      {/* Bouton d'achat principal - Design moderne */}
      <div className="text-center mb-6">
        <Dialog open={purchaseDialog} onOpenChange={setPurchaseDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg">
              <Plus className="w-5 h-5 mr-3" />
              Acheter des crédits
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
            <DialogHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Acheter des crédits
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="package" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Package</Label>
                <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                  <SelectTrigger className="mt-1 border-2 border-gray-200 dark:border-gray-600 hover:border-purple-400 focus:border-purple-500 rounded-xl">
                    <SelectValue placeholder="Sélectionner un package" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(packages).map(([key, pkg]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col">
                          <span className="font-medium">{key}</span>
                          <span className="text-sm text-gray-500">
                            {pkg.credits} crédits - {pkg.price.toLocaleString()} XOF
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="payment" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Méthode de paiement</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="mt-1 border-2 border-gray-200 dark:border-gray-600 hover:border-purple-400 focus:border-purple-500 rounded-xl">
                    <SelectValue placeholder="Sélectionner une méthode" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(paymentMethods).map(([key, method]) => (
                      <SelectItem key={key} value={key}>
                        {key === 'wave' && 'Wave'}
                        {key === 'orange_money' && 'Orange Money'}
                        {key === 'free_money' && 'Free Money'}
                        {key === 'cash' && 'Espèces'}
                        {key === 'bank_transfer' && 'Virement bancaire'}
                        {key === 'WAVE' && 'Wave'}
                        {key === 'ORANGE_MONEY' && 'Orange Money'}
                        {key === 'FREE_MONEY' && 'Free Money'}
                        {key === 'CASH' && 'Espèces'}
                        {key === 'BANK_TRANSFER' && 'Virement bancaire'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handlePurchase} 
                disabled={purchasing || !selectedPackage || !paymentMethod}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                {purchasing ? 'Achat en cours...' : 'Acheter'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Solde principal - Design moderne avec effet glassmorphism */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        
        <CardContent className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-blue-100 text-sm sm:text-base font-medium">Solde actuel</p>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold break-words mb-2">
                {credits?.balance || 0} <span className="text-2xl sm:text-3xl">crédits</span>
              </h2>
              <p className="text-blue-100 text-sm sm:text-base break-words font-medium">
                {credits?.sellerName}
              </p>
            </div>
            <div className="flex justify-center sm:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
                <div className="relative bg-white/20 p-4 rounded-full">
                  <Coins className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-3 p-2 bg-white-100 dark:bg-gray-800 rounded-2xl mb-20 sm:mb-0">
          <TabsTrigger value="overview" className="text-xs sm:text-sm px-4 py-3 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-md rounded-xl transition-all duration-200">
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="packages" className="text-xs sm:text-sm px-4 py-3 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-md rounded-xl transition-all duration-200">
            Packages
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm px-4 py-3 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-md rounded-xl transition-all duration-200">
            Historique
          </TabsTrigger>
          <TabsTrigger value="stats" className="text-xs sm:text-sm px-4 py-3 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-md rounded-xl transition-all duration-200">
            Statistiques
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-4">
          {/* Coûts des actions - Design moderne */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                Coûts des actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(actionCosts).map(([action, cost]) => (
                  <div key={action} className="group p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 hover:border-purple-200 dark:hover:border-purple-600 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
                          {getActionIcon(action)}
                        </div>
                        <span className="text-sm font-medium break-words text-gray-700 dark:text-gray-200">
                          {action === 'ADD_PRODUCT' && 'Ajouter un produit'}
                          {action === 'PROCESS_ORDER' && 'Traiter une commande'}
                          {action === 'PIN_PRODUCT' && 'Épingler un produit'}
                          {action === 'GENERATE_CUSTOMER_CARD' && 'Fiche client'}
                        </span>
                      </div>
                      <Badge variant="secondary" className="ml-3 flex-shrink-0 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-700">
                        {cost} crédit{cost > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Statistiques rapides - Design moderne */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 dark:bg-green-800/40 rounded-full">
                      <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Total acheté</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-green-800 dark:text-green-200">{stats.totalPurchased}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">crédits achetés</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-red-100 dark:bg-red-800/40 rounded-full">
                      <Minus className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">Total consommé</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-red-800 dark:text-red-200">{stats.totalConsumed}</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">crédits utilisés</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="packages" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Object.entries(packages).map(([key, pkg]) => (
              <Card key={key} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                <CardHeader className="pb-4">
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span className="capitalize break-words text-lg font-semibold text-gray-800 dark:text-gray-200">{key}</span>
                    <Badge variant="outline" className="self-start sm:self-auto bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-700">
                      {pkg.credits} crédits
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                        {pkg.price.toLocaleString()} XOF
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {pkg.credits} crédits pour {pkg.price.toLocaleString()} XOF
                      </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ~{(pkg.price / pkg.credits).toFixed(0)} XOF par crédit
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6 pt-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                Historique des transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80 sm:h-96">
                <div className="space-y-4">
                  {history.map((transaction) => (
                    <div key={transaction.id} className="group p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 hover:border-purple-200 dark:hover:border-purple-600 hover:shadow-md transition-all duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm break-words dark:text-white text-gray-800 dark:text-gray-200">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(transaction.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <p className={`font-bold text-lg ${transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount} crédits
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Solde: {transaction.balance_after}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6 pt-4">
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 hover:shadow-xl transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800/40 rounded-full">
                      <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    Solde actuel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl sm:text-4xl font-bold text-blue-800 dark:text-blue-200 mb-2">{stats.currentBalance}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">crédits disponibles</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 hover:shadow-xl transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-green-100 dark:bg-green-800/40 rounded-full">
                      <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    Total acheté
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl sm:text-4xl font-bold text-green-800 dark:text-green-200 mb-2">{stats.totalPurchased}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">crédits achetés</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 hover:shadow-xl transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-red-100 dark:bg-red-800/40 rounded-full">
                      <Minus className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    Total consommé
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl sm:text-4xl font-bold text-red-800 dark:text-red-200 mb-2">{stats.totalConsumed}</p>
                  <p className="text-sm text-red-600 dark:text-red-400">crédits utilisés</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 hover:shadow-xl transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-purple-100 dark:bg-purple-800/40 rounded-full">
                      <Gift className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    Total bonus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl sm:text-4xl font-bold text-purple-800 dark:text-purple-200 mb-2">{stats.totalBonus}</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">crédits bonus</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreditsPage; 