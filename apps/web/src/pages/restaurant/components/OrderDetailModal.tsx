import React from 'react';
import {
  X, User, MapPin, Phone, Truck, MessageSquare,
  Check, ChefHat, Package, RotateCcw, History
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Order } from '../../../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn, formatPrice } from '../../../lib/utils';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { TimerBadge, useTimerState } from '../../../components/ui/TimerBadge';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (orderId: string, action: 'accept' | 'cancel' | 'prete' | 'recuperee' | 'reactivate') => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onAction
}) => {
  if (!order) return null;

  const { state: timerState } = useTimerState(order.createdAt, 10, 20, 30000);

  const handleAction = (action: 'accept' | 'cancel' | 'prete' | 'recuperee' | 'reactivate') => {
    onAction(order.id, action);
    onClose();
  };

  const orderNumber = order.orderNumber?.split('-').pop() || order.id.substring(0, 8);

  const urgencyConfig = {
    ok: { bg: 'bg-success-50', border: 'border-success-200' },
    warning: { bg: 'bg-warning-50', border: 'border-warning-200' },
    danger: { bg: 'bg-danger-50', border: 'border-danger-200' },
  };

  const urgency = urgencyConfig[timerState];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className={cn('p-4 sm:p-6 border-b', urgency.bg, urgency.border)}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Commande #{orderNumber}
              </h2>
              <StatusBadge status={order.status} size="lg" />
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-4">
            <TimerBadge startTime={order.createdAt} size="lg" />
            <span className="text-sm text-gray-600">
              Reçue à {format(new Date(order.createdAt), 'HH:mm', { locale: fr })}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Customer Information */}
          <section className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-primary-600" />
              Informations client
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900">{order.clientName}</span>
              </div>

              {order.deliveryAddress ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary-500" />
                    <span className="text-primary-700 font-medium">Livraison à domicile</span>
                  </div>
                  <div className="flex items-start gap-2 ml-6">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-700">{order.deliveryAddress}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-success-500" />
                  <span className="text-success-700 font-medium">Retrait sur place</span>
                </div>
              )}

              {order.clientPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a
                    href={`tel:${order.clientPhone}`}
                    className="text-primary-600 hover:underline"
                  >
                    {order.clientPhone}
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Order Items */}
          <section className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-secondary-600" />
                Détail de la commande
              </h3>
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(order.total)}
              </span>
            </div>

            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold">
                      {item.quantity}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      {item.options && item.options.length > 0 && (
                        <div className="text-sm text-gray-500">
                          {item.options.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatPrice(item.totalPrice)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatPrice(item.totalPrice / item.quantity)} / unité
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <section className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-warning-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-warning-900 mb-1">Instructions spéciales</h4>
                  <p className="text-warning-800">{order.specialInstructions}</p>
                </div>
              </div>
            </section>
          )}

          {/* Order Timeline */}
          <section className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <History className="h-5 w-5 text-gray-600" />
              Historique
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-primary-500 rounded-full" />
                <span className="text-gray-600">
                  Commande reçue - {format(new Date(order.createdAt), 'HH:mm', { locale: fr })}
                </span>
              </div>
              {(order.status === 'PREPARING' || order.status === 'READY' || order.status === 'COMPLETED') && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-status-preparing rounded-full" />
                  <span className="text-gray-600">Préparation en cours</span>
                </div>
              )}
              {(order.status === 'READY' || order.status === 'COMPLETED') && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-status-ready rounded-full" />
                  <span className="text-gray-600">Commande prête</span>
                </div>
              )}
              {order.status === 'COMPLETED' && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-status-completed rounded-full" />
                  <span className="text-gray-600">Commande récupérée</span>
                </div>
              )}
              {order.status === 'CANCELLED' && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-status-cancelled rounded-full" />
                  <span className="text-gray-600">Commande annulée</span>
                </div>
              )}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="btn btn-ghost flex-1 sm:flex-none"
            >
              Fermer
            </button>

            <div className="flex flex-col sm:flex-row gap-2 flex-1 sm:justify-end">
              {order.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleAction('cancel')}
                    className="btn btn-danger btn-md"
                  >
                    <X className="h-4 w-4" />
                    Refuser
                  </button>
                  <button
                    onClick={() => handleAction('accept')}
                    className="btn btn-primary btn-md"
                  >
                    <Check className="h-4 w-4" />
                    Accepter
                  </button>
                </>
              )}

              {order.status === 'PREPARING' && (
                <>
                  <button
                    onClick={() => handleAction('cancel')}
                    className="btn btn-ghost text-danger-600 hover:bg-danger-50"
                  >
                    <X className="h-4 w-4" />
                    Annuler
                  </button>
                  <button
                    onClick={() => handleAction('prete')}
                    className="btn btn-primary btn-md"
                  >
                    <ChefHat className="h-4 w-4" />
                    Marquer prêt
                  </button>
                </>
              )}

              {order.status === 'READY' && (
                <>
                  <button
                    onClick={() => handleAction('cancel')}
                    className="btn btn-ghost text-danger-600 hover:bg-danger-50"
                  >
                    <X className="h-4 w-4" />
                    Annuler
                  </button>
                  <button
                    onClick={() => handleAction('recuperee')}
                    className="btn btn-primary btn-md"
                  >
                    <Package className="h-4 w-4" />
                    Récupéré
                  </button>
                </>
              )}

              {order.status === 'CANCELLED' && (
                <button
                  onClick={() => handleAction('reactivate')}
                  className="btn btn-outline btn-md"
                >
                  <RotateCcw className="h-4 w-4" />
                  Réactiver
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailModal;
