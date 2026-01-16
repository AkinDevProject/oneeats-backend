import React from 'react';
import { cn } from '../../lib/utils';
import { RefreshCcw, Download, Eye, EyeOff, Filter } from 'lucide-react';
import { Button } from '../ui/Button';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  children?: React.ReactNode;
  showAnalyticsToggle?: boolean;
  analyticsVisible?: boolean;
  onToggleAnalytics?: () => void;
  periodSelector?: {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
  };
  className?: string;
}

/**
 * AdminPageHeader - En-tête standardisé pour les pages admin
 * Inclut titre, contrôles analytics et actions
 */
export function AdminPageHeader({
  title,
  subtitle,
  onRefresh,
  onExport,
  children,
  showAnalyticsToggle,
  analyticsVisible,
  onToggleAnalytics,
  periodSelector,
  className,
}: AdminPageHeaderProps) {
  return (
    <div className={cn('bg-white border-b border-gray-200 px-8 py-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Analytics Controls */}
          {(showAnalyticsToggle || periodSelector) && (
            <div className="hidden md:flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
              {showAnalyticsToggle && (
                <>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onToggleAnalytics}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        analyticsVisible ? 'bg-violet-100 text-violet-600' : 'hover:bg-gray-200'
                      )}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={onToggleAnalytics}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        !analyticsVisible ? 'bg-gray-200' : 'hover:bg-gray-200'
                      )}
                    >
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                  {periodSelector && <div className="w-px h-6 bg-gray-300" />}
                </>
              )}
              {periodSelector && (
                <select
                  value={periodSelector.value}
                  onChange={(e) => periodSelector.onChange(e.target.value)}
                  className="bg-transparent text-sm font-medium text-gray-700 border-none focus:outline-none focus:ring-0"
                >
                  {periodSelector.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Custom children */}
          {children}

          {/* Refresh */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCcw className="h-4 w-4 text-gray-600" />
              <span className="hidden sm:inline text-sm font-medium text-gray-700">Actualiser</span>
            </button>
          )}

          {/* Export */}
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-medium">Export</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPageHeader;
