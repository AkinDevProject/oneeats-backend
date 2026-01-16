import React, { useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  ShoppingCart,
  Store,
  Users,
  AlertTriangle,
  Info,
  Clock,
  ChevronRight,
  Settings,
} from 'lucide-react';

export type NotificationType = 'order' | 'restaurant' | 'user' | 'system' | 'alert';
export type NotificationPriority = 'high' | 'medium' | 'low';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
}

interface AdminNotificationCenterProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onAction?: (notification: Notification) => void;
}

const typeConfig: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  order: { icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-100' },
  restaurant: { icon: Store, color: 'text-green-600', bg: 'bg-green-100' },
  user: { icon: Users, color: 'text-violet-600', bg: 'bg-violet-100' },
  system: { icon: Settings, color: 'text-gray-600', bg: 'bg-gray-100' },
  alert: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
};

const priorityConfig: Record<NotificationPriority, { dot: string; label: string }> = {
  high: { dot: 'bg-red-500', label: 'Haute' },
  medium: { dot: 'bg-yellow-500', label: 'Moyenne' },
  low: { dot: 'bg-gray-400', label: 'Basse' },
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Il y a ${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Il y a ${diffDays}j`;

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onAction,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAction?: (notification: Notification) => void;
}) {
  const config = typeConfig[notification.type];
  const priority = priorityConfig[notification.priority];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'group relative p-4 border-b border-gray-100 transition-colors',
        notification.read ? 'bg-white' : 'bg-violet-50/50',
        'hover:bg-gray-50'
      )}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-violet-500" />
      )}

      <div className="flex items-start gap-3 pl-3">
        {/* Icon */}
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', config.bg)}>
          <Icon className={cn('h-5 w-5', config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={cn('font-medium text-gray-900 truncate', !notification.read && 'font-semibold')}>
              {notification.title}
            </h4>
            {notification.priority === 'high' && (
              <span className={cn('w-2 h-2 rounded-full flex-shrink-0', priority.dot)} />
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(notification.timestamp)}
            </span>
            {notification.actionLabel && (
              <button
                onClick={() => onAction?.(notification)}
                className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
              >
                {notification.actionLabel}
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.read && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Marquer comme lu"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(notification.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * AdminNotificationCenter - Centre de notifications avec historique
 * Panneau latéral droit avec toutes les notifications
 */
export function AdminNotificationCenter({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  onAction,
}: AdminNotificationCenterProps) {
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const groupedByDate = filteredNotifications.reduce((acc, notif) => {
    const date = notif.timestamp.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(notif);
    return acc;
  }, {} as Record<string, Notification[]>);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slideInRight">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-violet-600 to-violet-700">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="h-6 w-6 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Notifications</h2>
              <p className="text-xs text-violet-200">{unreadCount} non lues</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as NotificationType | 'all')}
              className="text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700"
            >
              <option value="all">Toutes</option>
              <option value="order">Commandes</option>
              <option value="restaurant">Restaurants</option>
              <option value="user">Utilisateurs</option>
              <option value="system">Système</option>
              <option value="alert">Alertes</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1 px-2 py-1 hover:bg-violet-50 rounded transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Tout lire
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-gray-500 hover:text-red-600 font-medium flex items-center gap-1 px-2 py-1 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Bell className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            Object.entries(groupedByDate).map(([date, notifs]) => (
              <div key={date}>
                <div className="sticky top-0 px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-500 uppercase">{date}</span>
                </div>
                {notifs.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                    onDelete={onDelete}
                    onAction={onAction}
                  />
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Les notifications sont conservées pendant 30 jours
          </p>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

export default AdminNotificationCenter;
