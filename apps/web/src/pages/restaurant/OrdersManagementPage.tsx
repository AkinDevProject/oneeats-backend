import React, { useState, useEffect } from 'react';
import { format, formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Bell, Volume2, RefreshCw, Search, Filter, 
  Eye, EyeOff, BarChart3, Download, Check, X,
  Clock, User, MapPin, Phone, Truck, AlertTriangle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { mockOrders } from '../../data/mockData';
import { Order } from '../../types';

// Import des composants réutilisables
import QuickMetrics from './components/QuickMetrics';
import OrderDetailModal from './components/OrderDetailModal';

const OrdersManagementPage: React.FC = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'preparing' | 'ready'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickMetrics, setShowQuickMetrics] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrderSound, setNewOrderSound] = useState(false);

  // Real-time updates simulation
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      const hasNewOrder = Math.random() > 0.85;
      if (hasNewOrder) {
        setNewOrderSound(true);
        if (soundEnabled) {
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
            return { ...order, status: 'preparing' };
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

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleModalAction = (orderId: string, action: 'accept' | 'reject' | 'ready' | 'preparing') => {
    handleOrderAction(orderId, action);
    if (selectedOrder && selectedOrder.id === orderId) {
      const updatedOrder = orders.find(o => o.id === orderId);
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
    }
  };

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => order.status !== 'cancelled' ? sum + order.total : sum, 0);
  const totalOrders = orders.filter(o => o.status !== 'cancelled').length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800">⏳ En attente</Badge>;
      case 'accepted':
        return <Badge className="bg-blue-100 text-blue-800">✓ Acceptée</Badge>;
      case 'preparing':
        return <Badge className="bg-yellow-100 text-yellow-800">👨‍🍳 En préparation</Badge>;
      case 'ready':
        return <Badge className="bg-green-100 text-green-800">✅ Prête</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">✅ Livrée</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">❌ Annulée</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getOrderActions = (order: Order) => {
    switch (order.status) {
      case 'pending':
        return (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="primary" 
              icon={<Check className="h-4 w-4" />}
              onClick={() => handleOrderAction(order.id, 'accept')}
            >
              Accepter
            </Button>
            <Button 
              size="sm" 
              variant="danger" 
              icon={<X className="h-4 w-4" />}
              onClick={() => handleOrderAction(order.id, 'reject')}
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
            onClick={() => handleOrderAction(order.id, 'preparing')}
          >
            Commencer
          </Button>
        );
      case 'preparing':
        return (
          <Button 
            size="sm" 
            variant="success"
            onClick={() => handleOrderAction(order.id, 'ready')}
          >
            Marquer prêt
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Controls - Style TableauDashboard */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard - Gestion des Commandes</h1>
              <p className="text-gray-600 mt-1">
                Interface opérationnelle pour traiter les commandes en temps réel
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant={showQuickMetrics ? "primary" : "ghost"}
                size="sm"
                onClick={() => setShowQuickMetrics(!showQuickMetrics)}
                icon={showQuickMetrics ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              >
                {showQuickMetrics ? 'Masquer métriques' : 'Afficher métriques'}
              </Button>
              <Button
                variant={soundEnabled ? "primary" : "ghost"}
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                icon={<Volume2 className={`h-4 w-4 ${soundEnabled ? 'text-white' : 'text-gray-600'}`} />}
              >
                Son {soundEnabled ? 'ON' : 'OFF'}
              </Button>
              <Button
                variant={autoRefresh ? "primary" : "ghost"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                icon={<RefreshCw className={`h-4 w-4 ${autoRefresh ? 'text-white animate-spin' : 'text-gray-600'}`} />}
              >
                Actualiser
              </Button>
              <Button variant="ghost" size="sm" icon={<Download className="h-4 w-4" />}>
                Exporter
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* New Order Notification */}
        {newOrderSound && (
          <div className="mb-6 p-4 bg-orange-100 border border-orange-400 rounded-lg animate-pulse">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-orange-600" />
              <span className="text-orange-800 font-medium">🔔 Nouvelle commande reçue !</span>
            </div>
          </div>
        )}

        {/* Quick Metrics - Style TableauDashboard */}
        {showQuickMetrics && (
          <div className="mb-8">
            <QuickMetrics
              totalRevenue={totalRevenue}
              revenueChange="+15.3%"
              totalOrders={totalOrders}
              ordersChange="+8.7%"
              avgOrderValue={avgOrderValue}
              avgOrderChange="+3.2%"
              pendingOrdersCount={pendingOrdersCount}
            />
          </div>
        )}

        {/* Orders Management Section - Style TableauDashboard */}
        <Card className="bg-white">
          {/* Header avec filtres */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Gestion des Commandes</h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            {/* Filtres par statut - Style TableauDashboard */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              {[
                { key: 'all', label: 'Toutes', count: filteredOrders.length },
                { key: 'pending', label: 'En attente', count: orders.filter(o => o.status === 'pending').length },
                { key: 'accepted', label: 'Acceptées', count: orders.filter(o => o.status === 'accepted').length },
                { key: 'preparing', label: 'En cours', count: orders.filter(o => o.status === 'preparing').length },
                { key: 'ready', label: 'Prêtes', count: orders.filter(o => o.status === 'ready').length }
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setFilter(option.key as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    filter === option.key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {option.label} ({option.count})
                </button>
              ))}
            </div>
          </div>

          {/* Liste des commandes - Style TableauDashboard */}
          <div className="p-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Aucune commande {filter !== 'all' ? `(${filter})` : ''}</h4>
                <p className="text-gray-500">Les commandes apparaîtront ici en temps réel</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOrders.map((order) => {
                  const orderTime = new Date(order.createdAt);
                  const minutesAgo = (new Date().getTime() - orderTime.getTime()) / (1000 * 60);
                  const isUrgent = minutesAgo > 15;
                  
                  return (
                    <Card 
                      key={order.id} 
                      className={`p-4 border-2 hover:shadow-lg transition-all cursor-pointer ${
                        isUrgent && (order.status === 'pending' || order.status === 'accepted')
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => handleViewDetails(order)}
                    >
                      {/* En-tête de commande */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="font-bold text-lg text-gray-900">#{order.id}</div>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              {formatDistance(orderTime, new Date(), { 
                                addSuffix: true, 
                                locale: fr 
                              })}
                            </span>
                            {isUrgent && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xl text-gray-900">€{order.total.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">{order.items.length} article{order.items.length > 1 ? 's' : ''}</div>
                        </div>
                      </div>

                      {/* Statut */}
                      <div className="mb-4">
                        {getStatusBadge(order.status)}
                      </div>

                      {/* Informations client */}
                      <div className="mb-4 space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">{order.clientName}</span>
                        </div>
                        
                        {order.deliveryAddress ? (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Truck className="h-4 w-4 text-blue-500" />
                              <span className="text-sm text-blue-700 font-medium">Livraison</span>
                            </div>
                            <div className="text-xs text-gray-600 pl-6">{order.deliveryAddress}</div>
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

                      {/* Aperçu des articles */}
                      <div className="mb-4 text-sm text-gray-600">
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

                      {/* Actions */}
                      <div className="flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(order)}
                        >
                          Voir détails
                        </Button>
                        {getOrderActions(order)}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
        onAction={handleModalAction}
      />
    </div>
  );
};

export default OrdersManagementPage;