import React, { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, ChefHat, Phone, MessageCircle, MoreVertical, Timer, Euro } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { mockOrders } from '../../../data/mockData';
import { Order } from '../../../types';

const CompactListView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [activeTab, setActiveTab] = useState<string>('all');

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

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
      case 'preparing':
        return { 
          color: 'bg-blue-500', 
          label: 'En préparation',
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          icon: ChefHat,
          dot: 'bg-blue-400'
        };
      case 'ready':
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
    : orders.filter(order => order.status === activeTab);

  const tabs = [
    { key: 'all', label: 'Toutes', count: orders.length },
    { key: 'pending', label: 'En attente', count: orders.filter(o => o.status === 'pending').length },
    { key: 'preparing', label: 'En cours', count: orders.filter(o => o.status === 'preparing').length },
    { key: 'ready', label: 'Prêtes', count: orders.filter(o => o.status === 'ready').length },
  ];

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'completed';
      default: return currentStatus;
    }
  };

  const getActionLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Accepter';
      case 'preparing': return 'Prêt';
      case 'ready': return 'Livrer';
      default: return 'Action';
    }
  };

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

          {/* Enhanced Tabs with Colors and Icons */}
          <div className="grid grid-cols-4 gap-2">
            {tabs.map((tab) => {
              const getTabConfig = (key: string) => {
                switch(key) {
                  case 'all':
                    return { 
                      icon: '🎯', 
                      color: 'from-gray-500 to-gray-600',
                      bgColor: 'bg-gray-50',
                      textColor: 'text-gray-700',
                      activeColor: 'bg-gradient-to-r from-gray-500 to-gray-600'
                    };
                  case 'pending':
                    return { 
                      icon: '⏳', 
                      color: 'from-orange-500 to-red-500',
                      bgColor: 'bg-orange-50',
                      textColor: 'text-orange-700',
                      activeColor: 'bg-gradient-to-r from-orange-500 to-red-500'
                    };
                  case 'preparing':
                    return { 
                      icon: '👨‍🍳', 
                      color: 'from-blue-500 to-purple-500',
                      bgColor: 'bg-blue-50',
                      textColor: 'text-blue-700',
                      activeColor: 'bg-gradient-to-r from-blue-500 to-purple-500'
                    };
                  case 'ready':
                    return { 
                      icon: '✅', 
                      color: 'from-green-500 to-emerald-500',
                      bgColor: 'bg-green-50',
                      textColor: 'text-green-700',
                      activeColor: 'bg-gradient-to-r from-green-500 to-emerald-500'
                    };
                  default:
                    return { 
                      icon: '📋', 
                      color: 'from-gray-500 to-gray-600',
                      bgColor: 'bg-gray-50',
                      textColor: 'text-gray-700',
                      activeColor: 'bg-gradient-to-r from-gray-500 to-gray-600'
                    };
                }
              };

              const config = getTabConfig(tab.key);
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative overflow-hidden rounded-xl p-4 text-center transition-all duration-300 transform hover:scale-105 ${
                    isActive 
                      ? `${config.activeColor} text-white shadow-lg` 
                      : `${config.bgColor} hover:shadow-md border-2 border-transparent hover:border-opacity-20`
                  }`}
                >
                  <div className="space-y-2">
                    <div className="text-2xl">{config.icon}</div>
                    <div className={`font-bold text-sm ${isActive ? 'text-white' : config.textColor}`}>
                      {tab.label}
                    </div>
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${
                      isActive 
                        ? 'bg-white bg-opacity-20 text-white' 
                        : 'bg-white shadow-sm ' + config.textColor
                    }`}>
                      {tab.count}
                    </div>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute inset-0 bg-white bg-opacity-10 rounded-xl animate-pulse" />
                  )}
                  
                  {/* Urgent indicator for pending */}
                  {tab.key === 'pending' && tab.count > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-bounce">
                      <div className="w-2 h-2 bg-white rounded-full absolute top-1 left-1" />
                    </div>
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
                        <span className="font-bold text-gray-900">#{order.id.split('-')[1]}</span>
                        <Badge 
                          variant={order.status === 'pending' ? 'warning' : order.status === 'preparing' ? 'primary' : 'success'}
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
                    {order.status !== 'completed' && (
                      <Button
                        onClick={() => handleStatusUpdate(order.id, nextStatus)}
                        variant={order.status === 'pending' ? 'primary' : order.status === 'preparing' ? 'success' : 'outline'}
                        size="sm"
                        className="min-w-[80px]"
                        icon={
                          order.status === 'pending' ? <ChefHat className="h-4 w-4" /> :
                          order.status === 'preparing' ? <CheckCircle className="h-4 w-4" /> :
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
            <div className="text-lg font-bold text-orange-600">{orders.filter(o => o.status === 'pending').length}</div>
            <div className="text-xs text-gray-600">En attente</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{orders.filter(o => o.status === 'preparing').length}</div>
            <div className="text-xs text-gray-600">En cours</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{orders.filter(o => o.status === 'ready').length}</div>
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