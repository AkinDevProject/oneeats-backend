import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, BarChart3, RefreshCcw, Eye, EyeOff, TrendingUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useDashboard } from '../../hooks/data/useDashboard';
import { useRestaurants } from '../../hooks/data/useRestaurants';
import { useSystemAnalytics } from '../../hooks/business/useAnalytics';

const StatsPage: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const { stats: dashboardStats, loading: dashboardLoading, error: dashboardError, refetch } = useDashboard();
  const { restaurants, loading: restaurantsLoading } = useRestaurants();
  const { platformStats, loading: analyticsLoading, refetch: refetchAnalytics } = useSystemAnalytics();

  // Utiliser les vraies données des analytics
  const stats = dashboardStats;
  const loading = dashboardLoading || restaurantsLoading || analyticsLoading;

  // Construire les données des restaurants depuis les analytics réelles
  const restaurantData = platformStats?.topRestaurants?.length > 0
    ? platformStats.topRestaurants.slice(0, 4).map((restaurant, index) => {
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
        const totalRevenue = platformStats.topRestaurants.reduce((sum, r) => sum + Number(r.totalRevenue || 0), 0);
        const percentage = totalRevenue > 0 ? ((Number(restaurant.totalRevenue || 0) / totalRevenue) * 100) : 0;

        return {
          name: restaurant.name,
          value: Math.round(percentage),
          revenue: Number(restaurant.totalRevenue || 0),
          orders: restaurant.totalOrders || 0,
          color: colors[index] || '#8B5CF6'
        };
      })
    : [
        { name: 'Pizza Palace', value: 35, revenue: 0, orders: 0, color: '#3B82F6' },
        { name: 'Sushi Express', value: 25, revenue: 0, orders: 0, color: '#10B981' },
        { name: 'Burger House', value: 20, revenue: 0, orders: 0, color: '#F59E0B' },
        { name: 'Autres', value: 20, revenue: 0, orders: 0, color: '#8B5CF6' }
      ];

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Commandes', 'Chiffre d\'affaires'],
      ...stats.weeklyData.map(item => [
        item.date,
        item.orders.toString(),
        item.revenue.toString()
      ])
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'statistiques.csv';
    link.click();
  };

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - Style Data-Driven */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard - Statistiques Avancées</h1>
            <p className="text-gray-600 mt-1">
              Analyse prédictive • Métriques temps réel • Intelligence business
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Analytics Controls */}
            <div className="hidden md:flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <Eye className="h-4 w-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <EyeOff className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as any)}
                  className="bg-transparent text-sm font-medium text-gray-700 border-none focus:outline-none"
                >
                  <option value="day">Aujourd'hui</option>
                  <option value="week">7 derniers jours</option>
                  <option value="month">30 derniers jours</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => {
                refetch();
                refetchAnalytics();
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCcw className="h-4 w-4 text-gray-600" />
              <span className="hidden sm:inline text-sm font-medium text-gray-700">Actualiser</span>
            </button>
            <Button onClick={handleExport} className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-medium">Export CSV</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Analytics Section - Métriques Avancées */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Commandes Totales</p>
                  <p className="text-3xl font-bold">
                    {platformStats?.totalOrders || (stats?.weeklyData?.reduce((acc, curr) => acc + curr.orders, 0) || 0)}
                  </p>
                  <p className="text-purple-200 text-xs mt-1">
                    {platformStats?.orderGrowth ? `+${platformStats.orderGrowth.toFixed(1)}%` : '+15%'} vs période préc.
                  </p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">CA Total</p>
                  <p className="text-3xl font-bold">
                    {platformStats?.totalRevenue ? Number(platformStats.totalRevenue).toFixed(0) + '€' :
                     (stats?.weeklyData?.reduce((acc, curr) => acc + curr.revenue, 0) || 0).toFixed(0) + '€'}
                  </p>
                  <p className="text-blue-200 text-xs mt-1">
                    {platformStats?.revenueGrowth ? `+${platformStats.revenueGrowth.toFixed(1)}%` : '+8%'} vs semaine
                  </p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Commande Moy.</p>
                  <p className="text-3xl font-bold">
                    {platformStats?.averageOrderValue ? Number(platformStats.averageOrderValue).toFixed(0) + '€' :
                     ((stats?.weeklyData?.reduce((acc, curr) => acc + curr.revenue, 0) || 0) /
                      (stats?.weeklyData?.reduce((acc, curr) => acc + curr.orders, 0) || 1)).toFixed(0) + '€'}
                  </p>
                  <p className="text-green-200 text-xs mt-1">Panier moyen</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-gray-700 to-gray-800 text-white border-0 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium">Croissance</p>
                  <p className="text-3xl font-bold">
                    {platformStats?.userGrowth ? `+${platformStats.userGrowth.toFixed(1)}%` : '+12%'}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">Taux mensuel</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Analytics Charts - Style Data-Driven */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Évolution des commandes */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Évolution des Commandes</h3>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" fontSize={12} stroke="#666" />
                  <YAxis fontSize={12} stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                  <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chiffre d'affaires */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Chiffre d'Affaires</h3>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" fontSize={12} stroke="#666" />
                  <YAxis fontSize={12} stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Répartition par restaurant */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Répartition Restaurants</h3>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={restaurantData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {restaurantData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Vue d'ensemble combinée */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Vue d'Ensemble</h3>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" fontSize={12} stroke="#666" />
                  <YAxis yAxisId="left" fontSize={12} stroke="#666" />
                  <YAxis yAxisId="right" orientation="right" fontSize={12} stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                  <Bar yAxisId="left" dataKey="orders" fill="#f97316" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;