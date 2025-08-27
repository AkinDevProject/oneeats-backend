import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, X, Clock, Bell, Filter, AlertCircle, CheckCircle2, Timer, Users } from 'lucide-react';
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
          <Card variant="glass" className="flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 animate-pulse-glow border-primary-200">
            <Bell className="h-5 w-5 animate-bounce" />
            <span className="text-sm font-medium">Nouvelle commande reçue !</span>
          </Card>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card hover className="text-center p-3 sm:p-4 border-warning-200 bg-gradient-to-br from-warning-50 to-warning-100">
          <div className="flex items-center justify-center mb-2">
            <AlertCircle className="h-6 w-6 text-warning-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-warning-700">{pendingOrdersCount}</div>
          <div className="text-xs sm:text-sm text-warning-600">En attente</div>
        </Card>
        <Card hover className="text-center p-3 sm:p-4 border-success-200 bg-gradient-to-br from-success-50 to-success-100">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle2 className="h-6 w-6 text-success-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-success-700">
            {orders.filter(o => o.status === 'accepted').length}
          </div>
          <div className="text-xs sm:text-sm text-success-600">Acceptées</div>
        </Card>
        <Card hover className="text-center p-3 sm:p-4 border-primary-200 bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="flex items-center justify-center mb-2">
            <Timer className="h-6 w-6 text-primary-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-primary-700">
            {orders.filter(o => o.status === 'preparing').length}
          </div>
          <div className="text-xs sm:text-sm text-primary-600">En préparation</div>
        </Card>
        <Card hover className="text-center p-3 sm:p-4 border-secondary-200 bg-gradient-to-br from-secondary-50 to-secondary-100">
          <div className="flex items-center justify-center mb-2">
            <Users className="h-6 w-6 text-secondary-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-secondary-700">
            {orders.filter(o => o.status === 'ready').length}
          </div>
          <div className="text-xs sm:text-sm text-secondary-600">Prêtes</div>
        </Card>
      </div>

      {/* Filter */}
      <Card variant="glass" className="backdrop-blur-sm">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-primary-500" />
            <span className="font-medium text-gray-700">Filtrer par statut</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'accepted', 'preparing', 'ready'].map((status) => (
              <Button
                key={status}
                size="sm"
                variant={filter === status ? 'primary' : 'ghost'}
                onClick={() => setFilter(status as any)}
                className="transition-all duration-200"
              >
                {status === 'all' ? 'Toutes' : status === 'pending' ? 'En attente' : 
                 status === 'accepted' ? 'Acceptées' : status === 'preparing' ? 'En préparation' : 'Prêtes'}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="text-center py-12 animate-fade-in">
            <div className="flex flex-col items-center space-y-3">
              <Clock className="h-12 w-12 text-gray-300" />
              <p className="text-gray-500 text-lg font-medium">Aucune commande pour le moment</p>
              <p className="text-gray-400 text-sm">Les nouvelles commandes apparaîtront ici en temps réel</p>
            </div>
          </Card>
        ) : (
          filteredOrders.map((order, index) => (
            <Card 
              key={order.id} 
              hover
              className={`${
                order.status === 'pending' ? 'border-warning-200 bg-warning-50 animate-pulse-glow' : 
                order.status === 'ready' ? 'border-success-200 bg-success-50' :
                'border-gray-200'
              } transition-all duration-300`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
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
                        icon={<Check className="h-4 w-4" />}
                        onClick={() => handleOrderAction(order.id, 'accept')}
                        className="flex-1 lg:flex-none shadow-sm hover:shadow-md"
                      >
                        Accepter
                      </Button>
                      <Button 
                        size="sm" 
                        variant="danger"
                        icon={<X className="h-4 w-4" />}
                        onClick={() => handleOrderAction(order.id, 'reject')}
                        className="flex-1 lg:flex-none shadow-sm hover:shadow-md"
                      >
                        Refuser
                      </Button>
                    </>
                  )}
                  {order.status === 'accepted' && (
                    <Button 
                      size="sm" 
                      variant="primary"
                      icon={<CheckCircle2 className="h-4 w-4" />}
                      onClick={() => handleOrderAction(order.id, 'ready')}
                      className="w-full lg:w-auto shadow-sm hover:shadow-md animate-pulse"
                    >
                      Marquer prête
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <div className="flex items-center space-x-2 text-success-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-medium">Prête pour retrait</span>
                    </div>
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