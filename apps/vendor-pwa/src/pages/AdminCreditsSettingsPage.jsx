import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import apiService from '../services/api';
import { 
  Settings, 
  Power, 
  DollarSign, 
  Activity,
  TrendingUp,
  Save,
  Package,
  Zap,
  BarChart3,
  CheckCircle2,
  XCircle,
  Edit2,
  Check,
  X
} from 'lucide-react';

const AdminCreditsSettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [editingPackage, setEditingPackage] = useState(null);
  const [editingCost, setEditingCost] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadSettings();
    // Charger les stats seulement si on est sur l'onglet stats
    if (activeTab === 'stats') {
      loadStats();
    }
  }, [activeTab]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getCreditsSettings();
      setSettings(data.data);
      setError(null);
    } catch (err) {
      console.error('Erreur chargement settings:', err);
      const errorMsg = err.message || 'Erreur lors du chargement';
      if (errorMsg.includes('refusé') || errorMsg.includes('403')) {
        setError('⚠️ Accès refusé. Vous devez être connecté en tant qu\'administrateur. Reconnectez-vous.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await apiService.getCreditsStats();
      setStats(data.data);
    } catch (err) {
      console.error('Erreur lors du chargement des stats:', err);
    }
  };

  const handleToggleModule = async () => {
    try {
      setIsSaving(true);
      const data = await apiService.toggleCreditsModule();
      setSettings(prev => ({
        ...prev,
        enabled: data.data.enabled,
        mode: data.data.mode
      }));
      setSuccess(data.data.message);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Erreur lors du toggle');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const data = await apiService.updateCreditsSettings(settings);
      setSettings(data.data);
      setSuccess(data.message || 'Paramètres sauvegardés');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePackage = async (packageType, updatedData) => {
    try {
      setIsSaving(true);
      const data = await apiService.updateCreditPackage(packageType, updatedData);
      
      setSettings(prev => ({
        ...prev,
        packages: {
          ...prev.packages,
          [packageType]: data.data
        }
      }));
      
      setEditingPackage(null);
      setSuccess(`Package ${packageType} mis à jour`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateActionCost = async (actionType, cost) => {
    try {
      setIsSaving(true);
      const data = await apiService.updateActionCost(actionType, parseInt(cost));
      
      setSettings(prev => ({
        ...prev,
        actionCosts: data.data
      }));
      
      setEditingCost(null);
      setSuccess(data.message || 'Coût mis à jour');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">Impossible de charger les paramètres</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-8 h-8 text-purple-600" />
            Paramètres du Module de Crédits
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Contrôlez l'activation, les tarifs et les règles du système de crédits
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
          <XCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Status Card */}
      <Card className="border-2 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${settings.enabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                <Power className={`w-8 h-8 ${settings.enabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Module {settings.enabled ? 'Activé' : 'Désactivé'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Mode: <span className="font-semibold">{settings.mode === 'paid' ? '💳 Payant' : '🆓 Gratuit'}</span>
                </p>
              </div>
            </div>
            <Button
              onClick={handleToggleModule}
              disabled={isSaving}
              className={`${
                settings.enabled 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all`}
            >
              <Power className="w-5 h-5 mr-2" />
              {settings.enabled ? 'Désactiver' : 'Activer'} le module
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          Général
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'packages'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Package className="w-4 h-4" />
          Packages
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'actions'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Zap className="w-4 h-4" />
          Coûts des Actions
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'stats'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Statistiques
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Crédits initiaux pour les nouveaux vendeurs
              </label>
              <Input
                type="number"
                value={settings.initialCredits || 0}
                onChange={(e) => setSettings({
                  ...settings,
                  initialCredits: parseInt(e.target.value) || 0
                })}
                min="0"
                className="max-w-xs"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Nombre de crédits donnés gratuitement aux nouveaux vendeurs
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Méthodes de paiement actives
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(settings.paymentMethods || {}).map(([method, config]) => (
                  <label key={method} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        paymentMethods: {
                          ...settings.paymentMethods,
                          [method]: { ...config, enabled: e.target.checked }
                        }
                      })}
                      className="w-5 h-5"
                    />
                    <span className="font-medium text-gray-900 dark:text-white">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
            </Button>
          </div>
        )}

        {/* Packages */}
        {activeTab === 'packages' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(settings.packages || {}).map(([packageType, data]) => (
              <Card key={packageType} className="border-2 hover:border-purple-300 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{packageType}</h3>
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  
                  {editingPackage === packageType ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Crédits</label>
                        <Input
                          type="number"
                          defaultValue={data.credits}
                          id={`credits-${packageType}`}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Prix (XOF)</label>
                        <Input
                          type="number"
                          defaultValue={data.price}
                          id={`price-${packageType}`}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            const credits = parseInt(document.getElementById(`credits-${packageType}`).value);
                            const price = parseInt(document.getElementById(`price-${packageType}`).value);
                            handleUpdatePackage(packageType, { credits, price });
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingPackage(null)}
                          className="flex-1"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Crédits:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{data.credits}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Prix:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{data.price.toLocaleString()} XOF</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingPackage(packageType)}
                        className="w-full"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Action Costs */}
        {activeTab === 'actions' && (
          <div className="space-y-3">
            {Object.entries(settings.actionCosts || {}).map(([actionType, cost]) => (
              <div key={actionType} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 gap-3 sm:gap-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{actionType}</span>
                </div>
                
                {editingCost === actionType ? (
                  <div className="flex items-center gap-2 w-full sm:w-auto pl-11 sm:pl-0">
                    <Input
                      type="number"
                      defaultValue={cost}
                      id={`cost-${actionType}`}
                      className="w-20 sm:w-24 h-8 sm:h-10"
                      min="0"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const newCost = parseInt(document.getElementById(`cost-${actionType}`).value);
                        handleUpdateActionCost(actionType, newCost);
                      }}
                      className="bg-green-600 hover:bg-green-700 h-8 sm:h-10"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCost(null)}
                      className="h-8 sm:h-10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pl-11 sm:pl-0">
                    <span className="text-base sm:text-lg font-bold text-purple-600">{cost} cr</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCost(actionType)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Statistics */}
        {activeTab === 'stats' && (
          stats ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                    <span className="text-xl md:text-3xl font-bold text-blue-600">{stats.totalTransactions}</span>
                  </div>
                  <p className="text-xs md:text-sm font-medium text-blue-900 dark:text-blue-100">Transactions totales</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                    <span className="text-xl md:text-3xl font-bold text-green-600">{stats.completedTransactions}</span>
                  </div>
                  <p className="text-xs md:text-sm font-medium text-green-900 dark:text-green-100">Complétées</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
                    <span className="text-xl md:text-3xl font-bold text-purple-600">{stats.totalCreditsUsed}</span>
                  </div>
                  <p className="text-xs md:text-sm font-medium text-purple-900 dark:text-purple-100">Crédits consommés</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200">
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />
                    <span className="text-xl md:text-3xl font-bold text-yellow-600 truncate">{stats.totalRevenue?.toLocaleString() || 0}</span>
                  </div>
                  <p className="text-xs md:text-sm font-medium text-yellow-900 dark:text-yellow-100">Revenu (XOF)</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200">
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" />
                    <span className="text-xl md:text-3xl font-bold text-indigo-600">{stats.sellersWithCredits}</span>
                  </div>
                  <p className="text-xs md:text-sm font-medium text-indigo-900 dark:text-indigo-100">Vendeurs avec crédits</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Chargement des statistiques...</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AdminCreditsSettingsPage;
