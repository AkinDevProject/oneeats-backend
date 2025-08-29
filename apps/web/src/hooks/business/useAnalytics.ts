import { useMemo } from 'react';
import { Order } from '../../types';

/**
 * Hook personnalisé pour la génération et gestion des analytics
 * Centralise la logique analytics pour éviter la duplication
 */

export interface AnalyticsData {
  /** Données horaires pour les graphiques */
  hourlyData: Array<{
    hour: string;
    orders: number;
    revenue: number;
  }>;
  /** Distribution des statuts de commandes */
  statusDistribution: Array<{
    status: string;
    count: number;
    color: string;
  }>;
  /** Métriques de performance */
  performanceMetrics: {
    avgPreparationTime: number;
    customerSatisfaction: number;
    orderAccuracy: number;
    deliveryOnTime: number;
  };
  /** Articles les plus vendus */
  topItems: Array<{
    name: string;
    orders: number;
    revenue: number;
  }>;
  /** Données de comparaison temporelle */
  comparisonData?: {
    previousPeriodRevenue: number;
    revenueGrowth: string;
    previousPeriodOrders: number;
    ordersGrowth: string;
  };
}

interface UseAnalyticsOptions {
  /** Type d'analytics à générer */
  type: 'admin' | 'restaurant' | 'menu';
  /** Période de temps pour les analytics */
  timeRange: 'today' | 'week' | 'month';
  /** Données des commandes */
  orders?: Order[];
  /** ID du restaurant (pour analytics spécifiques) */
  restaurantId?: string;
}

/**
 * Configuration des statuts avec couleurs
 */
const statusConfig = {
  pending: { label: 'En attente', color: '#f59e0b' },
  accepted: { label: 'Acceptées', color: '#3b82f6' },
  preparing: { label: 'En préparation', color: '#8b5cf6' },
  ready: { label: 'Prêtes', color: '#10b981' },
  completed: { label: 'Terminées', color: '#6b7280' },
  cancelled: { label: 'Annulées', color: '#ef4444' }
};

/**
 * Génère les données horaires simulées
 * En production, ceci serait remplacé par des vraies données
 */
const generateHourlyData = (timeRange: UseAnalyticsOptions['timeRange']) => {
  const hours = [];
  const startHour = timeRange === 'today' ? 8 : 0;
  const endHour = timeRange === 'today' ? 22 : 24;
  
  for (let i = startHour; i < endHour; i++) {
    hours.push({
      hour: `${i.toString().padStart(2, '0')}:00`,
      orders: Math.floor(Math.random() * 12) + 1,
      revenue: Math.floor(Math.random() * 500) + 100
    });
  }
  
  return hours;
};

/**
 * Génère les articles les plus vendus simulés
 */
const generateTopItems = (type: UseAnalyticsOptions['type']) => {
  const items = {
    admin: [
      { name: 'Pizza Margherita', orders: 156, revenue: 2340 },
      { name: 'Burger Classic', orders: 134, revenue: 2010 },
      { name: 'Pâtes Carbonara', orders: 123, revenue: 1845 },
      { name: 'Salade César', orders: 98, revenue: 1470 }
    ],
    restaurant: [
      { name: 'Pizza Margherita', orders: 23, revenue: 345 },
      { name: 'Burger Classic', orders: 18, revenue: 270 },
      { name: 'Salade César', orders: 15, revenue: 195 },
      { name: 'Pâtes Carbonara', orders: 12, revenue: 168 }
    ],
    menu: [
      { name: 'Pizza Margherita', orders: 23, revenue: 345 },
      { name: 'Burger Deluxe', orders: 19, revenue: 285 },
      { name: 'Salade Méditerranéenne', orders: 17, revenue: 221 },
      { name: 'Risotto aux Champignons', orders: 14, revenue: 196 }
    ]
  };
  
  return items[type] || items.restaurant;
};

/**
 * Génère les métriques de performance
 */
const generatePerformanceMetrics = (type: UseAnalyticsOptions['type']) => {
  const baseMetrics = {
    avgPreparationTime: 18.5,
    customerSatisfaction: 4.7,
    orderAccuracy: 97.8,
    deliveryOnTime: 94.2
  };

  // Ajustements selon le type
  if (type === 'admin') {
    return {
      ...baseMetrics,
      customerSatisfaction: 4.5,
      orderAccuracy: 96.2,
      deliveryOnTime: 92.8
    };
  }

  return baseMetrics;
};

/**
 * Calcule la distribution des statuts à partir des commandes
 */
const calculateStatusDistribution = (orders: Order[] = []) => {
  const distribution = Object.entries(statusConfig).map(([status, config]) => ({
    status: config.label,
    count: orders.filter(order => order.status === status).length,
    color: config.color
  }));

  // Si pas de commandes, retourne des données simulées
  if (orders.length === 0) {
    return [
      { status: 'En attente', count: 8, color: '#f59e0b' },
      { status: 'En préparation', count: 12, color: '#3b82f6' },
      { status: 'Prêtes', count: 6, color: '#10b981' },
      { status: 'Terminées', count: 24, color: '#6b7280' }
    ];
  }

  return distribution.filter(item => item.count > 0);
};

/**
 * Génère les données de comparaison temporelle
 */
const generateComparisonData = (timeRange: UseAnalyticsOptions['timeRange']) => {
  const growth = {
    today: { revenue: '+15.3%', orders: '+8.7%' },
    week: { revenue: '+23.1%', orders: '+12.4%' },
    month: { revenue: '+18.9%', orders: '+15.2%' }
  };

  return {
    previousPeriodRevenue: 2340,
    revenueGrowth: growth[timeRange].revenue,
    previousPeriodOrders: 156,
    ordersGrowth: growth[timeRange].orders
  };
};

/**
 * Hook principal pour les analytics
 */
export const useAnalytics = ({
  type,
  timeRange,
  orders = [],
  restaurantId
}: UseAnalyticsOptions): AnalyticsData => {
  
  return useMemo(() => {
    const analyticsData: AnalyticsData = {
      hourlyData: generateHourlyData(timeRange),
      statusDistribution: calculateStatusDistribution(orders),
      performanceMetrics: generatePerformanceMetrics(type),
      topItems: generateTopItems(type),
      comparisonData: generateComparisonData(timeRange)
    };

    return analyticsData;
  }, [type, timeRange, orders]);
};

/**
 * Hook spécialisé pour les métriques rapides
 */
export const useQuickMetrics = (orders: Order[] = []) => {
  return useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => 
      order.status !== 'cancelled' ? sum + order.total : sum, 0
    );
    
    const totalOrders = orders.filter(o => o.status !== 'cancelled').length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
    
    // Commandes urgentes (> 15 minutes)
    const urgentOrders = orders.filter(order => {
      if (order.status !== 'pending' && order.status !== 'accepted') return false;
      const orderTime = new Date(order.createdAt);
      const minutesAgo = (new Date().getTime() - orderTime.getTime()) / (1000 * 60);
      return minutesAgo > 15;
    });

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      pendingOrdersCount,
      urgentOrders: urgentOrders.length
    };
  }, [orders]);
};

export default useAnalytics;