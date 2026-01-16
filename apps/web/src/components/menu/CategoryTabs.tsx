import React from 'react';
import { cn } from '../../lib/utils';
import { ChefHat, Sparkles } from 'lucide-react';

interface CategoryTab {
  key: string;
  label: string;
  count: number;
}

interface CategoryTabsProps {
  tabs: CategoryTab[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const categoryColors = [
  { bg: 'bg-primary-50', text: 'text-primary-700', active: 'bg-primary-500' },
  { bg: 'bg-secondary-50', text: 'text-secondary-700', active: 'bg-secondary-500' },
  { bg: 'bg-success-50', text: 'text-success-700', active: 'bg-success-500' },
  { bg: 'bg-warning-50', text: 'text-warning-700', active: 'bg-warning-500' },
  { bg: 'bg-danger-50', text: 'text-danger-700', active: 'bg-danger-500' },
  { bg: 'bg-gray-50', text: 'text-gray-700', active: 'bg-gray-500' },
];

/**
 * CategoryTabs - Filter tabs for menu categories
 */
export function CategoryTabs({
  tabs,
  value,
  onChange,
  className,
}: CategoryTabsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tabs.map((tab, index) => {
        const isActive = value === tab.key;
        const isAll = tab.key === 'all';
        const colorIndex = isAll ? 0 : ((index - 1) % categoryColors.length);
        const colors = categoryColors[colorIndex];
        const Icon = isAll ? Sparkles : ChefHat;

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              'relative flex items-center gap-2 px-3 py-2 rounded-lg',
              'text-sm font-medium transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive
                ? `${colors.active} text-white`
                : `${colors.bg} ${colors.text} border border-gray-200 hover:shadow-sm`
            )}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.substring(0, 6)}</span>
            <span
              className={cn(
                'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5',
                'rounded-full text-xs font-semibold',
                isActive ? 'bg-white/20' : 'bg-white'
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Compact category tabs for mobile (grid layout)
 */
export function CategoryTabsCompact({
  tabs,
  value,
  onChange,
  className,
}: CategoryTabsProps) {
  const columns = tabs.length <= 4 ? 2 : 3;

  return (
    <div className={cn(`grid grid-cols-${columns} gap-2`, className)}>
      {tabs.slice(0, 6).map((tab, index) => {
        const isActive = value === tab.key;
        const isAll = tab.key === 'all';
        const colorIndex = isAll ? 0 : ((index - 1) % categoryColors.length);
        const colors = categoryColors[colorIndex];

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              'relative flex items-center justify-between p-3 rounded-xl',
              'text-xs font-medium transition-all duration-200',
              isActive
                ? `${colors.active} text-white shadow-md`
                : `${colors.bg} ${colors.text} border border-gray-200`
            )}
          >
            <span className="truncate">{tab.label}</span>
            <span
              className={cn(
                'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5',
                'rounded-full text-xs font-bold',
                isActive ? 'bg-white/20' : 'bg-white'
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Availability filter tabs
 */
export function AvailabilityTabs({
  value,
  onChange,
  counts,
  className,
}: {
  value: 'all' | 'available' | 'unavailable';
  onChange: (value: 'all' | 'available' | 'unavailable') => void;
  counts: { all: number; available: number; unavailable: number };
  className?: string;
}) {
  const tabs = [
    { key: 'all' as const, label: 'Tous', count: counts.all },
    { key: 'available' as const, label: 'Disponibles', count: counts.available },
    { key: 'unavailable' as const, label: 'Indisponibles', count: counts.unavailable },
  ];

  return (
    <div className={cn('flex gap-1 bg-gray-100 rounded-lg p-1', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            value === tab.key
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-primary-600'
          )}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  );
}

export default CategoryTabs;
