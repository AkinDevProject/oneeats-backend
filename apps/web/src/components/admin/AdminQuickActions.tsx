import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import {
  Plus,
  X,
  ShoppingCart,
  Store,
  Users,
  FileText,
  Bell,
  Settings,
  RefreshCcw,
  Download,
  MessageSquare,
} from 'lucide-react';

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color?: string;
  onClick: () => void;
  badge?: number;
  disabled?: boolean;
}

interface AdminQuickActionsProps {
  actions?: QuickAction[];
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  onOpenNotifications?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  pendingOrdersCount?: number;
  unreadNotificationsCount?: number;
  className?: string;
}

const defaultActions: QuickAction[] = [
  {
    id: 'new-order',
    label: 'Nouvelle commande',
    icon: <ShoppingCart className="h-5 w-5" />,
    color: 'bg-blue-500 hover:bg-blue-600',
    onClick: () => {},
  },
  {
    id: 'add-restaurant',
    label: 'Ajouter restaurant',
    icon: <Store className="h-5 w-5" />,
    color: 'bg-green-500 hover:bg-green-600',
    onClick: () => {},
  },
  {
    id: 'add-user',
    label: 'Nouvel utilisateur',
    icon: <Users className="h-5 w-5" />,
    color: 'bg-violet-500 hover:bg-violet-600',
    onClick: () => {},
  },
  {
    id: 'generate-report',
    label: 'Générer rapport',
    icon: <FileText className="h-5 w-5" />,
    color: 'bg-amber-500 hover:bg-amber-600',
    onClick: () => {},
  },
];

const positionClasses = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
};

/**
 * AdminQuickActions - Barre d'actions flottante
 * Bouton FAB avec menu d'actions rapides
 */
export function AdminQuickActions({
  actions = defaultActions,
  position = 'bottom-right',
  onOpenNotifications,
  onRefresh,
  onExport,
  pendingOrdersCount = 0,
  unreadNotificationsCount = 0,
  className,
}: AdminQuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const allActions: QuickAction[] = [
    ...actions,
    ...(onOpenNotifications
      ? [{
          id: 'notifications',
          label: 'Notifications',
          icon: <Bell className="h-5 w-5" />,
          color: 'bg-indigo-500 hover:bg-indigo-600',
          onClick: onOpenNotifications,
          badge: unreadNotificationsCount,
        }]
      : []),
    ...(onRefresh
      ? [{
          id: 'refresh',
          label: 'Actualiser',
          icon: <RefreshCcw className="h-5 w-5" />,
          color: 'bg-gray-600 hover:bg-gray-700',
          onClick: onRefresh,
        }]
      : []),
    ...(onExport
      ? [{
          id: 'export',
          label: 'Exporter',
          icon: <Download className="h-5 w-5" />,
          color: 'bg-gray-600 hover:bg-gray-700',
          onClick: onExport,
        }]
      : []),
  ];

  return (
    <div className={cn('fixed z-40', positionClasses[position], className)}>
      {/* Action menu */}
      <div
        className={cn(
          'absolute bottom-16 right-0 flex flex-col-reverse gap-3 transition-all duration-300',
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        {allActions.map((action, index) => (
          <div
            key={action.id}
            className="flex items-center gap-3 justify-end"
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
            }}
          >
            {/* Label */}
            <span className="px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-lg whitespace-nowrap">
              {action.label}
            </span>

            {/* Action button */}
            <button
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              disabled={action.disabled}
              className={cn(
                'relative w-12 h-12 rounded-full shadow-lg text-white transition-all',
                'flex items-center justify-center',
                'hover:scale-110 active:scale-95',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                action.color || 'bg-violet-500 hover:bg-violet-600'
              )}
            >
              {action.icon}

              {/* Badge */}
              {action.badge && action.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {action.badge > 9 ? '9+' : action.badge}
                </span>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Main FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 rounded-full shadow-xl text-white transition-all duration-300',
          'flex items-center justify-center',
          'hover:scale-110 active:scale-95',
          isOpen
            ? 'bg-gray-800 hover:bg-gray-900 rotate-45'
            : 'bg-gradient-to-br from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700'
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}

        {/* Notification indicator */}
        {!isOpen && (pendingOrdersCount > 0 || unreadNotificationsCount > 0) && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {(pendingOrdersCount + unreadNotificationsCount) > 9
              ? '9+'
              : pendingOrdersCount + unreadNotificationsCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * AdminCommandPalette - Palette de commandes (Cmd+K style)
 * Pour des actions rapides avec recherche
 */
export function AdminCommandPalette({
  isOpen,
  onClose,
  onAction,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAction: (actionId: string) => void;
}) {
  const [search, setSearch] = useState('');

  const commands = [
    { id: 'go-orders', label: 'Aller aux commandes', icon: <ShoppingCart className="h-4 w-4" />, shortcut: 'Alt+1' },
    { id: 'go-restaurants', label: 'Aller aux restaurants', icon: <Store className="h-4 w-4" />, shortcut: 'Alt+2' },
    { id: 'go-users', label: 'Aller aux utilisateurs', icon: <Users className="h-4 w-4" />, shortcut: 'Alt+3' },
    { id: 'go-stats', label: 'Aller aux statistiques', icon: <FileText className="h-4 w-4" />, shortcut: 'Alt+4' },
    { id: 'refresh', label: 'Actualiser les données', icon: <RefreshCcw className="h-4 w-4" />, shortcut: 'Ctrl+R' },
    { id: 'export', label: 'Exporter les données', icon: <Download className="h-4 w-4" />, shortcut: 'Ctrl+E' },
    { id: 'notifications', label: 'Ouvrir les notifications', icon: <Bell className="h-4 w-4" />, shortcut: 'N' },
    { id: 'settings', label: 'Paramètres', icon: <Settings className="h-4 w-4" />, shortcut: 'Ctrl+,' },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fadeIn"
        onClick={onClose}
      />
      <div className="fixed inset-x-4 top-1/4 max-w-lg mx-auto bg-white rounded-2xl shadow-2xl z-50 overflow-hidden animate-scaleIn">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <MessageSquare className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une commande..."
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-400"
            autoFocus
          />
          <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs text-gray-500">
            Esc
          </kbd>
        </div>

        {/* Commands list */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <p className="text-sm">Aucune commande trouvée</p>
            </div>
          ) : (
            filteredCommands.map(cmd => (
              <button
                key={cmd.id}
                onClick={() => {
                  onAction(cmd.id);
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-violet-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 group-hover:text-violet-600">{cmd.icon}</span>
                  <span className="text-sm text-gray-700 group-hover:text-violet-700">{cmd.label}</span>
                </div>
                <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs text-gray-500 group-hover:bg-violet-100 group-hover:border-violet-200">
                  {cmd.shortcut}
                </kbd>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>Navigation: ↑↓</span>
          <span>Exécuter: ↵</span>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.15s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
      `}</style>
    </>
  );
}

export default AdminQuickActions;
