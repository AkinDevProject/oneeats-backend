import React, { useState, useEffect } from 'react';
import { format, formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Check, X, Clock, Bell, Filter, Timer, AlertTriangle, Volume2, 
  Search, Eye, ChevronDown, TrendingUp, DollarSign, ShoppingCart,
  Zap, Coffee, Truck, MapPin
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { mockOrders } from '../../data/mockData';
import { Order } from '../../types';

const OrdersManagementPage: React.FC = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'preparing' | 'ready'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [newOrderSound, setNewOrderSound] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Real-time clock update
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      const hasNewOrder = Math.random() > 0.85;
      if (hasNewOrder) {
        setNewOrderSound(true);
        if (soundEnabled) {
          // Audio notification
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
          } catch (error) {
            console.warn('Audio notification not supported');
          }
        }
        setTimeout(() => setNewOrderSound(false), 5000);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, soundEnabled]);

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleOrderAction = (orderId: string, action: 'accept' | 'reject' | 'ready' | 'preparing') => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        switch (action) {
          case 'accept':
            return { ...order, status: 'accepted' };
          case 'reject':
            return { ...order, status: 'cancelled' };
          case 'preparing':
            return { ...order, status: 'preparing' };
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
        return <Badge variant="warning" className="animate-pulse">🔔 En attente</Badge>;
      case 'accepted':
        return <Badge variant="success">✅ Acceptée</Badge>;
      case 'preparing':
        return <Badge variant="default" className="bg-blue-100 text-blue-700">👨‍🍳 En préparation</Badge>;
      case 'ready':
        return <Badge variant="success" className="animate-pulse">🛎️ Prête à emporter</Badge>;
      case 'cancelled':
        return <Badge variant="danger">❌ Annulée</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  const getOrderAge = (createdAt: Date | string) => {
    const orderDate = createdAt instanceof Date ? createdAt : new Date(createdAt);
    const ageInMinutes = Math.floor((currentTime.getTime() - orderDate.getTime()) / (1000 * 60));
    return Math.max(0, ageInMinutes);
  };

  const isOrderUrgent = (order: Order) => {
    const ageInMinutes = getOrderAge(order.createdAt);
    const estimatedTime = order.estimatedTime || 30;
    return ageInMinutes > estimatedTime * 0.8;
  };

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const acceptedOrdersCount = orders.filter(o => o.status === 'accepted').length;
  const preparingOrdersCount = orders.filter(o => o.status === 'preparing').length;
  const readyOrdersCount = orders.filter(o => o.status === 'ready').length;

  const todayRevenue = orders
    .filter(o => ['ready', 'delivered'].includes(o.status))
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header avec animation */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🍽️ Gestion des Commandes
          </h1>
          <p className="text-gray-600 flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Temps réel • {format(currentTime, 'HH:mm:ss', { locale: fr })}</span>
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
              autoRefresh
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
            }`}
          >
            <Timer className="h-4 w-4" />
            <span>Auto-actualisation</span>
          </button>
          
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
              soundEnabled
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
            }`}
          >
            <Volume2 className="h-4 w-4" />
            <span>Notifications</span>
          </button>
          
          {newOrderSound && (
            <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 text-white px-6 py-3 rounded-xl shadow-xl animate-bounce">
              <Bell className="h-5 w-5 animate-spin" />
              <span className="text-sm font-bold">🆕 Nouvelle commande !</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards avec animations */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className={`p-4 text-center transition-all duration-500 hover:scale-105 ${
          pendingOrdersCount > 0 
            ? 'bg-gradient-to-br from-orange-100 via-red-50 to-pink-100 border-orange-300 shadow-lg animate-pulse' 
            : 'bg-gradient-to-br from-gray-50 to-gray-100'
        }`}>
          <div className={`text-3xl font-bold ${
            pendingOrdersCount > 0 ? 'text-orange-600' : 'text-gray-400'
          }`}>
            🔔 {pendingOrdersCount}
          </div>
          <div className="text-sm text-gray-600 font-medium">En attente</div>
          {pendingOrdersCount > 0 && (
            <div className="text-xs text-orange-600 font-bold mt-1 animate-pulse">
              ⚡ ACTION REQUISE !
            </div>
          )}
        </Card>

        <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <div className="text-3xl font-bold text-green-600">✅ {acceptedOrdersCount}</div>
          <div className="text-sm text-gray-600 font-medium">Acceptées</div>
        </Card>

        <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <div className="text-3xl font-bold text-blue-600">👨‍🍳 {preparingOrdersCount}</div>
          <div className="text-sm text-gray-600 font-medium">En préparation</div>
        </Card>

        <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200 transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <div className="text-3xl font-bold text-purple-600">🛎️ {readyOrdersCount}</div>
          <div className="text-sm text-gray-600 font-medium">Prêtes</div>
        </Card>

        <Card className="p-4 text-center bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-200 transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <div className="text-3xl font-bold text-yellow-600">💰 {todayRevenue.toFixed(2)} €</div>
          <div className="text-sm text-gray-600 font-medium">CA aujourd'hui</div>
        </Card>
      </div>

      {/* Filtres et Recherche */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="🔍 Rechercher par nom ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-80 pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            </div>
            
            {/* Filters */}
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'Toutes', icon: '📋', count: filteredOrders.length },
                { key: 'pending', label: 'En attente', icon: '🔔', count: pendingOrdersCount },
                { key: 'accepted', label: 'Acceptées', icon: '✅', count: acceptedOrdersCount },
                { key: 'preparing', label: 'En cours', icon: '👨‍🍳', count: preparingOrdersCount },
                { key: 'ready', label: 'Prêtes', icon: '🛎️', count: readyOrdersCount }
              ].map(({ key, label, icon, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                    filter === key
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    filter === key ? 'bg-white bg-opacity-20' : 'bg-gray-100'
                  }`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Liste des Commandes */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-gray-500 text-xl font-medium">Aucune commande pour le moment</p>
            <p className="text-gray-400 text-sm mt-2">Les nouvelles commandes apparaîtront ici automatiquement</p>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const isUrgent = isOrderUrgent(order);
            const orderAge = getOrderAge(order.createdAt);
            const isExpanded = expandedOrder === order.id;
            
            return (
              <Card 
                key={order.id} 
                className={`transition-all duration-500 hover:shadow-xl transform hover:scale-[1.02] ${
                  order.status === 'pending' 
                    ? isUrgent 
                      ? 'border-red-400 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 shadow-xl ring-2 ring-red-200' 
                      : 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50 shadow-lg'
                    : order.status === 'ready'
                    ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      {/* Header de la commande */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                          <h3 className="text-xl font-bold text-gray-900">#{order.id}</h3>
                          {getStatusBadge(order.status)}
                          <div className="flex items-center text-sm text-gray-500 space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{format(order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt), 'HH:mm')}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {isUrgent && order.status === 'pending' && (
                            <div className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                              <AlertTriangle className="h-4 w-4 animate-bounce" />
                              <span>🚨 URGENT</span>
                            </div>
                          )}
                          <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                            orderAge > 30 ? 'bg-red-100 text-red-700 animate-pulse' :
                            orderAge > 15 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            ⏱️ {orderAge}min
                          </div>
                        </div>
                      </div>

                      {/* Info Client */}
                      <div className="bg-white bg-opacity-50 p-4 rounded-xl mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Coffee className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{order.clientName}</p>
                            <p className="text-sm text-gray-600">{order.clientEmail}</p>
                          </div>
                        </div>
                      </div>

                      {/* Items de la commande */}
                      <div className="space-y-2 mb-4">
                        <button
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          className="flex items-center justify-between w-full text-left p-3 bg-white bg-opacity-50 rounded-xl hover:bg-opacity-75 transition-all duration-300"
                        >
                          <span className="text-sm font-medium text-gray-700">
                            📦 {order.items.length} article{order.items.length > 1 ? 's' : ''}
                          </span>
                          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                            isExpanded ? 'rotate-180' : ''
                          }`} />
                        </button>
                        
                        {isExpanded && (
                          <div className="space-y-2 pl-4 animate-in slide-in-from-top duration-300">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between items-center py-2 px-3 bg-white rounded-lg shadow-sm">
                                <span className="text-sm">{item.quantity}× {item.name}</span>
                                <span className="text-sm font-medium">{(item.price * item.quantity).toFixed(2)} €</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Total et temps estimé */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0 bg-white bg-opacity-60 p-4 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-6 w-6 text-green-600" />
                          <span className="text-xl font-bold text-green-700">
                            {order.total.toFixed(2)} €
                          </span>
                        </div>
                        {order.estimatedTime && (
                          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                            orderAge > order.estimatedTime ? 'bg-red-100 text-red-700' :
                            orderAge > order.estimatedTime * 0.8 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            <Timer className="h-4 w-4" />
                            <span>⏰ {order.estimatedTime} min</span>
                            {orderAge > order.estimatedTime && <span className="font-bold">(Dépassé!)</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-3 lg:ml-6">
                      {order.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="success"
                            onClick={() => handleOrderAction(order.id, 'accept')}
                            className={`flex-1 lg:flex-none transition-all duration-300 transform hover:scale-110 shadow-lg ${
                              isUrgent ? 'animate-pulse bg-green-600 hover:bg-green-700 ring-2 ring-green-300' : ''
                            }`}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            ✅ Accepter
                          </Button>
                          <Button 
                            size="sm" 
                            variant="danger"
                            onClick={() => handleOrderAction(order.id, 'reject')}
                            className="flex-1 lg:flex-none transition-all duration-300 transform hover:scale-110 shadow-lg"
                          >
                            <X className="h-4 w-4 mr-2" />
                            ❌ Refuser
                          </Button>
                        </>
                      )}
                      {order.status === 'accepted' && (
                        <Button 
                          size="sm" 
                          variant="primary"
                          onClick={() => handleOrderAction(order.id, 'preparing')}
                          className="w-full lg:w-auto transition-all duration-300 transform hover:scale-110 shadow-lg bg-blue-600 hover:bg-blue-700"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          👨‍🍳 Commencer
                        </Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button 
                          size="sm" 
                          variant="success"
                          onClick={() => handleOrderAction(order.id, 'ready')}
                          className="w-full lg:w-auto transition-all duration-300 transform hover:scale-110 shadow-lg bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          🛎️ Prête !
                        </Button>
                      )}
                      {order.status === 'ready' && (
                        <div className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg">
                          <Truck className="h-5 w-5 mr-2" />
                          ✅ Prête à emporter!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrdersManagementPage;