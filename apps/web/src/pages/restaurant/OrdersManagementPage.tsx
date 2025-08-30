import React, { useState, useEffect } from 'react';
import { format, formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Bell, Volume2, RefreshCw, Search, Filter, 
  Download, Check, X,
  Clock, User, MapPin, Phone, Truck, AlertTriangle,
  Zap, Flame, Sparkles, ChefHat, AlertCircle, CheckCircle, MoreVertical, MessageCircle, Timer
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { mockOrders } from '../../data/mockData';
import { Order } from '../../types';

// Import des composants réutilisables
import OrderDetailModal from './components/OrderDetailModal';

const OrdersManagementPage: React.FC = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');
  const [searchTerm, setSearchTerm] = useState('');
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
    const matchesFilter = filter === 'all' || 
      (filter === 'preparing' && (order.status === 'preparing' || order.status === 'accepted')) ||
      order.status === filter;
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


  const getStatusBadge = (status: string) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case 'pending':
          return {
            gradient: 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500',
            textColor: 'text-white',
            icon: '⚠️',
            label: 'En attente',
            shadow: 'shadow-orange-300',
            glow: 'shadow-orange-500/50'
          };
        case 'accepted':
          return {
            gradient: 'bg-gradient-to-r from-cyan-400 via-teal-500 to-blue-600',
            textColor: 'text-white',
            icon: '✅',
            label: 'Acceptée',
            shadow: 'shadow-cyan-300',
            glow: 'shadow-cyan-500/50'
          };
        case 'preparing':
          return {
            gradient: 'bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600',
            textColor: 'text-white',
            icon: '🔥',
            label: 'En préparation',
            shadow: 'shadow-blue-300',
            glow: 'shadow-blue-500/50'
          };
        case 'ready':
          return {
            gradient: 'bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600',
            textColor: 'text-white',
            icon: '⚡',
            label: 'Prête',
            shadow: 'shadow-green-300',
            glow: 'shadow-green-500/50'
          };
        case 'completed':
          return {
            gradient: 'bg-gradient-to-r from-slate-400 via-gray-500 to-slate-600',
            textColor: 'text-white',
            icon: '✅',
            label: 'Livrée',
            shadow: 'shadow-gray-300',
            glow: 'shadow-gray-500/50'
          };
        case 'cancelled':
          return {
            gradient: 'bg-gradient-to-r from-red-400 via-rose-500 to-pink-600',
            textColor: 'text-white',
            icon: '❌',
            label: 'Annulée',
            shadow: 'shadow-red-300',
            glow: 'shadow-red-500/50'
          };
        default:
          return {
            gradient: 'bg-gradient-to-r from-gray-400 to-gray-600',
            textColor: 'text-white',
            icon: '📋',
            label: status,
            shadow: 'shadow-gray-300',
            glow: 'shadow-gray-500/50'
          };
      }
    };

    const config = getStatusConfig(status);
    
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-bold transition-all duration-300 hover:scale-105 ${config.gradient} ${config.textColor} ${config.shadow} hover:${config.glow} animate-pulse`}>
        <span className="text-base">{config.icon}</span>
        <span>{config.label}</span>
      </div>
    );
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
              className="flex-1 sm:flex-none"
            >
              <span className="sm:hidden">OK</span>
              <span className="hidden sm:inline">Accepter</span>
            </Button>
            <Button 
              size="sm" 
              variant="danger" 
              icon={<X className="h-4 w-4" />}
              onClick={() => handleOrderAction(order.id, 'reject')}
              className="flex-1 sm:flex-none"
            >
              <span className="sm:hidden">Non</span>
              <span className="hidden sm:inline">Refuser</span>
            </Button>
          </div>
        );
      case 'accepted':
        return (
          <Button 
            size="sm" 
            variant="primary"
            onClick={() => handleOrderAction(order.id, 'preparing')}
            className="w-full sm:w-auto"
          >
            <span className="sm:hidden">Start</span>
            <span className="hidden sm:inline">Commencer</span>
          </Button>
        );
      case 'preparing':
        return (
          <Button 
            size="sm" 
            variant="success"
            onClick={() => handleOrderAction(order.id, 'ready')}
            className="w-full sm:w-auto"
          >
            <span className="sm:hidden">Prêt</span>
            <span className="hidden sm:inline">Marquer prêt</span>
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Responsive Controls */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          {/* Mobile Header */}
          <div className="flex flex-col space-y-4 lg:hidden">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestion Commandes</h1>
              <p className="text-sm text-gray-600 mt-1">Interface temps réel • Opérationnel</p>
            </div>
            
            {/* Mobile Controls Row 1 */}
            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <Button
                  variant={soundEnabled ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="px-2 py-2"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button
                  variant={autoRefresh ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className="px-2 py-2"
                >
                  <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              
              {/* Live Status Indicator */}
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">LIVE</span>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Commandes</h1>
              <p className="text-gray-600 mt-1">
                Interface opérationnelle pour traiter les commandes en temps réel
              </p>
            </div>
            <div className="flex items-center space-x-4">
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

      {/* Main Content with Responsive Padding */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* New Order Notification - Mobile Optimized */}
        {newOrderSound && (
          <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-orange-100 border border-orange-400 rounded-lg animate-pulse">
            <div className="flex items-center space-x-2 lg:space-x-3">
              <Bell className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600 flex-shrink-0" />
              <span className="text-sm lg:text-base text-orange-800 font-medium">🔔 Nouvelle commande reçue !</span>
            </div>
          </div>
        )}


        {/* Orders Management Section - Responsive */}
        <Card className="bg-white shadow-sm">
          {/* Header avec filtres - Mobile Optimized */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            {/* Mobile Header */}
            <div className="flex flex-col space-y-4 sm:hidden">
              <h3 className="text-lg font-bold text-gray-900">Commandes</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden sm:flex items-center justify-between mb-4">
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
            
            {/* Ultra Colorful Enhanced Status Tabs - Exact CompactListView Style */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { key: 'all', label: 'Toutes', count: orders.length },
                { key: 'pending', label: 'En attente', count: orders.filter(o => o.status === 'pending').length },
                { key: 'preparing', label: 'En cours', count: orders.filter(o => o.status === 'preparing' || o.status === 'accepted').length },
                { key: 'ready', label: 'Prêtes', count: orders.filter(o => o.status === 'ready').length },
              ].map((tab) => {
                const getTabConfig = (key: string) => {
                  switch(key) {
                    case 'all':
                      return { 
                        icon: Sparkles,
                        emoji: '🎯',
                        gradient: 'from-slate-500 via-slate-600 to-slate-700',
                        bgGradient: 'from-slate-50 to-slate-100',
                        textColor: 'text-slate-700',
                        activeGradient: 'bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700',
                        shadowColor: 'shadow-slate-300',
                        glowColor: 'shadow-slate-500/50'
                      };
                    case 'pending':
                      return { 
                        icon: AlertCircle,
                        emoji: '⚠️',
                        gradient: 'from-amber-400 via-orange-500 to-red-500',
                        bgGradient: 'from-orange-50 via-amber-50 to-red-50',
                        textColor: 'text-orange-800',
                        activeGradient: 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500',
                        shadowColor: 'shadow-orange-200',
                        glowColor: 'shadow-orange-500/50'
                      };
                    case 'preparing':
                      return { 
                        icon: Flame,
                        emoji: '🔥',
                        gradient: 'from-blue-400 via-indigo-500 to-purple-600',
                        bgGradient: 'from-blue-50 via-indigo-50 to-purple-50',
                        textColor: 'text-blue-800',
                        activeGradient: 'bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600',
                        shadowColor: 'shadow-blue-200',
                        glowColor: 'shadow-blue-500/50'
                      };
                    case 'ready':
                      return { 
                        icon: Zap,
                        emoji: '⚡',
                        gradient: 'from-emerald-400 via-green-500 to-teal-600',
                        bgGradient: 'from-emerald-50 via-green-50 to-teal-50',
                        textColor: 'text-green-800',
                        activeGradient: 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600',
                        shadowColor: 'shadow-green-200',
                        glowColor: 'shadow-green-500/50'
                      };
                    default:
                      return { 
                        icon: Clock,
                        emoji: '📋',
                        gradient: 'from-gray-400 to-gray-600',
                        bgGradient: 'from-gray-50 to-gray-100',
                        textColor: 'text-gray-700',
                        activeGradient: 'bg-gradient-to-br from-gray-400 to-gray-600',
                        shadowColor: 'shadow-gray-200',
                        glowColor: 'shadow-gray-500/50'
                      };
                  }
                };

                const config = getTabConfig(tab.key);
                const isActive = filter === tab.key;
                const IconComponent = config.icon;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as any)}
                    className={`group relative overflow-hidden rounded-2xl p-5 text-center transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 ${
                      isActive 
                        ? `${config.activeGradient} text-white shadow-2xl ${config.glowColor} ring-2 ring-white ring-opacity-50` 
                        : `bg-gradient-to-br ${config.bgGradient} hover:shadow-xl ${config.shadowColor} border-2 border-white hover:border-opacity-60`
                    }`}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-2 right-2 text-6xl opacity-20">{config.emoji}</div>
                    </div>
                    
                    <div className="relative space-y-3">
                      {/* Icon with Animation */}
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto transition-all duration-300 ${
                        isActive 
                          ? 'bg-white bg-opacity-20 scale-110' 
                          : `bg-gradient-to-br ${config.gradient} group-hover:scale-105`
                      }`}>
                        <IconComponent className={`h-6 w-6 transition-all duration-300 ${
                          isActive ? 'text-white' : 'text-white'
                        }`} />
                      </div>
                      
                      {/* Label */}
                      <div className={`font-bold text-sm transition-all duration-300 ${
                        isActive ? 'text-white' : config.textColor
                      }`}>
                        {tab.label}
                      </div>
                      
                      {/* Count Badge with Pulse Effect */}
                      <div className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all duration-300 ${
                        isActive 
                          ? 'bg-white bg-opacity-20 text-white scale-110' 
                          : `bg-white shadow-lg ${config.textColor} group-hover:scale-105`
                      }`}>
                        {tab.count}
                        
                        {/* Pulse ring for active tab */}
                        {isActive && (
                          <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping" />
                        )}
                      </div>
                    </div>
                    
                    {/* Shimmer Effect */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 -skew-x-12 animate-pulse" />
                    )}
                    
                    {/* Urgent Notification for pending */}
                    {tab.key === 'pending' && tab.count > 0 && (
                      <div className="absolute -top-2 -right-2 flex items-center justify-center">
                        <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-bounce shadow-lg">
                          <div className="w-3 h-3 bg-white rounded-full absolute top-1.5 left-1.5 animate-pulse" />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
                      </div>
                    )}
                    
                    {/* Preparing Active Indicator */}
                    {tab.key === 'preparing' && tab.count > 0 && (
                      <div className="absolute top-1 left-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                    )}
                    
                    {/* Ready Indicator */}
                    {tab.key === 'ready' && tab.count > 0 && (
                      <div className="absolute top-1 right-1 w-3 h-3 bg-green-400 rounded-full animate-bounce" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Liste des commandes - Mobile Responsive */}
          <div className="p-4 sm:p-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Clock className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Aucune commande {filter !== 'all' ? `(${filter})` : ''}</h4>
                <p className="text-sm sm:text-base text-gray-500">Les commandes apparaîtront ici en temps réel</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const getStatusConfig = (status: string) => {
                    switch (status) {
                      case 'pending':
                        return { 
                          color: 'bg-orange-500', 
                          label: 'En attente',
                          textColor: 'text-orange-600',
                          bgColor: 'bg-orange-50',
                          icon: AlertCircle,
                          dot: 'bg-orange-400'
                        };
                      case 'accepted':
                      case 'preparing':
                        return { 
                          color: 'bg-blue-500', 
                          label: order.status === 'accepted' ? 'Acceptée' : 'En préparation',
                          textColor: 'text-blue-600',
                          bgColor: 'bg-blue-50',
                          icon: ChefHat,
                          dot: 'bg-blue-400'
                        };
                      case 'ready':
                        return { 
                          color: 'bg-green-500', 
                          label: 'Prête',
                          textColor: 'text-green-600',
                          bgColor: 'bg-green-50',
                          icon: CheckCircle,
                          dot: 'bg-green-400'
                        };
                      default:
                        return { 
                          color: 'bg-gray-500', 
                          label: status,
                          textColor: 'text-gray-600',
                          bgColor: 'bg-gray-50',
                          icon: Clock,
                          dot: 'bg-gray-400'
                        };
                    }
                  };

                  const getNextStatus = (currentStatus: string) => {
                    switch (currentStatus) {
                      case 'pending': return 'preparing';
                      case 'accepted': return 'preparing';
                      case 'preparing': return 'ready';
                      case 'ready': return 'completed';
                      default: return currentStatus;
                    }
                  };

                  const getActionLabel = (status: string) => {
                    switch (status) {
                      case 'pending': return 'Accepter';
                      case 'accepted': return 'Commencer';
                      case 'preparing': return 'Prêt';
                      case 'ready': return 'Livrer';
                      default: return 'Action';
                    }
                  };

                  const config = getStatusConfig(order.status);
                  const StatusIcon = config.icon;
                  const nextStatus = getNextStatus(order.status);
                  const actionLabel = getActionLabel(order.status);

                  return (
                    <Card key={order.id} className="bg-white hover:shadow-md transition-shadow">
                      <div className="p-4">
                        {/* Order Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 ${config.dot} rounded-full animate-pulse`} />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-gray-900">#{order.id}</span>
                                <Badge 
                                  variant={order.status === 'pending' ? 'warning' : (order.status === 'preparing' || order.status === 'accepted') ? 'primary' : 'success'}
                                  size="sm"
                                >
                                  {config.label}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600">{order.clientName}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-right">
                              <div className="font-bold text-gray-900">€{order.total.toFixed(2)}</div>
                              <div className="text-xs text-gray-600 flex items-center">
                                <Timer className="h-3 w-3 mr-1" />
                                {order.estimatedTime || 30}min
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1"
                              icon={<MoreVertical className="h-4 w-4" />}
                              onClick={() => handleViewDetails(order)}
                            />
                          </div>
                        </div>

                        {/* Order Items - Collapsed */}
                        <div className="mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              {order.items.length} article{order.items.length > 1 ? 's' : ''}:
                            </span>
                            <div className="flex-1 text-sm text-gray-700 truncate">
                              {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                            </div>
                          </div>
                        </div>

                        {/* Time and Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-1" />
                              {Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)}min
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-2 text-blue-600 hover:bg-blue-50"
                                icon={<Phone className="h-4 w-4" />}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-2 text-green-600 hover:bg-green-50"
                                icon={<MessageCircle className="h-4 w-4" />}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {(order.status !== 'completed' && order.status !== 'cancelled') && (
                              <Button
                                onClick={() => handleOrderAction(order.id, order.status === 'pending' ? 'accept' : order.status === 'accepted' ? 'preparing' : order.status === 'preparing' ? 'ready' : 'preparing')}
                                variant={order.status === 'pending' ? 'primary' : (order.status === 'preparing' || order.status === 'accepted') ? 'success' : 'outline'}
                                size="sm"
                                className="min-w-[80px]"
                                icon={
                                  order.status === 'pending' ? <ChefHat className="h-4 w-4" /> :
                                  (order.status === 'preparing' || order.status === 'accepted') ? <CheckCircle className="h-4 w-4" /> :
                                  <CheckCircle className="h-4 w-4" />
                                }
                              >
                                {actionLabel}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Indicator Bar */}
                      <div className={`h-1 ${config.color} w-full`} />
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