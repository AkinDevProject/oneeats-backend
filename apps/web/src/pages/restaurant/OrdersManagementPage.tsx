import React, { useState, useCallback, useMemo } from 'react';
import {
  Bell, Search, X, Clock, Wifi, WifiOff
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { useRestaurantData } from '../../hooks/useRestaurantData';
import { useRestaurantWebSocket, WebSocketMessage } from '../../hooks/useWebSocket';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

// Composants Design System
import { OrderCard, FilterTabs, FilterTabsCompact } from '../../components/orders';
import OrderDetailModal from './components/OrderDetailModal';

const OrdersManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { orders, loading, error, updateOrderStatus, refetch } = useRestaurantData();
  const [filter, setFilter] = useState<OrderStatus>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrderSound, setNewOrderSound] = useState(false);
  const [realtimeNotification, setRealtimeNotification] = useState<string | null>(null);

  // Gestionnaire de messages WebSocket
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log('WebSocket message received:', message);

    if (message.type === 'new_order') {
      console.log('New order received:', message);
      setRealtimeNotification(`Nouvelle commande #${message.orderNumber || 'N/A'}`);
      refetch();

      if (newOrderSound) {
        playNotificationSound();
      }

      setTimeout(() => setRealtimeNotification(null), 5000);
    } else if (message.type === 'order_status_changed') {
      console.log('Order status changed:', message);
      refetch();
    }
  }, [refetch, newOrderSound]);

  // Connexion WebSocket
  const { status: wsStatus, isConnected } = useRestaurantWebSocket(
    user?.restaurantId,
    {
      onMessage: handleWebSocketMessage,
      onConnect: () => console.log('WebSocket connected for real-time updates'),
      onDisconnect: () => console.log('WebSocket disconnected'),
    }
  );

  // Fonction pour jouer un son de notification
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Could not play sound:', e));
    } catch (e) {
      console.log('Sound not available');
    }
  };

  // Comptages par statut
  const statusCounts = useMemo(() => {
    const counts: Record<OrderStatus, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      PREPARING: 0,
      READY: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    orders.forEach(order => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  // Filtrage des commandes
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesFilter = order.status === filter;
      const matchesSearch = order.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (order.orderNumber && order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [orders, filter, searchTerm]);

  // Action handlers
  const handleAccept = useCallback(async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'PREPARING');
    } catch (err) {
      console.error('Erreur lors de l\'acceptation:', err);
    }
  }, [updateOrderStatus]);

  const handleReject = useCallback(async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'CANCELLED');
    } catch (err) {
      console.error('Erreur lors du refus:', err);
    }
  }, [updateOrderStatus]);

  const handleReady = useCallback(async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'READY');
    } catch (err) {
      console.error('Erreur lors du marquage prêt:', err);
    }
  }, [updateOrderStatus]);

  const handleComplete = useCallback(async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'COMPLETED');
    } catch (err) {
      console.error('Erreur lors de la complétion:', err);
    }
  }, [updateOrderStatus]);

  const handleReactivate = useCallback(async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'PENDING');
    } catch (err) {
      console.error('Erreur lors de la réactivation:', err);
    }
  }, [updateOrderStatus]);

  const handleViewDetails = useCallback((order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  }, []);

  const handleModalAction = useCallback((orderId: string, action: 'accept' | 'cancel' | 'prete' | 'recuperee' | 'reactivate') => {
    switch (action) {
      case 'accept':
        handleAccept(orderId);
        break;
      case 'cancel':
        handleReject(orderId);
        break;
      case 'prete':
        handleReady(orderId);
        break;
      case 'recuperee':
        handleComplete(orderId);
        break;
      case 'reactivate':
        handleReactivate(orderId);
        break;
    }

    if (selectedOrder && selectedOrder.id === orderId) {
      const updatedOrder = orders.find(o => o.id === orderId);
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
    }
  }, [handleAccept, handleReject, handleReady, handleComplete, handleReactivate, selectedOrder, orders]);

  const statusLabels: Record<OrderStatus, string> = {
    PENDING: 'en attente',
    CONFIRMED: 'confirmées',
    PREPARING: 'en préparation',
    READY: 'prêtes',
    COMPLETED: 'récupérées',
    CANCELLED: 'annulées',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Real-time Notification Banner */}
      {realtimeNotification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-primary-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <Bell className="h-5 w-5" />
            <span className="font-medium">{realtimeNotification}</span>
            <button
              onClick={() => setRealtimeNotification(null)}
              className="ml-2 hover:bg-white/20 rounded-full p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header - Responsive */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 py-4">
          {/* Top Row - Status & Search */}
          <div className="flex items-center justify-between mb-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-success-600" />
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-success-700 hidden sm:inline">
                    TEMPS RÉEL
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500">HORS LIGNE</span>
                </>
              )}
              <span className="text-xs text-gray-500 ml-2">
                {filteredOrders.length} commande{filteredOrders.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 max-w-xs sm:max-w-sm ml-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  'w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg',
                  'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  'bg-gray-50 placeholder-gray-400'
                )}
              />
            </div>
          </div>

          {/* Filter Tabs - Mobile: Compact 5 column grid */}
          <div className="sm:hidden">
            <FilterTabsCompact
              value={filter}
              onChange={(value) => value !== 'ALL' && setFilter(value)}
              counts={statusCounts}
            />
          </div>

          {/* Filter Tabs - Tablet & Desktop */}
          <div className="hidden sm:block">
            <FilterTabs
              value={filter}
              onChange={(value) => value !== 'ALL' && setFilter(value)}
              counts={statusCounts}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-7xl mx-auto">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-6">
            <p className="text-danger-800 text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Aucune commande {statusLabels[filter]}
            </h4>
            <p className="text-gray-500">
              Les commandes {statusLabels[filter]} apparaîtront ici
            </p>
          </div>
        )}

        {/* Orders List */}
        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={{
                  id: order.id,
                  orderNumber: order.orderNumber,
                  status: order.status,
                  total: order.total,
                  createdAt: order.createdAt,
                  estimatedTime: order.estimatedTime,
                  specialInstructions: order.specialInstructions,
                  clientName: order.clientName,
                  clientEmail: order.clientEmail,
                  clientPhone: order.clientPhone,
                  items: order.items?.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    totalPrice: item.totalPrice,
                    specialNotes: item.specialNotes,
                  })),
                }}
                variant="list"
                onAccept={handleAccept}
                onReject={handleReject}
                onReady={handleReady}
                onComplete={handleComplete}
                onReactivate={handleReactivate}
                onViewDetails={(o) => {
                  const fullOrder = orders.find(ord => ord.id === o.id);
                  if (fullOrder) handleViewDetails(fullOrder);
                }}
              />
            ))}
          </div>
        )}
      </main>

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
