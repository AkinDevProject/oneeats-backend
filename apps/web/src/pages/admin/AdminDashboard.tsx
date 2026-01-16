import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import {
  Store, DollarSign, ShoppingCart, Clock, Activity,
  Zap, Server, PieChart, BarChart3, Keyboard, Bell, Map,
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
  AdminNotificationCenter,
  AdminComparison,
  useComparisonMetrics,
  AdminInsights,
  useAutoInsights,
  AdminMapView,
  AdminQuickActions,
} from '../../components/admin';
import type { AdminAlert, Notification, MapRestaurant } from '../../components/admin';
import { useDashboard } from '../../hooks/data/useDashboard';
import { useRestaurants } from '../../hooks/data/useRestaurants';
import { useOrders } from '../../hooks/data/useOrders';
import { useSystemAnalytics } from '../../hooks/business/useAnalytics';
import {
  useKeyboardShortcuts,
  useShortcutsHelp,
  getAdminDashboardShortcuts,
} from '../../hooks/useKeyboardShortcuts';
import { useRealtimeUpdates, useLiveIndicator } from '../../hooks/useRealtimeUpdates';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboard();
  const { restaurants, loading: restaurantsLoading } = useRestaurants();
  const { orders, loading: ordersLoading } = useOrders();
  const { platformStats, loading: analyticsLoading, refetch: refetchAnalytics } = useSystemAnalytics();

  // UI State
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [activeView, setActiveView] = useState<'dashboard' | 'map'>('dashboard');

  // Panels state
  const [showNotifications, setShowNotifications] = useState(false);
  const { isVisible: showShortcuts, toggle: toggleShortcuts, hide: hideShortcuts } = useShortcutsHelp();

  // Realtime updates
  const { isConnected, metrics: realtimeMetrics } = useRealtimeUpdates({
    enabled: true,
    pollingInterval: 30000,
  });
  const liveIndicator = useLiveIndicator(isConnected);

  // Mock notifications for demo
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'order',
      priority: 'high',
      title: 'Nouvelle commande',
      message: 'Commande #1234 reçue de Restaurant Le Gourmet',
      timestamp: new Date(Date.now() - 5 * 60000),
      read: false,
      actionLabel: 'Voir',
    },
    {
      id: '2',
      type: 'restaurant',
      priority: 'medium',
      title: 'Restaurant hors ligne',
      message: 'Pizza Palace est passé hors ligne',
      timestamp: new Date(Date.now() - 30 * 60000),
      read: false,
    },
    {
      id: '3',
      type: 'system',
      priority: 'low',
      title: 'Mise à jour système',
      message: 'Nouvelle version disponible v2.1.0',
      timestamp: new Date(Date.now() - 2 * 3600000),
      read: true,
    },
  ]);

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
  const { inactiveRestaurants, pendingOrders, analytics, alerts, mapRestaurants } = useMemo(() => {
    const inactive = restaurants.filter((r) => !r.isOpen);
    const pending = orders.filter((o) => o.status === 'en_attente');

    // Generate alerts from real data
    const generatedAlerts: AdminAlert[] = [];

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
        responseTime: `${realtimeMetrics.averageResponseTime || 145}ms`,
        activeConnections: realtimeMetrics.activeUsers || platformStats?.totalUsers * 50 || 1247,
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
              count: Math.max(0, (platformStats.totalRestaurants || 0) - (platformStats.activeRestaurants || 0) - (platformStats.pendingRestaurants || 0)),
              color: '#ef4444',
            },
          ]
        : [],
    };

    // Map restaurants data
    const mapData: MapRestaurant[] = restaurants.slice(0, 10).map((r, i) => ({
      id: r.id,
      name: r.name,
      address: r.address || 'Paris, France',
      lat: 48.8566 + (Math.random() - 0.5) * 0.1,
      lng: 2.3522 + (Math.random() - 0.5) * 0.1,
      status: r.isOpen ? (Math.random() > 0.7 ? 'busy' : 'online') : 'offline',
      todayOrders: Math.floor(Math.random() * 20),
      todayRevenue: Math.floor(Math.random() * 500),
      avgPrepTime: Math.floor(Math.random() * 20) + 10,
      cuisineType: r.cuisineType,
    }));

    const filteredAlerts = generatedAlerts.filter((a) => !dismissedAlerts.has(a.id));

    return {
      inactiveRestaurants: inactive,
      pendingOrders: pending,
      analytics: analyticsData,
      alerts: filteredAlerts,
      mapRestaurants: mapData,
    };
  }, [restaurants, orders, platformStats, stats, dismissedAlerts, navigate, realtimeMetrics]);

  // Comparison metrics
  const comparisonMetrics = useComparisonMetrics(
    {
      revenue: stats?.todayRevenue || 0,
      orders: stats?.todayOrders || 0,
      users: platformStats?.totalUsers || 0,
      restaurants: stats?.activeRestaurants || 0,
    },
    {
      revenue: (stats?.todayRevenue || 0) * 0.85,
      orders: Math.floor((stats?.todayOrders || 0) * 0.9),
      users: Math.floor((platformStats?.totalUsers || 0) * 0.95),
      restaurants: Math.floor((stats?.activeRestaurants || 0) * 0.98),
    }
  );

  // Auto insights
  const insights = useAutoInsights({
    todayRevenue: stats?.todayRevenue || 0,
    yesterdayRevenue: (stats?.todayRevenue || 0) * 0.85,
    todayOrders: stats?.todayOrders || 0,
    yesterdayOrders: Math.floor((stats?.todayOrders || 0) * 0.9),
    activeRestaurants: stats?.activeRestaurants || 0,
    totalRestaurants: restaurants.length,
    pendingOrders: pendingOrders.length,
    averageOrderValue: platformStats?.averageOrderValue || 25,
    topRestaurant: analytics.topRestaurants[0],
  });

  // Alert handlers
  const handleDismissAlert = useCallback((alertId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]));
  }, []);

  const handleDismissAllAlerts = useCallback(() => {
    setDismissedAlerts(new Set(alerts.map((a) => a.id)));
  }, [alerts]);

  const handleAlertAction = useCallback((alert: AdminAlert) => {
    alert.onAction?.();
  }, []);

  // Notification handlers
  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleDeleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleClearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Loading state
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
          <button onClick={handleRefresh} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
            Réessayer
          </button>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <AdminPageHeader
        title="Dashboard Administration"
        subtitle={
          <span className="flex items-center gap-2">
            Vue d'ensemble et supervision
            <span className={cn('flex items-center gap-1.5 text-xs', isConnected ? 'text-green-600' : 'text-gray-400')}>
              <span className={liveIndicator.className} />
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </span>
        }
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
        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveView('dashboard')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              activeView === 'dashboard' ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <BarChart3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActiveView('map')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              activeView === 'map' ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <Map className="h-4 w-4" />
          </button>
        </div>

        {/* Notifications button */}
        <button
          onClick={() => setShowNotifications(true)}
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Keyboard shortcut hint */}
        <button
          onClick={toggleShortcuts}
          className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Raccourcis clavier (Shift + ?)"
        >
          <Keyboard className="h-4 w-4" />
        </button>
      </AdminPageHeader>

      {activeView === 'map' ? (
        /* Map View */
        <div className="p-8">
          <AdminMapView
            restaurants={mapRestaurants}
            onRestaurantClick={(r) => console.log('Restaurant clicked:', r)}
            className="h-[calc(100vh-200px)]"
          />
        </div>
      ) : (
        /* Dashboard View */
        <div className="p-8 space-y-6">
          {/* Critical Alerts Zone */}
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

          {/* Insights Section */}
          {insights.length > 0 && <AdminInsights insights={insights} maxVisible={4} onAction={(i) => console.log('Insight action:', i)} />}

          {/* Comparison Section */}
          {showAnalytics && (
            <AdminComparison
              metrics={comparisonMetrics}
              currentPeriod={{ label: 'Cette semaine', startDate: weekAgo, endDate: now }}
              previousPeriod={{ label: 'Semaine dernière', startDate: new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000), endDate: weekAgo }}
            />
          )}

          {/* Analytics Section */}
          {showAnalytics && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Performance Système</h3>
                  <Server className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="space-y-5">
                  <MetricItem label="Disponibilité" value={analytics.systemMetrics.uptime} color="indigo" progress={99.8} />
                  <MetricItem label="Temps de réponse" value={analytics.systemMetrics.responseTime} color="blue" progress={75} />
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-1">{analytics.systemMetrics.activeConnections.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Connexions actives</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Top Restaurants</h3>
                  <Zap className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="space-y-3">
                  {analytics.topRestaurants.map((restaurant, index) => (
                    <RestaurantRankItem key={restaurant.name} restaurant={restaurant} rank={index + 1} />
                  ))}
                  {analytics.topRestaurants.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Aucune donnée disponible</p>}
                </div>
              </Card>

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
                  Total: <span className="font-medium text-gray-900">{analytics.statusDistribution.reduce((sum, item) => sum + item.count, 0)} restaurants</span>
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
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
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
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="requests" stroke="#10B981" strokeWidth={2} name="Requêtes" dot={false} />
                  <Line type="monotone" dataKey="errors" stroke="#EF4444" strokeWidth={2} name="Erreurs" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* System Status */}
          <SystemStatusCard />
        </div>
      )}

      {/* Quick Actions FAB */}
      <AdminQuickActions
        onOpenNotifications={() => setShowNotifications(true)}
        onRefresh={handleRefresh}
        onExport={handleExport}
        pendingOrdersCount={pendingOrders.length}
        unreadNotificationsCount={unreadCount}
      />

      {/* Notification Center Panel */}
      <AdminNotificationCenter
        notifications={notifications}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDelete={handleDeleteNotification}
        onClearAll={handleClearAllNotifications}
      />

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

function RestaurantRankItem({ restaurant, rank }: { restaurant: { name: string; orders: number; revenue: number; status: string }; rank: number }) {
  const statusClass = restaurant.status === 'online' ? 'bg-green-100 text-green-800' : restaurant.status === 'busy' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800';
  const statusLabel = restaurant.status === 'online' ? 'En ligne' : restaurant.status === 'busy' ? 'Occupé' : 'Hors ligne';
  const rankColors = ['bg-yellow-500', 'bg-gray-400', 'bg-orange-600', 'bg-gray-300'];

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0', rankColors[rank - 1] || 'bg-gray-300')}>{rank}</div>
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
