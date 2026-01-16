import React, { useState } from 'react';
import { cn, formatPrice, formatTime } from '../../lib/utils';
import { OrderStatus } from '../../types';
import { StatusBadge, getStatusBarClass } from '../ui/StatusBadge';
import { TimerBadge } from '../ui/TimerBadge';
import {
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Clock,
  User,
  Phone,
  MessageSquare,
  Package,
  ChefHat,
  RotateCcw,
} from 'lucide-react';

export type OrderCardVariant = 'list' | 'kanban';

/**
 * Simplified Order interface that works with multiple data formats
 */
export interface OrderCardOrder {
  id: string;
  orderNumber?: string;
  status: OrderStatus;
  totalAmount?: number;
  total?: number;
  createdAt: Date | string;
  estimatedPickupTime?: Date | string;
  estimatedTime?: number;
  specialInstructions?: string;
  // Client info - supports both formats
  clientName?: string;
  clientFirstName?: string;
  clientLastName?: string;
  clientEmail?: string;
  clientPhone?: string;
  // Items
  items?: Array<{
    id?: string;
    menuItemId?: string;
    menuItemName?: string;
    name?: string;
    quantity: number;
    unitPrice?: number;
    price?: number;
    subtotal?: number;
    totalPrice?: number;
    specialNotes?: string;
  }>;
}

interface OrderCardProps {
  /** The order data */
  order: OrderCardOrder;
  /** Card variant - list for desktop, kanban for tablet */
  variant?: OrderCardVariant;
  /** Called when the order is accepted (PENDING -> PREPARING) */
  onAccept?: (orderId: string) => void;
  /** Called when the order is rejected (PENDING -> CANCELLED) */
  onReject?: (orderId: string) => void;
  /** Called when the order is marked as ready (PREPARING -> READY) */
  onReady?: (orderId: string) => void;
  /** Called when the order is marked as completed (READY -> COMPLETED) */
  onComplete?: (orderId: string) => void;
  /** Called when a cancelled order is reactivated */
  onReactivate?: (orderId: string) => void;
  /** Called when clicking "view details" */
  onViewDetails?: (order: OrderCardOrder) => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show expanded details by default */
  defaultExpanded?: boolean;
}

/**
 * Get available actions based on order status
 */
function getAvailableActions(status: OrderStatus): {
  primary?: { label: string; action: 'accept' | 'ready' | 'complete' | 'reactivate'; icon: React.ElementType };
  secondary?: { label: string; action: 'reject'; icon: React.ElementType };
} {
  switch (status) {
    case 'PENDING':
      return {
        primary: { label: 'Accepter', action: 'accept', icon: Check },
        secondary: { label: 'Refuser', action: 'reject', icon: X },
      };
    case 'CONFIRMED':
    case 'PREPARING':
      return {
        primary: { label: 'Prêt', action: 'ready', icon: ChefHat },
      };
    case 'READY':
      return {
        primary: { label: 'Récupéré', action: 'complete', icon: Package },
      };
    case 'CANCELLED':
      return {
        primary: { label: 'Réactiver', action: 'reactivate', icon: RotateCcw },
      };
    default:
      return {};
  }
}

/**
 * Get customer name from order (supports multiple data formats)
 */
function getCustomerName(order: OrderCardOrder): string {
  if (order.clientName) {
    return order.clientName;
  }
  if (order.clientFirstName || order.clientLastName) {
    return `${order.clientFirstName || ''} ${order.clientLastName || ''}`.trim();
  }
  return 'Client';
}

/**
 * Get total from order (supports multiple data formats)
 */
function getOrderTotal(order: OrderCardOrder): number {
  return order.totalAmount ?? order.total ?? 0;
}

/**
 * Get item name (supports multiple data formats)
 */
function getItemName(item: OrderCardOrder['items'][number]): string {
  return item.menuItemName || item.name || 'Article';
}

/**
 * Get item subtotal (supports multiple data formats)
 */
function getItemSubtotal(item: OrderCardOrder['items'][number]): number {
  return item.subtotal ?? item.totalPrice ?? (item.quantity * (item.unitPrice ?? item.price ?? 0));
}

/**
 * OrderCard - Displays an order with status, items, and actions
 *
 * Features:
 * - Status bar on the left with color coding
 * - Timer badge showing elapsed time
 * - Expandable details section
 * - Context-aware action buttons
 *
 * @example
 * <OrderCard
 *   order={order}
 *   variant="list"
 *   onAccept={(id) => handleAccept(id)}
 *   onReady={(id) => handleReady(id)}
 * />
 */
