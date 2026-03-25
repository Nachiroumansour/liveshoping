import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useCreditsModuleStatus from '../hooks/useCreditsModuleStatus';
import { Menu, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Home,
  Package,
  ShoppingBag,
  BarChart3,
  Store,
  Coins,
  Shield,
  Users,
  Lock,
  Wallet,
  MessageCircle,
  LogOut,
  Settings
} from 'lucide-react';
import NotificationToast from './NotificationToast';
import ThemeToggle from './ThemeToggle';
import NotificationIndicator from './NotificationIndicator';
import NotificationButton from './NotificationButton';

const Layout = ({ children }) => {

  // const [sidebarOpen, setSidebarOpen] = useState(false); // réservé pour futures évolutions
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { seller, credits, refreshCredits, isAdmin, logout } = useAuth();
  const { isEnabled: creditsEnabled } = useCreditsModuleStatus();
  
  // Debug logging
  useEffect(() => {
    console.log('🎯 Layout Debug:', {
      seller: seller?.name,
      credits: credits?.balance,
      creditsEnabled,
      isAdmin
    });
  }, [seller, credits, creditsEnabled, isAdmin]);
  
  const navigation = isAdmin ? [
    // Navigation pour SuperAdmin
    { id: 'admin', name: 'Tableau de bord', icon: Home, path: '/admin' },
    { id: 'sellers', name: 'Gestion Vendeurs', icon: Users, path: '/admin/sellers' },
    { id: 'orders', name: 'Supervision Commandes', icon: ShoppingBag, path: '/admin/orders' },
    { id: 'products', name: 'Modération Produits', icon: Package, path: '/admin/products' },
    { id: 'credits', name: 'Gestion Crédits', icon: Coins, path: '/admin/credits' },
    { id: 'security', name: 'Sécurité', icon: Lock, path: '/admin/security' },
  ] : [
    // Navigation pour vendeurs normaux
    // Les 5 premiers sont dans la bottom nav mobile, le reste dans le menu hamburger
    { id: 'dashboard', name: 'Accueil', icon: Home, path: '/dashboard' },
    { id: 'products', name: 'Produits', icon: Package, path: '/products' },
    { id: 'orders', name: 'Commandes', icon: ShoppingBag, path: '/orders' },
    { id: 'wallet', name: 'Paiement', icon: Wallet, path: '/wallet' },
    { id: 'lives', name: 'Sessions', icon: Store, path: '/lives' },
    // Stats et paramètres accessibles via menu hamburger
    { id: 'stats', name: 'Statistiques', icon: BarChart3, path: '/stats' },
    { id: 'settings', name: 'Paramètres', icon: Settings, path: '/settings' },
  ];

  // Rafraîchir les crédits périodiquement (seulement pour les vendeurs)
  useEffect(() => {
    if (!seller || isAdmin) return;
    
    const interval = setInterval(refreshCredits, 30000);
    
    return () => clearInterval(interval);
  }, [seller, refreshCredits, isAdmin]);

  // Le système de notifications est maintenant géré par le NotificationContext

  const handleNavigation = (path) => {
    navigate(path);
  };

  // const handleViewOrder = (orderId) => {
  //   navigate(`/orders/${orderId}`);
  // };

  const handleCreditsClick = () => {
    navigate('/credits');
  };

  // Fonction pour obtenir le nom d'affichage selon la taille d'écran
  const getDisplayName = (item) => {
    // Noms courts pour mobile, longs pour desktop
    const shortNames = {
      // Vendeur
      'dashboard': 'Accueil',
      'products': 'Produits', 
      'orders': 'Commandes',
      'stats': 'Stats',
      'lives': 'Sessions',
      'wallet': 'Wallet',
      'settings': 'Paramètres',
      // Admin
      'admin': 'Accueil',
      'sellers': 'Vendeurs',
      'credits': 'Crédits',
      'security': 'Sécurité'
    };
    
    // Cas spéciaux pour Admin qui partagent des IDs ou concepts similaires
    if (isAdmin) {
       if (item.id === 'orders') return 'Commandes'; // Supervision Commandes -> Commandes
       if (item.id === 'products') return 'Produits'; // Modération Produits -> Produits
    }
    
    return shortNames[item.id] || item.name;
  };

  // Détermine la page active à partir de l'URL
  const getActivePage = () => {
    const currentPath = location.pathname;
    
    // Trouver tous les items dont le chemin correspond au début de l'URL actuelle
    // On gère le cas exact OU le cas où c'est un sous-chemin (ex: /admin/sellers/123 match /admin/sellers)
    const matches = navigation.filter(item => 
      currentPath === item.path || currentPath.startsWith(`${item.path}/`)
    );
    
    if (matches.length > 0) {
      // Retourner l'ID de l'item avec le chemin le plus long (le plus spécifique)
      // Cela permet de distinguer /admin de /admin/sellers
      return matches.reduce((prev, current) => 
        prev.path.length > current.path.length ? prev : current
      ).id;
    }
    
    return 'dashboard';
  };
  const activePage = getActivePage();

  // Logic for responsive navigation
  const MAX_BOTTOM_NAV_ITEMS = 5;
  const visibleNavItems = navigation.slice(0, MAX_BOTTOM_NAV_ITEMS);
  const hiddenNavItems = navigation.slice(MAX_BOTTOM_NAV_ITEMS);

  // Fermer le menu mobile quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileMenu && !event.target.closest('.mobile-menu')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileMenu]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-gray-900 dark:text-white truncate">LiveShop Link</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {isAdmin ? 'Espace Administration' : seller?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-2">
          {/* Indicateur de crédits - Optimisé pour mobile - Visible seulement si module activé */}
          {credits && !isAdmin && creditsEnabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/credits')}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white border-0 shadow-lg font-bold px-2 py-1"
            >
              <Coins className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium hidden sm:inline">{credits.balance} crédits</span>
              <span className="text-xs font-medium sm:hidden">{credits.balance}</span>
            </Button>
          )}
          {/* Bouton notifications */}
          <NotificationButton onClick={() => setShowNotifications(!showNotifications)} />
          {/* Bouton thème */}
          <ThemeToggle />
          
          {/* Menu mobile avec déconnexion */}
          <div className="relative mobile-menu">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="relative"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            {/* Menu déroulant mobile */}
            {showMobileMenu && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="py-2">
                  {/* Items hidden from bottom nav */}
                  {hiddenNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          handleNavigation(item.path);
                          setShowMobileMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {item.name}
                      </button>
                    );
                  })}
                  
                  {/* Separator if needed */}
                  {hiddenNavItems.length > 0 && <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>}

                  {!isAdmin && creditsEnabled && (
                    <button
                      onClick={() => {
                        navigate('/credits');
                        setShowMobileMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <Coins className="w-4 h-4 mr-2" />
                      Gérer les crédits
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar - Caché sur mobile */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:bg-white lg:dark:bg-gray-800 lg:shadow-xl lg:h-screen">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Store className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">LiveShop Link</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isAdmin ? 'Espace Administration' : 'Espace Vendeur'}
              </p>
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-white font-bold text-xl">
                    {seller?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{seller?.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{seller?.phone_number}</p>
                <div className="mt-3 px-3 py-2 bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 text-xs rounded-full shadow-sm border border-purple-200 dark:border-purple-600">
                  ID: {seller?.public_link_id}
                </div>
                {/* {credits && !isAdmin && (
                  <div className="mt-3 px-4 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white text-sm rounded-xl shadow-lg border-0 flex items-center justify-center font-bold">
                    <Coins className="w-4 h-4 mr-2" />
                    {credits.balance} crédits
                  </div>
                )} */}
              </div>
            </CardContent>
          </Card>
          

        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <li key={item.id}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start h-12 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:from-purple-700 hover:to-blue-700' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400'
                    }`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : ''}`} />
                    <span className="font-medium">{isAdmin ? item.name : (item.id === 'dashboard' ? 'Tableau de bord' : item.id === 'stats' ? 'Statistiques' : item.name)}</span>
                  </Button>
                </li>
              );
            })}
          </ul>
          
          {/* Bouton thème dans la sidebar */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Thème</span>
              <ThemeToggle />
            </div>
          </div>
          
          {/* Bouton crédits pour vendeurs (sidebar desktop) */}
          {/* {!isAdmin && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 rounded-xl text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300 transition-all duration-200"
                onClick={handleCreditsClick}
              >
                <Coins className="w-5 h-5 mr-3" />
                <span className="font-medium">Gérer les crédits</span>
              </Button>
            </div>
          )} */}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start h-12 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Se déconnecter</span>
          </Button>
        </div>
      </div>

      {/* Desktop Header - Caché sur mobile */}
      <div className="hidden lg:block lg:fixed lg:top-0 lg:left-72 lg:right-0 lg:z-40 lg:bg-white lg:dark:bg-gray-800 lg:shadow-sm lg:border-b lg:border-gray-200 lg:dark:border-gray-700">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6  lg:pb-6 pt-[40px]">
          <div className="flex items-center space-x-4 pl-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {activePage === 'dashboard' && 'Tableau de bord'}
              {activePage === 'products' && 'Produits'}
              {activePage === 'orders' && 'Commandes'}
              {activePage === 'stats' && 'Statistiques'}
              {activePage === 'lives' && 'Sessions'}
              {activePage === 'credits' && 'Gérer les crédits'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            {/* Indicateur de crédits pour desktop - Visible seulement si module activé */}
            {credits && !isAdmin && creditsEnabled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/credits')}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white border-0 shadow-lg font-bold px-4 py-2"
              >
                <Coins className="w-4 h-4 mr-2" />
                <span className="font-medium">{credits.balance} crédits</span>
              </Button>
            )}
            {/* Bouton notifications pour desktop */}
            <NotificationButton onClick={() => setShowNotifications(!showNotifications)} />
            {/* Bouton thème pour desktop */}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="pt-16 lg:pt-16 lg:ml-72">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 lg:py-6 pb-20 lg:pb-6 pt-2 lg:pt-[59px]">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar - Amélioré pour mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center justify-around px-1 py-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                  isActive
                    ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
              >
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-purple-600 dark:text-purple-400' : ''}`} />
                <span className="text-xs font-medium truncate w-full text-center leading-tight">{getDisplayName(item)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Indicateur de notifications global - UNE SEULE INSTANCE */}
      <NotificationIndicator 
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />
    </div>
  );
};

export default Layout;