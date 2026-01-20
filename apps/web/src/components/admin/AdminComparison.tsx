import React, { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  ArrowRight,
  BarChart3,
  DollarSign,
  ShoppingCart,
  Users,
  Store,
} from 'lucide-react';

export interface ComparisonPeriod {
  label: string;
  startDate: Date;
  endDate: Date;
}

export interface ComparisonMetric {
  id: string;
  label: string;
  icon: React.ReactNode;
  currentValue: number;
  previousValue: number;
  format?: 'number' | 'currency' | 'percent';
  precision?: number;
}

interface AdminComparisonProps {
  metrics: ComparisonMetric[];
  currentPeriod: ComparisonPeriod;
  previousPeriod: ComparisonPeriod;
  onPeriodChange?: (period: 'day' | 'week' | 'month') => void;
  className?: string;
}

type PeriodType = 'day' | 'week' | 'month';

const periodOptions: { value: PeriodType; label: string; current: string; previous: string }[] = [
  { value: 'day', label: 'Jour', current: "Aujourd'hui", previous: 'Hier' },
  { value: 'week', label: 'Semaine', current: 'Cette semaine', previous: 'Semaine dernière' },
  { value: 'month', label: 'Mois', current: 'Ce mois', previous: 'Mois dernier' },
];

function formatValue(value: number, format: string = 'number', precision: number = 0): string {
  switch (format) {
    case 'currency':
      return `${value.toLocaleString('fr-FR', { minimumFractionDigits: precision, maximumFractionDigits: precision })}€`;
    case 'percent':
      return `${value.toFixed(precision)}%`;
    default:
      return value.toLocaleString('fr-FR');
  }
}

function calculateChange(current: number, previous: number): { value: number; direction: 'up' | 'down' | 'neutral' } {
  if (previous === 0) {
    return { value: current > 0 ? 100 : 0, direction: current > 0 ? 'up' : 'neutral' };
  }
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(change),
    direction: change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'neutral',
  };
}

function MetricComparisonCard({ metric }: { metric: ComparisonMetric }) {
  const change = calculateChange(metric.currentValue, metric.previousValue);
  const diff = metric.currentValue - metric.previousValue;

  const TrendIcon = change.direction === 'up' ? TrendingUp : change.direction === 'down' ? TrendingDown : Minus;

  const trendColors = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600">
            {metric.icon}
          </div>
          <span className="text-sm font-medium text-gray-600">{metric.label}</span>
        </div>
        <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', trendColors[change.direction])}>
          <TrendIcon className="h-3 w-3" />
          {change.value.toFixed(1)}%
        </div>
      </div>

      <div className="space-y-2">
        {/* Current value */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Actuel</span>
          <span className="text-xl font-bold text-gray-900">
            {formatValue(metric.currentValue, metric.format, metric.precision)}
          </span>
        </div>

        {/* Previous value */}
        <div className="flex items-center justify-between text-gray-400">
          <span className="text-xs">Précédent</span>
          <span className="text-sm">
            {formatValue(metric.previousValue, metric.format, metric.precision)}
          </span>
        </div>

        {/* Difference */}
        <div className="pt-2 border-t border-gray-100">
          <div className={cn(
            'text-xs font-medium flex items-center gap-1',
            change.direction === 'up' ? 'text-green-600' : change.direction === 'down' ? 'text-red-600' : 'text-gray-500'
          )}>
            {change.direction === 'up' ? '+' : change.direction === 'down' ? '' : ''}
            {formatValue(diff, metric.format, metric.precision)}
            <span className="text-gray-400 font-normal">de différence</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * AdminComparison - Widget de comparaison temporelle
 * Compare les métriques entre deux périodes
 */
export function AdminComparison({
  metrics,
  currentPeriod,
  previousPeriod,
  onPeriodChange,
  className,
}: AdminComparisonProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('week');

  const handlePeriodChange = (period: PeriodType) => {
    setSelectedPeriod(period);
    onPeriodChange?.(period);
  };

  const selectedOption = periodOptions.find(p => p.value === selectedPeriod) || periodOptions[1];

  // Summary calculations
  const summary = useMemo(() => {
    const positiveCount = metrics.filter(m => m.currentValue > m.previousValue).length;
    const negativeCount = metrics.filter(m => m.currentValue < m.previousValue).length;
    const neutralCount = metrics.length - positiveCount - negativeCount;

    return { positiveCount, negativeCount, neutralCount };
  }, [metrics]);

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Comparaison temporelle</h3>
              <p className="text-xs text-violet-200">
                {selectedOption.current} vs {selectedOption.previous}
              </p>
            </div>
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
            {periodOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handlePeriodChange(option.value)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  selectedPeriod === option.value
                    ? 'bg-white text-violet-600'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Period dates */}
        <div className="flex items-center gap-4 mt-4 text-sm text-violet-200">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{currentPeriod.startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
            <ArrowRight className="h-3 w-3" />
            <span>{currentPeriod.endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
          </div>
          <span className="text-violet-300">vs</span>
          <div className="flex items-center gap-2">
            <span>{previousPeriod.startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
            <ArrowRight className="h-3 w-3" />
            <span>{previousPeriod.endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-center gap-6 py-4 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-green-600">{summary.positiveCount}</span> en hausse
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-red-600">{summary.negativeCount}</span> en baisse
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-gray-600">{summary.neutralCount}</span> stable
          </span>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map(metric => (
            <MetricComparisonCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>
    </Card>
  );
}

/**
 * Hook pour générer les métriques de comparaison à partir des données
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useComparisonMetrics(
  currentData: { revenue: number; orders: number; users: number; restaurants: number },
  previousData: { revenue: number; orders: number; users: number; restaurants: number }
): ComparisonMetric[] {
  return [
    {
      id: 'revenue',
      label: "Chiffre d'affaires",
      icon: <DollarSign className="h-4 w-4" />,
      currentValue: currentData.revenue,
      previousValue: previousData.revenue,
      format: 'currency',
      precision: 0,
    },
    {
      id: 'orders',
      label: 'Commandes',
      icon: <ShoppingCart className="h-4 w-4" />,
      currentValue: currentData.orders,
      previousValue: previousData.orders,
      format: 'number',
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: <Users className="h-4 w-4" />,
      currentValue: currentData.users,
      previousValue: previousData.users,
      format: 'number',
    },
    {
      id: 'restaurants',
      label: 'Restaurants actifs',
      icon: <Store className="h-4 w-4" />,
      currentValue: currentData.restaurants,
      previousValue: previousData.restaurants,
      format: 'number',
    },
  ];
}

export default AdminComparison;
