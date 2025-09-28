import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, BarChart3, RefreshCcw, TrendingUp, Users, Store, ShoppingCart, DollarSign, Package } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useSystemAnalytics } from '../../hooks/business/useAnalytics';

const AnalyticsSystemPage: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const { platformStats, trendsStats, loading, error, refetch } = useSystemAnalytics();

  const handleExport = () => {
    if (!platformStats?.dailyStats) return;

    const csvContent = [
      ['Date', 'Commandes', 'Chiffre d\'affaires'],
      ...platformStats.dailyStats.map(item => [
        item.date,
        item.orders.toString(),
        item.revenue.toString()
      ])
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'analytics-system.csv';
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des analytics système...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur lors du chargement: {error}</p>
          <Button onClick={refetch} className="bg-blue-600 hover:bg-blue-700 text-white">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Système</h1>
            <p className="text-gray-600 mt-1">
              Vue d'ensemble complète de la plateforme OneEats
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
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
            <Button onClick={refetch} variant="outline" className="flex items-center space-x-2">
              <RefreshCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Actualiser</span>
            </Button>
            <Button onClick={handleExport} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Restaurants</p>
                  <p className="text-3xl font-bold">{platformStats?.totalRestaurants || 0}</p>
                  <p className="text-blue-200 text-xs mt-1">{platformStats?.activeRestaurants || 0} actifs</p>
                </div>
                <Store className="h-8 w-8 text-blue-200" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Utilisateurs</p>
                  <p className="text-3xl font-bold">{platformStats?.totalUsers || 0}</p>
                  <p className="text-green-200 text-xs mt-1">+{platformStats?.userGrowth || 0}% croissance</p>
                </div>
                <Users className="h-8 w-8 text-green-200" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Commandes</p>
                  <p className="text-3xl font-bold">{platformStats?.totalOrders || 0}</p>
                  <p className="text-purple-200 text-xs mt-1">+{platformStats?.orderGrowth || 0}% vs semaine</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-purple-200" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Chiffre d'Affaires</p>
                  <p className="text-3xl font-bold">{platformStats?.totalRevenue?.toFixed(0) || 0}€</p>
                  <p className="text-orange-200 text-xs mt-1">+{platformStats?.revenueGrowth || 0}% croissance</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-200" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">Panier Moyen</p>
                  <p className="text-3xl font-bold">{platformStats?.averageOrderValue?.toFixed(0) || 0}€</p>
                  <p className="text-indigo-200 text-xs mt-1">Par commande</p>
                </div>
                <Package className="h-8 w-8 text-indigo-200" />
              </div>
            </div>
          </Card>
        </div>

        {/* Statuts des commandes */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800 text-sm font-medium">En attente</p>
            <p className="text-2xl font-bold text-yellow-900">{platformStats?.pendingOrders || 0}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-blue-800 text-sm font-medium">Confirmées</p>
            <p className="text-2xl font-bold text-blue-900">{platformStats?.confirmedOrders || 0}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <p className="text-purple-800 text-sm font-medium">En préparation</p>
            <p className="text-2xl font-bold text-purple-900">{platformStats?.preparingOrders || 0}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-800 text-sm font-medium">Prêtes</p>
            <p className="text-2xl font-bold text-green-900">{platformStats?.readyOrders || 0}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-800 text-sm font-medium">Terminées</p>
            <p className="text-2xl font-bold text-gray-900">{platformStats?.completedOrders || 0}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800 text-sm font-medium">Annulées</p>
            <p className="text-2xl font-bold text-red-900">{platformStats?.cancelledOrders || 0}</p>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Évolution quotidienne */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Évolution Quotidienne</h3>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={platformStats?.dailyStats || []}>
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
                    dataKey="orders"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    name="Commandes"
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    name="Revenus"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Top Restaurants */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Top Restaurants</h3>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {platformStats?.topRestaurants?.slice(0, 5).map((restaurant, index) => (
                  <div key={restaurant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{restaurant.name}</p>
                        <p className="text-sm text-gray-500">{restaurant.cuisineType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{restaurant.totalRevenue?.toFixed(0)}€</p>
                      <p className="text-sm text-gray-500">{restaurant.totalOrders} commandes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Articles populaires */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Articles Populaires</h3>
                <Package className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {platformStats?.popularItems?.slice(0, 5).map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.restaurantName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{item.totalQuantity} vendus</p>
                      <p className="text-sm text-gray-500">{item.totalRevenue?.toFixed(0)}€ total</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Revenus par période */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Revenus par Période</h3>
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-900">Aujourd'hui</p>
                    <p className="text-sm text-blue-600">{platformStats?.todayOrders || 0} commandes</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{platformStats?.todayRevenue?.toFixed(0) || 0}€</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div>
                    <p className="font-medium text-purple-900">Cette semaine</p>
                    <p className="text-sm text-purple-600">{platformStats?.weekOrders || 0} commandes</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{platformStats?.weekRevenue?.toFixed(0) || 0}€</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-orange-900">Ce mois</p>
                    <p className="text-sm text-orange-600">{platformStats?.monthOrders || 0} commandes</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">{platformStats?.monthRevenue?.toFixed(0) || 0}€</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSystemPage;