import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Shield, 
  Users, 
  Activity,
  AlertTriangle,
  Lock,
  Eye,
  Settings,
  UserCheck,
  UserX,
  Clock,
  AlertCircle,
  Search,
  Filter,
  CheckCircle,
  Key
} from 'lucide-react';
import apiService from '../services/api';

const AdminSecurityPage = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminSellers();
      setSellers(response.data.sellers);
    } catch (error) {
      console.error('Erreur lors du chargement des vendeurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (sellerId, newRole) => {
    try {
      await apiService.updateSeller(sellerId, { role: newRole });
      loadSellers();
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error);
    }
  };

  const handleStatusChange = async (sellerId, currentStatus) => {
    try {
      await apiService.updateSeller(sellerId, { is_active: !currentStatus });
      loadSellers();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'superadmin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'seller': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';
  };

  const filteredSellers = sellers.filter(seller => {
    const matchesRole = selectedRole === 'all' || seller.role === selectedRole;
    const matchesSearch = seller.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          seller.phone_number.includes(searchTerm);
    return matchesRole && matchesSearch;
  });

  const stats = {
    total: sellers.length,
    superadmin: sellers.filter(s => s.role === 'superadmin').length,
    admin: sellers.filter(s => s.role === 'admin').length,
    seller: sellers.filter(s => s.role === 'seller').length,
    active: sellers.filter(s => s.is_active).length,
    inactive: sellers.filter(s => !s.is_active).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-4 md:p-8 space-y-8 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sécurité & Rôles
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestion des permissions, rôles et surveillance de la sécurité.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {stats.total} Utilisateurs
              </span>
           </div>
        </div>
      </div>

      {/* Statistiques Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-red-500 to-orange-600 text-white">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="text-red-100 text-xs md:text-sm font-medium mb-1 truncate">Super Admins</p>
                <h3 className="text-xl md:text-3xl font-bold truncate">{stats.superadmin}</h3>
              </div>
              <div className="p-1.5 md:p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0 ml-2">
                <Shield className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
            </div>
            <div className="mt-2 md:mt-4 flex items-center text-red-100 text-[10px] md:text-sm">
              <Lock className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span className="truncate">Accès complet</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-gray-800 border-l-4 border-l-blue-500">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium mb-1 truncate">Administrateurs</p>
                <h3 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">{stats.admin}</h3>
              </div>
              <div className="p-1.5 md:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg shrink-0 ml-2">
                <UserCheck className="w-4 h-4 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-2 md:mt-4 w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(stats.admin / stats.total) * 100}%` }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-gray-800 border-l-4 border-l-green-500">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium mb-1 truncate">Vendeurs Actifs</p>
                <h3 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">{stats.active}</h3>
              </div>
              <div className="p-1.5 md:p-2 bg-green-50 dark:bg-green-900/20 rounded-lg shrink-0 ml-2">
                <CheckCircle className="w-4 h-4 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-2 md:mt-4 flex items-center text-green-600 text-[10px] md:text-sm font-medium">
              <Activity className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span className="truncate">En ligne</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-gray-800 border-l-4 border-l-gray-500">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium mb-1 truncate">Comptes Suspendus</p>
                <h3 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">{stats.inactive}</h3>
              </div>
              <div className="p-1.5 md:p-2 bg-gray-100 dark:bg-gray-700 rounded-lg shrink-0 ml-2">
                <UserX className="w-4 h-4 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <div className="mt-2 md:mt-4 flex items-center text-gray-500 text-[10px] md:text-sm font-medium">
              <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span className="truncate">Action requise</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Liste des utilisateurs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filtres */}
          <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  />
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative w-full md:w-48">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none appearance-none cursor-pointer"
                    >
                      <option value="all">Tous les rôles</option>
                      <option value="superadmin">SuperAdmin</option>
                      <option value="admin">Admin</option>
                      <option value="seller">Vendeur</option>
                    </select>
                  </div>
                  
                  <Button onClick={loadSellers} variant="outline" size="icon" className="shrink-0">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {filteredSellers.map((sellerItem) => (
              <div 
                key={sellerItem.id} 
                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="p-3 md:p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm md:text-lg shrink-0 shadow-sm">
                        {sellerItem.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm md:text-lg truncate">{sellerItem.name}</h3>
                          <Badge variant="outline" className={`${getRoleColor(sellerItem.role)} text-[10px] md:text-xs px-1.5 py-0.5`}>
                            {sellerItem.role}
                          </Badge>
                          <Badge variant="outline" className={`${getStatusColor(sellerItem.is_active)} text-[10px] md:text-xs px-1.5 py-0.5`}>
                            {sellerItem.is_active ? 'Actif' : 'Suspendu'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 md:gap-4 mt-1 text-xs md:text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                          <span>{sellerItem.phone_number}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="font-mono text-[10px] md:text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded truncate max-w-[150px]">ID: {sellerItem.public_link_id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-gray-50 dark:border-gray-700 w-full md:w-auto pl-14 md:pl-0">
                      <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <select
                            value={sellerItem.role}
                            onChange={(e) => handleRoleChange(sellerItem.id, e.target.value)}
                            className="flex-1 sm:flex-none text-xs md:text-sm border border-gray-200 dark:border-gray-700 rounded-md px-2 md:px-3 py-1.5 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-red-500 outline-none h-8 md:h-9"
                            disabled={sellerItem.phone_number === '+221771842787'}
                          >
                            <option value="seller">Vendeur</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">SuperAdmin</option>
                          </select>
                          
                          <Button
                            size="sm"
                            variant={sellerItem.is_active ? "destructive" : "default"}
                            className={`flex-1 sm:flex-none h-8 md:h-9 text-xs md:text-sm ${sellerItem.is_active ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200" : "bg-green-600 hover:bg-green-700 text-white"}`}
                            onClick={() => handleStatusChange(sellerItem.id, sellerItem.is_active)}
                            disabled={sellerItem.phone_number === '+221771842787'}
                          >
                            {sellerItem.is_active ? 'Suspendre' : 'Activer'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertes de sécurité Sidebar */}
        <div className="space-y-6">
          <Card className="border-none shadow-lg bg-white dark:bg-gray-800 sticky top-6">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-red-50/50 dark:bg-red-900/10">
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                Alertes de sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {sellers.filter(s => s.credit_balance < 10).map(seller => (
                  <div key={`alert-credit-${seller.id}`} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full shrink-0">
                        <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{seller.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Solde critique: <span className="font-bold text-orange-600">{seller.credit_balance} crédits</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {sellers.filter(s => !s.is_active).map(seller => (
                  <div key={`alert-status-${seller.id}`} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full shrink-0">
                        <UserX className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{seller.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Compte suspendu ou inactif
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {sellers.filter(s => s.credit_balance < 10).length === 0 && 
                 sellers.filter(s => !s.is_active).length === 0 && (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tout est sécurisé</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Aucune alerte de sécurité détectée pour le moment.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-blue-50 dark:bg-blue-900/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Key className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-300 text-sm">Politique de sécurité</h4>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 leading-relaxed">
                    Les super-administrateurs ont un accès complet. Les administrateurs peuvent gérer les vendeurs mais pas les autres admins. Les vendeurs ont un accès limité à leur propre dashboard.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSecurityPage; 