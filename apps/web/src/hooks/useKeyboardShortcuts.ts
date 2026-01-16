import { useEffect, useCallback, useState } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
  category?: string;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

/**
 * Hook pour gérer les raccourcis clavier dans l'application
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts([
 *   { key: 'r', ctrl: true, description: 'Actualiser', action: handleRefresh },
 *   { key: 'n', ctrl: true, description: 'Nouvelle commande', action: handleNewOrder },
 * ]);
 * ```
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, preventDefault = true } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;

        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          if (preventDefault) {
            event.preventDefault();
          }
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts, enabled, preventDefault]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Hook pour afficher/masquer le panneau d'aide des raccourcis
 */
export function useShortcutsHelp() {
  const [isVisible, setIsVisible] = useState(false);

  const toggle = useCallback(() => setIsVisible((v) => !v), []);
  const show = useCallback(() => setIsVisible(true), []);
  const hide = useCallback(() => setIsVisible(false), []);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isVisible]);

  return { isVisible, toggle, show, hide };
}

/**
 * Raccourcis clavier par défaut pour le dashboard admin
 */
export function getAdminDashboardShortcuts(handlers: {
  onRefresh?: () => void;
  onExport?: () => void;
  onToggleAnalytics?: () => void;
  onNavigateOrders?: () => void;
  onNavigateRestaurants?: () => void;
  onNavigateUsers?: () => void;
  onNavigateStats?: () => void;
  onShowHelp?: () => void;
}): KeyboardShortcut[] {
  const shortcuts: KeyboardShortcut[] = [];

  if (handlers.onRefresh) {
    shortcuts.push({
      key: 'r',
      ctrl: true,
      description: 'Actualiser les données',
      action: handlers.onRefresh,
      category: 'Actions',
    });
  }

  if (handlers.onExport) {
    shortcuts.push({
      key: 'e',
      ctrl: true,
      description: 'Exporter les données',
      action: handlers.onExport,
      category: 'Actions',
    });
  }

  if (handlers.onToggleAnalytics) {
    shortcuts.push({
      key: 'a',
      ctrl: true,
      description: 'Afficher/Masquer analytics',
      action: handlers.onToggleAnalytics,
      category: 'Affichage',
    });
  }

  if (handlers.onNavigateOrders) {
    shortcuts.push({
      key: '1',
      alt: true,
      description: 'Aller aux commandes',
      action: handlers.onNavigateOrders,
      category: 'Navigation',
    });
  }

  if (handlers.onNavigateRestaurants) {
    shortcuts.push({
      key: '2',
      alt: true,
      description: 'Aller aux restaurants',
      action: handlers.onNavigateRestaurants,
      category: 'Navigation',
    });
  }

  if (handlers.onNavigateUsers) {
    shortcuts.push({
      key: '3',
      alt: true,
      description: 'Aller aux utilisateurs',
      action: handlers.onNavigateUsers,
      category: 'Navigation',
    });
  }

  if (handlers.onNavigateStats) {
    shortcuts.push({
      key: '4',
      alt: true,
      description: 'Aller aux statistiques',
      action: handlers.onNavigateStats,
      category: 'Navigation',
    });
  }

  if (handlers.onShowHelp) {
    shortcuts.push({
      key: '?',
      shift: true,
      description: 'Afficher les raccourcis',
      action: handlers.onShowHelp,
      category: 'Aide',
    });
  }

  return shortcuts;
}

export default useKeyboardShortcuts;
