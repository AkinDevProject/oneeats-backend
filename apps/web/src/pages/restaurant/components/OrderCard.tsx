import React from 'react';
import { Clock, User, MapPin, Phone, Truck } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Order } from '../../../types';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';

interface OrderCardProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  onQuickAction?: (orderId: string, action: 'accept' | 'reject' | 'ready' | 'preparing') => void;
  showActions?: boolean;
  compact?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onViewDetails,
  onQuickAction,
  showActions = true,
  compact = false
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" className="bg-orange-100 text-orange-800">⏳ En attente</Badge>;
      case 'accepted':
        return <Badge variant="info" className="bg-blue-100 text-blue-800">✓ Acceptée</Badge>;
      case 'preparing':
        return <Badge variant="primary" className="bg-yellow-100 text-yellow-800">👨‍🍳 En préparation</Badge>;
      case 'ready':
        return <Badge variant="success" className="bg-green-100 text-green-800">✅ Prête</Badge>;
      case 'completed':
        return <Badge variant="success" className="bg-gray-100 text-gray-800">✅ Livrée</Badge>;
      case 'cancelled':
        return <Badge variant="danger" className="bg-red-100 text-red-800">❌ Annulée</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getUrgencyColor = () => {
    const now = new Date();
    const orderTime = new Date(order.createdAt);
    const minutesAgo = (now.getTime() - orderTime.getTime()) / (1000 * 60);

    if (minutesAgo > 30) return 'border-red-500 bg-red-50';
    if (minutesAgo > 15) return 'border-orange-500 bg-orange-50';
    return 'border-gray-200 bg-white';
  };

  const getQuickActions = () => {
    if (!showActions || !onQuickAction) return null;

    switch (order.status) {
      case 'pending':
        return (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="primary" 
              onClick={(e) => {
                e.stopPropagation();
                onQuickAction(order.id, 'accept');
              }}
            >
              Accepter
            </Button>
            <Button 
              size="sm" 
              variant="danger" 
              onClick={(e) => {
                e.stopPropagation();
                onQuickAction(order.id, 'reject');
              }}
            >
              Refuser
            </Button>
          </div>
        );
      case 'accepted':
        return (
          <Button 
            size="sm" 
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAction(order.id, 'preparing');
            }}
          >
            Commencer
          </Button>
        );
      case 'preparing':
        return (
          <Button 
            size="sm" 
            variant="success"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAction(order.id, 'ready');
            }}
          >
            Marquer prêt
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${getUrgencyColor()} ${
        compact ? 'p-4' : 'p-6'
      }`}
      onClick={() => onViewDetails(order)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="font-bold text-gray-900">{order.orderNumber || `#${order.id.substring(0, 8)}...`}</h3>
          {getStatusBadge(order.status)}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">€{order.total.toFixed(2)}</p>
          {!compact && (
            <p className="text-sm text-gray-500">{order.items.length} article{order.items.length > 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-900">{order.clientName}</span>
        </div>
        
        {order.deliveryAddress ? (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-700 font-medium">Livraison</span>
            </div>
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
              <span className="text-xs text-gray-600">{order.deliveryAddress}</span>
            </div>
            {order.clientPhone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-600">{order.clientPhone}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-700 font-medium">Sur place</span>
          </div>
        )}
      </div>

      {/* Time */}
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">
          {formatDistance(new Date(order.createdAt), new Date(), { 
            addSuffix: true, 
            locale: fr 
          })}
        </span>
      </div>

      {/* Items preview (if not compact) */}
      {!compact && order.items.length > 0 && (
        <div className="mb-4">
          <div className="text-sm text-gray-600">
            {order.items.slice(0, 2).map((item, idx) => (
              <span key={idx}>
                {item.quantity}x {item.name}
                {idx < Math.min(order.items.length - 1, 1) && ', '}
              </span>
            ))}
            {order.items.length > 2 && (
              <span className="text-gray-500"> +{order.items.length - 2} autre{order.items.length - 2 > 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={() => onViewDetails(order)}>
          Voir détails
        </Button>
        {getQuickActions()}
      </div>
    </Card>
  );
};

export default OrderCard;