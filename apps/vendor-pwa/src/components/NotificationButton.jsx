import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useNotificationStore } from '../hooks/useNotificationStore';

const NotificationButton = ({ onClick, className = "" }) => {
  const { unreadCount = 0, isConnected } = useNotificationStore();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`relative ${className}`}
    >
      <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-purple-600 dark:text-purple-400' : ''}`} />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold bg-red-500 hover:bg-red-600 border-2 border-white dark:border-gray-800"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
      {!isConnected && (
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800"></div>
      )}
    </Button>
  );
};

export default NotificationButton;
