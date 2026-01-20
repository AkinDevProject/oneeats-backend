import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, User, DollarSign, CheckCircle2, AlertCircle, Timer } from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Order } from '../types';

interface OrderBoardProps {
  orders: Order[];
  onOrderAction: (orderId: string, action: 'accept' | 'reject' | 'ready') => void;
}

const OrderBoard: React.FC<OrderBoardProps> = ({ orders, onOrderAction }) => {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return {
          color: 'warning',
          icon: AlertCircle,
          label: 'En attente',
          bgClass: 'bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200',
          textClass: 'text-warning-700'
        };
      case 'accepted':
        return {
          color: 'success',
          icon: CheckCircle2,
          label: 'Acceptée',
          bgClass: 'bg-gradient-to-br from-success-50 to-success-100 border-success-200',
          textClass: 'text-success-700'
        };
      case 'preparing':
        return {
          color: 'info',
          icon: Timer,
          label: 'En préparation',
          bgClass: 'bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200',
          textClass: 'text-primary-700'
        };
      case 'ready':
        return {
          color: 'success',
          icon: CheckCircle2,
          label: 'Prête',
          bgClass: 'bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-200',
          textClass: 'text-secondary-700'
        };
      default:
        return {
          color: 'secondary',
          icon: Clock,
          label: 'Inconnue',
          bgClass: 'bg-gray-50 border-gray-200',
          textClass: 'text-gray-700'
        };
    }
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm', { locale: fr });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes === 1) return 'Il y a 1 min';
    if (minutes < 60) return `Il y a ${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return 'Il y a 1h';
    return `Il y a ${hours}h`;
  };

  return (
    <div className="space-y-4">
      {orders.map((order, index) => {
        const config = getStatusConfig(order.status);
        const StatusIcon = config.icon;
        const isSelected = selectedOrder === order.id;

        return (
          <Card
            key={order.id}
            hover
            variant={isSelected ? 'elevated' : 'default'}
            className={`${config.bgClass} ${isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : ''} 
              transition-all duration-300 cursor-pointer animate-fade-in`}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => setSelectedOrder(isSelected ? null : order.id)}
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <StatusIcon className={`h-5 w-5 ${config.textClass}`} />
                  <div>
                    <h3 className="font-semibold text-gray-900">Commande #{order.id}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(order.createdAt)}</span>
                      <span className="text-gray-300">•</span>
                      <span>{formatTimeAgo(order.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={config.color as 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'} size="md">
                  {config.label}
                </Badge>
              </div>

              {/* Customer Info */}
              <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{order.clientName}</p>
                  <p className="text-sm text-gray-500">{order.clientEmail}</p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Articles commandés</h4>
                <div className="space-y-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-1 px-3 bg-white/40 rounded-md">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-primary-600">{item.quantity}×</span>
                        <span className="text-gray-800">{item.name}</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {(item.price * item.quantity).toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pt-3 border-t border-white/50">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-success-600" />
                    <span className="text-lg font-bold text-gray-900">
                      {order.total.toFixed(2)} €
                    </span>
                  </div>
                  {order.estimatedTime && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Timer className="h-4 w-4" />
                      <span>{order.estimatedTime} min</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  {order.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        icon={<CheckCircle2 className="h-4 w-4" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOrderAction(order.id, 'accept');
                        }}
                        className="flex-1 sm:flex-none"
                      >
                        Accepter
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        icon={<AlertCircle className="h-4 w-4" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOrderAction(order.id, 'reject');
                        }}
                        className="flex-1 sm:flex-none"
                      >
                        Refuser
                      </Button>
                    </>
                  )}
                  {order.status === 'accepted' && (
                    <Button
                      size="md"
                      variant="primary"
                      icon={<CheckCircle2 className="h-4 w-4" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOrderAction(order.id, 'ready');
                      }}
                      className="w-full sm:w-auto animate-pulse"
                    >
                      Marquer comme prête
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <div className="flex items-center space-x-2 text-success-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Prête pour retrait</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default OrderBoard;