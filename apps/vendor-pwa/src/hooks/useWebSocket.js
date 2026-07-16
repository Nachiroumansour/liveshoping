import { useState, useEffect } from 'react';
import webSocketService from '../services/websocket';
import { useAuth } from '../contexts/AuthContext';

export const useWebSocket = () => {
  const { token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) return;

    const connectWebSocket = async () => {
      try {
        await webSocketService.connect(token);
        setIsConnected(true);
        setSocket(webSocketService.socket);
      } catch (error) {
        console.error('❌ Erreur connexion WebSocket:', error);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    // Écouter les changements de connexion
    const handleConnect = () => {
      setIsConnected(true);
      setSocket(webSocketService.socket);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setSocket(null);
    };

    if (webSocketService.socket) {
      webSocketService.socket.on('connect', handleConnect);
      webSocketService.socket.on('disconnect', handleDisconnect);
    }

    return () => {
      if (webSocketService.socket) {
        webSocketService.socket.off('connect', handleConnect);
        webSocketService.socket.off('disconnect', handleDisconnect);
      }
    };
  }, [token]);

  return {
    socket: webSocketService.socket,
    isConnected: webSocketService.isConnected,
    connect: webSocketService.connect.bind(webSocketService),
    disconnect: webSocketService.disconnect.bind(webSocketService),
    onNewOrder: webSocketService.onNewOrder.bind(webSocketService),
    onOrderStatusUpdate: webSocketService.onOrderStatusUpdate.bind(webSocketService),
    onNotification: webSocketService.onNotification.bind(webSocketService),
    forceReconnect: webSocketService.forceReconnect.bind(webSocketService),
    getConnectionStats: webSocketService.getConnectionStats.bind(webSocketService)
  };
}; 