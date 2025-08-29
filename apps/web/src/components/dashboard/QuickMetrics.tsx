import React from 'react';
import { DollarSign, ShoppingCart, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../ui/Card';

/**
 * Composant d'affichage des métriques rapides en mode tableau de bord
 * Affiche les KPIs essentiels avec des indicateurs de changement
 * Optimisé pour mobile et desktop avec animations
 */

interface QuickMetricsProps {
  /** Chiffre d'affaires total */
  totalRevenue: number;
  /** Pourcentage de changement du CA (ex: "+15.3%") */
  revenueChange: string;
  /** Nombre total de commandes */
  totalOrders: number;
  /** Pourcentage de changement des commandes */
  ordersChange: string;
  /** Valeur moyenne du panier */
  avgOrderValue: number;
  /** Pourcentage de changement du panier moyen */
  avgOrderChange: string;
  /** Nombre de commandes en attente */
  pendingOrdersCount: number;
  /** Classe CSS personnalisée */
  className?: string;
}

/**
 * Formate et analyse les données de changement
 * @param change - String du changement avec + ou - (ex: "+15.3%")
 * @returns Objet avec le texte, la couleur et l'icône appropriés
 */
const formatChange = (change: string) => {
  const isPositive = change.startsWith('+');
  return {
    text: change,
    color: isPositive ? 'text-green-600' : 'text-red-600',
    icon: isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
  };
};

/**
 * Configuration des couleurs et styles pour chaque métrique
 */
const metricConfig = {
  revenue: {
    gradient: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-100',
    label: 'Chiffre d\'affaires'
  },
  orders: {
    gradient: 'from-green-500 to-green-600', 
    textColor: 'text-green-100',
    label: 'Commandes'
  },
  avgOrder: {
    gradient: 'from-purple-500 to-purple-600',
    textColor: 'text-purple-100', 
    label: 'Panier moyen'
  },
  pending: {
    gradient: 'from-orange-500 to-orange-600',
    textColor: 'text-orange-100',
    label: 'En attente'
  },
  completed: {
    gradient: 'from-gray-500 to-gray-600',
    textColor: 'text-gray-100',
    label: 'En attente'
  }
};

export const QuickMetrics: React.FC<QuickMetricsProps> = ({
  totalRevenue,
  revenueChange,
  totalOrders,
  ordersChange,
  avgOrderValue,
  avgOrderChange,
  pendingOrdersCount,
  className = ''
}) => {
  // Formatage des données de changement
  const revenueChangeData = formatChange(revenueChange);
  const ordersChangeData = formatChange(ordersChange);
  const avgOrderChangeData = formatChange(avgOrderChange);

  // Configuration dynamique pour les commandes en attente
  const pendingConfig = pendingOrdersCount > 0 ? metricConfig.pending : metricConfig.completed;
  const pendingAnimation = pendingOrdersCount > 0 ? 'animate-pulse' : '';

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 ${className}`}>
      
      {/* Carte Chiffre d'affaires */}
      <Card className={`p-4 sm:p-6 bg-gradient-to-br ${metricConfig.revenue.gradient} text-white shadow-lg hover:shadow-xl transition-shadow`}>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          {/* Icône avec background semi-transparent */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          
          {/* Valeur principale */}
          <div className="text-right min-w-0">
            <div className="text-2xl sm:text-3xl font-bold truncate">
              €{totalRevenue.toFixed(0)}
            </div>
            <div className={`${metricConfig.revenue.textColor} font-medium text-xs sm:text-sm`}>
              {metricConfig.revenue.label}
            </div>
          </div>
        </div>
        
        {/* Indicateur de changement */}
        <div className={`flex items-center ${metricConfig.revenue.textColor} text-xs sm:text-sm`}>
          {revenueChangeData.icon}
          <span className="ml-1">{revenueChangeData.text} vs hier</span>
        </div>
      </Card>

      {/* Carte Commandes */}
      <Card className={`p-4 sm:p-6 bg-gradient-to-br ${metricConfig.orders.gradient} text-white shadow-lg hover:shadow-xl transition-shadow`}>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          
          <div className="text-right min-w-0">
            <div className="text-2xl sm:text-3xl font-bold">
              {totalOrders}
            </div>
            <div className={`${metricConfig.orders.textColor} font-medium text-xs sm:text-sm`}>
              {metricConfig.orders.label}
            </div>
          </div>
        </div>
        
        <div className={`flex items-center ${metricConfig.orders.textColor} text-xs sm:text-sm`}>
          {ordersChangeData.icon}
          <span className="ml-1">{ordersChangeData.text} vs hier</span>
        </div>
      </Card>

      {/* Carte Panier moyen */}
      <Card className={`p-4 sm:p-6 bg-gradient-to-br ${metricConfig.avgOrder.gradient} text-white shadow-lg hover:shadow-xl transition-shadow`}>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          
          <div className="text-right min-w-0">
            <div className="text-2xl sm:text-3xl font-bold truncate">
              €{avgOrderValue.toFixed(0)}
            </div>
            <div className={`${metricConfig.avgOrder.textColor} font-medium text-xs sm:text-sm`}>
              {metricConfig.avgOrder.label}
            </div>
          </div>
        </div>
        
        <div className={`flex items-center ${metricConfig.avgOrder.textColor} text-xs sm:text-sm`}>
          {avgOrderChangeData.icon}
          <span className="ml-1">{avgOrderChangeData.text} vs hier</span>
        </div>
      </Card>

      {/* Carte Commandes en attente avec animation conditionnelle */}
      <Card className={`p-4 sm:p-6 bg-gradient-to-br ${pendingConfig.gradient} text-white shadow-lg hover:shadow-xl transition-shadow ${pendingAnimation}`}>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          
          <div className="text-right min-w-0">
            <div className="text-2xl sm:text-3xl font-bold">
              {pendingOrdersCount}
            </div>
            <div className={`${pendingConfig.textColor} font-medium text-xs sm:text-sm`}>
              {pendingConfig.label}
            </div>
          </div>
        </div>
        
        {/* Statut dynamique */}
        <div className={`flex items-center ${pendingConfig.textColor} text-xs sm:text-sm`}>
          <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span>
            {pendingOrdersCount > 0 ? 'Action requise' : 'Tout traité'}
          </span>
        </div>
      </Card>
    </div>
  );
};

export default QuickMetrics;