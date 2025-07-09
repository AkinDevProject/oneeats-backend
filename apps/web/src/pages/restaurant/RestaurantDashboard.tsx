import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, X, Clock, Bell, Filter } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { mockOrders } from '../../data/mockData';
import { Order } from '../../types';

const RestaurantDashboard: React.FC = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'preparing' | 'ready'>('all');
  const [newOrderSound, setNewOrderSound] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new order notification
      const hasNewOrder = Math.random() > 0.8;
      if (hasNewOrder) {
        setNewOrderSound(true);
        setTimeout(() => setNewOrderSound(false), 3000);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const handleOrderAction = (orderId: string, action: 'accept' | 'reject' | 'ready') => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        switch (action) {
          case 'accept':
            return { ...order, status: 'accepted' };
          case 'reject':
            return { ...order, status: 'cancelled' };
          case 'ready':
            return { ...order, status: 'ready' };
          default:
            return order;
        }
      }
      return order;
    }));
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">En attente</Badge>;
      case 'accepted':
        return <Badge variant="success">Acceptée</Badge>;
      case 'preparing':
        return <Badge variant="default">En préparation</Badge>;
      case 'ready':
        return <Badge variant="success">Prête</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Annulée</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Commandes en direct</h1>
          <p className="text-gray-600 text-sm sm:text-base">Gérez vos commandes en temps réel</p>
        </div>
        {newOrderSound && (
          <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
            <Bell className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">Nouvelle commande !</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="text-center p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">{pendingOrdersCount}</div>
          <div className="text-xs sm:text-sm text-gray-600">En attente</div>
        </Card>
        <Card className="text-center p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-green-600">
            {orders.filter(o => o.status === 'accepted').length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Acceptées</div>
        </Card>
        <Card className="text-center p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-yellow-600">
            {orders.filter(o => o.status === 'preparing').length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">En préparation</div>
        </Card>
        <Card className="text-center p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-purple-600">
            {orders.filter(o => o.status === 'ready').length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Prêtes</div>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
          <Filter className="h-4 w-4 text-gray-400" />
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'accepted', 'preparing', 'ready'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Toutes' : status === 'pending' ? 'En attente' : 
                 status === 'accepted' ? 'Acceptées' : status === 'preparing' ? 'En préparation' : 'Prêtes'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500">Aucune commande pour le moment</p>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className={`${order.status === 'pending' ? 'border-yellow-200 bg-yellow-50' : ''}`}>
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-2 space-y-2 sm:space-y-0">
                    <h3 className="font-semibold text-gray-900">#{order.id}</h3>
                    {getStatusBadge(order.status)}
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {format(order.createdAt, 'HH:mm')}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="font-medium text-gray-900">{order.clientName}</p>
                    <p className="text-sm text-gray-500">{order.clientEmail}</p>
                  </div>

                  <div className="space-y-1 mb-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span>{(item.price * item.quantity).toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                    <div className="font-semibold text-lg">
                      Total: {order.total.toFixed(2)} €
                    </div>
                    {order.estimatedTime && (
                      <div className="text-sm text-gray-500">
                        Temps estimé: {order.estimatedTime} min
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 lg:ml-4">
                  {order.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="success"
                        onClick={() => handleOrderAction(order.id, 'accept')}
                        className="flex-1 lg:flex-none"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accepter
                      </Button>
                      <Button 
                        size="sm" 
                        variant="danger"
                        onClick={() => handleOrderAction(order.id, 'reject')}
                        className="flex-1 lg:flex-none"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Refuser
                      </Button>
                    </>
                  )}
                  {order.status === 'accepted' && (
                    <Button 
                      size="sm" 
                      variant="primary"
                      onClick={() => handleOrderAction(order.id, 'ready')}
                      className="w-full lg:w-auto"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Prête
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;