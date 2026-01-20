import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Order, OrderStatus } from '../../types';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onStatusChange
}) => {
  if (!isOpen || !order) return null;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning" className="bg-orange-100 text-orange-800">⏳ En attente</Badge>;
      case 'CONFIRMED':
        return <Badge variant="info" className="bg-blue-100 text-blue-800">✅ Confirmée</Badge>;
      case 'PREPARING':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">👨‍🍳 En préparation</Badge>;
      case 'READY':
        return <Badge variant="success" className="bg-green-100 text-green-800">✅ Prête</Badge>;
      case 'COMPLETED':
        return <Badge variant="success" className="bg-gray-100 text-gray-800">✅ Terminée</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger" className="bg-red-100 text-red-800">❌ Annulée</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (onStatusChange) {
      onStatusChange(order.id, newStatus);
    }
  };

  const statusOptions = [
    { value: 'PENDING', label: 'En attente' },
    { value: 'CONFIRMED', label: 'Confirmée' },
    { value: 'PREPARING', label: 'En préparation' },
    { value: 'READY', label: 'Prête' },
    { value: 'COMPLETED', label: 'Terminée' },
    { value: 'CANCELLED', label: 'Annulée' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative inline-block w-full max-w-4xl p-6 mx-auto my-8 text-left align-middle transition-all transform bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Commande {order.orderNumber}
                </h3>
                <p className="text-gray-600 mt-1">
                  Détails complets de la commande
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(order.status)}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations Client */}
            <Card className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Informations Client</span>
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-900">
                    {order.clientFirstName} {order.clientLastName}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{order.clientEmail}</span>
                </div>
                {order.clientPhone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{order.clientPhone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span className="text-green-700 font-medium">Récupération sur place</span>
                </div>
              </div>
            </Card>

            {/* Informations Commande */}
            <Card className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Package className="h-5 w-5 text-purple-600" />
                <span>Informations Commande</span>
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Numéro de commande:</span>
                  <span className="font-medium text-gray-900">{order.orderNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Montant total:</span>
                  <span className="font-bold text-xl text-gray-900">{order.totalAmount.toFixed(2)} €</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Créée le:</span>
                  <span className="font-medium text-gray-900">
                    {format(order.createdAt, 'dd MMM yyyy à HH:mm', { locale: fr })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Dernière mise à jour:</span>
                  <span className="font-medium text-gray-900">
                    {format(order.updatedAt, 'dd MMM yyyy à HH:mm', { locale: fr })}
                  </span>
                </div>
                {order.estimatedPickupTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Récupération estimée:</span>
                    <span className="font-medium text-gray-900">
                      {format(order.estimatedPickupTime, 'dd MMM yyyy à HH:mm', { locale: fr })}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Instructions spéciales */}
          {order.specialInstructions && (
            <Card className="p-6 mt-6 bg-orange-50 border-orange-200">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-900 mb-2">Instructions spéciales</h4>
                  <p className="text-orange-800">{order.specialInstructions}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Articles commandés */}
          <Card className="p-6 mt-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-green-600" />
                <span>Articles commandés</span>
              </span>
              <span className="text-sm text-gray-600">
                {order.items.length} article{order.items.length > 1 ? 's' : ''}
              </span>
            </h4>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold">
                      {item.quantity}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.menuItemName}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity}x à {item.unitPrice.toFixed(2)} €
                      </p>
                      {item.specialNotes && (
                        <p className="text-sm text-gray-500 italic mt-1">
                          Note: {item.specialNotes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg">{item.subtotal.toFixed(2)} €</p>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="border-t border-gray-200 pt-3 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">{order.totalAmount.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Changer le statut:</span>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
              {order.status === 'PENDING' && onStatusChange && (
                <>
                  <Button
                    variant="success"
                    onClick={() => handleStatusChange('CONFIRMED')}
                    icon={<CheckCircle className="h-4 w-4" />}
                  >
                    Confirmer
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleStatusChange('CANCELLED')}
                    icon={<XCircle className="h-4 w-4" />}
                  >
                    Annuler
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;