import React, { useState, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, TrendingUp, Users, Store, ShoppingCart, DollarSign, Package, Download, RefreshCcw } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { cn } from '../../lib/utils';
import {
  AdminMetricCard,
  AdminPageHeader,
  AdminMetricCardSkeleton,
  AdminChartSkeleton,
  AdminQuickActions,
  AdminShortcutsHelp,
  AdminAlertZone,
} from '../../components/admin';
import type { QuickAction, AdminAlert } from '../../components/admin';
import { useKeyboardShortcuts, useShortcutsHelp, KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';
import { useSystemAnalytics } from '../../hooks/business/useAnalytics';

// Skeleton for status cards
function StatusCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg p-4 bg-gray-100 border border-gray-200">
      <div className="h-3 w-20 bg-gray-200 rounded mx-auto mb-2" />
      <div className="h-8 w-12 bg-gray-200 rounded mx-auto" />
    </div>
  );
}

// Skeleton for rank items
function RankItemSkeleton() {
  return (
    <div className="animate-pulse flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full" />
        <div className="space-y-1">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="space-y-1 text-right">
        <div className="h-4 w-16 bg-gray-200 rounded" />
        <div className="h-3 w-24 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

const AnalyticsSystemPage: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const { platformStats, loading, error, refetch } = useSystemAnalytics();

  // Shortcuts help modal
  const { isVisible: showShortcuts, toggle: toggleShortcuts, hide: closeShortcuts } = useShortcutsHelp();

  const handleExport = useCallback(() => {
    if (!platformStats?.dailyStats) return;
    const csv = [
      ['Date', 'Commandes', "Chiffre d'affaires"],
      ...platformStats.dailyStats.map(d => [d.date, d.orders.toString(), d.revenue.toString()])
    ].map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'analytics-system.csv';
    link.click();
  }, [platformStats]);

  // Alerts
  const alerts = useMemo<AdminAlert[]>(() => {
    const alertList: AdminAlert[] = [];
    if (platformStats?.pendingOrders && platformStats.pendingOrders > 10) {
      alertList.push({
        id: 'high-pending',
        severity: 'critical',
        title: `${platformStats.pendingOrders} commandes en attente`,
        message: 'Nombre anormalement élevé de commandes non traitées.',
      });
    }
    if (platformStats?.cancelledOrders && platformStats.cancelledOrders > 5) {
      alertList.push({
        id: 'high-cancelled',
        severity: 'warning',
        title: `Taux d'annulation élevé`,
        message: `${platformStats.cancelledOrders} commandes annulées récemment. Investiguer les causes.`,
      });
    }
    return alertList;
  }, [platformStats]);

  // Keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = useMemo(() => [
    { key: 'r', ctrl: true, description: 'Actualiser', action: refetch, category: 'Actions' },
    { key: 'e', ctrl: true, description: 'Exporter CSV', action: handleExport, category: 'Actions' },
    { key: 'd', alt: true, description: "Période: Aujourd'hui", action: () => setPeriod('day'), category: 'Période' },
    { key: 'w', alt: true, description: 'Période: 7 jours', action: () => setPeriod('week'), category: 'Période' },
    { key: 'm', alt: true, description: 'Période: 30 jours', action: () => setPeriod('month'), category: 'Période' },
    { key: '?', description: 'Aide raccourcis', action: toggleShortcuts, category: 'Navigation' },
  ], [refetch, handleExport, toggleShortcuts]);

  useKeyboardShortcuts(shortcuts, { enabled: !showShortcuts });

  // Quick actions
  const quickActions: QuickAction[] = useMemo(() => [
    {
      id: 'download-analytics',
      label: 'Télécharger rapport',
      icon: <Download className="h-5 w-5" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: handleExport,
    },
  ], [handleExport]);

  // Loading with skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminPageHeader
          title="Analytics Système"
          subtitle="Vue d'ensemble complète de la plateforme OneEats"
        />
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => <AdminMetricCardSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => <StatusCardSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AdminChartSkeleton />
            <Card className="p-6">
              <div className="h-5 w-32 bg-gray-200 rounded mb-6" />
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => <RankItemSkeleton key={i} />)}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="text-center py-16 max-w-md">
          <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Erreur: {error}</p>
          <button onClick={refetch} className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Réessayer
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminPageHeader
        title="Analytics Système"
        subtitle="Vue d'ensemble complète de la plateforme OneEats"
        onRefresh={refetch}
        onExport={handleExport}
        periodSelector={{
          value: period,
          onChange: (v) => setPeriod(v as 'day' | 'week' | 'month'),
          options: [
            { value: 'day', label: "Aujourd'hui" },
            { value: 'week', label: '7 derniers jours' },
            { value: 'month', label: '30 derniers jours' },
          ],
        }}
      />

      <div className="p-8 space-y-6">
        {/* Alerts */}
        {alerts.length > 0 && (
          <AdminAlertZone alerts={alerts} maxVisible={2} />
        )}

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <AdminMetricCard title="Total Restaurants" value={platformStats?.totalRestaurants || 0} subtitle={`${platformStats?.activeRestaurants || 0} actifs`} icon={<Store className="h-6 w-6" />} color="blue" />
          <AdminMetricCard title="Total Utilisateurs" value={platformStats?.totalUsers || 0} icon={<Users className="h-6 w-6" />} color="green" trend={{ value: platformStats?.userGrowth || 0, label: 'croissance' }} />
          <AdminMetricCard title="Total Commandes" value={platformStats?.totalOrders || 0} icon={<ShoppingCart className="h-6 w-6" />} color="violet" trend={{ value: platformStats?.orderGrowth || 0, label: 'vs semaine' }} />
          <AdminMetricCard title="Chiffre d'Affaires" value={`${platformStats?.totalRevenue?.toFixed(0) || 0}€`} icon={<DollarSign className="h-6 w-6" />} color="orange" trend={{ value: platformStats?.revenueGrowth || 0, label: 'croissance' }} />
          <AdminMetricCard title="Panier Moyen" value={`${platformStats?.averageOrderValue?.toFixed(0) || 0}€`} subtitle="Par commande" icon={<Package className="h-6 w-6" />} color="indigo" />
        </div>

        {/* Order Status */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <StatusCard label="En attente" value={platformStats?.pendingOrders || 0} color="yellow" />
          <StatusCard label="Confirmées" value={platformStats?.confirmedOrders || 0} color="blue" />
          <StatusCard label="En préparation" value={platformStats?.preparingOrders || 0} color="violet" />
          <StatusCard label="Prêtes" value={platformStats?.readyOrders || 0} color="green" />
          <StatusCard label="Terminées" value={platformStats?.completedOrders || 0} color="gray" />
          <StatusCard label="Annulées" value={platformStats?.cancelledOrders || 0} color="red" />
        </div>

        {/* Charts & Lists */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Daily Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Évolution Quotidienne</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={platformStats?.dailyStats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={12} stroke="#666" />
                <YAxis fontSize={12} stroke="#666" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} name="Commandes" />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} name="Revenus" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Top Restaurants */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Restaurants</h3>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {platformStats?.topRestaurants?.slice(0, 5).map((r, i) => (
                <RankItem key={r.id} rank={i + 1} name={r.name} subtitle={r.cuisineType} value={`${r.totalRevenue?.toFixed(0)}€`} subvalue={`${r.totalOrders} commandes`} color="blue" />
              ))}
            </div>
          </Card>

          {/* Popular Items */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Articles Populaires</h3>
              <Package className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {platformStats?.popularItems?.slice(0, 5).map((item, i) => (
                <RankItem key={item.id} rank={i + 1} name={item.name} subtitle={item.restaurantName} value={`${item.totalQuantity} vendus`} subvalue={`${item.totalRevenue?.toFixed(0)}€ total`} color="green" />
              ))}
            </div>
          </Card>

          {/* Revenue by Period */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Revenus par Période</h3>
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <PeriodRevenue label="Aujourd'hui" orders={platformStats?.todayOrders || 0} revenue={platformStats?.todayRevenue || 0} color="blue" />
              <PeriodRevenue label="Cette semaine" orders={platformStats?.weekOrders || 0} revenue={platformStats?.weekRevenue || 0} color="violet" />
              <PeriodRevenue label="Ce mois" orders={platformStats?.monthOrders || 0} revenue={platformStats?.monthRevenue || 0} color="orange" />
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions FAB */}
      <AdminQuickActions
        actions={quickActions}
        onRefresh={refetch}
        onExport={handleExport}
      />

      {/* Keyboard Shortcuts Help */}
      <AdminShortcutsHelp
        isVisible={showShortcuts}
        onClose={closeShortcuts}
        shortcuts={shortcuts}
      />
    </div>
  );
};

