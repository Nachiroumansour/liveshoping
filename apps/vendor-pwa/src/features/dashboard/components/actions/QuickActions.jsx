import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Video, 
  ShoppingCart, 
  Settings, 
  TrendingUp,
  Package,
  Users,
  CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'create-product',
      title: 'Ajouter un produit',
      description: 'Créer un nouveau produit',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      iconColor: 'text-blue-500',
      route: '/products',
      action: () => navigate('/products?action=create')
    },
    {
      id: 'start-live',
      title: 'Démarrer un live',
      description: 'Lancer une diffusion en direct',
      icon: Video,
      color: 'bg-red-500 hover:bg-red-600',
      iconColor: 'text-red-500',
      route: '/lives',
      action: () => navigate('/lives?action=create')
    },
    {
      id: 'view-orders',
      title: 'Voir les commandes',
      description: 'Gérer les commandes reçues',
      icon: ShoppingCart,
      color: 'bg-green-500 hover:bg-green-600',
      iconColor: 'text-green-500',
      route: '/orders',
      action: () => navigate('/orders')
    },
    // {
    //   id: 'manage-credits',
    //   title: 'Gérer les crédits',
    //   description: 'Acheter et gérer vos crédits',
    //   icon: CreditCard,
    //   color: 'bg-purple-500 hover:bg-purple-600',
    //   iconColor: 'text-purple-500',
    //   route: '/credits',
    //   action: () => navigate('/credits')
    // }, // Désactivé temporairement
    {
      id: 'view-stats',
      title: 'Statistiques',
      description: 'Analyser vos performances',
      icon: TrendingUp,
      color: 'bg-orange-500 hover:bg-orange-600',
      iconColor: 'text-orange-500',
      route: '/stats',
      action: () => navigate('/stats')
    },
    {
      id: 'manage-products',
      title: 'Gérer les produits',
      description: 'Modifier vos produits existants',
      icon: Package,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      iconColor: 'text-indigo-500',
      route: '/products',
      action: () => navigate('/products')
    },
    {
      id: 'manage-lives',
      title: 'Gérer les lives',
      description: 'Voir et modifier vos lives',
      icon: Video,
      color: 'bg-pink-500 hover:bg-pink-600',
      iconColor: 'text-pink-500',
      route: '/lives',
      action: () => navigate('/lives')
    },
    {
      id: 'settings',
      title: 'Paramètres',
      description: 'Configurer votre compte',
      icon: Settings,
      color: 'bg-gray-500 hover:bg-gray-600',
      iconColor: 'text-gray-500',
      route: '/settings',
      action: () => navigate('/settings')
    }
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Plus className="h-5 w-5 text-white" />
          </div>
          Actions rapides
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                onClick={action.action}
                variant="outline"
                className={`h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-200 ${action.color} border-0 text-white`}
              >
                <div className={`p-2 bg-white/20 rounded-full`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions; 