export function OrderCard({
  order,
  variant = 'list',
  onAccept,
  onReject,
  onReady,
  onComplete,
  onReactivate,
  onViewDetails,
  className,
  defaultExpanded = false,
}: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const actions = getAvailableActions(order.status);

  const handleAction = (action: 'accept' | 'reject' | 'ready' | 'complete' | 'reactivate') => {
    switch (action) {
      case 'accept':
        onAccept?.(order.id);
        break;
      case 'reject':
        onReject?.(order.id);
        break;
      case 'ready':
        onReady?.(order.id);
        break;
      case 'complete':
        onComplete?.(order.id);
        break;
      case 'reactivate':
        onReactivate?.(order.id);
        break;
    }
  };

  const customerName = getCustomerName(order);
  const orderTotal = getOrderTotal(order);
  const items = order.items || [];
  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const orderNumber = order.orderNumber?.split('-').pop() || order.id.substring(0, 8);

  // Kanban variant - compact card for tablet view
  if (variant === 'kanban') {
    return (
      <div
        className={cn(
          'relative bg-white rounded-lg border border-gray-200 shadow-card overflow-hidden',
          'hover:shadow-card-hover transition-shadow duration-200',
          className
        )}
      >
        {/* Status bar */}
        <div className={cn('absolute left-0 top-0 bottom-0 w-1', getStatusBarClass(order.status))} />

        <div className="pl-3 pr-3 py-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-900">#{orderNumber}</span>
            <TimerBadge startTime={order.createdAt} size="sm" />
          </div>

          {/* Items summary */}
          <div className="text-sm text-gray-600 mb-2">
            {items.slice(0, 3).map((item, idx) => (
              <div key={item.id || idx} className="truncate">
                {item.quantity}x {getItemName(item)}
              </div>
            ))}
            {items.length > 3 && (
              <div className="text-gray-400">+{items.length - 3} autres</div>
            )}
          </div>

          {/* Customer & Total */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 truncate">{customerName}</span>
            <span className="font-medium text-gray-900">{formatPrice(orderTotal)}</span>
          </div>

          {/* Actions */}
          {actions.primary && (
            <button
              onClick={() => handleAction(actions.primary!.action)}
              className={cn(
                'mt-3 w-full btn btn-md touch-target-lg',
                actions.primary.action === 'reject' ? 'btn-danger' : 'btn-primary'
              )}
            >
              <actions.primary.icon size={16} />
              {actions.primary.label}
            </button>
          )}
        </div>
      </div>
    );
  }

  // List variant - detailed card for desktop
  return (
    <div
      className={cn(
        'relative bg-white rounded-lg border border-gray-200 shadow-card overflow-hidden',
        'hover:shadow-card-hover transition-shadow duration-200',
        className
      )}
    >
      {/* Status bar */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-1', getStatusBarClass(order.status))} />

      <div className="pl-4 pr-4 py-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg text-gray-900">#{orderNumber}</span>
                <StatusBadge status={order.status} size="sm" />
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <User size={14} />
                  {customerName}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {formatTime(order.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Package size={14} />
                  {itemsCount} {itemsCount > 1 ? 'articles' : 'article'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TimerBadge startTime={order.createdAt} />
            <span className="text-lg font-semibold text-gray-900">
              {formatPrice(orderTotal)}
            </span>
          </div>
        </div>

        {/* Items Preview (always visible) */}
        <div className="mt-3 flex flex-wrap gap-2">
          {items.slice(0, isExpanded ? undefined : 4).map((item, idx) => (
            <span
              key={item.id || idx}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm text-gray-700"
            >
              <span className="font-medium">{item.quantity}x</span>
              <span className="truncate max-w-[150px]">{getItemName(item)}</span>
            </span>
          ))}
          {!isExpanded && items.length > 4 && (
            <span className="px-2 py-1 text-sm text-gray-500">
              +{items.length - 4} autres
            </span>
          )}
        </div>

        {/* Special Instructions */}
        {order.specialInstructions && (
          <div className="mt-3 flex items-start gap-2 p-2 bg-warning-50 border border-warning-200 rounded-md">
            <MessageSquare size={16} className="text-warning-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-warning-800">{order.specialInstructions}</span>
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            {/* Items Detail */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Détail de la commande</h4>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{item.quantity}x</span>
                      <span className="text-gray-700">{getItemName(item)}</span>
                      {item.specialNotes && (
                        <span className="text-xs text-gray-500 italic">({item.specialNotes})</span>
                      )}
                    </div>
                    <span className="text-gray-600">{formatPrice(getItemSubtotal(item))}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Info */}
            {(order.clientEmail || order.clientPhone) && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Contact client</h4>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {order.clientPhone && (
                    <a
                      href={`tel:${order.clientPhone}`}
                      className="flex items-center gap-1 hover:text-primary-600"
                    >
                      <Phone size={14} />
                      {order.clientPhone}
                    </a>
                  )}
                  {order.clientEmail && (
                    <a
                      href={`mailto:${order.clientEmail}`}
                      className="hover:text-primary-600 truncate"
                    >
                      {order.clientEmail}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer with Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={16} />
                Réduire
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Voir détails
              </>
            )}
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {actions.secondary && (
              <button
                onClick={() => handleAction(actions.secondary!.action)}
                className="btn btn-md btn-ghost text-danger-600 hover:bg-danger-50"
              >
                <actions.secondary.icon size={16} />
                {actions.secondary.label}
              </button>
            )}
            {actions.primary && (
              <button
                onClick={() => handleAction(actions.primary!.action)}
                className={cn(
                  'btn btn-md',
                  actions.primary.action === 'reactivate' ? 'btn-outline' : 'btn-primary'
                )}
              >
                <actions.primary.icon size={16} />
                {actions.primary.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderCard;
