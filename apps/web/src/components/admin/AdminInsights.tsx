import React, { useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ThumbsUp,
  Target,
  Zap,
  Clock,
  Users,
  Store,
  ShoppingCart,
  DollarSign,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export type InsightType = 'positive' | 'warning' | 'opportunity' | 'trend';
export type InsightCategory = 'revenue' | 'orders' | 'restaurants' | 'users' | 'performance';

export interface Insight {
  id: string;
  type: InsightType;
  category: InsightCategory;
  title: string;
  description: string;
  metric?: {
    label: string;
    value: string;
    change?: number;
  };
  actionLabel?: string;
  actionUrl?: string;
  priority: number; // 1 = highest
}

interface AdminInsightsProps {
  insights: Insight[];
  maxVisible?: number;
  onAction?: (insight: Insight) => void;
  className?: string;
}

const typeConfig: Record<InsightType, {
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  badge: string;
}> = {
  positive: {
    icon: ThumbsUp,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
  },
  opportunity: {
    icon: Target,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
  },
  trend: {
    icon: Zap,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-700',
  },
};

const categoryIcons: Record<InsightCategory, React.ElementType> = {
  revenue: DollarSign,
  orders: ShoppingCart,
  restaurants: Store,
  users: Users,
  performance: Clock,
};

function InsightCard({
  insight,
  onAction,
}: {
  insight: Insight;
  onAction?: (insight: Insight) => void;
}) {
  const config = typeConfig[insight.type];
  const TypeIcon = config.icon;
  const CategoryIcon = categoryIcons[insight.category];

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all hover:shadow-md',
        config.bg,
        config.border
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
          config.color,
          'bg-white shadow-sm'
        )}>
          <TypeIcon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 text-sm">{insight.title}</h4>
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', config.badge)}>
              {insight.type === 'positive' ? 'Positif' :
               insight.type === 'warning' ? 'Attention' :
               insight.type === 'opportunity' ? 'Opportunité' : 'Tendance'}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3">{insight.description}</p>

          {/* Metric */}
          {insight.metric && (
            <div className="flex items-center gap-3 mb-3 p-2 bg-white/60 rounded-lg">
              <CategoryIcon className={cn('h-4 w-4', config.color)} />
              <span className="text-xs text-gray-500">{insight.metric.label}</span>
              <span className="font-bold text-gray-900">{insight.metric.value}</span>
              {insight.metric.change !== undefined && (
                <span className={cn(
                  'text-xs font-medium flex items-center gap-0.5',
                  insight.metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {insight.metric.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {insight.metric.change >= 0 ? '+' : ''}{insight.metric.change}%
                </span>
              )}
            </div>
          )}

          {/* Action */}
          {insight.actionLabel && (
            <button
              onClick={() => onAction?.(insight)}
              className={cn(
                'text-xs font-medium flex items-center gap-1 transition-colors',
                config.color,
                'hover:underline'
              )}
            >
              {insight.actionLabel}
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * AdminInsights - Insights automatiques basés sur les données
 * Génère des recommandations et observations intelligentes
 */
export function AdminInsights({
  insights,
  maxVisible = 4,
  onAction,
  className,
}: AdminInsightsProps) {
  // Sort by priority and limit
  const visibleInsights = useMemo(() => {
    return [...insights]
      .sort((a, b) => a.priority - b.priority)
      .slice(0, maxVisible);
  }, [insights, maxVisible]);

  const insightCounts = useMemo(() => ({
    positive: insights.filter(i => i.type === 'positive').length,
    warning: insights.filter(i => i.type === 'warning').length,
    opportunity: insights.filter(i => i.type === 'opportunity').length,
    trend: insights.filter(i => i.type === 'trend').length,
  }), [insights]);

  if (insights.length === 0) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <Lightbulb className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-sm font-medium">Aucun insight disponible</p>
          <p className="text-xs mt-1">Les insights apparaîtront avec plus de données</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Insights automatiques</h3>
              <p className="text-xs text-gray-500">
                {insights.length} observation{insights.length > 1 ? 's' : ''} basée{insights.length > 1 ? 's' : ''} sur vos données
              </p>
            </div>
          </div>

          {/* Summary badges */}
          <div className="hidden md:flex items-center gap-2">
            {insightCounts.positive > 0 && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                {insightCounts.positive} positif{insightCounts.positive > 1 ? 's' : ''}
              </span>
            )}
            {insightCounts.warning > 0 && (
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                {insightCounts.warning} attention
              </span>
            )}
            {insightCounts.opportunity > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {insightCounts.opportunity} opportunité{insightCounts.opportunity > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Insights grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visibleInsights.map(insight => (
            <InsightCard key={insight.id} insight={insight} onAction={onAction} />
          ))}
        </div>

        {insights.length > maxVisible && (
          <div className="mt-4 text-center">
            <button className="text-sm text-violet-600 hover:text-violet-700 font-medium">
              Voir {insights.length - maxVisible} insight{insights.length - maxVisible > 1 ? 's' : ''} de plus
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Hook pour générer des insights automatiques à partir des données
 */
export function useAutoInsights(data: {
  todayRevenue: number;
  yesterdayRevenue: number;
  todayOrders: number;
  yesterdayOrders: number;
  activeRestaurants: number;
  totalRestaurants: number;
  pendingOrders: number;
  averageOrderValue: number;
  topRestaurant?: { name: string; orders: number };
  slowRestaurant?: { name: string; avgTime: number };
}): Insight[] {
  return useMemo(() => {
    const insights: Insight[] = [];

    // Revenue change insight
    const revenueChange = data.yesterdayRevenue > 0
      ? ((data.todayRevenue - data.yesterdayRevenue) / data.yesterdayRevenue) * 100
      : 0;

    if (revenueChange > 10) {
      insights.push({
        id: 'revenue-up',
        type: 'positive',
        category: 'revenue',
        title: 'Excellente journée en cours',
        description: `Le chiffre d'affaires est en forte hausse par rapport à hier. Continuez sur cette lancée!`,
        metric: {
          label: "CA aujourd'hui",
          value: `${data.todayRevenue.toLocaleString('fr-FR')}€`,
          change: Math.round(revenueChange),
        },
        priority: 2,
      });
    } else if (revenueChange < -15) {
      insights.push({
        id: 'revenue-down',
        type: 'warning',
        category: 'revenue',
        title: 'Baisse du chiffre d\'affaires',
        description: `Le CA est en baisse significative. Vérifiez les restaurants actifs et les promotions en cours.`,
        metric: {
          label: "CA aujourd'hui",
          value: `${data.todayRevenue.toLocaleString('fr-FR')}€`,
          change: Math.round(revenueChange),
        },
        actionLabel: 'Analyser les causes',
        priority: 1,
      });
    }

    // Pending orders
    if (data.pendingOrders > 5) {
      insights.push({
        id: 'pending-orders',
        type: 'warning',
        category: 'orders',
        title: 'Commandes en attente',
        description: `${data.pendingOrders} commandes attendent une action. Cela peut impacter la satisfaction client.`,
        metric: {
          label: 'En attente',
          value: `${data.pendingOrders}`,
        },
        actionLabel: 'Traiter les commandes',
        priority: 1,
      });
    }

    // Restaurant activity
    const restaurantActivity = data.totalRestaurants > 0
      ? (data.activeRestaurants / data.totalRestaurants) * 100
      : 0;

    if (restaurantActivity < 70) {
      insights.push({
        id: 'low-restaurant-activity',
        type: 'opportunity',
        category: 'restaurants',
        title: 'Restaurants sous-utilisés',
        description: `Seulement ${Math.round(restaurantActivity)}% des restaurants sont actifs. Contactez les inactifs pour augmenter l'offre.`,
        metric: {
          label: 'Taux d\'activité',
          value: `${Math.round(restaurantActivity)}%`,
        },
        actionLabel: 'Contacter les restaurants',
        priority: 3,
      });
    }

    // Top performer
    if (data.topRestaurant && data.topRestaurant.orders > 10) {
      insights.push({
        id: 'top-performer',
        type: 'positive',
        category: 'restaurants',
        title: 'Restaurant star du jour',
        description: `${data.topRestaurant.name} performe exceptionnellement avec ${data.topRestaurant.orders} commandes aujourd'hui.`,
        priority: 4,
      });
    }

    // Average order value trend
    if (data.averageOrderValue > 30) {
      insights.push({
        id: 'high-aov',
        type: 'trend',
        category: 'orders',
        title: 'Panier moyen élevé',
        description: `Le panier moyen de ${data.averageOrderValue.toFixed(0)}€ est supérieur à la moyenne. Les clients commandent des repas complets.`,
        metric: {
          label: 'Panier moyen',
          value: `${data.averageOrderValue.toFixed(0)}€`,
        },
        priority: 5,
      });
    }

    // Orders trend
    const ordersChange = data.yesterdayOrders > 0
      ? ((data.todayOrders - data.yesterdayOrders) / data.yesterdayOrders) * 100
      : 0;

    if (ordersChange > 20) {
      insights.push({
        id: 'orders-surge',
        type: 'trend',
        category: 'orders',
        title: 'Pic de commandes',
        description: `Le nombre de commandes est en hausse de ${Math.round(ordersChange)}%. Assurez-vous que les restaurants suivent le rythme.`,
        metric: {
          label: 'Commandes',
          value: `${data.todayOrders}`,
          change: Math.round(ordersChange),
        },
        actionLabel: 'Surveiller les performances',
        priority: 2,
      });
    }

    return insights;
  }, [data]);
}

export default AdminInsights;
