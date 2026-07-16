import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

const RouteTest = () => {
  const { seller, isAdmin, isAuthenticated } = useAuth();

  return (
    <Card className="border-2 border-red-500">
      <CardHeader>
        <CardTitle className="text-red-600">🔒 Test de Protection des Routes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Informations Utilisateur</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Nom:</strong> {seller?.name}</p>
              <p><strong>Rôle:</strong> {seller?.role}</p>
              <p><strong>Authentifié:</strong> 
                <Badge variant={isAuthenticated ? "default" : "destructive"} className="ml-2">
                  {isAuthenticated ? "Oui" : "Non"}
                </Badge>
              </p>
              <p><strong>Admin:</strong> 
                <Badge variant={isAdmin ? "default" : "secondary"} className="ml-2">
                  {isAdmin ? "Oui" : "Non"}
                </Badge>
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Accès aux Routes</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Routes Admin:</strong> 
                <Badge variant={isAdmin ? "default" : "destructive"} className="ml-2">
                  {isAdmin ? "Autorisé" : "Bloqué"}
                </Badge>
              </p>
              <p><strong>Routes Vendeur:</strong> 
                <Badge variant={!isAdmin ? "default" : "destructive"} className="ml-2">
                  {!isAdmin ? "Autorisé" : "Bloqué"}
                </Badge>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Routes Testées:</h4>
          <div className="text-sm space-y-1">
            <p>✅ <code>/admin</code> - {isAdmin ? "Accessible" : "Bloqué pour vendeurs"}</p>
            <p>✅ <code>/admin/sellers</code> - {isAdmin ? "Accessible" : "Bloqué pour vendeurs"}</p>
            <p>✅ <code>/dashboard</code> - {!isAdmin ? "Accessible" : "Bloqué pour admins"}</p>
            <p>✅ <code>/products</code> - {!isAdmin ? "Accessible" : "Bloqué pour admins"}</p>
            <p>✅ <code>/orders</code> - {!isAdmin ? "Accessible" : "Bloqué pour admins"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteTest; 