const tooltipStyle = { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };

const colorMap: Record<string, { bg: string; border: string; text: string; subtext: string }> = {
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', subtext: 'text-yellow-800' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', subtext: 'text-blue-800' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-900', subtext: 'text-violet-800' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', subtext: 'text-green-800' },
  gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-900', subtext: 'text-gray-800' },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', subtext: 'text-red-800' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', subtext: 'text-orange-800' },
};

function StatusCard({ label, value, color }: { label: string; value: number; color: string }) {
  const c = colorMap[color];
  return (
    <div className={cn('rounded-lg p-4 text-center border', c.bg, c.border)}>
      <p className={cn('text-sm font-medium', c.subtext)}>{label}</p>
      <p className={cn('text-2xl font-bold', c.text)}>{value}</p>
    </div>
  );
}

function RankItem({ rank, name, subtitle, value, subvalue, color }: { rank: number; name: string; subtitle?: string; value: string; subvalue: string; color: string }) {
  const c = colorMap[color];
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', c.bg)}>
          <span className={cn('text-sm font-bold', c.text)}>#{rank}</span>
        </div>
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{subvalue}</p>
      </div>
    </div>
  );
}

function PeriodRevenue({ label, orders, revenue, color }: { label: string; orders: number; revenue: number; color: string }) {
  const c = colorMap[color];
  return (
    <div className={cn('flex items-center justify-between p-4 rounded-lg', c.bg)}>
      <div>
        <p className={cn('font-medium', c.text)}>{label}</p>
        <p className={cn('text-sm', c.subtext)}>{orders} commandes</p>
      </div>
      <p className={cn('text-2xl font-bold', c.text)}>{revenue.toFixed(0)}€</p>
    </div>
  );
}

export default AnalyticsSystemPage;
