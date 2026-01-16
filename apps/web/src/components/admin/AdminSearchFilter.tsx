import React from 'react';
import { cn } from '../../lib/utils';
import { Search, Filter } from 'lucide-react';
import { Card } from '../ui/Card';
import { AdminFilterTabs } from './AdminFilterTabs';

interface FilterTab {
  key: string;
  label: string;
  count?: number;
}

interface AdminSearchFilterProps {
  title?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  tabs?: FilterTab[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  resultCount?: number;
  resultLabel?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * AdminSearchFilter - Section de recherche et filtres pour les pages admin
 * Combine recherche, filtres par onglets et compteur de résultats
 */
export function AdminSearchFilter({
  title = 'Filtres et Recherche Avancée',
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Rechercher...',
  tabs,
  activeTab,
  onTabChange,
  resultCount,
  resultLabel = 'résultat',
  className,
  children,
}: AdminSearchFilterProps) {
  return (
    <Card className={cn('bg-white shadow-sm border border-gray-200', className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <Filter className="h-4 w-4 text-violet-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className={cn(
                  'w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                )}
              />
            </div>
          </div>

          {/* Tabs + Result count */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            {tabs && activeTab !== undefined && onTabChange && (
              <AdminFilterTabs
                tabs={tabs}
                value={activeTab}
                onChange={onTabChange}
              />
            )}

            {children}

            {resultCount !== undefined && (
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg whitespace-nowrap">
                {resultCount} {resultLabel}{resultCount > 1 ? 's' : ''} trouvé{resultCount > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default AdminSearchFilter;
