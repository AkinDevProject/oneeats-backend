import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton base - Élément de chargement animé
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded',
        className
      )}
      style={{
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

/**
 * AdminMetricCardSkeleton - Skeleton pour les cartes métriques
 */
export function AdminMetricCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-4 w-24 bg-white/30 rounded" />
          <div className="h-8 w-32 bg-white/40 rounded" />
          <div className="h-3 w-20 bg-white/20 rounded" />
        </div>
        <div className="w-12 h-12 bg-white/20 rounded-xl" />
      </div>
      <div className="flex items-center mt-3">
        <div className="h-4 w-4 bg-white/20 rounded mr-2" />
        <div className="h-3 w-16 bg-white/20 rounded" />
      </div>
    </div>
  );
}

/**
 * AdminChartSkeleton - Skeleton pour les graphiques
 */
export function AdminChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-lg" />
          <div className="h-5 w-40 bg-gray-200 rounded" />
        </div>
        <div className="w-5 h-5 bg-gray-200 rounded" />
      </div>

      {/* Chart area */}
      <div
        className="bg-gray-100 rounded-lg flex items-end justify-around px-4 pb-4 pt-8"
        style={{ height }}
      >
        {/* Simulated bar chart */}
        {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
          <div
            key={i}
            className="w-8 bg-gray-200 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * AdminAlertSkeleton - Skeleton pour la zone d'alertes
 */
export function AdminAlertSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-gray-200 rounded" />
          <div className="h-5 w-32 bg-gray-200 rounded" />
        </div>
        <div className="w-20 h-6 bg-gray-200 rounded" />
      </div>

      {/* Alert items */}
      <div className="p-4 space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-gray-200 rounded" />
              <div className="h-3 w-64 bg-gray-200 rounded" />
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * AdminTableSkeleton - Skeleton pour les tableaux
 */
export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-4">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-5 w-24 bg-gray-200 rounded" />
        <div className="h-5 w-28 bg-gray-200 rounded" />
        <div className="ml-auto h-5 w-20 bg-gray-200 rounded" />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'px-6 py-4 flex items-center gap-4',
            i !== rows - 1 && 'border-b border-gray-100'
          )}
        >
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-8 w-8 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

/**
 * AdminStatusCardSkeleton - Skeleton pour les cartes de statut système
 */
export function AdminStatusCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-36 bg-gray-200 rounded" />
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-200 rounded-full" />
          <div className="h-4 w-28 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Status items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * AdminDashboardSkeleton - Skeleton complet pour le dashboard admin
 */
export function AdminDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header skeleton */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Alert zone skeleton */}
        <AdminAlertSkeleton />

        {/* Metrics skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <AdminMetricCardSkeleton key={i} />
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AdminChartSkeleton />
          <AdminChartSkeleton />
        </div>

        {/* Status skeleton */}
        <AdminStatusCardSkeleton />
      </div>
    </div>
  );
}

// Add shimmer animation to global styles via style tag
if (typeof document !== 'undefined') {
  const styleId = 'admin-skeleton-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

export default {
  Skeleton,
  AdminMetricCardSkeleton,
  AdminChartSkeleton,
  AdminAlertSkeleton,
  AdminTableSkeleton,
  AdminStatusCardSkeleton,
  AdminDashboardSkeleton,
};
