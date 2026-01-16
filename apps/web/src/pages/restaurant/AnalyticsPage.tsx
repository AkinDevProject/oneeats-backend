import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Clock,
  Users, Star, Award, Target, BarChart3, PieChart,
  Download, RefreshCw, Zap, Coffee
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = {
  primary: '#00CCBC',    // Turquoise OneEats
  secondary: '#FF6D00', // Orange OneEats
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  violet: '#8B5CF6',
};

const AnalyticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Données simulées
  const dailyStats = useMemo(() => ({
    revenue: 2450.75,
    orders: 34,
    averageOrder: 72.08,
    customers: 28,
    satisfaction: 4.8,
    completionTime: 23
  }), []);

  const weeklyData = useMemo(() => [
    { day: 'Lun', orders: 25, revenue: 1800, satisfaction: 4.2 },
    { day: 'Mar', orders: 32, revenue: 2100, satisfaction: 4.5 },
    { day: 'Mer', orders: 28, revenue: 1950, satisfaction: 4.3 },
    { day: 'Jeu', orders: 38, revenue: 2650, satisfaction: 4.4 },
    { day: 'Ven', orders: 45, revenue: 3200, satisfaction: 4.8 },
    { day: 'Sam', orders: 52, revenue: 4100, satisfaction: 4.9 },
    { day: 'Dim', orders: 34, revenue: 2450, satisfaction: 4.6 }
  ], []);

  const topDishes = useMemo(() => [
    { name: 'Pizza Margherita', orders: 45, revenue: 562.50, growth: 12 },
    { name: 'Pasta Carbonara', orders: 32, revenue: 448.00, growth: -5 },
    { name: 'Tiramisu', orders: 28, revenue: 168.00, growth: 23 },
    { name: 'Salade César', orders: 22, revenue: 264.00, growth: 8 },
    { name: 'Risotto aux champignons', orders: 18, revenue: 306.00, growth: 15 }
  ], []);

  const ordersByHour = useMemo(() => [
    { hour: '8h', orders: 2 }, { hour: '9h', orders: 5 }, { hour: '10h', orders: 8 },
    { hour: '11h', orders: 12 }, { hour: '12h', orders: 25 }, { hour: '13h', orders: 30 },
    { hour: '14h', orders: 18 }, { hour: '15h', orders: 8 }, { hour: '16h', orders: 6 },
    { hour: '17h', orders: 10 }, { hour: '18h', orders: 15 }, { hour: '19h', orders: 28 },
    { hour: '20h', orders: 35 }, { hour: '21h', orders: 22 }, { hour: '22h', orders: 12 }
  ], []);

  const orderTypes = useMemo(() => [
    { name: 'À emporter', value: 65, color: COLORS.primary },
    { name: 'Sur place', value: 35, color: COLORS.secondary }
  ], []);

  const refreshData = async () => {
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); setLastUpdated(new Date()); }, 1000);
  };

  const exportData = () => {
    const csv = [
      ['Jour', 'Commandes', 'CA', 'Satisfaction'],
      ...weeklyData.map(d => [d.day, d.orders.toString(), d.revenue.toString(), d.satisfaction.toString()])
    ].map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'analytics.csv';
    link.click();
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytiques & Performance</h1>
          <p className="text-gray-600 mt-1 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Dernière mise à jour: {format(lastUpdated, 'dd/MM/yyyy à HH:mm', { locale: fr })}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as typeof selectedPeriod)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
          <Button onClick={refreshData} disabled={isLoading} variant="primary">
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Actualiser
          </Button>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <KpiCard icon={<DollarSign className="h-8 w-8" />} value={dailyStats.revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} label="CA aujourd'hui" trend="+12%" color="primary" />
        <KpiCard icon={<ShoppingCart className="h-8 w-8" />} value={dailyStats.orders} label="Commandes" trend="+8%" color="secondary" />
        <KpiCard icon={<Target className="h-8 w-8" />} value={`${dailyStats.averageOrder.toFixed(0)} €`} label="Panier moyen" trend="+5%" color="violet" />
        <KpiCard icon={<Users className="h-8 w-8" />} value={dailyStats.customers} label="Clients uniques" trend="+15%" color="warning" />
        <KpiCard icon={<Star className="h-8 w-8" />} value={dailyStats.satisfaction} label="Satisfaction" trend="+0.2" color="success" />
        <KpiCard icon={<Zap className="h-8 w-8" />} value={`${dailyStats.completionTime} min`} label="Temps moyen" trend="-3 min" trendDown color="danger" />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="Évolution du chiffre d'affaires" icon={<BarChart3 className="h-5 w-5 text-primary-600" />} badge="+18% vs semaine dernière" badgeColor="success">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} €`, 'CA']} />
              <Area type="monotone" dataKey="revenue" stroke={COLORS.primary} strokeWidth={3} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Commandes par jour" icon={<ShoppingCart className="h-5 w-5 text-success-600" />} badge="Moyenne: 36/jour" badgeColor="info">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}`, 'Commandes']} />
              <Bar dataKey="orders" fill={COLORS.success} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="Affluence par heure" icon={<Clock className="h-5 w-5 text-violet-600" />} badge="Rush: 20h-21h" badgeColor="warning">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={ordersByHour}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}`, 'Commandes']} />
              <Line type="monotone" dataKey="orders" stroke={COLORS.violet} strokeWidth={3} dot={{ fill: COLORS.violet, strokeWidth: 2, r: 4 }} activeDot={{ r: 6, stroke: COLORS.violet, strokeWidth: 2, fill: 'white' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Types de commande" icon={<PieChart className="h-5 w-5 text-secondary-600" />}>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie data={orderTypes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={5}>
                {orderTypes.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}%`, 'Pourcentage']} contentStyle={tooltipStyle} />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top Dishes */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Award className="h-5 w-5 mr-2 text-warning-600" />
            Top 5 des plats les plus commandés
          </h3>
          <Badge variant="warning">Cette semaine</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">#</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Plat</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Commandes</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">CA</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Évolution</th>
              </tr>
            </thead>
            <tbody>
              {topDishes.map((dish, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full font-bold text-sm">
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Coffee className="h-5 w-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{dish.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                      {dish.orders}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-medium text-gray-900">{dish.revenue.toFixed(2)} €</td>
                  <td className="py-4 px-4 text-center">
                    <div className={cn('inline-flex items-center gap-1 text-sm font-medium', dish.growth > 0 ? 'text-success-600' : 'text-danger-600')}>
                      {dish.growth > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      <span>{Math.abs(dish.growth)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const tooltipStyle = { backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };

const colorClasses: Record<string, { bg: string; text: string; icon: string }> = {
  primary: { bg: 'bg-primary-50', text: 'text-primary-600', icon: 'text-primary-600' },
  secondary: { bg: 'bg-secondary-50', text: 'text-secondary-600', icon: 'text-secondary-600' },
  success: { bg: 'bg-success-50', text: 'text-success-600', icon: 'text-success-600' },
  warning: { bg: 'bg-warning-50', text: 'text-warning-600', icon: 'text-warning-600' },
  danger: { bg: 'bg-danger-50', text: 'text-danger-600', icon: 'text-danger-600' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', icon: 'text-violet-600' },
};

function KpiCard({ icon, value, label, trend, color, trendDown }: { icon: React.ReactNode; value: string | number; label: string; trend: string; color: string; trendDown?: boolean }) {
  const c = colorClasses[color];
  const TrendIcon = trendDown ? TrendingDown : TrendingUp;
  return (
    <Card className={cn('p-4 text-center hover:shadow-lg transition-all duration-300 hover:scale-105', c.bg)}>
      <div className={cn('flex items-center justify-center mb-2', c.icon)}>{icon}</div>
      <div className={cn('text-2xl font-bold', c.text)}>{value}</div>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
      <div className={cn('flex items-center justify-center mt-1 text-xs', trendDown ? 'text-success-600' : c.text)}>
        <TrendIcon className="h-3 w-3 mr-1" />
        <span>{trend}</span>
      </div>
    </Card>
  );
}

function ChartCard({ title, icon, badge, badgeColor, children }: { title: string; icon: React.ReactNode; badge?: string; badgeColor?: 'success' | 'info' | 'warning'; children: React.ReactNode }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">{icon}<span className="ml-2">{title}</span></h3>
        {badge && <Badge variant={badgeColor || 'default'}>{badge}</Badge>}
      </div>
      {children}
    </Card>
  );
}

export default AnalyticsPage;
