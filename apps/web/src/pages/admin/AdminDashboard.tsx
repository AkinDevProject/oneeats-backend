import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import {
  Store, DollarSign, ShoppingCart, Clock, Activity,
  Zap, Server, PieChart, BarChart3, Keyboard
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { cn } from '../../lib/utils';
import {
  AdminMetricCard,
  AdminPageHeader,
  SystemStatusCard,
  AdminAlertZone,
  AdminDashboardSkeleton,
  AdminShortcutsHelp,
} from '../../components/admin';
import type { AdminAlert } from '../../components/admin';
import { useDashboard } from '../../hooks/data/useDashboard';
import { useRestaurants } from '../../hooks/data/useRestaurants';
import { useOrders } from '../../hooks/data/useOrders';
import { useSystemAnalytics } from '../../hooks/business/useAnalytics';
import {
  useKeyboardShortcuts,
  useShortcutsHelp,
  getAdminDashboardShortcuts,
} from '../../hooks/useKeyboardShortcuts';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboard();
  const { restaurants, loading: restaurantsLoading } = useRestaurants();
  const { orders, loading: ordersLoading } = useOrders();
  const { platformStats, loading: analyticsLoading, refetch: refetchAnalytics } = useSystemAnalytics();

  const [showAnalytics, setShowAnalytics] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const { isVisible: showShortcuts, toggle: toggleShortcuts, hide: hideShortcuts } = useShortcutsHelp();

  const loading = statsLoading || restaurantsLoading || ordersLoading || analyticsLoading;

  // Handlers
  const handleRefresh = useCallback(() => {
    refetchStats();
    refetchAnalytics();
  }, [refetchStats, refetchAnalytics]);

  const handleExport = useCallback(() => {
    if (!stats?.weeklyData) return;
    const csv = [
      ['Date', 'Commandes', "Chiffre d'affaires"],
      ...stats.weeklyData.map((d) => [d.date, d.orders.toString(), d.revenue.toString()]),
    ]
      .map((r) => r.join(';'))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'dashboard-admin.csv';
    link.click();
  }, [stats]);

  // Keyboard shortcuts
  const shortcuts = useMemo(
    () =>
      getAdminDashboardShortcuts({
        onRefresh: handleRefresh,
        onExport: handleExport,
        onToggleAnalytics: () => setShowAnalytics((v) => !v),
        onNavigateOrders: () => navigate('/admin/orders'),
        onNavigateRestaurants: () => navigate('/admin/restaurants'),
        onNavigateUsers: () => navigate('/admin/users'),
        onNavigateStats: () => navigate('/admin/stats'),
        onShowHelp: toggleShortcuts,
      }),
    [handleRefresh, handleExport, navigate, toggleShortcuts]
  );

  useKeyboardShortcuts(shortcuts);

  // Computed data
  const { inactiveRestaurants, pendingOrders, analytics, alerts } = useMemo(() => {
    const inactive = restaurants.filter((r) => !r.isOpen);
    const pending = orders.filter((o) => o.status === 'en_attente');

    // Generate alerts from real data
    const generatedAlerts: AdminAlert[] = [];

    // Critical: Pending orders
    if (pending.length > 0) {
      generatedAlerts.push({
        id: 'pending-orders',
        type: 'order',
        severity: pending.length > 5 ? 'critical' : 'warning',
        title: `${pending.length} commande${pending.length > 1 ? 's' : ''} en attente`,
        message: `Des commandes nécessitent une action immédiate`,
        timestamp: new Date(),
        actionLabel: 'Voir les commandes',
        onAction: () => navigate('/admin/orders'),
      });
    }

    // Warning: Inactive restaurants during business hours
    const hour = new Date().getHours();
    if (inactive.length > 0 && hour >= 11 && hour <= 22) {
      generatedAlerts.push({
        id: 'inactive-restaurants',
        type: 'restaurant',
        severity: inactive.length > 3 ? 'critical' : 'warning',
        title: `${inactive.length} restaurant${inactive.length > 1 ? 's' : ''} hors ligne`,
        message: `Restaurants fermés pendant les heures de service`,
        timestamp: new Date(),
        actionLabel: 'Contacter',
        onAction: () => navigate('/admin/restaurants'),
      });
    }

    // Info: High order volume
    if (stats && stats.todayOrders > 50) {
      generatedAlerts.push({
        id: 'high-volume',
        type: 'system',
        severity: 'info',
        title: 'Volume élevé de commandes',
        message: `${stats.todayOrders} commandes aujourd'hui - surveillez les performances`,
        timestamp: new Date(),
        actionLabel: 'Voir stats',
        onAction: () => navigate('/admin/stats'),
      });
    }

    const analyticsData = {
      systemMetrics: {
        uptime: '99.8%',
        responseTime: '145ms',
        activeConnections: platformStats ? platformStats.totalUsers * 50 : 1247,
      },
      performanceData:
        stats?.weeklyData?.map((day, index) => ({
          time: `${index * 4}:00`,
          requests: day.orders * 10 + Math.floor(Math.random() * 50),
          errors: Math.max(0, Math.floor(day.orders / 10)),
        })) || [],
      topRestaurants:
        platformStats?.topRestaurants?.slice(0, 4)?.map((r) => ({
          name: r.name,
          orders: r.totalOrders || 0,
          revenue: Number(r.totalRevenue || 0),
          status: r.totalOrders > 2 ? 'online' : r.totalOrders > 0 ? 'busy' : 'offline',
        })) || [],
      statusDistribution: platformStats
        ? [
            { status: 'En ligne', count: platformStats.activeRestaurants || 0, color: '#10b981' },
            { status: 'En attente', count: platformStats.pendingRestaurants || 0, color: '#f59e0b' },
            {
              status: 'Hors ligne',
              count: Math.max(
                0,
                (platformStats.totalRestaurants || 0) -
                  (platformStats.activeRestaurants || 0) -
                  (platformStats.pendingRestaurants || 0)
              ),
              color: '#ef4444',
            },
          ]
        : [],
    };

    // Filter out dismissed alerts
    const filteredAlerts = generatedAlerts.filter((a) => !dismissedAlerts.has(a.id));

    return {
      inactiveRestaurants: inactive,
      pendingOrders: pending,
      analytics: analyticsData,
      alerts: filteredAlerts,
    };
  }, [restaurants, orders, platformStats, stats, dismissedAlerts, navigate]);

  const handleDismissAlert = useCallback((alertId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]));
  }, []);

  const handleDismissAllAlerts = useCallback(() => {
    setDismissedAlerts(new Set(alerts.map((a) => a.id)));
  }, [alerts]);

  const handleAlertAction = useCallback((alert: AdminAlert) => {
    alert.onAction?.();
  }, []);

  // Loading state with skeleton
  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  // Error state
  if (statsError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="p-8 text-center border-red-200 bg-red-50">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Server className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-red-900 mb-2">Erreur de chargement</h3>
          <p className="text-red-700 mb-4">{statsError}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <AdminPageHeader
        title="Dashboard Administration"
        subtitle="Vue d'ensemble et supervision de la plateforme"
        onRefresh={handleRefresh}
        onExport={handleExport}
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
      >
        {/* Keyboard shortcut hint */}
        <button
          onClick={toggleShortcuts}
          className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Raccourcis clavier (Shift + ?)"
        >
          <Keyboard className="h-4 w-4" />
          <span className="text-xs">Shift + ?</span>
        </button>
      </AdminPageHeader>

      <div className="p-8 space-y-6">
        {/* Critical Alerts Zone - TOP PRIORITY */}
        <AdminAlertZone
          alerts={alerts}
          onDismiss={handleDismissAlert}
          onDismissAll={handleDismissAllAlerts}
          onAction={handleAlertAction}
          maxVisible={3}
        />

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
            title="Temps moyen"
            value="18 min"
            subtitle="Préparation"
            icon={<Clock className="h-6 w-6" />}
            color="orange"
          />
        </div>

        {/* Analytics Section */}
        {showAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Performance */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Performance Système</h3>
                <Server className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="space-y-5">
                <MetricItem label="Disponibilité" value={analytics.systemMetrics.uptime} color="indigo" progress={99.8} />
                <MetricItem label="Temps de réponse" value={analytics.systemMetrics.responseTime} color="blue" progress={75} />
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {analytics.systemMetrics.activeConnections.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Connexions actives</div>
                </div>
              </div>
            </Card>

            {/* Top Restaurants */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Top Restaurants</h3>
                <Zap className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="space-y-3">
                {analytics.topRestaurants.map((restaurant, index) => (
                  <RestaurantRankItem key={restaurant.name} restaurant={restaurant} rank={index + 1} />
                ))}
                {analytics.topRestaurants.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Aucune donnée disponible</p>
                )}
              </div>
            </Card>

            {/* Status Distribution */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">État des Restaurants</h3>
                <PieChart className="h-5 w-5 text-violet-500" />
              </div>
              <div className="space-y-4">
                {analytics.statusDistribution.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium text-gray-900">{item.status}</span>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: item.color }}>
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-600">
                Total:{' '}
                <span className="font-medium text-gray-900">
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
              <h3 className="text-lg font-bold text-gray-900">Commandes - 7 derniers jours</h3>
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={12} stroke="#666" />
                <YAxis fontSize={12} stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Commandes" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Performance Système - 24h</h3>
              <Activity className="h-5 w-5 text-green-500" />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={analytics.performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" fontSize={12} stroke="#666" />
                <YAxis fontSize={12} stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Line type="monotone" dataKey="requests" stroke="#10B981" strokeWidth={2} name="Requêtes" dot={false} />
                <Line type="monotone" dataKey="errors" stroke="#EF4444" strokeWidth={2} name="Erreurs" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* System Status */}
        <SystemStatusCard />
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      <AdminShortcutsHelp shortcuts={shortcuts} isVisible={showShortcuts} onClose={hideShortcuts} />
    </div>
  );
};

// Sub-components
function MetricItem({ label, value, color, progress }: { label: string; value: string; color: string; progress: number }) {
  const colorClasses: Record<string, { text: string; bg: string }> = {
    indigo: { text: 'text-indigo-600', bg: 'bg-indigo-500' },
    blue: { text: 'text-blue-600', bg: 'bg-blue-500' },
    green: { text: 'text-green-600', bg: 'bg-green-500' },
  };
  const c = colorClasses[color] || colorClasses.blue;

  return (
    <div>
      <div className={cn('text-2xl font-bold mb-1', c.text)}>{value}</div>
      <div className="text-sm text-gray-600 mb-2">{label}</div>
      <div className="bg-gray-200 rounded-full h-2">
        <div className={cn('h-2 rounded-full transition-all', c.bg)} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function RestaurantRankItem({
  restaurant,
  rank,
}: {
  restaurant: { name: string; orders: number; revenue: number; status: string };
  rank: number;
}) {
  const statusClass =
    restaurant.status === 'online'
      ? 'bg-green-100 text-green-800'
      : restaurant.status === 'busy'
      ? 'bg-orange-100 text-orange-800'
      : 'bg-red-100 text-red-800';
  const statusLabel = restaurant.status === 'online' ? 'En ligne' : restaurant.status === 'busy' ? 'Occupé' : 'Hors ligne';
  const rankColors = ['bg-yellow-500', 'bg-gray-400', 'bg-orange-600', 'bg-gray-300'];

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
      <div
        className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0',
          rankColors[rank - 1] || 'bg-gray-300'
        )}
      >
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate text-sm">{restaurant.name}</div>
        <div className="text-xs text-gray-500">{restaurant.orders} cmd</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="font-semibold text-gray-900 text-sm">{restaurant.revenue}€</div>
        <div className={cn('text-xs px-1.5 py-0.5 rounded-full inline-block', statusClass)}>{statusLabel}</div>
      </div>
    </div>
  );
}

export default AdminDashboard;
