import { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { DashboardStats } from '../../types';

interface UseDashboardResult {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDashboard = (): UseDashboardResult => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Utiliser l'endpoint analytics existant au lieu de admin/dashboard/stats
      const platformData = await apiService.analytics.getPlatformStats();

      // Convertir les données analytics en format DashboardStats
      const dashboardStats: DashboardStats = {
        todayOrders: platformData.todayOrders || 0,
        todayRevenue: Number(platformData.todayRevenue) || 0,
        activeRestaurants: platformData.activeRestaurants || 0,
        weeklyData: platformData.dailyStats?.map(day => ({
          date: day.date,
          orders: Number(day.orders) || 0,
          revenue: Number(day.revenue) || 0
        })) || []
      };

      setStats(dashboardStats);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchDashboardStats,
  };
};