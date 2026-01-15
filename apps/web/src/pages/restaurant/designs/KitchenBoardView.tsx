import React from 'react';
import { Clock, CheckCircle, AlertCircle, ChefHat, Timer, Users, Loader2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useRestaurantData } from '../../../hooks/useRestaurantData';

const KitchenBoardView: React.FC = () => {
  const { orders, loading, error, updateOrderStatus, refetch } = useRestaurantData();

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
    }
  };

  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case 'PENDING':
        return {
          color: 'bg-orange-500',
          textColor: 'text-orange-600',
          bgColor: 'bg-orange-50 border-orange-200',
          label: 'EN ATTENTE',
          icon: AlertCircle
        };
      case 'PREPARING':
        return {
          color: 'bg-blue-500',
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200',
          label: 'EN PRÉPARATION',
          icon: ChefHat
        };
      case 'READY':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
          label: 'PRÊT',
          icon: CheckCircle
        };
      default:
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200',
          label: status.toUpperCase(),
          icon: Clock
        };
    }
  };

  const groupedOrders = {
    pending: orders.filter(order => order.status === 'PENDING'),
    preparing: orders.filter(order => order.status === 'PREPARING'),
    ready: orders.filter(order => order.status === 'READY')
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl p-8 shadow-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refetch} variant="primary">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cuisine - Vue Tableau</h1>
              <p className="text-gray-600">Gestion visuelle des commandes</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{groupedOrders.pending.length}</div>
              <div className="text-xs text-gray-600">En attente</div>
            </div>
          </div>
        </div>
      </div>

      {/* Kitchen Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(groupedOrders).map(([status, orderList]) => {
          const config = getStatusConfig(status);
          const StatusIcon = config.icon;
          
          return (
            <div key={status} className="space-y-4">
              {/* Column Header */}
              <div className={`${config.bgColor} rounded-xl p-4 border-2`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${config.color} rounded-full flex items-center justify-center`}>
                      <StatusIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-bold ${config.textColor}`}>{config.label}</h3>
                      <p className="text-sm text-gray-600">{orderList.length} commandes</p>
                    </div>
                  </div>
                  <Badge
                    variant={status === 'PENDING' ? 'warning' : status === 'PREPARING' ? 'primary' : 'success'}
                    className="text-lg font-bold px-3 py-1"
                  >
                    {orderList.length}
                  </Badge>
                </div>
              </div>

              {/* Orders in Column */}
              <div className="space-y-3">
                {orderList.map((order) => (
                  <Card key={order.id} className={`${config.bgColor} border-2 hover:shadow-lg transition-all`}>
                    <div className="p-4 space-y-4">
                      {/* Order Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 ${config.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                            {order.id.split('-')[1]}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{order.clientName}</div>
                            <div className="text-sm text-gray-600">{order.id}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">€{order.total.toFixed(2)}</div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Timer className="h-4 w-4 mr-1" />
                            {order.estimatedTime}min
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center bg-white bg-opacity-50 rounded-lg p-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" size="sm" className="font-bold">
                                {item.quantity}x
                              </Badge>
                              <span className="font-medium text-gray-900">{item.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">€{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Order Timer */}
                      <div className="flex items-center justify-between pt-2 border-t border-white border-opacity-50">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-600">
                            Il y a {Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)}min
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-600">Table {Math.floor(Math.random() * 20) + 1}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-2">
                        {status === 'PENDING' && (
                          <Button
                            onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                            variant="primary"
                            size="sm"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            icon={<ChefHat className="h-4 w-4" />}
                          >
                            Commencer
                          </Button>
                        )}
                        {status === 'PREPARING' && (
                          <Button
                            onClick={() => handleStatusUpdate(order.id, 'READY')}
                            variant="success"
                            size="sm"
                            className="flex-1"
                            icon={<CheckCircle className="h-4 w-4" />}
                          >
                            Marquer Prêt
                          </Button>
                        )}
                        {status === 'READY' && (
                          <Button
                            onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            Livré
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KitchenBoardView;