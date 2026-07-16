import React, { useState, useEffect } from 'react';
import { Activity, Zap, Clock, Database } from 'lucide-react';
import { Badge } from './ui/badge';

const PerformanceIndicator = ({ 
  apiCalls = 0, 
  cacheHits = 0, 
  lastUpdate = null, 
  isRealtime = false 
}) => {
  const [performance, setPerformance] = useState({
    apiCalls,
    cacheHits,
    efficiency: 0,
    lastUpdate: lastUpdate
  });

  useEffect(() => {
    setPerformance(prev => ({
      ...prev,
      apiCalls,
      cacheHits,
      efficiency: apiCalls > 0 ? Math.round((cacheHits / apiCalls) * 100) : 0,
      lastUpdate
    }));
  }, [apiCalls, cacheHits, lastUpdate]);

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 80) return 'bg-green-100 text-green-800';
    if (efficiency >= 60) return 'bg-yellow-100 text-yellow-800';
    if (efficiency >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getEfficiencyIcon = (efficiency) => {
    if (efficiency >= 80) return '🚀';
    if (efficiency >= 60) return '⚡';
    if (efficiency >= 40) return '🔄';
    return '🐌';
  };

  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'Jamais';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
    return `Il y a ${Math.floor(diff / 86400000)}j`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          Performance API
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Efficacité du cache */}
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {performance.efficiency}%
          </div>
          <div className="text-xs text-gray-500 mb-2">
            Efficacité cache
          </div>
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getEfficiencyColor(performance.efficiency)}`}>
            <span>{getEfficiencyIcon(performance.efficiency)}</span>
            {performance.efficiency >= 80 ? 'Excellent' :
             performance.efficiency >= 60 ? 'Bon' :
             performance.efficiency >= 40 ? 'Moyen' : 'Faible'}
          </div>
        </div>

        {/* Appels API */}
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {performance.apiCalls}
          </div>
          <div className="text-xs text-gray-500 mb-2">
            Appels API
          </div>
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Database className="w-3 h-3" />
            Total
          </div>
        </div>
      </div>

      {/* Détails */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            Cache hits: {performance.cacheHits}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-400" />
            {formatLastUpdate(performance.lastUpdate)}
          </span>
        </div>
      </div>

      {/* Conseils d'optimisation */}
      {performance.efficiency < 60 && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          💡 Conseil: Optimisez votre utilisation du cache pour de meilleures performances
        </div>
      )}
    </div>
  );
};

export default PerformanceIndicator; 