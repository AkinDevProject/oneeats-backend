import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import {
  AlertTriangle,
  ShoppingCart,
  Store,
  Clock,
  X,
  ChevronRight,
  Phone,
  Eye,
  CheckCircle,
  Bell,
  BellOff
} from 'lucide-react';

type AlertSeverity = 'critical' | 'warning' | 'info';
type AlertType = 'order' | 'restaurant' | 'system' | 'user';

export interface AdminAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: Date;
  actionLabel?: string;
  onAction?: () => void;
  metadata?: Record<string, unknown>;
}

interface AdminAlertZoneProps {
  alerts: AdminAlert[];
  onDismiss?: (alertId: string) => void;
  onDismissAll?: () => void;
  onAction?: (alert: AdminAlert) => void;
  className?: string;
  maxVisible?: number;
  collapsible?: boolean;
}

const severityConfig: Record<AlertSeverity, {
  bg: string;
  border: string;
  icon: string;
  badge: string;
  pulse?: boolean;
}> = {
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    badge: 'bg-red-600',
    pulse: true
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    badge: 'bg-amber-500'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    badge: 'bg-blue-500'
  },
};

const typeIcons: Record<AlertType, React.ElementType> = {
  order: ShoppingCart,
  restaurant: Store,
  system: AlertTriangle,
  user: Clock,
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Il y a ${diffHours}h`;

  return `Il y a ${Math.floor(diffHours / 24)}j`;
}

function AlertItem({
  alert,
  onDismiss,
  onAction
}: {
  alert: AdminAlert;
  onDismiss?: (id: string) => void;
  onAction?: (alert: AdminAlert) => void;
}) {
  const config = severityConfig[alert.severity];
  const Icon = typeIcons[alert.type];

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg border transition-all',
        'hover:shadow-md',
        config.bg,
        config.border
      )}
    >
      {/* Icon with pulse for critical */}
      <div className="relative flex-shrink-0">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          alert.severity === 'critical' ? 'bg-red-100' :
          alert.severity === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
        )}>
          <Icon className={cn('h-5 w-5', config.icon)} />
        </div>
        {config.pulse && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-900 truncate">{alert.title}</h4>
          <span className={cn(
            'px-2 py-0.5 text-xs font-medium text-white rounded-full',
            config.badge
          )}>
            {alert.severity === 'critical' ? 'URGENT' :
             alert.severity === 'warning' ? 'Attention' : 'Info'}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-0.5 truncate">{alert.message}</p>
        <span className="text-xs text-gray-400 mt-1">{formatTimeAgo(alert.timestamp)}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {alert.actionLabel && (
          <button
            onClick={() => onAction?.(alert)}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              alert.severity === 'critical'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : alert.severity === 'warning'
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            )}
          >
            {alert.type === 'restaurant' ? <Phone className="h-3.5 w-3.5" /> :
             alert.type === 'order' ? <Eye className="h-3.5 w-3.5" /> :
             <ChevronRight className="h-3.5 w-3.5" />}
            {alert.actionLabel}
          </button>
        )}
        {onDismiss && (
          <button
            onClick={() => onDismiss(alert.id)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            title="Ignorer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * AdminAlertZone - Zone d'alertes critiques pour le dashboard admin
 * Affiche les alertes prioritaires avec actions rapides
 */
export function AdminAlertZone({
  alerts,
  onDismiss,
  onDismissAll,
  onAction,
  className,
  maxVisible = 3,
  collapsible = true,
}: AdminAlertZoneProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Sort by severity (critical first) then by timestamp (newest first)
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;
  const visibleAlerts = showAll ? sortedAlerts : sortedAlerts.slice(0, maxVisible);
  const hasMore = sortedAlerts.length > maxVisible;

  if (alerts.length === 0) {
    return (
      <div className={cn(
        'bg-green-50 border border-green-200 rounded-xl p-4',
        className
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-green-900">Tout est opérationnel</h4>
            <p className="text-sm text-green-700">Aucune alerte active pour le moment</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-5 w-5 text-gray-600" />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {criticalCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Alertes actives
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({alerts.length})
              </span>
            </h3>
          </div>

          {/* Badges de comptage */}
          <div className="flex items-center gap-2 ml-2">
            {criticalCount > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                {criticalCount} critique{criticalCount > 1 ? 's' : ''}
              </span>
            )}
            {warningCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                {warningCount} attention
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onDismissAll && alerts.length > 1 && (
            <button
              onClick={onDismissAll}
              className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            >
              Tout ignorer
            </button>
          )}
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              title={isCollapsed ? "Afficher les alertes" : "Masquer les alertes"}
            >
              {isCollapsed ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Alerts List */}
      {!isCollapsed && (
        <div className="p-4 space-y-3">
          {visibleAlerts.map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onDismiss={onDismiss}
              onAction={onAction}
            />
          ))}

          {/* Show more button */}
          {hasMore && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-2 text-sm text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors font-medium"
            >
              Voir {sortedAlerts.length - maxVisible} alerte{sortedAlerts.length - maxVisible > 1 ? 's' : ''} de plus
            </button>
          )}

          {showAll && hasMore && (
            <button
              onClick={() => setShowAll(false)}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Réduire
            </button>
          )}
        </div>
      )}

      {/* Collapsed state indicator */}
      {isCollapsed && criticalCount > 0 && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100">
          <p className="text-sm text-red-700 font-medium">
            ⚠️ {criticalCount} alerte{criticalCount > 1 ? 's' : ''} critique{criticalCount > 1 ? 's' : ''} en attente
          </p>
        </div>
      )}
    </div>
  );
}

export default AdminAlertZone;
