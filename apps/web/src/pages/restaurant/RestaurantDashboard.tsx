import React, { useState, useEffect } from 'react';
import { format, subHours, subDays, startOfDay, endOfDay, eachHourOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  BarChart3, PieChart, TrendingUp, TrendingDown, Activity,
  DollarSign, Users, ShoppingCart, Star, Target, Zap,
  Calendar, Download, RefreshCw, Eye, EyeOff, ArrowRight,
  Clock, AlertTriangle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { mockOrders } from '../../data/mockData';
import { Order } from '../../types';

// Import des composants réutilisables
import QuickMetrics from './components/QuickMetrics';

const RestaurantDashboard: React.FC = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [showAnalytics, setShowAnalytics] = useState(true);

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
      { status: 'En attente', count: orders.filter(o => o.status === 'pending').length, color: '#f59e0b' },
      { status: 'En préparation', count: orders.filter(o => o.status === 'preparing' || o.status === 'accepted').length, color: '#3b82f6' },
      { status: 'Prêtes', count: orders.filter(o => o.status === 'ready').length, color: '#10b981' },
      { status: 'Terminées', count: orders.filter(o => o.status === 'completed').length, color: '#6b7280' }
    ],
    
    performanceMetrics: {
      avgPreparationTime: 18.5,
      customerSatisfaction: 4.7,
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

  const totalRevenue = orders.reduce((sum, order) => order.status !== 'cancelled' ? sum + order.total : sum, 0);
  const totalOrders = orders.filter(o => o.status !== 'cancelled').length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  // Urgent orders (> 15 minutes old)
  const urgentOrders = orders.filter(order => {
    if (order.status !== 'pending' && order.status !== 'accepted') return false;
    const orderTime = new Date(order.createdAt);
    const minutesAgo = (new Date().getTime() - orderTime.getTime()) / (1000 * 60);
    return minutesAgo > 15;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Controls */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard - Vue d'ensemble</h1>
              <p className="text-gray-600 mt-1">Métriques business et performance en temps réel</p>
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
              <Button variant="ghost" size="sm" icon={<RefreshCw className="h-4 w-4" />}>
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
        {/* Quick Metrics */}
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

        {/* Urgent Actions Required */}
        {urgentOrders.length > 0 && (
          <Card className="p-6 bg-red-50 border-red-200 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-bold text-red-900">Action urgente requise</h3>
                  <p className="text-red-700">
                    {urgentOrders.length} commande{urgentOrders.length > 1 ? 's' : ''} en attente depuis plus de 15 minutes
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-700"
                icon={<ArrowRight className="h-4 w-4" />}
              >
                Gérer les commandes
              </Button>
            </div>
          </Card>
        )}

        {/* Analytics Section */}
        {showAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
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

            {/* Performance KPIs */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Indicateurs de Performance</h3>
                <Target className="h-5 w-5 text-purple-500" />
              </div>
              
              <div className="grid grid-cols-1 gap-6">
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

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Commandes par heure - Aujourd'hui</h3>
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.hourlyData.slice(8, 22)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="orders" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Chiffre d'affaires par heure</h3>
              <Activity className="h-5 w-5 text-green-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.hourlyData.slice(8, 22)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Gérer les commandes</h4>
                <p className="text-sm text-gray-600">Traiter les commandes en attente</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Analytics détaillées</h4>
                <p className="text-sm text-gray-600">Voir les statistiques complètes</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Gestion du menu</h4>
                <p className="text-sm text-gray-600">Modifier les articles et prix</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Paramètres</h4>
                <p className="text-sm text-gray-600">Configuration du restaurant</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;