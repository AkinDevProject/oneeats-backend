import React, { useState } from 'react';
import { 
  BarChart3, Activity, ArrowRight, AlertTriangle,
  ShoppingCart, Users, Target
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// Composants réutilisables
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import QuickMetrics from '../../components/dashboard/QuickMetrics';
import StatusDistribution from '../../components/dashboard/StatusDistribution';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

// Hooks et utilitaires
import { useAnalytics, useQuickMetrics } from '../../hooks/business/useAnalytics';
import { mockOrders } from '../../data/mockData';

/**
 * Dashboard principal du restaurant
 * Affiche les métriques de performance, analytics et actions rapides
 * Utilise des composants réutilisables pour maintenir la cohérence
 */

const RestaurantDashboard: React.FC = () => {
  // État local du dashboard
  const [orders] = useState(mockOrders);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [showAnalytics, setShowAnalytics] = useState(true);

  // Hooks personnalisés pour les données
  const analytics = useAnalytics({
    type: 'restaurant',
    timeRange,
    orders
  });
  
  const quickMetrics = useQuickMetrics(orders);

  // Gestionnaires d'événements
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range as 'today' | 'week' | 'month');
  };

  const handleRefresh = () => {
    // Logique de rafraîchissement des données
    console.log('Actualisation des données...');
  };

  const handleExport = () => {
    // Logique d'export des analytics
    console.log('Export des analytics...');
  };

  // Calcul des commandes urgentes (> 15 minutes)
  const urgentOrders = orders.filter(order => {
    if (order.status !== 'pending' && order.status !== 'accepted') return false;
    const orderTime = new Date(order.createdAt);
    const minutesAgo = (new Date().getTime() - orderTime.getTime()) / (1000 * 60);
    return minutesAgo > 15;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* En-tête responsive avec contrôles */}
      <DashboardHeader
        title="Analytics Dashboard - Vue d'ensemble"
        subtitle="Métriques business et performance en temps réel"
        showAnalytics={showAnalytics}
        onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      {/* Contenu principal avec padding responsive */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        
        {/* Métriques rapides */}
        <div className="mb-6 lg:mb-8">
          <QuickMetrics
            totalRevenue={quickMetrics.totalRevenue}
            revenueChange={analytics.comparisonData?.revenueGrowth || "+15.3%"}
            totalOrders={quickMetrics.totalOrders}
            ordersChange={analytics.comparisonData?.ordersGrowth || "+8.7%"}
            avgOrderValue={quickMetrics.avgOrderValue}
            avgOrderChange="+3.2%"
            pendingOrdersCount={quickMetrics.pendingOrdersCount}
          />
        </div>

        {/* Alert pour actions urgentes */}
        {urgentOrders.length > 0 && (
          <UrgentOrdersAlert 
            urgentCount={urgentOrders.length}
            onManageOrders={() => console.log('Navigation vers gestion commandes')}
          />
        )}

        {/* Section Analytics - Affiché conditionnellement */}
        {showAnalytics && (
          <AnalyticsSection analytics={analytics} />
        )}

        {/* Graphiques */}
        <ChartsSection analytics={analytics} />

        {/* Actions rapides */}
        <QuickActionsSection />
      </div>
    </div>
  );
};

/**
 * Composant d'alerte pour les commandes urgentes
 */
interface UrgentOrdersAlertProps {
  urgentCount: number;
  onManageOrders: () => void;
}

const UrgentOrdersAlert: React.FC<UrgentOrdersAlertProps> = ({ 
  urgentCount, 
  onManageOrders 
}) => (
  <Card className="p-4 lg:p-6 bg-red-50 border-red-200 mb-6 lg:mb-8">
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="flex items-start sm:items-center space-x-3">
        <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 flex-shrink-0 mt-0.5 sm:mt-0" />
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-red-900">
            Action urgente requise
          </h3>
          <p className="text-sm sm:text-base text-red-700">
            {urgentCount} commande{urgentCount > 1 ? 's' : ''} en attente depuis plus de 15 minutes
          </p>
        </div>
      </div>
      <Button
        variant="primary"
        className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
        icon={<ArrowRight className="h-4 w-4" />}
        onClick={onManageOrders}
      >
        <span className="sm:hidden">Gérer</span>
        <span className="hidden sm:inline">Gérer les commandes</span>
      </Button>
    </div>
  </Card>
);

/**
 * Section des analytics avec KPIs et distribution
 */
