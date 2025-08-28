import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Clock, Users, Star, Target,
  BarChart3, PieChart, Activity, Zap, Calendar, Download, RefreshCw, Eye, EyeOff
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const RestaurantStatsPage: React.FC = () => {
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');

  const weeklyData = [
    { day: 'Lun', orders: 12, revenue: 280 },
    { day: 'Mar', orders: 18, revenue: 420 },
    { day: 'Mer', orders: 15, revenue: 350 },
    { day: 'Jeu', orders: 22, revenue: 510 },
    { day: 'Ven', orders: 28, revenue: 650 },
    { day: 'Sam', orders: 35, revenue: 780 },
    { day: 'Dim', orders: 25, revenue: 580 }
  ];

  // Analytics Data
  const analytics = {
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
    ],
    
    statusDistribution: [
      { status: 'Pending', count: 4, color: '#f59e0b' },
      { status: 'Preparing', count: 8, color: '#3b82f6' },
      { status: 'Ready', count: 12, color: '#10b981' },
      { status: 'Completed', count: 156, color: '#6b7280' }
    ]
  };

  const totalRevenue = weeklyData.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = weeklyData.reduce((sum, day) => sum + day.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;


  const handleExport = () => {
    const csvContent = [
      ['Jour', 'Commandes', 'Chiffre d\'affaires'],
      ...weeklyData.map(item => [
        item.day,
        item.orders.toString(),
        item.revenue.toString()
      ])
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'statistiques-restaurant.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Controls */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard - Statistiques</h1>
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
              <Button variant="ghost" size="sm" icon={<RefreshCw className="h-4 w-4" />}>
                Actualiser
              </Button>
              <Button onClick={handleExport} variant="ghost" size="sm" icon={<Download className="h-4 w-4" />}>
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
              <span>+15.3% vs semaine dernière</span>
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
              <span>+8.7% vs semaine dernière</span>
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
              <span>+3.2% vs semaine dernière</span>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8" />
              <div className="text-right">
                <div className="text-3xl font-bold">{analytics.performanceMetrics.avgPreparationTime}</div>
                <div className="text-orange-100 font-medium">Temps préparation (min)</div>
              </div>
            </div>
            <div className="flex items-center text-orange-100 text-sm">
              <TrendingDown className="h-4 w-4 mr-1" />
              <span>-2.1min vs semaine dernière</span>
            </div>
          </Card>
        </div>

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
              <h3 className="text-xl font-bold text-gray-900">Commandes - 7 derniers jours</h3>
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="orders" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Chiffre d'affaires - 7 derniers jours</h3>
              <Activity className="h-5 w-5 text-green-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default RestaurantStatsPage;