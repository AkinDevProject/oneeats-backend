import React from 'react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

type GradientColor = 'violet' | 'blue' | 'green' | 'orange' | 'red' | 'gray' | 'indigo';

interface AdminMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label?: string;
  };
  icon: React.ReactNode;
  color?: GradientColor;
  alert?: boolean;
  className?: string;
}

const gradientMap: Record<GradientColor, { bg: string; light: string; lighter: string }> = {
  violet: { bg: 'from-violet-500 to-violet-600', light: 'text-violet-100', lighter: 'text-violet-200' },
  blue: { bg: 'from-blue-500 to-blue-600', light: 'text-blue-100', lighter: 'text-blue-200' },
  green: { bg: 'from-green-500 to-green-600', light: 'text-green-100', lighter: 'text-green-200' },
  orange: { bg: 'from-orange-500 to-orange-600', light: 'text-orange-100', lighter: 'text-orange-200' },
  red: { bg: 'from-red-500 to-red-600', light: 'text-red-100', lighter: 'text-red-200' },
  gray: { bg: 'from-gray-700 to-gray-800', light: 'text-gray-300', lighter: 'text-gray-400' },
  indigo: { bg: 'from-indigo-500 to-indigo-600', light: 'text-indigo-100', lighter: 'text-indigo-200' },
};

/**
 * AdminMetricCard - Carte de métrique pour le dashboard admin
 * Affiche une valeur clé avec icône, tendance et gradient de couleur
 */
export function AdminMetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'violet',
  alert,
  className,
}: AdminMetricCardProps) {
  const colors = gradientMap[color];
  const TrendIcon = trend && trend.value >= 0 ? TrendingUp : TrendingDown;

  return (
    <Card
      className={cn(
        'bg-gradient-to-br text-white border-0 shadow-lg',
        colors.bg,
        className
      )}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={cn('text-sm font-medium', colors.light)}>{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && (
              <p className={cn('text-xs mt-1', colors.lighter)}>{subtitle}</p>
            )}
            {alert && (
              <div className={cn('text-xs font-bold animate-pulse mt-1', colors.lighter)}>
                URGENT
              </div>
            )}
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            {icon}
          </div>
        </div>
        {trend && (
          <div className={cn('flex items-center mt-2 text-sm', colors.lighter)}>
            <TrendIcon className="h-4 w-4 mr-1" />
            <span>
              {trend.value >= 0 ? '+' : ''}{trend.value.toFixed(1)}%
              {trend.label && ` ${trend.label}`}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

export default AdminMetricCard;
