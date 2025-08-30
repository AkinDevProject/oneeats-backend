import React, { useState, useEffect } from 'react';
import { format, subHours, subDays, startOfDay, endOfDay, eachHourOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Check, X, Clock, Bell, AlertCircle, CheckCircle2, Timer, 
  BarChart3, PieChart, TrendingUp, TrendingDown, Activity,
  DollarSign, Users, ShoppingCart, Star, Target, Zap,
  Calendar, Download, RefreshCw, Filter, Eye, EyeOff
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Order } from '../../../types';
import { useRestaurantData } from '../../../hooks/useRestaurantData';

const TableauDashboard: React.FC = () => {
  const { orders, stats, loading, error, updateOrderStatus, refetch } = useRestaurantData();
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'preparing' | 'ready'>('all');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [showAnalytics, setShowAnalytics] = useState(true);

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const handleOrderAction = async (orderId: string, action: 'accept' | 'reject' | 'ready') => {
    try {
      let status: string;
      switch (action) {
        case 'accept':
          status = 'EN_PREPARATION';
          break;
        case 'reject':
          status = 'ANNULEE';
          break;
        case 'ready':
          status = 'PRETE';
          break;
        default:
          return;
      }
      await updateOrderStatus(orderId, status);
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
    }
  };

  // Analytics Data
  const analytics = {
    hourlyData: eachHourOfInterval({
      start: startOfDay(new Date()),
      end: endOfDay(new Date())
    }).map(hour => ({
      hour: format(hour, 'HH:mm'),
      orders: Math.floor(Math.random() * 8) + 1,
      revenue: Math.floor(Math.random() * 400) + 100
    })),
    
    statusDistribution: [
      { status: 'Pending', count: orders.filter(o => o.status === 'pending').length, color: '#f59e0b' },
      { status: 'Preparing', count: orders.filter(o => o.status === 'preparing' || o.status === 'accepted').length, color: '#3b82f6' },
      { status: 'Ready', count: orders.filter(o => o.status === 'ready').length, color: '#10b981' },
      { status: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length, color: '#ef4444' }
    ],
    
    performanceMetrics: {
      avgPreparationTime: 18.5,
      customerSatisfaction: 4.5,
      orderAccuracy: 97.8,
      deliveryOnTime: 94.2
    },
    
    topItems: [
      { name: 'Pizza Margherita', orders: 23, revenue: 345 },
      { name: 'Burger Classic', orders: 18, revenue: 270 },
      { name: 'Salade César', orders: 15, revenue: 195 },
      { name: 'Pâtes Carbonara', orders: 12, revenue: 168 }
    ]
  };

  const totalRevenue = stats?.totalRevenue || 0;
  const totalOrders = stats?.totalOrders || 0;
  const avgOrderValue = stats?.avgOrderValue || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Erreur: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Controls */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Données en temps réel et analyses de performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant={showAnalytics ? "primary" : "ghost"}
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
                icon={showAnalytics ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              >
                {showAnalytics ? 'Masquer Analytics' : 'Afficher Analytics'}
              </Button>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
              <Button variant="ghost" size="sm" icon={<RefreshCw className="h-4 w-4" />} onClick={refetch}>
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
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8" />
              <div className="text-right">
                <div className="text-3xl font-bold">€{totalRevenue.toFixed(0)}</div>
                <div className="text-blue-100 font-medium">Chiffre d'affaires</div>
              </div>
            </div>
            <div className="flex items-center text-blue-100 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+15.3% vs hier</span>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <ShoppingCart className="h-8 w-8" />
              <div className="text-right">
                <div className="text-3xl font-bold">{totalOrders}</div>
                <div className="text-green-100 font-medium">Commandes</div>
              </div>
            </div>
            <div className="flex items-center text-green-100 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+8.7% vs hier</span>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8" />
              <div className="text-right">
                <div className="text-3xl font-bold">€{avgOrderValue.toFixed(0)}</div>
                <div className="text-purple-100 font-medium">Panier moyen</div>
              </div>
            </div>
            <div className="flex items-center text-purple-100 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+3.2% vs hier</span>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <Timer className="h-8 w-8" />
              <div className="text-right">
                <div className="text-3xl font-bold">{analytics.performanceMetrics.avgPreparationTime}</div>
                <div className="text-orange-100 font-medium">Temps préparation (min)</div>
              </div>
            </div>
            <div className="flex items-center text-orange-100 text-sm">
              <TrendingDown className="h-4 w-4 mr-1" />
              <span>-2.1min vs hier</span>
            </div>
          </Card>
        </div>

        {/* Analytics Section */}
        {showAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Hourly Orders Chart */}
            <Card className="p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Commandes par heure</h3>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-gray-600">Aujourd'hui</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {analytics.hourlyData.filter((_, i) => i % 2 === 0).map((data, index) => (
                  <div key={data.hour} className="flex items-center space-x-4">
                    <div className="w-12 text-sm text-gray-600 font-medium">{data.hour}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${(data.orders / 8) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8">{data.orders}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 w-16">€{data.revenue}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Status Distribution */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Distribution des statuts</h3>
                <PieChart className="h-5 w-5 text-green-500" />
              </div>
              
              <div className="space-y-4">
                {analytics.statusDistribution.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">{item.status}</span>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: item.color }}>
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Total: <span className="font-medium text-gray-900">
                    {analytics.statusDistribution.reduce((sum, item) => sum + item.count, 0)} commandes
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Performance Metrics & Top Items */}
        {showAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Performance KPIs */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Indicateurs de Performance</h3>
                <Target className="h-5 w-5 text-purple-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {analytics.performanceMetrics.customerSatisfaction}/5
                  </div>
                  <div className="text-sm text-gray-600">Satisfaction Client</div>
                  <div className="flex items-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${
                          i < Math.floor(analytics.performanceMetrics.customerSatisfaction) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {analytics.performanceMetrics.orderAccuracy}%
                  </div>
                  <div className="text-sm text-gray-600">Précision Commandes</div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${analytics.performanceMetrics.orderAccuracy}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {analytics.performanceMetrics.deliveryOnTime}%
                  </div>
                  <div className="text-sm text-gray-600">Livraison à temps</div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${analytics.performanceMetrics.deliveryOnTime}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {analytics.performanceMetrics.avgPreparationTime}min
                  </div>
                  <div className="text-sm text-gray-600">Temps Préparation</div>
                  <div className="flex items-center mt-2 text-green-600 text-sm">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    <span>-2.1min cette semaine</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Top Selling Items */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Articles les plus vendus</h3>
                <Zap className="h-5 w-5 text-yellow-500" />
              </div>
              
              <div className="space-y-4">
                {analytics.topItems.map((item, index) => (
                  <div key={item.name} className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.orders} commandes</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">€{item.revenue}</div>
                      <div className="text-sm text-gray-600">CA</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Orders Management */}
        <Card className="bg-white">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Gestion des Commandes</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                  {[
                    { key: 'all', label: 'Toutes', count: orders.length },
                    { key: 'pending', label: 'En attente', count: orders.filter(o => o.status === 'pending').length },
                    { key: 'preparing', label: 'En cours', count: orders.filter(o => o.status === 'preparing' || o.status === 'accepted').length },
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
            </div>
          </div>

          <div className="p-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Aucune commande</h4>
                <p className="text-gray-500">Les commandes apparaîtront ici en temps réel</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="p-4 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="font-bold text-lg text-gray-900">#{order.id}</div>
                        <div className="text-sm text-gray-500">
                          {format(order.createdAt, 'HH:mm')}
                        </div>
                      </div>
                      <Badge 
                        variant={
                          order.status === 'pending' ? 'warning' :
                          order.status === 'preparing' || order.status === 'accepted' ? 'info' :
                          order.status === 'ready' ? 'success' : 'danger'
                        }
                      >
                        {order.status === 'pending' ? 'En attente' :
                         order.status === 'accepted' ? 'Acceptée' :
                         order.status === 'preparing' ? 'En cours' :
                         order.status === 'ready' ? 'Prête' : 'Annulée'}
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <div className="font-medium text-gray-900">{order.clientName}</div>
                      <div className="text-sm text-gray-600">{order.clientEmail}</div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} articles
                      </div>
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item) => (
                          <div key={item.id} className="text-sm text-gray-700 flex justify-between">
                            <span>{item.quantity}x {item.name}</span>
                            <span>€{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-sm text-gray-500">
                            +{order.items.length - 2} autres articles
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="font-bold text-xl text-gray-900">
                        €{order.total.toFixed(2)}
                      </div>
                      {order.estimatedTime && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Timer className="h-4 w-4 mr-1" />
                          {order.estimatedTime}min
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      {order.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleOrderAction(order.id, 'accept')}
                            className="flex-1"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accepter
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleOrderAction(order.id, 'reject')}
                            className="flex-1"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Refuser
                          </Button>
                        </>
                      )}
                      {(order.status === 'accepted' || order.status === 'preparing') && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleOrderAction(order.id, 'ready')}
                          className="w-full"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Marquer prêt
                        </Button>
                      )}
                      {order.status === 'ready' && (
                        <div className="flex items-center justify-center w-full text-green-600 font-medium text-sm bg-green-50 py-2 rounded-lg">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Prêt pour retrait
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TableauDashboard;