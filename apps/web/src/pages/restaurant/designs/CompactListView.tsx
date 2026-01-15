import React, { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, ChefHat, Phone, MessageCircle, MoreVertical, Timer, Euro, Zap, Flame, Sparkles, Loader2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useRestaurantData } from '../../../hooks/useRestaurantData';

const CompactListView: React.FC = () => {
  const { orders, loading, error, updateOrderStatus, refetch } = useRestaurantData();
  const [activeTab, setActiveTab] = useState<string>('all');

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
          label: 'En attente',
          textColor: 'text-orange-600',
          bgColor: 'bg-orange-50',
          icon: AlertCircle,
          dot: 'bg-orange-400'
        };
      case 'PREPARING':
        return {
          color: 'bg-blue-500',
          label: 'En préparation',
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          icon: ChefHat,
          dot: 'bg-blue-400'
        };
      case 'READY':
        return {
          color: 'bg-green-500',
          label: 'Prêt',
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

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(order => order.status.toUpperCase() === activeTab.toUpperCase());

  const tabs = [
    { key: 'all', label: 'Toutes', count: orders.length },
    { key: 'PENDING', label: 'En attente', count: orders.filter(o => o.status === 'PENDING').length },
    { key: 'PREPARING', label: 'En cours', count: orders.filter(o => o.status === 'PREPARING').length },
    { key: 'READY', label: 'Prêtes', count: orders.filter(o => o.status === 'READY').length },
  ];

  const getNextStatus = (currentStatus: string) => {
    const normalizedStatus = currentStatus.toUpperCase();
    switch (normalizedStatus) {
      case 'PENDING': return 'PREPARING';
      case 'PREPARING': return 'READY';
      case 'READY': return 'COMPLETED';
      default: return currentStatus;
    }
  };

  const getActionLabel = (status: string) => {
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case 'PENDING': return 'Accepter';
      case 'PREPARING': return 'Prêt';
      case 'READY': return 'Livrer';
      default: return 'Action';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center p-8 max-w-md mx-auto">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refetch} variant="primary">
            Réessayer
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Vue Liste Compacte</h1>
              <p className="text-sm text-gray-600">Gestion rapide des commandes</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{filteredOrders.length}</div>
                <div className="text-xs text-gray-600">Commandes</div>
              </div>
            </div>
          </div>

          {/* Ultra Colorful Enhanced Status Tabs */}
          <div className="grid grid-cols-4 gap-3">
            {tabs.map((tab) => {
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
              const isActive = activeTab === tab.key;
              const IconComponent = config.icon;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
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
                  
                  {/* Urgent Notification */}
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
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-3">
        {filteredOrders.map((order) => {
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
                        <span className="font-bold text-gray-900">#{order.orderNumber || order.id.split('-')[1]}</span>
                        <Badge
                          variant={order.status === 'PENDING' ? 'warning' : order.status === 'PREPARING' ? 'primary' : 'success'}
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
                        {order.estimatedTime}min
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1"
                      icon={<MoreVertical className="h-4 w-4" />}
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
                    {order.status !== 'COMPLETED' && (
                      <Button
                        onClick={() => handleStatusUpdate(order.id, nextStatus)}
                        variant={order.status === 'PENDING' ? 'primary' : order.status === 'PREPARING' ? 'success' : 'outline'}
                        size="sm"
                        className="min-w-[80px]"
                        icon={
                          order.status === 'PENDING' ? <ChefHat className="h-4 w-4" /> :
                          order.status === 'PREPARING' ? <CheckCircle className="h-4 w-4" /> :
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

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune commande {activeTab !== 'all' && `${tabs.find(t => t.key === activeTab)?.label.toLowerCase()}`}
          </h3>
          <p className="text-gray-600">
            {activeTab === 'all' 
              ? 'Les nouvelles commandes apparaîtront ici' 
              : `Aucune commande ${tabs.find(t => t.key === activeTab)?.label.toLowerCase()} pour le moment`
            }
          </p>
        </div>
      )}

      {/* Quick Stats Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-center space-x-8">
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{orders.filter(o => o.status === 'PENDING').length}</div>
            <div className="text-xs text-gray-600">En attente</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{orders.filter(o => o.status === 'PREPARING').length}</div>
            <div className="text-xs text-gray-600">En cours</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{orders.filter(o => o.status === 'READY').length}</div>
            <div className="text-xs text-gray-600">Prêtes</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">€{orders.reduce((sum, o) => sum + o.total, 0).toFixed(0)}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed bottom bar */}
      <div className="h-20" />
    </div>
  );
};

export default CompactListView;