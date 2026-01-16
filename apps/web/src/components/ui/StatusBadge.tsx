import React from 'react';
import { cn } from '../../lib/utils';
import { OrderStatus } from '../../types';
import { Clock, ChefHat, CheckCircle, Package, XCircle, AlertCircle } from 'lucide-react';

/**
 * Configuration for each order status
 */
const statusConfig: Record<OrderStatus, {
  label: string;
  icon: React.ElementType;
  className: string;
}> = {
  PENDING: {
    label: 'En attente',
    icon: Clock,
    className: 'bg-status-pending-bg text-status-pending-text border-status-pending-border',
  },
  CONFIRMED: {
    label: 'Confirmée',
    icon: AlertCircle,
    className: 'bg-primary-100 text-primary-700 border-primary-300',
  },
  PREPARING: {
    label: 'En préparation',
    icon: ChefHat,
    className: 'bg-status-preparing-bg text-status-preparing-text border-status-preparing-border',
  },
  READY: {
    label: 'Prête',
    icon: CheckCircle,
    className: 'bg-status-ready-bg text-status-ready-text border-status-ready-border',
  },
  COMPLETED: {
    label: 'Récupérée',
    icon: Package,
    className: 'bg-status-completed-bg text-status-completed-text border-status-completed-border',
  },
  CANCELLED: {
    label: 'Annulée',
    icon: XCircle,
    className: 'bg-status-cancelled-bg text-status-cancelled-text border-status-cancelled-border',
  },
};

interface StatusBadgeProps {
  /** The order status */
  status: OrderStatus;
  /** Show icon alongside text */
  showIcon?: boolean;
  /** Optional count to display */
  count?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

/**
 * StatusBadge - Displays order status with appropriate color coding and icon
 *
 * @example
 * <StatusBadge status="PENDING" />
 * <StatusBadge status="PREPARING" showIcon count={3} />
 */
export function StatusBadge({
  status,
  showIcon = true,
  count,
  size = 'md',
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium border',
        'transition-colors duration-200',
        sizeClasses[size],
        config.className,
        className
      )}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      <span>{config.label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full',
            'bg-current/20 min-w-[1.25rem]',
            size === 'sm' ? 'h-4 text-[10px] px-1' : 'h-5 text-xs px-1.5'
          )}
        >
          {count}
        </span>
      )}
    </span>
  );
}

/**
 * Get the status label for an order status
 */
export function getStatusLabel(status: OrderStatus): string {
  return statusConfig[status]?.label || status;
}

/**
 * Get the status color class for an order status
 */
export function getStatusColorClass(status: OrderStatus): string {
  return statusConfig[status]?.className || '';
}

/**
 * Get the status bar color class for order cards
 */
export function getStatusBarClass(status: OrderStatus): string {
  const barClasses: Record<OrderStatus, string> = {
    PENDING: 'bg-status-pending',
    CONFIRMED: 'bg-primary-500',
    PREPARING: 'bg-status-preparing',
    READY: 'bg-status-ready',
    COMPLETED: 'bg-status-completed',
    CANCELLED: 'bg-status-cancelled',
  };
  return barClasses[status] || 'bg-gray-400';
}

export default StatusBadge;
