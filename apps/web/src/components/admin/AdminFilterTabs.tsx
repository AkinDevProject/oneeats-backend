import React from 'react';
import { cn } from '../../lib/utils';

interface FilterTab {
  key: string;
  label: string;
  count?: number;
}

interface AdminFilterTabsProps {
  tabs: FilterTab[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * AdminFilterTabs - Onglets de filtrage pour les pages admin
 * Utilise le thème violet de l'admin
 */
export function AdminFilterTabs({
  tabs,
  value,
  onChange,
  className,
}: AdminFilterTabsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap',
            'transition-all duration-200 flex items-center gap-2',
            value === tab.key
              ? 'bg-violet-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-bold',
                value === tab.key ? 'bg-white/20' : 'bg-white'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export default AdminFilterTabs;
