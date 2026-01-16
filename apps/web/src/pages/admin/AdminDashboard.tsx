import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import {
  Store, DollarSign, ShoppingCart, AlertCircle, Clock, Activity,
  Zap, CheckCircle2, Server, PieChart, BarChart3
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { AdminMetricCard, AdminPageHeader, SystemStatusCard } from '../../components/admin';
import { useDashboard } from '../../hooks/data/useDashboard';
import { useRestaurants } from '../../hooks/data/useRestaurants';
import { useOrders } from '../../hooks/data/useOrders';
import { useSystemAnalytics } from '../../hooks/business/useAnalytics';

const AdminDashboard: React.FC = () => {
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboard();
  const { restaurants, loading: restaurantsLoading } = useRestaurants();
  const { orders, loading: ordersLoading } = useOrders();
  const { platformStats, loading: analyticsLoading, refetch: refetchAnalytics } = useSystemAnalytics();

  const [showAnalytics, setShowAnalytics] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  const loading = statsLoading || restaurantsLoading || ordersLoading || analyticsLoading;

  // Données calculées
  const { inactiveRestaurants, pendingOrders, analytics } = useMemo(() => {
    const inactive = restaurants.filter(r => !r.isOpen);
    const pending = orders.filter(o => o.status === 'en_attente');

    const analyticsData = {
      systemMetrics: {
        uptime: '99.8%',
        responseTime: '145ms',
        activeConnections: platformStats ? (platformStats.totalUsers * 50) : 1247,
      },
      performanceData: stats?.weeklyData?.map((day, index) => ({
        time: `${index * 4}:00`,
        requests: day.orders * 10 + Math.floor(Math.random() * 50),
        errors: Math.max(0, Math.floor(day.orders / 10))
      })) || [],
      topRestaurants: platformStats?.topRestaurants?.slice(0, 4)?.map(r => ({
        name: r.name,
        orders: r.totalOrders || 0,
        revenue: Number(r.totalRevenue || 0),
        status: r.totalOrders > 2 ? 'online' : r.totalOrders > 0 ? 'busy' : 'offline'
      })) || [],
      statusDistribution: platformStats ? [
        { status: 'En ligne', count: platformStats.activeRestaurants || 0, color: '#10b981' },
        { status: 'En attente', count: platformStats.pendingRestaurants || 0, color: '#f59e0b' },
        { status: 'Hors ligne', count: Math.max(0, (platformStats.totalRestaurants || 0) - (platformStats.activeRestaurants || 0) - (platformStats.pendingRestaurants || 0)), color: '#ef4444' }
      ] : []
    };

    return { inactiveRestaurants: inactive, pendingOrders: pending, analytics: analyticsData };
  }, [restaurants, orders, platformStats, stats]);

  const handleRefresh = () => {
    refetchStats();
    refetchAnalytics();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mb-4" />
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (statsError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="p-8 text-center border-danger-200 bg-danger-50">
          <AlertCircle className="h-16 w-16 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-danger-900 mb-2">Erreur de chargement</h3>
          <p className="text-danger-700">{statsError}</p>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <AdminPageHeader
        title="Analytics Dashboard - Administration"
        subtitle="Supervision système et métriques de performance"
        onRefresh={handleRefresh}
        showAnalyticsToggle
        analyticsVisible={showAnalytics}
        onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
        periodSelector={{
          value: timeRange,
          onChange: (v) => setTimeRange(v as 'today' | 'week' | 'month'),
          options: [
            { value: 'today', label: "Aujourd'hui" },
            { value: 'week', label: 'Cette semaine' },
            { value: 'month', label: 'Ce mois' },
          ],
        }}
      />

      <div className="p-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminMetricCard
            title="Chiffre d'affaires"
            value={`${stats.todayRevenue.toLocaleString('fr-FR')}€`}
            icon={<DollarSign className="h-6 w-6" />}
            color="violet"
            trend={{ value: platformStats?.revenueGrowth || 18.5, label: 'vs hier' }}
          />
          <AdminMetricCard
            title="Commandes"
            value={stats.todayOrders}
            icon={<ShoppingCart className="h-6 w-6" />}
            color="blue"
            trend={{ value: platformStats?.orderGrowth || 12, label: 'vs hier' }}
          />
          <AdminMetricCard
            title="Restaurants actifs"
            value={stats.activeRestaurants}
            subtitle={`${restaurants.length - inactiveRestaurants.length} en ligne`}
            icon={<Store className="h-6 w-6" />}
            color="green"
          />
          <AdminMetricCard
            title="Alertes système"
            value={pendingOrders.length}
            subtitle={pendingOrders.length > 0 ? 'Action requise' : 'Tout opérationnel'}
            icon={<AlertCircle className="h-6 w-6" />}
            color={pendingOrders.length > 0 ? 'orange' : 'gray'}
            alert={pendingOrders.length > 0}
          />
        </div>

        {/* Analytics Section */}
        {showAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Performance */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Performance Système</h3>
                <Server className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="space-y-6">
                <MetricItem
                  label="Disponibilité"
                  value={analytics.systemMetrics.uptime}
                  color="indigo"
                  progress={99.8}
                />
                <MetricItem
                  label="Temps de réponse"
                  value={analytics.systemMetrics.responseTime}
                  color="blue"
                  progress={75}
                />
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {analytics.systemMetrics.activeConnections.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Connexions actives</div>
                </div>
              </div>
            </Card>

            {/* Top Restaurants */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Top Restaurants</h3>
                <Zap className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="space-y-4">
                {analytics.topRestaurants.map((restaurant, index) => (
                  <RestaurantRankItem key={restaurant.name} restaurant={restaurant} rank={index + 1} />
                ))}
              </div>
            </Card>

            {/* Status Distribution */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">État des Restaurants</h3>
                <PieChart className="h-5 w-5 text-violet-500" />
              </div>
              <div className="space-y-4">
                {analytics.statusDistribution.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium text-gray-900">{item.status}</span>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: item.color }}>{item.count}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-600">
                Total: <span className="font-medium text-gray-900">
                  {analytics.statusDistribution.reduce((sum, item) => sum + item.count, 0)} restaurants
                </span>
              </div>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Commandes - 7 derniers jours</h3>
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Performance Système - 24h</h3>
              <Activity className="h-5 w-5 text-green-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="requests" stroke="#10B981" strokeWidth={2} name="Requêtes" />
                <Line type="monotone" dataKey="errors" stroke="#EF4444" strokeWidth={2} name="Erreurs" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* System Status */}
        <SystemStatusCard />

        {/* Alerts */}
        {(inactiveRestaurants.length > 0 || pendingOrders.length > 0) && (
          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Alertes & Actions Requises</h3>
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="space-y-3">
              {inactiveRestaurants.length > 0 && (
                <AlertItem
                  icon={<Store className="h-5 w-5 text-yellow-600" />}
                  message={`${inactiveRestaurants.length} restaurant${inactiveRestaurants.length > 1 ? 's' : ''} fermé${inactiveRestaurants.length > 1 ? 's' : ''}`}
                  actionLabel="Contacter"
                  borderColor="border-yellow-200"
                />
              )}
              {pendingOrders.length > 0 && (
                <AlertItem
                  icon={<ShoppingCart className="h-5 w-5 text-blue-600" />}
                  message={`${pendingOrders.length} commande${pendingOrders.length > 1 ? 's' : ''} en attente`}
                  actionLabel="Voir détails"
                  borderColor="border-blue-200"
                />
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

// Sub-components
function MetricItem({ label, value, color, progress }: { label: string; value: string; color: string; progress: number }) {
  return (
    <div>
      <div className={cn('text-3xl font-bold mb-2', `text-${color}-600`)}>{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="mt-2 bg-gray-200 rounded-full h-2">
        <div className={cn('h-2 rounded-full', `bg-${color}-500`)} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function RestaurantRankItem({ restaurant, rank }: { restaurant: { name: string; orders: number; revenue: number; status: string }; rank: number }) {
  const statusClass = restaurant.status === 'online' ? 'bg-green-100 text-green-800' :
                      restaurant.status === 'busy' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800';
  const statusLabel = restaurant.status === 'online' ? 'En ligne' :
                      restaurant.status === 'busy' ? 'Occupé' : 'Hors ligne';
  const rankColors = ['bg-yellow-500', 'bg-gray-400', 'bg-orange-600', 'bg-gray-300'];

  return (
    <div className="flex items-center gap-4">
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white', rankColors[rank - 1] || 'bg-gray-300')}>
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{restaurant.name}</div>
        <div className="text-sm text-gray-600">{restaurant.orders} commandes</div>
      </div>
      <div className="text-right">
        <div className="font-bold text-gray-900">€{restaurant.revenue}</div>
        <div className={cn('text-xs px-2 py-1 rounded-full', statusClass)}>{statusLabel}</div>
      </div>
    </div>
  );
}

function AlertItem({ icon, message, actionLabel, borderColor }: { icon: React.ReactNode; message: string; actionLabel: string; borderColor: string }) {
  return (
    <div className={cn('flex items-center justify-between p-4 bg-white rounded-lg border', borderColor)}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-gray-900">{message}</span>
      </div>
      <Button variant="outline" size="sm">{actionLabel}</Button>
    </div>
  );
}

export default AdminDashboard;
