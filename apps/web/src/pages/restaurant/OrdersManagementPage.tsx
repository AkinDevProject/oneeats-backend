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
import { Order } from '../../types';
import { useRestaurantData } from '../../hooks/useRestaurantData';

// Import des composants réutilisables
import OrderDetailModal from './components/OrderDetailModal';

const OrdersManagementPage: React.FC = () => {
  const { orders, loading, error, updateOrderStatus, refetch } = useRestaurantData();
  const [filter, setFilter] = useState<'en_attente' | 'en_preparation' | 'prete' | 'recuperee' | 'annulee'>('en_attente');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrderSound, setNewOrderSound] = useState(false);

  const tabs = [
    { key: 'en_attente', label: 'En attente' },
    { key: 'en_preparation', label: 'En cours' },
    { key: 'prete', label: 'Prêtes' },
    { key: 'recuperee', label: 'Récupérées' },
    { key: 'annulee', label: 'Annulées' },
  ];

  // Note: Real-time updates and sound controls are now managed in the sidebar

  const filteredOrders = orders.filter(order => {
    const matchesFilter = order.status === filter;
    const matchesSearch = order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.orderNumber && order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleOrderAction = async (orderId: string, action: 'accept' | 'cancel' | 'prete' | 'recuperee') => {
    try {
      console.log('Handling order action:', { orderId, action });
      let status: string;
      switch (action) {
        case 'accept':
          status = 'EN_PREPARATION';
          break;
        case 'cancel':
          status = 'ANNULEE';
          break;
        case 'prete':
          status = 'PRETE';
          break;
        case 'recuperee':
          status = 'RECUPEREE';
          break;
        default:
          console.warn('Unknown action:', action);
          return;
      }
      console.log('Updating order status:', { orderId, status });
      await updateOrderStatus(orderId, status);
      console.log('Order status updated successfully');
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleModalAction = (orderId: string, action: 'accept' | 'cancel' | 'prete' | 'recuperee') => {
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
        case 'en_attente':
          return {
            gradient: 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500',
            textColor: 'text-white',
            icon: '⚠️',
            label: 'En attente',
            shadow: 'shadow-orange-300',
            glow: 'shadow-orange-500/50'
          };
        case 'en_preparation':
          return {
            gradient: 'bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600',
            textColor: 'text-white',
            icon: '🔥',
            label: 'En préparation',
            shadow: 'shadow-blue-300',
            glow: 'shadow-blue-500/50'
          };
        case 'prete':
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
        case 'annulee':
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
      case 'en_attente':
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
              onClick={() => handleOrderAction(order.id, 'cancel')}
              className="flex-1 sm:flex-none"
            >
              <span className="sm:hidden">Non</span>
              <span className="hidden sm:inline">Refuser</span>
            </Button>
          </div>
        );
      case 'en_preparation':
        return (
          <Button 
            size="sm" 
            variant="success"
            onClick={() => handleOrderAction(order.id, 'prete')}
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
    <div className="bg-gray-50">
      {/* Mobile & Tablet Optimized Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        {/* Mobile Header */}
        <div className="px-4 py-3 sm:hidden">
          {/* Mobile Top Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">LIVE</span>
              <span className="text-xs text-gray-500">{filteredOrders.length}</span>
            </div>
            
            {/* Mobile Search Toggle */}
            <button 
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => {
                const searchInput = document.getElementById('mobile-search') as HTMLInputElement;
                searchInput?.focus();
              }}
            >
              <Search className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          
          {/* Mobile Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="mobile-search"
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            />
          </div>
          
          {/* Mobile Status Tabs - 3x2 Grid */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'en_attente', label: 'En attente', shortLabel: 'Attente', count: orders.filter(o => o.status === 'en_attente').length },
              { key: 'en_preparation', label: 'En cours', shortLabel: 'Cours', count: orders.filter(o => o.status === 'en_preparation').length },
              { key: 'prete', label: 'Prêtes', shortLabel: 'Prêtes', count: orders.filter(o => o.status === 'prete').length },
              { key: 'recuperee', label: 'Récupérées', shortLabel: 'Récup', count: orders.filter(o => o.status === 'recuperee').length },
              { key: 'annulee', label: 'Annulées', shortLabel: 'Annul', count: orders.filter(o => o.status === 'annulee').length },
            ].map((tab) => {
              const getTabConfig = (key: string) => {
                switch(key) {
                  case 'en_attente':
                    return { 
                      icon: AlertCircle, emoji: '⚠️', gradient: 'from-amber-400 to-red-500',
                      bgGradient: 'from-orange-50 to-red-50', textColor: 'text-orange-800',
                      activeGradient: 'bg-gradient-to-r from-amber-400 to-red-500'
                    };
                  case 'en_preparation':
                    return { 
                      icon: Flame, emoji: '🔥', gradient: 'from-blue-400 to-purple-600',
                      bgGradient: 'from-blue-50 to-purple-50', textColor: 'text-blue-800',
                      activeGradient: 'bg-gradient-to-r from-blue-400 to-purple-600'
                    };
                  case 'prete':
                    return { 
                      icon: Zap, emoji: '⚡', gradient: 'from-emerald-400 to-teal-600',
                      bgGradient: 'from-emerald-50 to-teal-50', textColor: 'text-green-800',
                      activeGradient: 'bg-gradient-to-r from-emerald-400 to-teal-600'
                    };
                  case 'recuperee':
                    return { 
                      icon: CheckCircle, emoji: '✅', gradient: 'from-gray-400 to-gray-600',
                      bgGradient: 'from-gray-50 to-gray-100', textColor: 'text-gray-700',
                      activeGradient: 'bg-gradient-to-r from-gray-400 to-gray-600'
                    };
                  case 'annulee':
                    return { 
                      icon: X, emoji: '❌', gradient: 'from-red-400 to-red-600',
                      bgGradient: 'from-red-50 to-red-100', textColor: 'text-red-700',
                      activeGradient: 'bg-gradient-to-r from-red-400 to-red-600'
                    };
                  default: return { icon: Clock, emoji: '📋', gradient: 'from-gray-400 to-gray-600', bgGradient: 'from-gray-50 to-gray-100', textColor: 'text-gray-700', activeGradient: 'bg-gradient-to-r from-gray-400 to-gray-600' };
                }
              };
              
              const config = getTabConfig(tab.key);
              const isActive = filter === tab.key;
              const IconComponent = config.icon;
              
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`relative p-3 rounded-xl transition-all duration-200 touch-manipulation ${
                    isActive 
                      ? `${config.activeGradient} text-white shadow-lg` 
                      : `bg-gradient-to-r ${config.bgGradient} border border-gray-200 active:scale-95`
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <IconComponent className={`h-4 w-4 ${isActive ? 'text-white' : config.textColor}`} />
                    <div className="flex-1 text-left">
                      <div className={`font-medium text-xs ${isActive ? 'text-white' : config.textColor}`}>
                        {tab.shortLabel}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-bold min-w-[24px] text-center ${
                      isActive ? 'bg-white bg-opacity-20 text-white' : 'bg-white ' + config.textColor
                    }`}>
                      {tab.count}
                    </div>
                  </div>
                  
                  {tab.key === 'en_attente' && tab.count > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Tablet Header */}
        <div className="hidden sm:block lg:hidden px-5 py-4">
          {/* Tablet Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">TEMPS RÉEL</span>
              <span className="text-sm text-gray-500">• {filteredOrders.length} commandes</span>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Tablet Status Tabs */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { key: 'en_attente', label: 'En attente', count: orders.filter(o => o.status === 'en_attente').length },
              { key: 'en_preparation', label: 'En cours', count: orders.filter(o => o.status === 'en_preparation').length },
              { key: 'prete', label: 'Prêtes', count: orders.filter(o => o.status === 'prete').length },
              { key: 'recuperee', label: 'Récupérées', count: orders.filter(o => o.status === 'recuperee').length },
              { key: 'annulee', label: 'Annulées', count: orders.filter(o => o.status === 'annulee').length },
            ].map((tab) => {
              const getTabConfig = (key: string) => {
                switch(key) {
                  case 'en_attente': return { icon: AlertCircle, emoji: '⚠️', gradient: 'from-amber-400 to-red-500', bgGradient: 'from-orange-50 to-red-50', textColor: 'text-orange-800', activeGradient: 'bg-gradient-to-r from-amber-400 to-red-500' };
                  case 'en_preparation': return { icon: Flame, emoji: '🔥', gradient: 'from-blue-400 to-purple-600', bgGradient: 'from-blue-50 to-purple-50', textColor: 'text-blue-800', activeGradient: 'bg-gradient-to-r from-blue-400 to-purple-600' };
                  case 'prete': return { icon: Zap, emoji: '⚡', gradient: 'from-emerald-400 to-teal-600', bgGradient: 'from-emerald-50 to-teal-50', textColor: 'text-green-800', activeGradient: 'bg-gradient-to-r from-emerald-400 to-teal-600' };
                  case 'recuperee': return { icon: CheckCircle, emoji: '✅', gradient: 'from-gray-400 to-gray-600', bgGradient: 'from-gray-50 to-gray-100', textColor: 'text-gray-700', activeGradient: 'bg-gradient-to-r from-gray-400 to-gray-600' };
                  case 'annulee': return { icon: X, emoji: '❌', gradient: 'from-red-400 to-red-600', bgGradient: 'from-red-50 to-red-100', textColor: 'text-red-700', activeGradient: 'bg-gradient-to-r from-red-400 to-red-600' };
                  default: return { icon: Clock, emoji: '📋', gradient: 'from-gray-400 to-gray-600', bgGradient: 'from-gray-50 to-gray-100', textColor: 'text-gray-700', activeGradient: 'bg-gradient-to-r from-gray-400 to-gray-600' };
                }
              };
              
              const config = getTabConfig(tab.key);
              const isActive = filter === tab.key;
              const IconComponent = config.icon;
              
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`relative p-4 rounded-xl transition-all duration-200 touch-manipulation ${
                    isActive 
                      ? `${config.activeGradient} text-white shadow-lg` 
                      : `bg-gradient-to-r ${config.bgGradient} border border-gray-200 hover:shadow-md active:scale-95`
                  }`}
                >
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center">
                      <IconComponent className={`h-5 w-5 ${isActive ? 'text-white' : config.textColor}`} />
                    </div>
                    <div className={`font-medium text-sm ${isActive ? 'text-white' : config.textColor}`}>
                      {tab.label}
                    </div>
                    <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      isActive ? 'bg-white bg-opacity-20 text-white' : 'bg-white shadow-sm ' + config.textColor
                    }`}>
                      {tab.count}
                    </div>
                  </div>
                  
                  {tab.key === 'en_attente' && tab.count > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-bounce">
                      <div className="w-2 h-2 bg-white rounded-full absolute top-1 left-1" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Desktop Header */}
        <div className="hidden lg:block px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">TEMPS RÉEL</span>
              <span className="text-sm text-gray-500">• {filteredOrders.length} commandes affichées</span>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-4">
            {[
              { key: 'en_attente', label: 'En attente', count: orders.filter(o => o.status === 'en_attente').length },
              { key: 'en_preparation', label: 'En cours', count: orders.filter(o => o.status === 'en_preparation').length },
              { key: 'prete', label: 'Prêtes', count: orders.filter(o => o.status === 'prete').length },
              { key: 'recuperee', label: 'Récupérées', count: orders.filter(o => o.status === 'recuperee').length },
              { key: 'annulee', label: 'Annulées', count: orders.filter(o => o.status === 'annulee').length },
            ].map((tab) => {
              const getTabConfig = (key: string) => {
                switch(key) {
                  case 'en_attente': return { icon: AlertCircle, emoji: '⚠️', gradient: 'from-amber-400 to-red-500', bgGradient: 'from-orange-50 to-red-50', textColor: 'text-orange-800', activeGradient: 'bg-gradient-to-br from-amber-400 to-red-500', shadowColor: 'shadow-orange-200', glowColor: 'shadow-orange-500/50' };
                  case 'en_preparation': return { icon: Flame, emoji: '🔥', gradient: 'from-blue-400 to-purple-600', bgGradient: 'from-blue-50 to-purple-50', textColor: 'text-blue-800', activeGradient: 'bg-gradient-to-br from-blue-400 to-purple-600', shadowColor: 'shadow-blue-200', glowColor: 'shadow-blue-500/50' };
                  case 'prete': return { icon: Zap, emoji: '⚡', gradient: 'from-emerald-400 to-teal-600', bgGradient: 'from-emerald-50 to-teal-50', textColor: 'text-green-800', activeGradient: 'bg-gradient-to-br from-emerald-400 to-teal-600', shadowColor: 'shadow-green-200', glowColor: 'shadow-green-500/50' };
                  case 'recuperee': return { icon: CheckCircle, emoji: '✅', gradient: 'from-gray-400 to-gray-600', bgGradient: 'from-gray-50 to-gray-100', textColor: 'text-gray-700', activeGradient: 'bg-gradient-to-br from-gray-400 to-gray-600', shadowColor: 'shadow-gray-200', glowColor: 'shadow-gray-500/50' };
                  case 'annulee': return { icon: X, emoji: '❌', gradient: 'from-red-400 to-red-600', bgGradient: 'from-red-50 to-red-100', textColor: 'text-red-700', activeGradient: 'bg-gradient-to-br from-red-400 to-red-600', shadowColor: 'shadow-red-200', glowColor: 'shadow-red-500/50' };
                  default: return { icon: Clock, emoji: '📋', gradient: 'from-gray-400 to-gray-600', bgGradient: 'from-gray-50 to-gray-100', textColor: 'text-gray-700', activeGradient: 'bg-gradient-to-br from-gray-400 to-gray-600', shadowColor: 'shadow-gray-200', glowColor: 'shadow-gray-500/50' };
                }
              };
              
              const config = getTabConfig(tab.key);
              const isActive = filter === tab.key;
              const IconComponent = config.icon;
              
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`group relative overflow-hidden rounded-2xl p-4 text-center transition-all duration-300 transform hover:scale-105 ${
                    isActive 
                      ? `${config.activeGradient} text-white shadow-lg ${config.glowColor}` 
                      : `bg-gradient-to-br ${config.bgGradient} hover:shadow-md ${config.shadowColor} border border-gray-200`
                  }`}
                >
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-2 right-2 text-4xl opacity-20">{config.emoji}</div>
                  </div>
                  
                  <div className="relative space-y-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full mx-auto transition-all duration-300 ${
                      isActive ? 'bg-white bg-opacity-20' : `bg-gradient-to-br ${config.gradient}`
                    }`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div className={`font-bold text-sm ${isActive ? 'text-white' : config.textColor}`}>
                      {tab.label}
                    </div>
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                      isActive ? 'bg-white bg-opacity-20 text-white' : `bg-white shadow-sm ${config.textColor}`
                    }`}>
                      {tab.count}
                    </div>
                  </div>
                  
                  {tab.key === 'en_attente' && tab.count > 0 && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-bounce shadow-lg">
                      <div className="w-2.5 h-2.5 bg-white rounded-full absolute top-1 left-1 animate-pulse" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* New Order Notification */}
        {newOrderSound && (
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-100 to-red-50 border border-orange-300 rounded-xl animate-pulse shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-orange-800">🔔 Nouvelle commande reçue !</span>
            </div>
          </div>
        )}


        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Aucune commande {tabs.find(t => t.key === filter)?.label.toLowerCase()}
            </h4>
            <p className="text-gray-500">
              Aucune commande {tabs.find(t => t.key === filter)?.label.toLowerCase()} pour le moment
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
                  const getStatusConfig = (status: string) => {
                    switch (status) {
                      case 'en_attente':
                        return { 
                          color: 'bg-orange-500', 
                          label: 'En attente',
                          textColor: 'text-orange-600',
                          bgColor: 'bg-orange-50',
                          icon: AlertCircle,
                          dot: 'bg-orange-400'
                        };
                      case 'en_preparation':
                        return { 
                          color: 'bg-blue-500', 
                          label: 'En préparation',
                          textColor: 'text-blue-600',
                          bgColor: 'bg-blue-50',
                          icon: ChefHat,
                          dot: 'bg-blue-400'
                        };
                      case 'prete':
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
                      case 'en_attente': return 'en_preparation';
                      case 'en_preparation': return 'prete';
                      case 'prete': return 'recuperee';
                      default: return currentStatus;
                    }
                  };

                  const getActionLabel = (status: string) => {
                    switch (status) {
                      case 'en_attente': return 'Accepter';
                      case 'en_preparation': return 'Prêt';
                      case 'prete': return 'Récupérée';
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
                                <span className="font-bold text-gray-900">{order.orderNumber || `#${order.id.substring(0, 8)}...`}</span>
                                <Badge 
                                  variant={order.status === 'en_attente' ? 'warning' : (order.status === 'en_preparation') ? 'primary' : 'success'}
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

                        {/* Order Items - Multi-line */}
                        <div className="mb-3">
                          <div className="text-sm text-gray-600 mb-2">
                            {order.items.length} article{order.items.length > 1 ? 's' : ''}:
                          </div>
                          <div className="space-y-1">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                  <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                                    {item.quantity}
                                  </span>
                                  <span className="text-gray-700">{item.name}</span>
                                </div>
                                <span className="text-gray-500 text-xs">
                                  €{item.totalPrice.toFixed(2)}
                                </span>
                              </div>
                            ))}
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
                            {(order.status !== 'recuperee') && (
                              <>
                                {order.status !== 'annulee' ? (
                                  <Button
                                    onClick={() => handleOrderAction(order.id, order.status === 'en_attente' ? 'accept' : order.status === 'en_preparation' ? 'prete' : order.status === 'prete' ? 'recuperee' : 'accept')}
                                    variant={order.status === 'en_attente' ? 'primary' : (order.status === 'en_preparation') ? 'success' : 'outline'}
                                    size="sm"
                                    className="min-w-[80px]"
                                    icon={
                                      order.status === 'en_attente' ? <ChefHat className="h-4 w-4" /> :
                                      (order.status === 'en_preparation') ? <CheckCircle className="h-4 w-4" /> :
                                      <CheckCircle className="h-4 w-4" />
                                    }
                                  >
                                    {actionLabel}
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => handleOrderAction(order.id, 'accept')}
                                    variant="success"
                                    size="sm"
                                    className="min-w-[80px]"
                                    icon={<CheckCircle className="h-4 w-4" />}
                                  >
                                    Réactiver
                                  </Button>
                                )}
                              </>
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