interface AnalyticsSectionProps {
  analytics: ReturnType<typeof useAnalytics>;
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ analytics }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
    
    {/* Distribution des statuts */}
    <StatusDistribution
      title="Distribution des statuts"
      statusData={analytics.statusDistribution}
    />

    {/* Métriques de performance */}
    <PerformanceMetrics metrics={analytics.performanceMetrics} />

    {/* Articles les plus vendus */}
    <TopSellingItems items={analytics.topItems} />
  </div>
);

/**
 * Composant des métriques de performance
 */
interface PerformanceMetricsProps {
  metrics: {
    customerSatisfaction: number;
    orderAccuracy: number;
    deliveryOnTime: number;
  };
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ metrics }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-gray-900">Indicateurs de Performance</h3>
      <Target className="h-5 w-5 text-purple-500" />
    </div>
    
    <div className="grid grid-cols-1 gap-6">
      {/* Satisfaction Client */}
      <div>
        <div className="text-3xl font-bold text-purple-600 mb-2">
          {metrics.customerSatisfaction}/5
        </div>
        <div className="text-sm text-gray-600">Satisfaction Client</div>
        <div className="flex items-center mt-2">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`text-lg ${
                i < Math.floor(metrics.customerSatisfaction) 
                  ? 'text-yellow-400' 
                  : 'text-gray-300'
              }`}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      {/* Précision Commandes */}
      <MetricWithProgressBar
        value={metrics.orderAccuracy}
        label="Précision Commandes"
        color="green"
      />

      {/* Livraison à temps */}
      <MetricWithProgressBar
        value={metrics.deliveryOnTime}
        label="Livraison à temps"
        color="blue"
      />
    </div>
  </Card>
);

/**
 * Composant métrique avec barre de progression
 */
interface MetricWithProgressBarProps {
  value: number;
  label: string;
  color: 'green' | 'blue' | 'purple';
}

const MetricWithProgressBar: React.FC<MetricWithProgressBarProps> = ({ 
  value, 
  label, 
  color 
}) => {
  const colorMap = {
    green: 'text-green-600 bg-green-500',
    blue: 'text-blue-600 bg-blue-500',
    purple: 'text-purple-600 bg-purple-500'
  };

  const [textColor, bgColor] = colorMap[color].split(' ');

  return (
    <div>
      <div className={`text-3xl font-bold ${textColor} mb-2`}>
        {value}%
      </div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="mt-2 bg-gray-200 rounded-full h-2">
        <div 
          className={`${bgColor} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Articles les plus vendus
 */
interface TopSellingItemsProps {
  items: Array<{
    name: string;
    orders: number;
    revenue: number;
  }>;
}

const TopSellingItems: React.FC<TopSellingItemsProps> = ({ items }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-gray-900">Articles les plus vendus</h3>
      <Target className="h-5 w-5 text-yellow-500" />
    </div>
    
    <div className="space-y-4">
      {items.map((item, index) => (
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
);

/**
 * Section des graphiques
 */
interface ChartsSectionProps {
  analytics: ReturnType<typeof useAnalytics>;
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ analytics }) => (
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
    
    {/* Graphique commandes par heure */}
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

    {/* Graphique chiffre d'affaires */}
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
);

/**
 * Actions rapides
 */
const QuickActionsSection: React.FC = () => {
  const actions = [
    {
      icon: ShoppingCart,
      title: 'Gérer les commandes',
      description: 'Traiter les commandes en attente',
      color: 'blue',
      onClick: () => console.log('Navigation vers commandes')
    },
    {
      icon: BarChart3,
      title: 'Analytics détaillées',
      description: 'Voir les statistiques complètes',
      color: 'green',
      onClick: () => console.log('Navigation vers analytics')
    },
    {
      icon: Users,
      title: 'Gestion du menu',
      description: 'Modifier les articles et prix',
      color: 'purple',
      onClick: () => console.log('Navigation vers menu')
    },
    {
      icon: Target,
      title: 'Paramètres',
      description: 'Configuration du restaurant',
      color: 'orange',
      onClick: () => console.log('Navigation vers paramètres')
    }
  ];

  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {actions.map((action, index) => (
        <Card 
          key={index}
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={action.onClick}
        >
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 ${colorMap[action.color as keyof typeof colorMap]} rounded-full flex items-center justify-center`}>
              <action.icon className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{action.title}</h4>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default RestaurantDashboard;