import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ApiService from '../services/api';
import webSocketService from '../services/websocket';
import { formatActivityEvent } from '../utils/activityMessages';
import { Activity, Sparkles } from 'lucide-react';

const LAST_SEEN_KEY = 'pulse_last_seen_at';

export default function PulsePage() {
  const { seller } = useAuth();
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchActivity() {
      try {
        setLoading(true);
        const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
        const res = await ApiService.getActivity(lastSeen, 30);

        if (cancelled) return;

        setEvents(res.events || []);
        setSummary(res.summary || null);

        // Marquer la visite APRÈS avoir capturé le résumé calculé avec l'ancien repère
        localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
      } catch (error) {
        console.error('❌ Erreur lors du chargement du pouls de la boutique:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchActivity();

    return () => {
      cancelled = true;
    };
  }, []);

  // Temps réel : nouvel événement boutique → ajouté en tête du fil
  const handleShopActivity = useCallback((event) => {
    setEvents((prev) => [event, ...prev]);
  }, []);

  useEffect(() => {
    webSocketService.on('shop_activity', handleShopActivity);

    return () => {
      webSocketService.off('shop_activity');
    };
  }, [handleShopActivity]);

  const summaryRows = summary
    ? [
        { key: 'orders', count: summary.orders, emoji: '🛍️', label: 'commandes' },
        { key: 'paid', count: summary.paid, emoji: '💰', label: 'payées' },
        { key: 'delivered', count: summary.delivered, emoji: '🚚', label: 'livraisons' },
        { key: 'comments', count: summary.comments, emoji: '💬', label: 'commentaires' },
        { key: 'stock_alerts', count: summary.stock_alerts, emoji: '⚠️', label: 'alertes stock' },
      ].filter((row) => row.count > 0)
    : [];

  const formattedEvents = events
    .map((event) => {
      const formatted = formatActivityEvent(event);
      return formatted ? { ...formatted, id: event.id } : null;
    })
    .filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement du pouls de ta boutique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full px-4 py-2 lg:py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-3 lg:p-6 text-white mb-4 lg:mb-8">
          <h1 className="text-xl lg:text-3xl font-bold">Bonjour {seller?.name} 👋</h1>
          <p className="text-purple-100 text-sm lg:text-lg">Le pouls de ta boutique</p>
        </div>

        {/* Pendant ton absence */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm mb-6 lg:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-xl dark:text-white">
              <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
              Pendant ton absence
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryRows.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {summaryRows.map((row) => (
                  <div
                    key={row.key}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    <span>{row.emoji}</span>
                    <span>{row.count} {row.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">
                Tout est calme — rien de nouveau depuis ta dernière visite
              </p>
            )}
          </CardContent>
        </Card>

        {/* Fil d'activité */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl dark:text-white">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Activité
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              Les derniers événements de ta boutique, en direct
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formattedEvents.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">
                  Ta boutique n'a pas encore d'activité.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Partage ton lien pour recevoir tes premières commandes !
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {formattedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 border border-gray-100 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-700/50"
                  >
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0 pt-0.5 w-12">
                      {event.timeLabel}
                    </span>
                    <span className="text-lg leading-none">{event.emoji}</span>
                    <p className="text-sm text-gray-800 dark:text-gray-200 flex-1">{event.sentence}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
