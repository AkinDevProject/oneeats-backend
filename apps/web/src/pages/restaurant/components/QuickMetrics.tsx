import React from 'react';
import { DollarSign, ShoppingCart, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

interface QuickMetricsProps {
  totalRevenue: number;
  revenueChange: string;
  totalOrders: number;
  ordersChange: string;
  avgOrderValue: number;
  avgOrderChange: string;
  pendingOrdersCount: number;
}

const QuickMetrics: React.FC<QuickMetricsProps> = ({
  totalRevenue,
  revenueChange,
  totalOrders,
  ordersChange,
  avgOrderValue,
  avgOrderChange,
  pendingOrdersCount
}) => {
  const formatChange = (change: string) => {
    const isPositive = change.startsWith('+');
    return {
      text: change,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      icon: isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
    };
  };

  const revenueChangeData = formatChange(revenueChange);
  const ordersChangeData = formatChange(ordersChange);
  const avgOrderChangeData = formatChange(avgOrderChange);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Chiffre d'affaires - Mobile Optimized */}
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="text-right min-w-0">
            <div className="text-2xl sm:text-3xl font-bold truncate">€{totalRevenue.toFixed(0)}</div>
            <div className="text-blue-100 font-medium text-xs sm:text-sm">Chiffre d'affaires</div>
          </div>
        </div>
        <div className="flex items-center text-blue-100 text-xs sm:text-sm">
          {revenueChangeData.icon}
          <span className="ml-1">{revenueChangeData.text} vs hier</span>
        </div>
      </Card>

      {/* Commandes - Mobile Optimized */}
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="text-right min-w-0">
            <div className="text-2xl sm:text-3xl font-bold">{totalOrders}</div>
            <div className="text-green-100 font-medium text-xs sm:text-sm">Commandes</div>
          </div>
        </div>
        <div className="flex items-center text-green-100 text-xs sm:text-sm">
          {ordersChangeData.icon}
          <span className="ml-1">{ordersChangeData.text} vs hier</span>
        </div>
      </Card>

      {/* Panier moyen - Mobile Optimized */}
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="text-right min-w-0">
            <div className="text-2xl sm:text-3xl font-bold truncate">€{avgOrderValue.toFixed(0)}</div>
            <div className="text-purple-100 font-medium text-xs sm:text-sm">Panier moyen</div>
          </div>
        </div>
        <div className="flex items-center text-purple-100 text-xs sm:text-sm">
          {avgOrderChangeData.icon}
          <span className="ml-1">{avgOrderChangeData.text} vs hier</span>
        </div>
      </Card>

      {/* Commandes en attente - Mobile Optimized with Animation */}
      <Card className={`p-4 sm:p-6 ${pendingOrdersCount > 0 ? 'bg-gradient-to-br from-orange-500 to-orange-600 animate-pulse' : 'bg-gradient-to-br from-gray-500 to-gray-600'} text-white shadow-lg`}>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="text-right min-w-0">
            <div className="text-2xl sm:text-3xl font-bold">{pendingOrdersCount}</div>
            <div className={`${pendingOrdersCount > 0 ? 'text-orange-100' : 'text-gray-100'} font-medium text-xs sm:text-sm`}>En attente</div>
          </div>
        </div>
        <div className={`flex items-center ${pendingOrdersCount > 0 ? 'text-orange-100' : 'text-gray-100'} text-xs sm:text-sm`}>
          <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span>{pendingOrdersCount > 0 ? 'Action requise' : 'Tout traité'}</span>
        </div>
      </Card>
    </div>
  );
};

export default QuickMetrics;