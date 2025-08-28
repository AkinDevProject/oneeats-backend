import React from 'react';
import { Clock, ChefHat, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Order } from '../../../types';
import OrderCard from './OrderCard';

interface OrderStatusBoardProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
  onQuickAction: (orderId: string, action: 'accept' | 'reject' | 'ready' | 'preparing') => void;
}

const OrderStatusBoard: React.FC<OrderStatusBoardProps> = ({
  orders,
  onViewDetails,
  onQuickAction
}) => {
  const getOrdersByStatus = (status: string) => {
    return orders.filter(order => order.status === status);
  };

  const pendingOrders = getOrdersByStatus('pending');
  const acceptedOrders = getOrdersByStatus('accepted');
  const preparingOrders = getOrdersByStatus('preparing');
  const readyOrders = getOrdersByStatus('ready');

  const statusColumns = [
    {
      id: 'pending',
      title: 'En attente',
      orders: pendingOrders,
      icon: <Clock className="h-5 w-5" />,
      color: 'border-orange-300 bg-orange-50',
      headerColor: 'bg-orange-100 text-orange-800',
      count: pendingOrders.length
    },
    {
      id: 'accepted',
      title: 'Acceptées',
      orders: acceptedOrders,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'border-blue-300 bg-blue-50',
      headerColor: 'bg-blue-100 text-blue-800',
      count: acceptedOrders.length
    },
    {
      id: 'preparing',
      title: 'En préparation',
      orders: preparingOrders,
      icon: <ChefHat className="h-5 w-5" />,
      color: 'border-yellow-300 bg-yellow-50',
      headerColor: 'bg-yellow-100 text-yellow-800',
      count: preparingOrders.length
    },
    {
      id: 'ready',
      title: 'Prêtes',
      orders: readyOrders,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'border-green-300 bg-green-50',
      headerColor: 'bg-green-100 text-green-800',
      count: readyOrders.length
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      {statusColumns.map((column) => (
        <Card key={column.id} className={`${column.color} border-2`}>
          {/* Column Header */}
          <div className={`px-4 py-3 ${column.headerColor} rounded-t-lg border-b`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {column.icon}
                <h3 className="font-semibold text-sm">{column.title}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold">{column.count}</span>
                {column.id === 'pending' && column.count > 0 && (
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                )}
              </div>
            </div>
          </div>

          {/* Column Content */}
          <div className="p-4">
            {column.orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-gray-300 mb-2">
                  {column.icon}
                </div>
                <p className="text-sm">Aucune commande</p>
              </div>
            ) : (
              <div className="space-y-4">
                {column.orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onViewDetails={onViewDetails}
                    onQuickAction={onQuickAction}
                    compact={true}
                    showActions={column.id === 'pending' || column.id === 'accepted' || column.id === 'preparing'}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Column Footer */}
          {column.orders.length > 0 && (
            <div className="px-4 py-2 border-t bg-gray-50/50 rounded-b-lg">
              <div className="text-xs text-gray-600 text-center">
                {column.orders.length} commande{column.orders.length > 1 ? 's' : ''}
                {column.id === 'pending' && column.orders.length > 0 && (
                  <span className="text-orange-600 font-medium"> • Action requise</span>
                )}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default OrderStatusBoard;