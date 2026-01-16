import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, BarChart3, TrendingUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { cn } from '../../lib/utils';
import { AdminMetricCard, AdminPageHeader } from '../../components/admin';
import { useDashboard } from '../../hooks/data/useDashboard';
import { useSystemAnalytics } from '../../hooks/business/useAnalytics';

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

const StatsPage: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const { stats, loading: dashboardLoading, refetch } = useDashboard();
  const { platformStats, loading: analyticsLoading, refetch: refetchAnalytics } = useSystemAnalytics();

  const loading = dashboardLoading || analyticsLoading;

  // Restaurant data for pie chart
  const restaurantData = useMemo(() => {
    if (!platformStats?.topRestaurants?.length) {
      return [
        { name: 'Pizza Palace', value: 35, color: CHART_COLORS[0] },
        { name: 'Sushi Express', value: 25, color: CHART_COLORS[1] },
        { name: 'Burger House', value: 20, color: CHART_COLORS[2] },
        { name: 'Autres', value: 20, color: CHART_COLORS[3] }
      ];
    }
    const total = platformStats.topRestaurants.reduce((sum, r) => sum + Number(r.totalRevenue || 0), 0);
    return platformStats.topRestaurants.slice(0, 4).map((r, i) => ({
      name: r.name,
      value: total > 0 ? Math.round((Number(r.totalRevenue || 0) / total) * 100) : 0,
      color: CHART_COLORS[i]
    }));
  }, [platformStats]);

  const handleExport = () => {
    if (!stats?.weeklyData) return;
    const csv = [
      ['Date', 'Commandes', "Chiffre d'affaires"],
      ...stats.weeklyData.map(d => [d.date, d.orders.toString(), d.revenue.toString()])
    ].map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'statistiques.csv';
    link.click();
  };

  const handleRefresh = () => { refetch(); refetchAnalytics(); };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  const totalOrders = platformStats?.totalOrders || stats?.weeklyData?.reduce((a, c) => a + c.orders, 0) || 0;
  const totalRevenue = platformStats?.totalRevenue || stats?.weeklyData?.reduce((a, c) => a + c.revenue, 0) || 0;
  const avgOrder = platformStats?.averageOrderValue || (totalOrders > 0 ? totalRevenue / totalOrders : 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminPageHeader
        title="Analytics Dashboard - Statistiques Avancées"
        subtitle="Analyse prédictive • Métriques temps réel • Intelligence business"
        onRefresh={handleRefresh}
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
        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <AdminMetricCard
            title="Commandes Totales"
            value={totalOrders}
            icon={<BarChart3 className="h-6 w-6" />}
            color="violet"
            trend={{ value: platformStats?.orderGrowth || 15, label: 'vs période préc.' }}
          />
          <AdminMetricCard
            title="CA Total"
            value={`${Number(totalRevenue).toFixed(0)}€`}
            icon={<TrendingUp className="h-6 w-6" />}
            color="blue"
            trend={{ value: platformStats?.revenueGrowth || 8, label: 'vs semaine' }}
          />
          <AdminMetricCard
            title="Commande Moy."
            value={`${Number(avgOrder).toFixed(0)}€`}
            subtitle="Panier moyen"
            icon={<BarChart3 className="h-6 w-6" />}
            color="green"
          />
          <AdminMetricCard
            title="Croissance"
            value={`+${platformStats?.userGrowth?.toFixed(1) || 12}%`}
            subtitle="Taux mensuel"
            icon={<TrendingUp className="h-6 w-6" />}
            color="gray"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ChartCard title="Évolution des Commandes" icon={<BarChart3 className="h-4 w-4 text-violet-600" />} iconBg="bg-violet-100">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.weeklyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={12} stroke="#666" />
                <YAxis fontSize={12} stroke="#666" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Chiffre d'Affaires" icon={<TrendingUp className="h-4 w-4 text-blue-600" />} iconBg="bg-blue-100">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.weeklyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={12} stroke="#666" />
                <YAxis fontSize={12} stroke="#666" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }} activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Répartition Restaurants" icon={<BarChart3 className="h-4 w-4 text-green-600" />} iconBg="bg-green-100">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={restaurantData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={100} dataKey="value">
                  {restaurantData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Vue d'Ensemble" icon={<BarChart3 className="h-4 w-4 text-orange-600" />} iconBg="bg-orange-100">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.weeklyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={12} stroke="#666" />
                <YAxis yAxisId="left" fontSize={12} stroke="#666" />
                <YAxis yAxisId="right" orientation="right" fontSize={12} stroke="#666" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar yAxisId="left" dataKey="orders" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

const tooltipStyle = { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };

function ChartCard({ title, icon, iconBg, children }: { title: string; icon: React.ReactNode; iconBg: string; children: React.ReactNode }) {
  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconBg)}>{icon}</div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
        {children}
      </div>
    </Card>
  );
}

export default StatsPage;
