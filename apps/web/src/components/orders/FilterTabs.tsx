import React from 'react';
import { cn } from '../../lib/utils';
import { OrderStatus } from '../../types';
import { Clock, CheckCircle, ChefHat, Package, XCircle, AlertCircle } from 'lucide-react';

interface FilterTab {
  key: OrderStatus | 'ALL';
  label: string;
  shortLabel: string;
  count: number;
}

interface FilterTabsProps {
  /** Currently selected filter */
  value: OrderStatus | 'ALL';
  /** Called when filter changes */
  onChange: (value: OrderStatus | 'ALL') => void;
  /** Order counts by status */
  counts: Record<OrderStatus, number>;
  /** Whether to show "All" tab */
  showAllTab?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const tabConfig: Record<OrderStatus | 'ALL', {
  icon: React.ElementType;
  colorClass: string;
  activeClass: string;
  badgeClass: string;
}> = {
  ALL: {
    icon: Package,
    colorClass: 'text-gray-600',
    activeClass: 'bg-gray-700 text-white',
    badgeClass: 'bg-gray-200 text-gray-700',
  },
  PENDING: {
    icon: AlertCircle,
    colorClass: 'text-status-pending-text',
    activeClass: 'bg-status-pending text-white',
    badgeClass: 'bg-status-pending-bg text-status-pending-text',
  },
  CONFIRMED: {
    icon: CheckCircle,
    colorClass: 'text-primary-600',
    activeClass: 'bg-primary-500 text-white',
    badgeClass: 'bg-primary-100 text-primary-700',
  },
  PREPARING: {
    icon: ChefHat,
    colorClass: 'text-status-preparing-text',
    activeClass: 'bg-status-preparing text-white',
    badgeClass: 'bg-status-preparing-bg text-status-preparing-text',
  },
  READY: {
    icon: CheckCircle,
    colorClass: 'text-status-ready-text',
    activeClass: 'bg-status-ready text-white',
    badgeClass: 'bg-status-ready-bg text-status-ready-text',
  },
  COMPLETED: {
    icon: Package,
    colorClass: 'text-status-completed-text',
    activeClass: 'bg-status-completed text-white',
    badgeClass: 'bg-status-completed-bg text-status-completed-text',
  },
  CANCELLED: {
    icon: XCircle,
    colorClass: 'text-status-cancelled-text',
    activeClass: 'bg-status-cancelled text-white',
    badgeClass: 'bg-status-cancelled-bg text-status-cancelled-text',
  },
};

const statusLabels: Record<OrderStatus | 'ALL', { label: string; shortLabel: string }> = {
  ALL: { label: 'Toutes', shortLabel: 'Tout' },
  PENDING: { label: 'En attente', shortLabel: 'Attente' },
  CONFIRMED: { label: 'Confirmées', shortLabel: 'Conf.' },
  PREPARING: { label: 'En cours', shortLabel: 'Cours' },
  READY: { label: 'Prêtes', shortLabel: 'Prêtes' },
  COMPLETED: { label: 'Récupérées', shortLabel: 'Récup.' },
  CANCELLED: { label: 'Annulées', shortLabel: 'Annul.' },
};

/**
 * FilterTabs - Status filter tabs for orders
 *
 * @example
 * <FilterTabs
 *   value={filter}
 *   onChange={setFilter}
 *   counts={{ PENDING: 3, PREPARING: 2, READY: 1, ... }}
 * />
 */
export function FilterTabs({
  value,
  onChange,
  counts,
  showAllTab = false,
  className,
}: FilterTabsProps) {
  const tabs: (OrderStatus | 'ALL')[] = showAllTab
    ? ['ALL', 'PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']
    : ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tabs.map((tab) => {
        const config = tabConfig[tab];
        const labels = statusLabels[tab];
        const Icon = config.icon;
        const count = tab === 'ALL' ? totalCount : counts[tab];
        const isActive = value === tab;
        const hasPending = tab === 'PENDING' && count > 0;

        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={cn(
              'relative flex items-center gap-2 px-3 py-2 rounded-lg',
              'text-sm font-medium transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive
                ? config.activeClass
                : `bg-white border border-gray-200 ${config.colorClass} hover:bg-gray-50`
            )}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{labels.label}</span>
            <span className="sm:hidden">{labels.shortLabel}</span>
            <span
              className={cn(
                'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5',
                'rounded-full text-xs font-semibold',
                isActive ? 'bg-white/20' : config.badgeClass
              )}
            >
              {count}
            </span>

            {/* Pulse indicator for pending orders */}
            {hasPending && !isActive && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger-500 rounded-full animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Compact filter tabs for mobile
 */
export function FilterTabsCompact({
  value,
  onChange,
  counts,
  className,
}: Omit<FilterTabsProps, 'showAllTab'>) {
  const tabs: OrderStatus[] = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

  return (
    <div className={cn('grid grid-cols-5 gap-1', className)}>
      {tabs.map((tab) => {
        const config = tabConfig[tab];
        const Icon = config.icon;
        const count = counts[tab];
        const isActive = value === tab;
        const hasPending = tab === 'PENDING' && count > 0;

        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={cn(
              'relative flex flex-col items-center gap-1 p-2 rounded-lg',
              'text-xs font-medium transition-all duration-200',
              isActive
                ? config.activeClass
                : `bg-white border border-gray-200 ${config.colorClass}`
            )}
          >
            <Icon size={16} />
            <span
              className={cn(
                'inline-flex items-center justify-center w-5 h-5',
                'rounded-full text-[10px] font-bold',
                isActive ? 'bg-white/20' : config.badgeClass
              )}
            >
              {count}
            </span>

            {hasPending && !isActive && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger-500 rounded-full animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default FilterTabs;
